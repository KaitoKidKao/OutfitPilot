// Typed client for the OutfitPilot API (Hono, see api/src/contract.ts).
// Types below mirror api/src/contract.ts exactly (without zod). Change both together.
//
//   GET  /api/health          -> 200 { ok: true }
//   POST /api/style           -> 200 StyleResponse | 400 | 429
//   POST /api/realtime-token  -> 200 RealtimeTokenResponse | 429 | 500 | 503
//   Every non-2xx response uses ErrorEnvelope.
//
// Security: the only value this app knows is the public API base URL. Provider
// keys live on the server; this file must never reference them.

import { isGarmentId, type GarmentId, type OccasionId } from "./catalog";

export type { GarmentId, OccasionId };

export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];

// ---------- GET /api/health ----------
export interface HealthResponse {
  ok: true;
}

// ---------- POST /api/style ----------
export interface StyleRequest {
  occasionId: OccasionId;
  /** A catalog style tag (see STYLE_VALUES in lib/catalog.ts) or "none". */
  style: string;
  locale: Locale;
  customOccasion?: string;
  gender?: "women" | "men";
}

export interface Recommendation {
  garmentId: GarmentId;
  reason: string;
  pairWith: string;
}

export type StyleSource = "llm" | "fallback";

export interface StyleResponse {
  /** Exactly 2 items with different garmentIds. [0] = Look A, [1] = Look B. */
  recommendations: [Recommendation, Recommendation];
  /** "fallback" = rule-based default; the UI must label it as such. */
  source: StyleSource;
}

// ---------- POST /api/realtime-token ----------
export interface RealtimeTokenResponse {
  /** Short-lived Decart client key. Returned from the SDK's apiKeyProvider. */
  token: string;
  /** ISO 8601 expiry. */
  expiresAt: string;
  /** Model the token is scoped to. The app connects with this exact string. */
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

/** Client-side failure kinds that never come from the server. */
export type ClientErrorCode = "no_api_url" | "network_error" | "timeout" | "bad_response";

export class ApiError extends Error {
  readonly code: ErrorCode | ClientErrorCode;
  /** HTTP status, or 0 when the request never got a response. */
  readonly status: number;

