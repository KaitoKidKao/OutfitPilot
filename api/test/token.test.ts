import { describe, expect, it, vi } from "vitest";
import type { ErrorEnvelope, RealtimeTokenResponse } from "../src/contract.js";
import { DECART_VTON_MODEL } from "../src/decart/token.js";
import { makeApp, postJson } from "./helpers.js";

const PERMANENT = "dct_permanent_test_key";
const env = () => ({ DECART_API_KEY: PERMANENT });

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("POST /api/realtime-token", () => {
  it("503 not_configured when DECART_API_KEY is missing", async () => {
    const res = await postJson(makeApp(), "/api/realtime-token", {});
    expect(res.status).toBe(503);
    expect(((await res.json()) as ErrorEnvelope).error.code).toBe("not_configured");
  });

  it("503 also with the real env and an empty key", async () => {
    const res = await postJson(makeApp({ env: () => process.env }), "/api/realtime-token", {});
    expect(res.status).toBe(503);
  });

  it("mints a scoped short-lived token with the documented request and returns the contract shape", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({ apiKey: "ek_short", token: "eyJ.jwt", expiresAt: "2026-11-14T04:02:00Z", permissions: { models: [DECART_VTON_MODEL] } }),
    );
    const res = await postJson(makeApp({ env, fetchImpl }), "/api/realtime-token", {});
    expect(res.status).toBe(200);
    const json = (await res.json()) as RealtimeTokenResponse;
    expect(json).toEqual({ token: "ek_short", expiresAt: "2026-11-14T04:02:00Z", model: "lucy-vton-3.6" });
    expect(res.headers.get("cache-control")).toBe("no-store");

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://api.decart.ai/v1/client/tokens");
    expect(init?.method).toBe("POST");
    const headers = init?.headers as Record<string, string>;
    expect(headers["X-API-KEY"]).toBe(PERMANENT);
    expect(JSON.parse(String(init?.body))).toEqual({
      expiresIn: 120,
      allowedModels: ["lucy-vton-3.6"],
      constraints: { realtime: { maxSessionDuration: 120 } },
    });
  });

  it("accepts a request with no body", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => jsonResponse({ apiKey: "ek_x", expiresAt: "2026-11-14T04:02:00Z" }));
    const res = await makeApp({ env, fetchImpl }).request("/api/realtime-token", { method: "POST" });
    expect(res.status).toBe(200);
  });

  it("never returns the permanent key, even on upstream errors", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(`bad key ${PERMANENT}`, { status: 401 }));
    const res = await postJson(makeApp({ env, fetchImpl }), "/api/realtime-token", {});
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toContain(PERMANENT);
    expect(JSON.parse(text).error.code).toBe("upstream_error");
  });

  it("upstream 429 -> 429 rate_limited", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response("slow down", { status: 429 }));
    const res = await postJson(makeApp({ env, fetchImpl }), "/api/realtime-token", {});
    expect(res.status).toBe(429);
    expect(((await res.json()) as ErrorEnvelope).error.code).toBe("rate_limited");
  });

  it("network failure or malformed response -> 500 upstream_error", async () => {
    const boom = vi.fn<typeof fetch>(async () => {
      throw new TypeError("fetch failed");
    });
    expect((await postJson(makeApp({ env, fetchImpl: boom }), "/api/realtime-token", {})).status).toBe(500);

    const malformed = vi.fn<typeof fetch>(async () => jsonResponse({ token: "eyJ.only-jwt" }));
    expect((await postJson(makeApp({ env, fetchImpl: malformed }), "/api/realtime-token", {})).status).toBe(500);
  });

  it("ignores the request body: invalid JSON still gets a contract status, never 400", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => jsonResponse({ apiKey: "ek_x", expiresAt: "2026-11-14T04:02:00Z" }));
    expect((await postJson(makeApp({ env, fetchImpl }), "/api/realtime-token", "{oops")).status).toBe(200);
    expect((await postJson(makeApp(), "/api/realtime-token", "{oops")).status).toBe(503);
  });
});
