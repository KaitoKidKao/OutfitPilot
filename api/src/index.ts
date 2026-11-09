// Vercel entry point (zero-config Hono: src/index.ts with a default export
// of the Hono instance; no vercel.json or api/ folder needed).
import { Hono } from "hono";
import { createApp } from "./create-app.js";

const app = createApp({}, new Hono());

export default app;
