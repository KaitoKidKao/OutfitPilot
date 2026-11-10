// OpenAI adapter for the AI Stylist (Responses API + Structured Outputs).
// The OpenAI SDK and key live only on this server (the SDK does not support
// React Native, and the key must never reach the app).
//
// Request shape verified against the installed `openai@7.53.0` type
// definitions (ResponseCreateParams: input, text.format json_schema
// {type,name,schema,strict}, temperature, max_output_tokens; Response:
// output_text, status, incomplete_details, refusal content items).
// Reasoning models (e.g. gpt-5.6-luna, verified 2026-11-10) reject `temperature`
// with a 400: set OPENAI_TEMPERATURE=off. They also spend output tokens on
// reasoning, which can exhaust the 300-token budget and come back "incomplete"
// (the stylist then falls back to the rule-based picks): set
// OPENAI_REASONING_EFFORT=none (gpt-5.6-luna accepts none|low|medium|high,
// not minimal) to keep replies fast and inside the budget.

// Named import: Vercel's builder resolves the CJS typings, where the default import is the module.
import { OpenAI } from "openai";
import { GARMENT_IDS } from "../catalog.js";

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

export type LLMReply =
  | { kind: "text"; text: string }
  | { kind: "refusal"; refusal: string }
  | { kind: "incomplete"; reason: string };

/** One LLM call. Throws on transport/API errors (timeout, 401, 429, 5xx). */
export type StylistLLM = (turns: ChatTurn[]) => Promise<LLMReply>;

export const LLM_TIMEOUT_MS = 8_000;
export const LLM_MAX_OUTPUT_TOKENS = 300;
export const LLM_DEFAULT_TEMPERATURE = 0.3;

// Output schema copied from docs/plan.md "4. Schema đầu ra". Strict mode
// supports enum, minItems and maxItems; the server validates again anyway.
export const STYLIST_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["recommendations"],
  properties: {
    recommendations: {
      type: "array",
      minItems: 2,
      maxItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["garmentId", "reason", "pairWith"],
        properties: {
          garmentId: { type: "string", enum: [...GARMENT_IDS] },
          reason: { type: "string" },
          pairWith: { type: "string" },
        },
      },
    },
  },
} as const;

export interface OpenAIStylistConfig {
  apiKey: string;
  model: string;
  /** undefined = omit the parameter. */
  temperature?: number;
  /** Sent as reasoning.effort; undefined = omit (non-reasoning models reject it). */
  reasoningEffort?: ReasoningEffortSetting;
}

export const REASONING_EFFORTS = ["none", "minimal", "low", "medium", "high", "xhigh", "max"] as const;
export type ReasoningEffortSetting = (typeof REASONING_EFFORTS)[number];

function isReasoningEffort(v: string): v is ReasoningEffortSetting {
  return (REASONING_EFFORTS as readonly string[]).includes(v);
}

/** Reads OPENAI_* env. Returns null when the key or model is missing. */
export function readOpenAIConfig(env: NodeJS.ProcessEnv = process.env): OpenAIStylistConfig | null {
  const apiKey = env.OPENAI_API_KEY?.trim();
  const model = env.OPENAI_MODEL?.trim();
  if (!apiKey || !model) return null;

  const rawTemp = env.OPENAI_TEMPERATURE?.trim().toLowerCase();
  let temperature: number | undefined = LLM_DEFAULT_TEMPERATURE;
  if (rawTemp === "off") temperature = undefined;
  else if (rawTemp) {
    const n = Number(rawTemp);
    if (Number.isFinite(n) && n >= 0 && n <= 2) temperature = n;
  }
  const rawEffort = env.OPENAI_REASONING_EFFORT?.trim().toLowerCase();
  const reasoningEffort = rawEffort && isReasoningEffort(rawEffort) ? rawEffort : undefined;

  return { apiKey, model, temperature, ...(reasoningEffort ? { reasoningEffort } : {}) };
}

export function createOpenAIStylistLLM(config: OpenAIStylistConfig): StylistLLM {
  // maxRetries 0: the stylist does its own single retry and must stay fast.
  const client = new OpenAI({ apiKey: config.apiKey, timeout: LLM_TIMEOUT_MS, maxRetries: 0 });

  return async (turns) => {
    const response = await client.responses.create({
      model: config.model,
      input: turns.map((t) => ({ role: t.role, content: t.content })),
      text: {
        format: {
          type: "json_schema",
          name: "outfit_recommendations",
          strict: true,
          schema: STYLIST_OUTPUT_SCHEMA as unknown as Record<string, unknown>,
        },
      },
      max_output_tokens: LLM_MAX_OUTPUT_TOKENS,
      ...(config.temperature === undefined ? {} : { temperature: config.temperature }),
      ...(config.reasoningEffort === undefined ? {} : { reasoning: { effort: config.reasoningEffort } }),
    });

    if (response.status === "incomplete") {
      return { kind: "incomplete", reason: response.incomplete_details?.reason ?? "unknown" };
    }
    for (const item of response.output) {
      if (item.type !== "message") continue;
      for (const part of item.content) {
        if (part.type === "refusal") return { kind: "refusal", refusal: part.refusal };
      }
    }
    return { kind: "text", text: response.output_text };
  };
}
