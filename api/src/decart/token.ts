// Mint a short-lived Decart client token with the permanent server key.
//
// Built only from facts confirmed in the official SDK source
// (github.com/decartai/sdk, packages/sdk/src/tokens/client.ts and
// shared/request.ts, @decartai/sdk 0.2.14):
//   POST https://api.decart.ai/v1/client/tokens
//   headers: X-API-KEY: <permanent key>, content-type: application/json
//   body (CreateTokenOptions): expiresIn (1-3600 s), allowedModels,
//         constraints.realtime.maxSessionDuration (seconds)
//   200 body (CreateTokenResponse): { apiKey: "ek_...", token?: JWT, expiresAt: ISO, ... }
// The client must receive `apiKey` (the SDK's apiKeyProvider returns it),
// not the JWT `token`.
// We call the endpoint with fetch instead of the SDK to keep the server
// bundle small; the request is the same one the SDK sends.
//
// `allowedOrigins` is deliberately NOT set: the SDK says it is enforced on
// the WebSocket Origin header and only protects browser clients, and it is
// unverified whether it breaks native (React Native) connections.

export const DECART_API_BASE = "https://api.decart.ai";
/** Exact model id from the SDK's model registry. The app must use the same string. */
export const DECART_VTON_MODEL = "lucy-vton-3.6";
/** docs/plan.md: token expiresIn 120 s and maxSessionDuration 120 s. */
export const TOKEN_TTL_SECONDS = 120;
export const MAX_SESSION_SECONDS = 120;
export const DECART_TIMEOUT_MS = 8_000;

export interface MintedToken {
  token: string;
  expiresAt: string;
  model: string;
}

export class DecartTokenError extends Error {
  constructor(
    message: string,
    /** Upstream HTTP status, or 0 for network/timeout/shape errors. */
    readonly status: number,
  ) {
    super(message);
    this.name = "DecartTokenError";
  }
}

export function buildTokenRequestBody() {
  return {
    expiresIn: TOKEN_TTL_SECONDS,
    allowedModels: [DECART_VTON_MODEL],
    constraints: { realtime: { maxSessionDuration: MAX_SESSION_SECONDS } },
  };
}

export async function mintDecartToken(
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<MintedToken> {
  let res: Response;
  try {
    res = await fetchImpl(`${DECART_API_BASE}/v1/client/tokens`, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "content-type": "application/json" },
      body: JSON.stringify(buildTokenRequestBody()),
      signal: AbortSignal.timeout(DECART_TIMEOUT_MS),
    });
  } catch (err) {
    const name = err instanceof Error ? err.name : "unknown";
    throw new DecartTokenError(`Decart token request failed (${name})`, 0);
  }

  if (!res.ok) {
    // TODO(verify): the exact status codes and JSON error body of
    // /v1/client/tokens are not documented in the SDK (it only reads the
    // status and raw text). We map by status alone and never forward the
    // upstream body to the app.
    throw new DecartTokenError(`Decart token request returned HTTP ${res.status}`, res.status);
  }

  return parseTokenResponse(await res.json().catch(() => null));
}

/** Pulls { apiKey, expiresAt } out of Decart's response; rejects anything else. */
export function parseTokenResponse(body: unknown): MintedToken {
  const b = (body ?? {}) as { apiKey?: unknown; expiresAt?: unknown };
  if (typeof b.apiKey !== "string" || b.apiKey === "" || typeof b.expiresAt !== "string" || b.expiresAt === "") {
    throw new DecartTokenError("Decart token response is missing apiKey or expiresAt", 0);
  }
  return { token: b.apiKey, expiresAt: b.expiresAt, model: DECART_VTON_MODEL };
}
