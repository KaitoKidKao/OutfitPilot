// AI Stylist flow (docs/plan.md "5. Cài đặt gọi và kiểm tra"):
//   1. LLM not configured -> fallback.
//   2. Call once; validate.
//   3. Invalid reply (bad JSON, schema break, refusal, incomplete) -> retry once,
//      sending the plan's error-feedback message.
//   4. Still invalid, or any transport error (timeout, 401, 429, 5xx) -> fallback.
// Transport errors do not trigger the retry: another 8 s wait would only
// delay the fallback the user sees.

import type { Locale, StyleResponse } from "../contract.js";
import type { OccasionId } from "../catalog.js";
import { fallbackRecommendations } from "./fallback.js";
import type { ChatTurn, LLMReply, StylistLLM } from "./openai.js";
import { buildRetryMessage, buildUserMessage, SYSTEM_PROMPT } from "./prompt.js";
import { getPregeneratedPicks } from "./stage-cache.js";
import { validateStylistOutput, type ValidationResult } from "./validate.js";

export interface StylistInput {
  occasionId: OccasionId;
  style: string;
  locale: Locale;
  customOccasion?: string;
}

export type StylistLogger = (event: string, detail?: Record<string, unknown>) => void;

export interface RecommendOptions {
  /** If true, returns pre-generated high-fidelity AI recommendations with zero latency. */
  useStageCache?: boolean;
}

function check(reply: LLMReply): ValidationResult {
  if (reply.kind === "refusal") return { ok: false, error: "the reply was a refusal" };
  if (reply.kind === "incomplete") return { ok: false, error: `the reply was incomplete (${reply.reason})` };
  return validateStylistOutput(reply.text);
}

export async function recommend(
  input: StylistInput,
  llm: StylistLLM | null,
  log: StylistLogger = () => {},
  options: RecommendOptions = {},
): Promise<StyleResponse> {
  const hasCustomOccasion = !!input.customOccasion && input.customOccasion.trim().length > 0;
  const stagePicks = !hasCustomOccasion ? getPregeneratedPicks(input.occasionId, input.style, input.locale) : null;

  if (options.useStageCache && stagePicks) {
    log("stylist_stage_cache_hit", { occasion: input.occasionId, style: input.style });
    return { recommendations: stagePicks, source: "llm" };
  }

  const fallback = (why: string): StyleResponse => {
    log("stylist_fallback", { why });
    return {
      recommendations: fallbackRecommendations(input.occasionId, input.style, input.locale),
      source: "fallback",
    };
  };

  if (!llm) return fallback("llm_not_configured");

  const turns: ChatTurn[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserMessage(input) },
  ];

  try {
    const first = await llm(turns);
    const firstCheck = check(first);
    if (firstCheck.ok) return { recommendations: firstCheck.recommendations, source: "llm" };

    log("stylist_retry", { error: firstCheck.error });
    const retryTurns: ChatTurn[] = [
      ...turns,
      ...(first.kind === "text" && first.text ? [{ role: "assistant" as const, content: first.text }] : []),
      { role: "user", content: buildRetryMessage(firstCheck.error) },
    ];
    const second = await llm(retryTurns);
    const secondCheck = check(second);
    if (secondCheck.ok) return { recommendations: secondCheck.recommendations, source: "llm" };
    return fallback(`invalid_after_retry: ${secondCheck.error}`);
  } catch (err) {
    const name = err instanceof Error ? err.constructor.name : "unknown";
    return fallback(`llm_error: ${name}`);
  }
}
