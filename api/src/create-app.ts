// Builds the Hono app. Dependencies are injectable so tests never touch the
// network or real keys. (Deliberately not named app.ts / server.ts: those are
// Vercel entry-point candidates, and src/index.ts is the one entry.)

import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import {
  describeZodError,
  errorBody,
  styleRequestSchema,
  type HealthResponse,
  type RealtimeTokenResponse,
  type StyleResponse,
} from "./contract.js";
import { DecartTokenError, mintDecartToken } from "./decart/token.js";
import { FixedWindowLimiter, rateLimit, type ClientIpFn, type RateLimitRule } from "./rate-limit.js";
import { createOpenAIStylistLLM, readOpenAIConfig, type StylistLLM } from "./stylist/openai.js";
import { recommend, type StylistLogger } from "./stylist/stylist.js";

export const MAX_BODY_BYTES = 2_048;

export interface AppDeps {
  /** Read on every request so Vercel env changes apply without code changes. */
  env?: () => NodeJS.ProcessEnv;
  /** Returns null when the LLM is not configured (-> fallback). */
  createLLM?: (env: NodeJS.ProcessEnv) => StylistLLM | null;
  /** Used for the Decart token request. */
  fetchImpl?: typeof fetch;
  now?: () => number;
  limits?: { style?: RateLimitRule; token?: RateLimitRule; tokenGlobal?: RateLimitRule };
  /**
   * Identifies the client for rate limiting. Default trusts x-real-ip /
   * x-forwarded-for, which is only safe behind Vercel. src/local.ts passes
   * the socket address instead.
   */
  clientIp?: ClientIpFn;
  log?: StylistLogger;
}

export const DEFAULT_LIMITS = {
  style: { limit: 20, windowMs: 60_000 },
  token: { limit: 6, windowMs: 60_000 },
  /** All clients together, per instance. Override with TOKEN_GLOBAL_PER_MIN. */
  tokenGlobal: { limit: 20, windowMs: 60_000 },
} satisfies Record<string, RateLimitRule>;

/** TOKEN_GLOBAL_PER_MIN as a positive integer, or null when unset/invalid. */
function readTokenGlobalPerMin(env: NodeJS.ProcessEnv): number | null {
  const raw = env.TOKEN_GLOBAL_PER_MIN?.trim();
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

function defaultLLMFactory(): (env: NodeJS.ProcessEnv) => StylistLLM | null {
  let cacheKey = "";
  let cached: StylistLLM | null = null;
  return (env) => {
    const config = readOpenAIConfig(env);
    if (!config) return null;
    const key = `${config.apiKey}|${config.model}|${config.temperature}`;
    if (key !== cacheKey) {
      cached = createOpenAIStylistLLM(config);
      cacheKey = key;
    }
    return cached;
  };
}

const defaultLog: StylistLogger = (event, detail) => {
  console.log(JSON.stringify({ event, ...detail }));
};

type JsonRead = { ok: true; value: unknown } | { ok: false; message: string };

async function readJson(c: Context, allowEmpty: boolean): Promise<JsonRead> {
  const declared = Number(c.req.header("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return { ok: false, message: "Request body is too large." };
  const text = await c.req.text();
  if (text.length > MAX_BODY_BYTES) return { ok: false, message: "Request body is too large." };
  if (text.trim() === "") {
    return allowEmpty ? { ok: true, value: {} } : { ok: false, message: "Request body must be JSON." };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, message: "Request body is not valid JSON." };
  }
}

export function createApp(deps: AppDeps = {}, app: Hono = new Hono()): Hono {
  const getEnv = deps.env ?? (() => process.env);
  const createLLM = deps.createLLM ?? defaultLLMFactory();
  const fetchImpl = deps.fetchImpl ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const log = deps.log ?? defaultLog;
  const limiter = new FixedWindowLimiter(deps.now);
  const limits = { ...DEFAULT_LIMITS, ...deps.limits };

  // Native apps do not send CORS requests; this only matters for Expo web or
  // other browser clients. Default deny: with CORS_ORIGINS empty no CORS
  // headers are sent, so third-party web pages cannot read responses (e.g. a
  // minted token) from their visitors' browsers.
  app.use("/api/*", async (c, next) => {
    const origins = getEnv().CORS_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean);
    if (!origins || origins.length === 0) return next();
    return cors({
      origin: origins,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      maxAge: 600,
    })(c, next);
  });

  app.get("/api/health", (c) => c.json({ ok: true } satisfies HealthResponse));

  app.post("/api/style", rateLimit(limiter, "style", limits.style, { clientIp: deps.clientIp }), async (c) => {
    const body = await readJson(c, false);
    if (!body.ok) return c.json(errorBody("bad_request", body.message), 400);

    const parsed = styleRequestSchema.safeParse(body.value);
    if (!parsed.success) return c.json(errorBody("bad_request", describeZodError(parsed.error)), 400);

    const result: StyleResponse = await recommend(parsed.data, createLLM(getEnv()), log);
    return c.json(result);
  });

  const tokenLimit = rateLimit(limiter, "token", limits.token, {
    clientIp: deps.clientIp,
    global: () => {
      const perMin = readTokenGlobalPerMin(getEnv());
      return perMin ? { limit: perMin, windowMs: 60_000 } : limits.tokenGlobal;
    },
  });

  // The contract request is always {}; the body is ignored (never parsed), so
  // this route has no 400 path: 200 | 429 | 500 | 503 only.
  app.post("/api/realtime-token", tokenLimit, async (c) => {
    const apiKey = getEnv().DECART_API_KEY?.trim();
    if (!apiKey) {
      return c.json(errorBody("not_configured", "AI try-on is not configured on the server (DECART_API_KEY missing)."), 503);
    }

    try {
      const minted = await mintDecartToken(apiKey, fetchImpl);
      c.header("Cache-Control", "no-store");
      return c.json(minted satisfies RealtimeTokenResponse);
    } catch (err) {
      const status = err instanceof DecartTokenError ? err.status : 0;
      log("decart_token_error", { status });
      if (status === 429) {
        return c.json(errorBody("rate_limited", "The AI try-on provider is busy. Try again shortly."), 429);
      }
      return c.json(errorBody("upstream_error", "Could not start an AI try-on session. Try again."), 500);
    }
  });

  app.notFound((c) => c.json(errorBody("not_found", "Route not found."), 404));
  app.onError((err, c) => {
    log("unhandled_error", { name: err.name });
    return c.json(errorBody("internal_error", "Unexpected server error."), 500);
  });

  return app;
}
