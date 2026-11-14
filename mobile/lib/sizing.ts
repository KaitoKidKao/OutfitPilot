// Size advice (Sang, 14/11). SAMPLE DATA: one generic size chart per gender
// (height / weight ranges for S–XL), not the real chart of any brand. The verdict
// is a simple rule against that chart and the height/weight the user typed in;
// the camera does NOT measure the body. Everything is stored on this device only.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

import { getGarment, type GarmentId } from "./catalog";

export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];
export type FitPref = "om" | "vua" | "rong";

export interface Body {
  height: number; // cm
  weight: number; // kg
  fit: FitPref;
}

interface Row {
  size: Size;
  h: [number, number];
  w: [number, number];
}

/** Sample chart ("Bảng size mẫu"): height cm / weight kg per size. */
export const SIZE_CHART: Record<"men" | "women", Row[]> = {
  men: [
    { size: "S", h: [158, 166], w: [48, 57] },
    { size: "M", h: [165, 172], w: [56, 65] },
    { size: "L", h: [171, 178], w: [64, 73] },
    { size: "XL", h: [177, 186], w: [72, 85] },
  ],
  women: [
    { size: "S", h: [148, 156], w: [40, 47] },
    { size: "M", h: [155, 162], w: [46, 53] },
    { size: "L", h: [160, 167], w: [52, 60] },
    { size: "XL", h: [165, 173], w: [59, 68] },
  ],
};

export function chartGender(garmentId: GarmentId, fallback: "men" | "women"): "men" | "women" {
  const g = getGarment(garmentId).gender;
  return g === "men" || g === "women" ? g : fallback;
}

/** Position on the chart as a fractional size index (0 = S … 3 = XL). */
function bodyIndex(body: Body, gender: "men" | "women"): number {
  const rows = SIZE_CHART[gender];
  const pos = (v: number, key: "h" | "w") => {
    // Linear position between row midpoints.
    const m = rows.map((r) => (r[key][0] + r[key][1]) / 2);
    const at = (k: number) => m[k] ?? 0;
    const n = m.length - 1;
    if (v <= at(0)) return -(at(0) - v) / (at(1) - at(0));
    for (let k = 0; k < n; k++) {
      if (v <= at(k + 1)) return k + (v - at(k)) / (at(k + 1) - at(k));
    }
    return n + (v - at(n)) / (at(n) - at(n - 1));
  };
  // Weight decides most of the fit; height matters for length.
  let idx = pos(body.weight, "w") * 0.65 + pos(body.height, "h") * 0.35;
  if (body.fit === "om") idx -= 0.35;
  if (body.fit === "rong") idx += 0.45;
  return idx;
}

export function recommendSize(body: Body, gender: "men" | "women"): Size {
  const i = Math.round(Math.min(SIZES.length - 1, Math.max(0, bodyIndex(body, gender))));
  return SIZES[i] ?? "M";
}

export interface Verdict {
  tone: "good" | "tight" | "loose";
  title: string;
  reason: string;
}

export function sizeVerdict(chosen: Size, body: Body, gender: "men" | "women"): Verdict {
  const best = recommendSize(body, gender);
  const diff = SIZES.indexOf(chosen) - SIZES.indexOf(best);
  const fitWord = body.fit === "om" ? ", thích mặc ôm" : body.fit === "rong" ? ", thích mặc rộng" : "";
  const reason = `Theo ${body.height}cm, ${body.weight}kg${fitWord} · bảng size mẫu`;
  if (diff === 0) return { tone: "good", title: `Size ${chosen} vừa với bạn`, reason };
  if (diff < 0) return { tone: "tight", title: `Có thể hơi chật, nên thử ${best}`, reason };
  return { tone: "loose", title: `Có thể hơi rộng, nên thử ${best}`, reason };
}

// ---------- device storage (body + chosen size per garment) ----------

const BODY_KEY = "outfitpilot.body.v1";
const SIZES_KEY = "outfitpilot.sizes.v1";

interface SizingState {
  ready: boolean;
  body: Body | null;
  sizes: Record<string, Size>;
}

let state: SizingState = { ready: false, body: null, sizes: {} };
let loading = false;
const listeners = new Set<() => void>();
const set = (next: Partial<SizingState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

async function load() {
  if (loading || state.ready) return;
  loading = true;
  let body: Body | null = null;
  let sizes: Record<string, Size> = {};
  try {
    const [b, z] = await Promise.all([AsyncStorage.getItem(BODY_KEY), AsyncStorage.getItem(SIZES_KEY)]);
    body = b ? (JSON.parse(b) as Body) : null;
    sizes = z ? (JSON.parse(z) as Record<string, Size>) : {};
  } catch {
    // keep defaults
  }
  set({ ready: true, body, sizes });
}

export async function saveBody(body: Body) {
  set({ body });
  await AsyncStorage.setItem(BODY_KEY, JSON.stringify(body)).catch(() => undefined);
}

export async function saveSize(garmentId: GarmentId, size: Size) {
  const sizes = { ...state.sizes, [garmentId]: size };
  set({ sizes });
  await AsyncStorage.setItem(SIZES_KEY, JSON.stringify(sizes)).catch(() => undefined);
}

function subscribe(l: () => void) {
  listeners.add(l);
  void load();
  return () => {
    listeners.delete(l);
  };
}

/** Body info and chosen sizes, loaded from the device. `ready` is false until read. */
export function useSizing(): SizingState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
