// Simple in-memory fixed-window rate limiter, keyed by route + client IP,
// plus an optional all-clients bucket per route (used for paid Decart tokens).
//
// LIMITATION: counters live in one serverless instance's memory. On Vercel
// (Fluid compute) each instance has its own counters and they reset when the
// instance is recycled, so this only slows down casual abuse during the demo.
// Post-hackathon upgrade: a shared store such as Upstash Redis
// (@upstash/ratelimit) plus a per-device daily session cap.

import type { Context, MiddlewareHandler } from "hono";
import { errorBody } from "./contract.js";

export interface RateLimitRule {
  /** Max requests per window. */
  limit: number;
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export class FixedWindowLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(private readonly now: () => number = Date.now) {}

  /** Returns 0 when allowed, otherwise the seconds until the window resets. */
  hit(key: string, rule: RateLimitRule): number {
    const t = this.now();
    let b = this.buckets.get(key);
    if (!b || t >= b.resetAt) {
      b = { count: 0, resetAt: t + rule.windowMs };
      this.buckets.set(key, b);
    }
    b.count += 1;
    if (this.buckets.size > 10_000) this.sweep(t);
    return b.count > rule.limit ? Math.max(1, Math.ceil((b.resetAt - t) / 1000)) : 0;
  }

  private sweep(t: number) {
    for (const [k, b] of this.buckets) if (t >= b.resetAt) this.buckets.delete(k);
  }
}

/** Longest client key we store, so odd header values cannot bloat the map. */
export const MAX_CLIENT_KEY_CHARS = 64;

export type ClientIpFn = (c: Context) => string;

/**
 * Client IP from proxy headers. Use ONLY behind Vercel: Vercel overwrites
 * x-forwarded-for / x-real-ip with the real client address (anti-spoofing),
 * and @hono/vercel's getConnInfo reads x-real-ip, so we read the same headers.
 * Anywhere else (e.g. `npm run dev` on a LAN) these headers are set by the
 * client and can be spoofed; src/local.ts passes a socket-based function.
 */
export const headerClientIp: ClientIpFn = (c) =>
  c.req.header("x-real-ip")?.trim() ||
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
  "unknown";

export interface RateLimitOptions {
  /** How to identify the client. Default: headerClientIp (Vercel only). */
  clientIp?: ClientIpFn;
  /** Extra all-clients bucket checked after the per-client one passes. */
  global?: () => RateLimitRule | null;
}

export function rateLimit(
  limiter: FixedWindowLimiter,
  name: string,
  rule: RateLimitRule,
  options: RateLimitOptions = {},
): MiddlewareHandler {
  const clientIp = options.clientIp ?? headerClientIp;
  return async (c, next) => {
    const who = (clientIp(c) || "unknown").slice(0, MAX_CLIENT_KEY_CHARS);
    let retryAfter = limiter.hit(`${name}:ip:${who}`, rule);
    const globalRule = retryAfter === 0 ? options.global?.() : null;
    if (globalRule) retryAfter = limiter.hit(`${name}:global`, globalRule);
    if (retryAfter > 0) {
      c.header("Retry-After", String(retryAfter));
      return c.json(errorBody("rate_limited", `Too many requests. Try again in ${retryAfter} s.`), 429);
    }
    await next();
  };
}
