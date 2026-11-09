// Guard: no test may reach the network. Any unmocked global fetch fails loudly.
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.stubGlobal("fetch", () => {
    throw new Error("Network access is not allowed in tests (unmocked global fetch).");
  });
  // Make sure real keys from the shell never leak into tests.
  for (const k of ["DECART_API_KEY", "OPENAI_API_KEY", "OPENAI_MODEL", "OPENAI_TEMPERATURE", "CORS_ORIGINS", "TOKEN_GLOBAL_PER_MIN"]) {
    vi.stubEnv(k, "");
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
});
