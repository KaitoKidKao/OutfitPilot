// Server-side checks from docs/plan.md "5. Cài đặt gọi và kiểm tra":
// valid JSON, exactly 2 items, garmentId in the catalog and distinct,
// reason and pairWith non-empty, reason at most 200 characters.

import { getGarment, type GarmentId } from "../catalog.js";
import type { Recommendation } from "../contract.js";

export const MAX_REASON_CHARS = 200;

export type ValidationResult =
  | { ok: true; recommendations: [Recommendation, Recommendation] }
  | { ok: false; error: string };

/** Accepts the raw model text (JSON string) or an already-parsed value. */
export function validateStylistOutput(raw: unknown): ValidationResult {
  let data: unknown = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return { ok: false, error: "reply is not valid JSON" };
    }
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { ok: false, error: "reply must be a JSON object with a \"recommendations\" array" };
  }
  const recs = (data as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(recs)) {
    return { ok: false, error: "\"recommendations\" must be an array" };
  }
  if (recs.length !== 2) {
    return { ok: false, error: `"recommendations" must contain exactly 2 items, got ${recs.length}` };
  }

  const out: Recommendation[] = [];
  for (let i = 0; i < recs.length; i++) {
    const item: unknown = recs[i];
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return { ok: false, error: `recommendations[${i}] must be an object` };
    }
    const { garmentId, reason, pairWith } = item as Record<string, unknown>;

    if (typeof garmentId !== "string" || !getGarment(garmentId)) {
      return { ok: false, error: `recommendations[${i}].garmentId must be one of G01-G06 from the CATALOG` };
    }
    if (typeof reason !== "string" || reason.trim() === "") {
      return { ok: false, error: `recommendations[${i}].reason must be a non-empty string` };
    }
    if (reason.trim().length > MAX_REASON_CHARS) {
      return { ok: false, error: `recommendations[${i}].reason must be at most ${MAX_REASON_CHARS} characters` };
    }
    if (typeof pairWith !== "string" || pairWith.trim() === "") {
      return { ok: false, error: `recommendations[${i}].pairWith must be a non-empty string` };
    }
    out.push({ garmentId: garmentId as GarmentId, reason: reason.trim(), pairWith: pairWith.trim() });
  }

  const [a, b] = out as [Recommendation, Recommendation];
  if (a.garmentId === b.garmentId) {
    return { ok: false, error: "the two garmentId values must be different" };
  }
  return { ok: true, recommendations: [a, b] };
}
