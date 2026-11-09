import { createApp, type AppDeps } from "../src/create-app.js";

export function makeApp(deps: AppDeps = {}) {
  return createApp({
    env: () => ({}),
    createLLM: () => null,
    fetchImpl: () => {
      throw new Error("unexpected Decart fetch");
    },
    log: () => {},
    ...deps,
  });
}

export function postJson(app: ReturnType<typeof makeApp>, path: string, body: unknown, headers: Record<string, string> = {}) {
  return app.request(path, {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });
}
