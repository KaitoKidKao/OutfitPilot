// Catalog + occasions, mirrored from docs/plan.md section "Prompt cho AI Stylist"
// (and api/src/catalog.ts). The server is the source of truth for what the LLM
// sees; this copy is for display and for building try-on prompts.
// Keep ids, names and attributes identical to the plan.

export const GARMENT_IDS = ["G01", "G02", "G03", "G04", "G05", "G06"] as const;
export type GarmentId = (typeof GARMENT_IDS)[number];

export const OCCASION_IDS = ["job_interview", "campus_day", "coffee_date"] as const;
export type OccasionId = (typeof OCCASION_IDS)[number];

export interface GarmentCredit {
  /** Photographer or rights holder, as the source names them. */
  author: string;
  /** Where the photo comes from, e.g. "Unsplash". */
  source: string;
  /** Page of the original photo (https). */
  url?: string;
  /** Licence name, e.g. "Unsplash License". */
  license?: string;
}

export interface Garment {
  id: GarmentId;
  name: string;
  type: string;
  color: string;
  formality: number;
  styles: string[];
  cut: string;
  /**
   * Bundled garment photo: require("../assets/garments/G0X.jpg") (4:5 portrait,
   * plain background, garment only). To send one to Decart it is converted to base64
   * first (lib/tryOnSession.ts); the SDK rejects file:// URIs.
   */
  image: number | null;
  /** Asset path of `image`, relative to mobile/. */
  imagePath: string;
  /**
   * true while the photo is a stand-in sample (Unsplash) rather than a licensed
   * product photo. The UI shows a "Sample" tag on it (DESIGN.md Chips).
   */
  sample: boolean;
  /** Provenance of the photo; null until the asset owner fills it in. */
  credit: GarmentCredit | null;
}

// Photos: assets/garments/G01.jpg ... G06.jpg, 1000x1250 (4:5). Unsplash samples until
// licensed photos arrive (user decision 2026-11-09); provenance in assets/garments/CREDITS.md.
const unsplash = (author: string, url: string): GarmentCredit => ({ author, source: "Unsplash", url, license: "Unsplash License" });

export const CATALOG: readonly Garment[] = [
  { id: "G01", name: "Navy Blazer", type: "outerwear", color: "navy", formality: 4, styles: ["formal", "smart"], cut: "tailored, structured", image: require("../assets/garments/G01.jpg"), imagePath: "assets/garments/G01.jpg", sample: true, credit: unsplash("Robert Richman", "https://unsplash.com/photos/two-jackets-hanging-on-a-clothes-line-cYRsB4liZPs") },
  { id: "G02", name: "White Oxford Shirt", type: "shirt", color: "white", formality: 4, styles: ["formal", "minimal"], cut: "crisp, classic", image: require("../assets/garments/G02.jpg"), imagePath: "assets/garments/G02.jpg", sample: true, credit: unsplash("Nimble Made", "https://unsplash.com/photos/white-button-up-shirt-on-clothes-hanger-hMMXhKSZk7k") },
  { id: "G03", name: "Cream Cardigan", type: "knitwear", color: "cream", formality: 2, styles: ["casual", "soft"], cut: "knit, relaxed", image: require("../assets/garments/G03.jpg"), imagePath: "assets/garments/G03.jpg", sample: true, credit: unsplash("Yuliia Pakhomova", "https://unsplash.com/photos/a-cream-colored-fuzzy-sweater-hanging-on-a-hanger-nU5cyclcWuA") },
  { id: "G04", name: "Denim Jacket", type: "outerwear", color: "blue denim", formality: 1, styles: ["casual", "street"], cut: "boxy, rugged", image: require("../assets/garments/G04.jpg"), imagePath: "assets/garments/G04.jpg", sample: true, credit: unsplash("Caio Coelho", "https://unsplash.com/photos/blue-denim-button-up-jacket-QRN47la37gw") },
  { id: "G05", name: "Black Bomber Jacket", type: "outerwear", color: "black", formality: 2, styles: ["street", "minimal"], cut: "sporty, cropped", image: require("../assets/garments/G05.jpg"), imagePath: "assets/garments/G05.jpg", sample: true, credit: unsplash("nens love", "https://unsplash.com/photos/a-black-jacket-hanging-on-a-wall-next-to-a-white-chair-3S1feeK3ZJA") },
  { id: "G06", name: "Beige Overshirt", type: "overshirt", color: "beige", formality: 3, styles: ["casual", "smart"], cut: "relaxed, layering", image: require("../assets/garments/G06.jpg"), imagePath: "assets/garments/G06.jpg", sample: true, credit: unsplash("philippe wehrli", "https://unsplash.com/photos/a-pair-of-jeans-a-jacket-and-a-pair-of-sneakers-are-laid-out-j2Abvzsq8z4") },
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
