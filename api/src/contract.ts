// OutfitPilot API contract. The mobile app mirrors these types in
// mobile/lib/api.ts (without zod). Change both files together.
//
//   GET  /api/health          -> 200 { ok: true }
//   POST /api/style           -> 200 StyleResponse | 400 | 429
//   POST /api/realtime-token  -> 200 RealtimeTokenResponse | 429 | 500 | 503
//
// Every non-2xx response uses ErrorEnvelope.

import { z } from "zod";
import { GARMENT_IDS, OCCASION_IDS, STYLE_TAGS } from "./catalog.js";

export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];

// ---------- GET /api/health ----------
export interface HealthResponse {
  ok: true;
}

// ---------- POST /api/style ----------
// `style` must be a catalog style tag or "none". Anything else is rejected
// with 400 before it can reach the LLM (prompt-injection guard). Input is
// trimmed and lower-cased first, so " Minimal " is accepted as "minimal".
export const styleValueSchema = z
  .string()
  .max(32)
  .transform((s) => s.trim().toLowerCase())
  .refine((s) => s === "none" || STYLE_TAGS.includes(s), {
    message: `style must be one of: ${[...STYLE_TAGS, "none"].join(", ")}`,
  });

export const styleRequestSchema = z
  .object({
    occasionId: z.enum(OCCASION_IDS),
    style: styleValueSchema,
    locale: z.enum(LOCALES),
  })
  .strict();

export type StyleRequest = z.output<typeof styleRequestSchema>;

export const recommendationSchema = z
  .object({
    garmentId: z.enum(GARMENT_IDS),
    reason: z.string(),
    pairWith: z.string(),
  })
  .strict();

export type Recommendation = z.infer<typeof recommendationSchema>;

export type StyleSource = "llm" | "fallback";

export interface StyleResponse {
  /** Exactly 2 items with different garmentIds. [0] = Look A, [1] = Look B. */
  recommendations: [Recommendation, Recommendation];
  /** "fallback" = rule-based default; the UI must label it as such. */
  source: StyleSource;
}

// ---------- POST /api/realtime-token ----------
// Request body: {}. The server ignores the body entirely (no 400 on this route).
export interface RealtimeTokenResponse {
  /**
   * Short-lived Decart client key (the `apiKey` field, "ek_...", of Decart's
   * create-token response). Return it from the SDK's `apiKeyProvider`.
   */
  token: string;
  /** ISO 8601 expiry from Decart. */
  expiresAt: string;
  /** Model the token is scoped to. The app must connect with this exact string. */
  model: string;
}

// ---------- Errors ----------
export type ErrorCode =
  | "bad_request"
  | "rate_limited"
  | "not_configured"
  | "upstream_error"
  | "not_found"
  | "internal_error";

export interface ErrorEnvelope {
  error: { code: ErrorCode; message: string };
}

export function errorBody(code: ErrorCode, message: string): ErrorEnvelope {
  return { error: { code, message } };
}

/** Turn a zod error into one short, safe message (no echo of the raw input). */
export function describeZodError(err: z.ZodError): string {
  return err.issues
    .slice(0, 3)
    .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
    .join("; ");
}