  constructor(code: ErrorCode | ClientErrorCode, message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// ---------- Config ----------

// Must be read as process.env.EXPO_PUBLIC_API_URL literally: Expo only inlines
// that exact form (no destructuring, no bracket access).
const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL;

const OCTET = "(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)";
/** http://<localhost | 127.0.0.1 | 10/8 | 172.16/12 | 192.168/16>[:port][/path] */
const LAN_HTTP_URL = new RegExp(
  `^http://(?:localhost|127\\.0\\.0\\.1|10\\.${OCTET}\\.${OCTET}\\.${OCTET}|172\\.(?:1[6-9]|2\\d|3[01])\\.${OCTET}\\.${OCTET}|192\\.168\\.${OCTET}\\.${OCTET})(?::\\d{1,5})?(?:/[^\\s]*)?$`,
);

function normalizeBaseUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!/^https?:\/\/[^<>\s]+$/.test(trimmed)) return null; // also rejects the "<LAN-IP>" placeholder
  // /api/realtime-token returns a bearer token for a billed session: plain http (LAN API)
  // is accepted only in development builds or LAN IPs during testing, never in a public release bundle.
  // The host must BE a private address: anchored on the whole authority, so a public host
  // such as http://45.192.168.1.9 or http://192.168.1.1.evil.com is rejected.
  // TODO(after-demo): drop this exception once every build points at the https API.
  if (!__DEV__ && !trimmed.startsWith("https://") && !LAN_HTTP_URL.test(trimmed)) return null;
  return trimmed;
}

export const API_URL: string | null = normalizeBaseUrl(RAW_API_URL);

export function isApiConfigured(): boolean {
  return API_URL !== null;
}

const TIMEOUT_MS = {
  health: 5_000,
  // Server: 8 s LLM timeout + at most 1 retry, then rule-based fallback.
  style: 20_000,
  token: 10_000,
} as const;

// ---------- Transport ----------

const ERROR_CODES: readonly string[] = [
  "bad_request",
  "rate_limited",
  "not_configured",
  "upstream_error",
  "not_found",
  "internal_error",
];

function parseErrorEnvelope(body: unknown): ErrorEnvelope["error"] | null {
  if (typeof body !== "object" || body === null) return null;
  const err = (body as { error?: unknown }).error;
  if (typeof err !== "object" || err === null) return null;
  const { code, message } = err as { code?: unknown; message?: unknown };
  if (typeof code !== "string" || !ERROR_CODES.includes(code)) return null;
  return { code: code as ErrorCode, message: typeof message === "string" ? message : code };
}

async function request(path: string, init: { method: "GET" | "POST"; body?: unknown }, timeoutMs: number): Promise<unknown> {
  if (!API_URL) {
    throw new ApiError("no_api_url", "EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and restart Metro.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init.method,
      headers: init.body !== undefined ? { "Content-Type": "application/json", Accept: "application/json" } : { Accept: "application/json" },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if (controller.signal.aborted) {
      throw new ApiError("timeout", `Request to ${path} timed out after ${Math.round(timeoutMs / 1000)} s.`);
    }
    throw new ApiError("network_error", `Cannot reach the API at ${API_URL}. Same Wi-Fi? Server running? (${String((e as Error)?.message ?? e)})`);
  } finally {
    clearTimeout(timer);
  }

  let body: unknown = null;
  const text = await res.text().catch(() => "");
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const env = parseErrorEnvelope(body);
    if (env) throw new ApiError(env.code, env.message, res.status);
    throw new ApiError("bad_response", `HTTP ${res.status} from ${path} without an error envelope.`, res.status);
  }
  if (body === null) throw new ApiError("bad_response", `Empty or non-JSON response from ${path}.`, res.status);
  return body;
}

// ---------- Response guards (the app trusts nothing it did not check) ----------

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function toRecommendation(v: unknown): Recommendation | null {
  if (typeof v !== "object" || v === null) return null;
  const { garmentId, reason, pairWith } = v as Record<string, unknown>;
  if (!isGarmentId(garmentId) || !isNonEmptyString(reason) || !isNonEmptyString(pairWith)) return null;
  return { garmentId, reason, pairWith };
}

function toStyleResponse(body: unknown): StyleResponse {
  const { recommendations, source } = (body ?? {}) as Record<string, unknown>;
  if (!Array.isArray(recommendations) || recommendations.length !== 2) {
    throw new ApiError("bad_response", "Style response must contain exactly 2 recommendations.", 200);
  }
  const a = toRecommendation(recommendations[0]);
  const b = toRecommendation(recommendations[1]);
  if (!a || !b || a.garmentId === b.garmentId) {
    throw new ApiError("bad_response", "Style response has invalid or duplicate garment ids.", 200);
  }
  if (source !== "llm" && source !== "fallback") {
    throw new ApiError("bad_response", "Style response has an unknown source.", 200);
  }
  return { recommendations: [a, b], source };
}

function toRealtimeToken(body: unknown): RealtimeTokenResponse {
  const { token, expiresAt, model } = (body ?? {}) as Record<string, unknown>;
  if (!isNonEmptyString(token) || !isNonEmptyString(expiresAt) || !isNonEmptyString(model) || Number.isNaN(Date.parse(expiresAt))) {
    throw new ApiError("bad_response", "Realtime token response is missing token, expiresAt or model.", 200);
  }
  return { token, expiresAt, model };
}

// ---------- Public API ----------

export async function getHealth(): Promise<HealthResponse> {
  const body = await request("/api/health", { method: "GET" }, TIMEOUT_MS.health);
  if ((body as { ok?: unknown }).ok !== true) throw new ApiError("bad_response", "Health check did not return ok:true.", 200);
  return { ok: true };
}

export async function postStyle(req: StyleRequest): Promise<StyleResponse> {
  const body = await request("/api/style", { method: "POST", body: req }, TIMEOUT_MS.style);
  return toStyleResponse(body);
}

/** Mints a fresh short-lived Decart client token. Called by lib/decart.ts only. */
export async function postRealtimeToken(): Promise<RealtimeTokenResponse> {
  const body = await request("/api/realtime-token", { method: "POST", body: {} }, TIMEOUT_MS.token);
  return toRealtimeToken(body);
}

/** One short, human-readable line for an API failure (English, for the UI). */
export function describeApiError(e: unknown): string {
  if (!(e instanceof ApiError)) return String((e as Error)?.message ?? e);
  switch (e.code) {
    case "no_api_url":
      return "API address not set (EXPO_PUBLIC_API_URL).";
    case "not_configured":
      // Wording avoids the server env var name so a bundle grep for it stays clean.
      return "AI is not configured on the server yet (no Decart key set there).";
    case "rate_limited":
      return "Too many requests. Wait a moment and try again.";
    case "timeout":
    case "network_error":
      return e.message;
    default:
      return `${e.message} (${e.code}${e.status ? `, HTTP ${e.status}` : ""})`;
  }
}
