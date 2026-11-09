// OpenAI adapter for the AI Stylist (Responses API + Structured Outputs).
// The OpenAI SDK and key live only on this server (the SDK does not support
// React Native, and the key must never reach the app).
//
// Request shape verified against the installed `openai@7.53.0` type
// definitions (ResponseCreateParams: input, text.format json_schema
// {type,name,schema,strict}, temperature, max_output_tokens; Response:
// output_text, status, incomplete_details, refusal content items).
// TODO(verify on a real key): that the chosen OPENAI_MODEL accepts `temperature`.
// Some reasoning models reject it; set OPENAI_TEMPERATURE=off in that case.
// Reasoning models may also spend the 300-token budget on reasoning and come
// back "incomplete"; the stylist then falls back to the rule-based picks.

import OpenAI from "openai";
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
  return { apiKey, model, temperature };
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
