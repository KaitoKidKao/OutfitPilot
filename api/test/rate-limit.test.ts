import { describe, expect, it, vi } from "vitest";
import type { ErrorEnvelope } from "../src/contract.js";
import { makeApp, postJson } from "./helpers.js";

const okFetch = vi.fn<typeof fetch>(
  async () => new Response(JSON.stringify({ apiKey: "ek_x", expiresAt: "2026-11-14T04:02:00Z" }), { status: 200 }),
);
const env = () => ({ DECART_API_KEY: "dct_test" });
const style = { occasionId: "campus_day", style: "none", locale: "en" };

describe("rate limiting (in-memory fixed window per IP)", () => {
  it("token route: 6 per minute, the 7th gets 429 with Retry-After", async () => {
    const app = makeApp({ env, fetchImpl: okFetch });
    const ip = { "x-real-ip": "1.2.3.4" };
    for (let i = 0; i < 6; i++) {
      expect((await postJson(app, "/api/realtime-token", {}, ip)).status).toBe(200);
    }
    const res = await postJson(app, "/api/realtime-token", {}, ip);
    expect(res.status).toBe(429);
    expect(((await res.json()) as ErrorEnvelope).error.code).toBe("rate_limited");
    expect(Number(res.headers.get("retry-after"))).toBeGreaterThan(0);

    // A different client IP is counted separately.
    expect((await postJson(app, "/api/realtime-token", {}, { "x-real-ip": "5.6.7.8" })).status).toBe(200);
  });

  it("style route: 20 per minute, then 429; resets after the window", async () => {
    let now = 1_000_000;
    const app = makeApp({ now: () => now });
    const ip = { "x-forwarded-for": "9.9.9.9, 10.0.0.1" };
    for (let i = 0; i < 20; i++) {
      expect((await postJson(app, "/api/style", style, ip)).status).toBe(200);
    }
    expect((await postJson(app, "/api/style", style, ip)).status).toBe(429);
    now += 60_000;
    expect((await postJson(app, "/api/style", style, ip)).status).toBe(200);
  });

  it("style and token limits are independent", async () => {
    const app = makeApp({ env, fetchImpl: okFetch, limits: { token: { limit: 1, windowMs: 60_000 } } });
    const ip = { "x-real-ip": "2.2.2.2" };
    expect((await postJson(app, "/api/realtime-token", {}, ip)).status).toBe(200);
    expect((await postJson(app, "/api/realtime-token", {}, ip)).status).toBe(429);
    expect((await postJson(app, "/api/style", style, ip)).status).toBe(200);
  });

  it("with a socket-based clientIp (local dev), a spoofed x-real-ip does not reset the limit", async () => {
    const app = makeApp({ env, fetchImpl: okFetch, clientIp: () => "192.168.1.50" });
    for (let i = 0; i < 6; i++) {
      expect((await postJson(app, "/api/realtime-token", {}, { "x-real-ip": `10.0.0.${i}` })).status).toBe(200);
    }
    expect((await postJson(app, "/api/realtime-token", {}, { "x-real-ip": "10.0.0.99" })).status).toBe(429);
  });

  it("very long client keys are truncated, so they share one bucket", async () => {
    const app = makeApp({ env, fetchImpl: okFetch, limits: { token: { limit: 1, windowMs: 60_000 } } });
    const base = "a".repeat(64);
    expect((await postJson(app, "/api/realtime-token", {}, { "x-real-ip": `${base}1` })).status).toBe(200);
    expect((await postJson(app, "/api/realtime-token", {}, { "x-real-ip": `${base}2` })).status).toBe(429);
  });

  it("token route has an all-clients cap per instance (default 20/min)", async () => {
    const app = makeApp({ env, fetchImpl: okFetch });
    for (let i = 0; i < 20; i++) {
      expect((await postJson(app, "/api/realtime-token", {}, { "x-real-ip": `3.3.3.${i}` })).status).toBe(200);
    }
    const res = await postJson(app, "/api/realtime-token", {}, { "x-real-ip": "4.4.4.4" });
    expect(res.status).toBe(429);
    expect(((await res.json()) as ErrorEnvelope).error.code).toBe("rate_limited");
  });

  it("TOKEN_GLOBAL_PER_MIN overrides the all-clients cap", async () => {
    const app = makeApp({ env: () => ({ DECART_API_KEY: "dct_test", TOKEN_GLOBAL_PER_MIN: "2" }), fetchImpl: okFetch });
    expect((await postJson(app, "/api/realtime-token", {}, { "x-real-ip": "7.7.7.1" })).status).toBe(200);
    expect((await postJson(app, "/api/realtime-token", {}, { "x-real-ip": "7.7.7.2" })).status).toBe(200);
    expect((await postJson(app, "/api/realtime-token", {}, { "x-real-ip": "7.7.7.3" })).status).toBe(429);
  });
});
