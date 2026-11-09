// Catalog + occasions, mirrored from docs/plan.md section "Prompt cho AI Stylist"
// (and api/src/catalog.ts). The server is the source of truth for what the LLM
// sees; this copy is for display and for building try-on prompts.
// Keep ids, names and attributes identical to the plan.

export const GARMENT_IDS = ["G01", "G02", "G03", "G04", "G05", "G06"] as const;
export type GarmentId = (typeof GARMENT_IDS)[number];

export const OCCASION_IDS = ["job_interview", "campus_day", "coffee_date"] as const;
export type OccasionId = (typeof OCCASION_IDS)[number];

export interface Garment {
  id: GarmentId;
  name: string;
  type: string;
  color: string;
  formality: number;
  styles: string[];
  cut: string;
  /**
   * Bundled garment photo, e.g. require("../assets/garments/G01.png").
   * TODO(team): add 6 LICENSED product photos as assets/garments/G01.png ... G06.png
   * (plain background, garment only, at least 512x512, JPEG/PNG/WebP), then
   * replace `null` below with the require(...). To send one to Decart it must be
   * converted to base64 or an https URL first (see toDecartImage in lib/decart.ts):
   * the SDK rejects file:// URIs.
   */
  image: number | null;
  /** Planned asset path, documented so the team knows what file to add. */
  imagePath: string;
}

export const CATALOG: readonly Garment[] = [
  { id: "G01", name: "Navy Blazer", type: "outerwear", color: "navy", formality: 4, styles: ["formal", "smart"], cut: "tailored, structured", image: null, imagePath: "assets/garments/G01.png" },
  { id: "G02", name: "White Oxford Shirt", type: "shirt", color: "white", formality: 4, styles: ["formal", "minimal"], cut: "crisp, classic", image: null, imagePath: "assets/garments/G02.png" },
  { id: "G03", name: "Cream Cardigan", type: "knitwear", color: "cream", formality: 2, styles: ["casual", "soft"], cut: "knit, relaxed", image: null, imagePath: "assets/garments/G03.png" },
  { id: "G04", name: "Denim Jacket", type: "outerwear", color: "blue denim", formality: 1, styles: ["casual", "street"], cut: "boxy, rugged", image: null, imagePath: "assets/garments/G04.png" },
  { id: "G05", name: "Black Bomber Jacket", type: "outerwear", color: "black", formality: 2, styles: ["street", "minimal"], cut: "sporty, cropped", image: null, imagePath: "assets/garments/G05.png" },
  { id: "G06", name: "Beige Overshirt", type: "overshirt", color: "beige", formality: 3, styles: ["casual", "smart"], cut: "relaxed, layering", image: null, imagePath: "assets/garments/G06.png" },
];

export interface Occasion {
  id: OccasionId;
  label: string;
  dressCode: string;
  targetFormality: number;
}

export const OCCASIONS: Readonly<Record<OccasionId, Occasion>> = {
  job_interview: {
    id: "job_interview",
    label: "Job Interview",
    dressCode: "Smart and formal. Clean, tailored, neutral colors. No street or very casual pieces.",
    targetFormality: 4,
  },
  campus_day: {
    id: "campus_day",
    label: "Campus Day",
    dressCode: "Casual and neat. Comfortable for a full day, easy to layer, nothing too formal.",
    targetFormality: 2,
  },
  coffee_date: {
    id: "coffee_date",
    label: "Coffee Date",
    dressCode: "Smart casual. Relaxed but put together, soft and approachable colors.",
    targetFormality: 3,
  },
};

/** Every style tag in the catalog plus "none": the allowed values of StyleRequest.style. */
export const STYLE_TAGS: readonly string[] = Array.from(new Set(CATALOG.flatMap((g) => g.styles)));
export const STYLE_VALUES: readonly string[] = [...STYLE_TAGS, "none"];

export function isGarmentId(value: unknown): value is GarmentId {
  return typeof value === "string" && (GARMENT_IDS as readonly string[]).includes(value);
}

export function getGarment(id: GarmentId): Garment {
  const garment = CATALOG.find((g) => g.id === id);
  if (!garment) throw new Error(`Unknown garment id ${id}`);
  return garment;
}

/**
 * Try-on prompt for Lucy VTON. Describes only the visible garment, following the
 * VTON 3.5 prompting guide (seen only as a search snippet; 3.6-specific guidance
 * is UNVERIFIED). TODO(verify): tune wording on device once real photos exist.
 */
export function tryOnPrompt(garment: Garment): string {
  return `A ${garment.color} ${garment.name.toLowerCase()}, ${garment.cut}, worn by the person in the video.`;
}
