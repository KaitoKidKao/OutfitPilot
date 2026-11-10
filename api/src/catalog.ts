// Catalog and occasions copied exactly from docs/plan.md, section
// "Prompt cho AI Stylist" (items 2 and 3). Keep this file in sync with the
// plan: the LLM sees these objects verbatim as JSON.

export const GARMENT_IDS = ["G01", "G02", "G03", "G04", "G05", "G06"] as const;
export type GarmentId = (typeof GARMENT_IDS)[number];

export interface Garment {
  id: GarmentId;
  name: string;
  type: string;
  color: string;
  formality: number;
  styles: string[];
  cut: string;
}

// Property order matches the plan so JSON.stringify produces the same line.
export const CATALOG: readonly Garment[] = [
  { id: "G01", name: "Navy Blazer", type: "outerwear", color: "navy", formality: 4, styles: ["formal", "smart"], cut: "tailored, structured" },
  { id: "G02", name: "White Oxford Shirt", type: "shirt", color: "white", formality: 4, styles: ["formal", "minimal"], cut: "crisp, classic" },
  { id: "G03", name: "Cream Knit Sweater", type: "knitwear", color: "cream", formality: 2, styles: ["casual", "soft"], cut: "knit, relaxed" },
  { id: "G04", name: "Denim Jacket", type: "outerwear", color: "blue denim", formality: 1, styles: ["casual", "street"], cut: "boxy, rugged" },
  { id: "G05", name: "Black Bomber Jacket", type: "outerwear", color: "black", formality: 2, styles: ["street", "minimal"], cut: "sporty, cropped" },
  { id: "G06", name: "Beige Overshirt", type: "overshirt", color: "beige", formality: 3, styles: ["casual", "smart"], cut: "relaxed, layering" },
];

export const OCCASION_IDS = ["job_interview", "campus_day", "coffee_date", "other"] as const;
export type OccasionId = (typeof OCCASION_IDS)[number];

export interface Occasion {
  id: OccasionId;
  label: string;
  dressCode: string;
  targetFormality: number;
}

// Labels: "Job Interview" is given in the plan's example message; the other two
// match DESIGN.md ("Campus Day", "Coffee Date"). "other" represents custom occasions.
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
  other: {
    id: "other",
    label: "Custom Occasion",
    dressCode: "Matches the user-specified custom occasion vibe and dress code.",
    targetFormality: 3,
  },
};

/** Every style tag that appears in the catalog, in first-seen order. */
export const STYLE_TAGS: readonly string[] = Array.from(new Set(CATALOG.flatMap((g) => g.styles)));

export const STYLE_VALUES: readonly string[] = [...STYLE_TAGS, "none"];

export function getGarment(id: string): Garment | undefined {
  return CATALOG.find((g) => g.id === id);
}
