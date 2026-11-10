// Web screenshot helper. Inert everywhere except a web build started with
// EXPO_PUBLIC_PREVIEW_SEED=1. Then a URL such as /final?seed=final pre-fills the
// store with the server's rule-based default pair for Job Interview (G01 + G02),
// labelled source "fallback", so later screens can be screenshotted without a
// backend. It never pretends to be AI output.
// Add &sheet=saved to /final?seed=final to open the Saved looks sheet with one
// saved default suggestion (in memory only; nothing is written to storage).
import { Platform } from "react-native";

import type { StyleResponse } from "./api";
import type { OccasionId } from "./catalog";
import type { StyleChoice } from "./occasions";
import type { SavedLook } from "./store";

export type SeedRoute = "index" | "picks" | "setup" | "fitting" | "final";

export interface PreviewSeed {
  route: SeedRoute;
  occasionId: OccasionId | null;
  style: StyleChoice;
  picks: StyleResponse | null;
  consentGiven: boolean;
  /** Saved looks to start with (in memory). */
  saved: SavedLook[];
  /** Open the Saved looks sheet on first render (Final Look only). */
  openSavedSheet: boolean;
}

// Exactly what api/src/stylist/fallback.ts returns for
// { occasionId: "job_interview", style: "none", locale: "en" }.
const JOB_INTERVIEW_FALLBACK: StyleResponse = {
  recommendations: [
    {
      garmentId: "G01",
      reason: "Navy Blazer: right formality level for a job interview; navy, tailored, structured.",
      pairWith: "Dark tailored trousers and plain leather shoes",
    },
    {
      garmentId: "G02",
      reason: "White Oxford Shirt: right formality level for a job interview; white, crisp, classic.",
      pairWith: "Dark tailored trousers and plain leather shoes",
    },
  ],
  source: "fallback",
};

const ROUTES: readonly SeedRoute[] = ["index", "picks", "setup", "fitting", "final"];

/** Returns a seed only on web with EXPO_PUBLIC_PREVIEW_SEED=1 and a valid ?seed=<route>. */
export function readPreviewSeed(): PreviewSeed | null {
  if (Platform.OS !== "web") return null;
  // Must be read literally so Expo inlines it at build time.
  if (process.env.EXPO_PUBLIC_PREVIEW_SEED !== "1") return null;
  if (typeof window === "undefined" || !window.location) return null;

  const raw = new URLSearchParams(window.location.search).get("seed");
  const route = ROUTES.find((r) => r === raw);
  if (!route) return null;

  if (route === "index") {
    return { route, occasionId: null, style: "none", picks: null, consentGiven: false, saved: [], openSavedSheet: false };
  }
  const sheet = route === "final" && new URLSearchParams(window.location.search).get("sheet") === "saved";
  const first = JOB_INTERVIEW_FALLBACK.recommendations[0];
  const savedAt = "2026-11-09T09:30:00.000Z";
  return {
    route,
    occasionId: "job_interview",
    style: "none",
    picks: JOB_INTERVIEW_FALLBACK,
    consentGiven: route === "fitting" || route === "final",
    saved: sheet
      ? [
          {
            id: `${first.garmentId}-job_interview-${Date.parse(savedAt)}`,
            garmentId: first.garmentId,
            occasionId: "job_interview",
            reason: first.reason,
            pairWith: first.pairWith,
            source: JOB_INTERVIEW_FALLBACK.source,
            savedAt,
          },
        ]
      : [],
    openSavedSheet: sheet,
  };
}
