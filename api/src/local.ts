// Local dev server (npm run dev). Not used on Vercel.
// Loads api/.env.local if present (Node's built-in loader), then serves the
// same routes that Vercel serves from src/index.ts.
import { serve } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono } from "hono";
import { createApp } from "./create-app.js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: the API still runs; /api/style uses the fallback and
  // /api/realtime-token answers 503 not_configured.
}

// Same routes as src/index.ts, but rate limiting keys on the TCP socket
// address: off Vercel, x-real-ip / x-forwarded-for come from the client and
// anyone on the LAN could spoof them to dodge the limit.
const app = createApp({ clientIp: (c) => getConnInfo(c).remote.address ?? "unknown" }, new Hono());
const port = Number(process.env.PORT ?? 8787);

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`OutfitPilot API on http://localhost:${info.port} (LAN: use this PC's IP for EXPO_PUBLIC_API_URL)`);
});
