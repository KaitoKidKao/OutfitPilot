// Catalog and occasions copied exactly from docs/plan.md, section
// "Prompt cho AI Stylist" (items 2 and 3). Keep this file in sync with the
// plan: the LLM sees these objects verbatim as JSON.

export const GARMENT_IDS = [
  "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10",
  "P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "P10",
  "W01-01", "W01-02", "W02-01", "W02-02", "W03-01", "W03-02", "W04-01", "W04-02", "W04-03",
  "W05-01", "W05-02", "W06-01", "W06-02", "W06-03", "W07-01", "W07-02", "W08-01", "W09-01", "W10-01",
  // Batch 1 24 items
  "W11_01", "W11_02", "W11_03", "W12_01", "W12_02", "W12_03", "W12_04",
  "W13_01", "W14_01", "W14_02", "W15_01", "W15_02",
  "M11_01", "M11_02", "M12_01", "M12_02", "M13_01", "M13_02",
  "M14_01", "M14_02", "M14_03", "M15_01", "M15_02", "M15_03",
  // Accessories & Other (Shoes, Bags, Hats, Eyewear, Jewelry)
  "W01_03", "W01_04", "W02_03", "W02_04", "W03_03", "W03_04", "W04_04", "W04_05",
  "W05_03", "W05_04", "W06_04", "W06_05", "W07_03", "W07_04", "W07_05", "W08_02",
  "W08_03", "W08_04", "W09_02", "W09_03", "W09_04", "W09_05", "W09_06", "W10_02",
  "W10_03", "W10_04",
  // Men's Accessories (Shoes, Watches, Belts, Bags, Hats, Eyewear, Scarf, Wallet, Bracelet)
  "M_ACC_001", "M_ACC_002", "M_ACC_003", "M_ACC_004", "M_ACC_005", "M_ACC_006",
  "M_ACC_007", "M_ACC_008", "M_ACC_009", "M_ACC_010", "M_ACC_011", "M_ACC_012",
  "M_ACC_013", "M_ACC_014", "M_ACC_015", "M_ACC_016", "M_ACC_017", "M_ACC_018",
  "M_ACC_019", "M_ACC_020", "M_ACC_021", "M_ACC_022", "M_ACC_023", "M_ACC_024",
  "M_ACC_025", "M_ACC_026", "M_ACC_027", "M_ACC_028", "M_ACC_029", "M_ACC_030",
] as const;
export type GarmentId = (typeof GARMENT_IDS)[number];

export interface Garment {
  id: GarmentId;
  name: string;
  type: string;
  color: string;
  formality: number;
  styles: string[];
  cut: string;
  gender?: "men" | "women" | "unisex";
}

// Property order matches the plan so JSON.stringify produces the same line.
export const CATALOG: readonly Garment[] = [
  { id: "G01", name: "Navy Blazer", type: "outerwear", color: "navy", formality: 4, styles: ["formal", "smart"], cut: "tailored, structured" },
  { id: "G02", name: "White Oxford Shirt", type: "shirt", color: "white", formality: 4, styles: ["formal", "minimal"], cut: "crisp, classic" },
  { id: "G03", name: "Cream Knit Sweater", type: "knitwear", color: "cream", formality: 2, styles: ["casual", "soft"], cut: "knit, relaxed" },
  { id: "G04", name: "Denim Jacket", type: "outerwear", color: "blue denim", formality: 1, styles: ["casual", "street"], cut: "boxy, rugged" },
  { id: "G05", name: "Black Bomber Jacket", type: "outerwear", color: "black", formality: 2, styles: ["street", "minimal"], cut: "sporty, cropped" },
  { id: "G06", name: "Beige Overshirt", type: "overshirt", color: "beige", formality: 3, styles: ["casual", "smart"], cut: "relaxed, layering" },
  { id: "G07", name: "Gray Hoodie", type: "knitwear", color: "gray", formality: 1, styles: ["casual", "street"], cut: "relaxed, pullover", gender: "unisex" },
  { id: "G09", name: "Navy Polo Shirt", type: "shirt", color: "navy", formality: 3, styles: ["smart", "casual"], cut: "fitted, athletic", gender: "men" },
  { id: "G10", name: "Beige Trench Coat", type: "outerwear", color: "beige", formality: 4, styles: ["formal", "smart"], cut: "longline, belted", gender: "unisex" },
  // Batch 1 Men
  { id: "M11_01", name: "Navy Polo Shirt", type: "shirt", color: "navy", formality: 3, styles: ["smart", "casual"], cut: "fitted, collared", gender: "men" },
  { id: "M12_01", name: "Light Blue Linen Shirt", type: "shirt", color: "light blue", formality: 2, styles: ["beach", "holiday", "casual"], cut: "relaxed, breathable", gender: "men" },
  { id: "M13_01", name: "Black Oversized Hoodie", type: "knitwear", color: "black", formality: 1, styles: ["street", "casual"], cut: "oversized, streetwear", gender: "men" },
  { id: "M14_01", name: "Charcoal Blazer", type: "outerwear", color: "charcoal", formality: 5, styles: ["formal", "evening", "party"], cut: "structured, formal", gender: "men" },
  { id: "M14_02", name: "White Dress Shirt", type: "shirt", color: "white", formality: 4, styles: ["formal", "smart"], cut: "crisp, tailored", gender: "men" },
  { id: "M15_01", name: "Cream Cable-Knit Sweater", type: "knitwear", color: "cream", formality: 2, styles: ["casual", "soft"], cut: "cable-knit, cozy", gender: "men" },
  { id: "M15_02", name: "Blue Denim Jacket", type: "outerwear", color: "blue denim", formality: 2, styles: ["casual", "street"], cut: "classic, rugged", gender: "men" },
  // Women Collection (HD & Batch 1)
  { id: "W01-01", name: "Black Satin Camisole", type: "top", color: "black", formality: 3, styles: ["bar", "evening", "party"], cut: "strappy, fluid", gender: "women" },
  { id: "W02-01", name: "Emerald Satin Maxi Dress", type: "dress", color: "emerald green", formality: 5, styles: ["evening", "party", "formal"], cut: "maxi, slip dress", gender: "women" },
  { id: "W02-02", name: "Black Cropped Blazer", type: "outerwear", color: "black", formality: 4, styles: ["evening", "smart"], cut: "cropped, tailored", gender: "women" },
  { id: "W03-01", name: "Burgundy Ruched Top", type: "top", color: "burgundy", formality: 3, styles: ["bar", "date", "party"], cut: "ruched, fitted", gender: "women" },
  { id: "W04-01", name: "Camel Blazer", type: "outerwear", color: "camel", formality: 4, styles: ["office", "formal", "smart"], cut: "tailored, structured", gender: "women" },
  { id: "W04-02", name: "White Collared Blouse", type: "top", color: "white", formality: 4, styles: ["office", "formal"], cut: "crisp, collared", gender: "women" },
  { id: "W06-01", name: "White Hooded Zip Jacket", type: "outerwear", color: "white", formality: 1, styles: ["sports", "casual"], cut: "hooded, athletic", gender: "women" },
  { id: "W07-01", name: "White Linen Shirt", type: "top", color: "white", formality: 3, styles: ["beach", "holiday", "casual"], cut: "relaxed, breathable", gender: "women" },
  { id: "W08-01", name: "Sky-blue Maxi Dress", type: "dress", color: "sky blue", formality: 3, styles: ["beach", "holiday"], cut: "maxi, flared", gender: "women" },
  { id: "W09-01", name: "Floral Sundress", type: "dress", color: "floral", formality: 3, styles: ["date", "casual"], cut: "fit-and-flare, puff sleeves", gender: "women" },
  { id: "W10-01", name: "Coral Wrap Dress", type: "dress", color: "coral", formality: 3, styles: ["beach", "travel"], cut: "wrap dress, v-neck", gender: "women" },
  { id: "W11_01", name: "Cream Tie-Neck Blouse", type: "top", color: "cream", formality: 4, styles: ["office", "formal", "smart"], cut: "tie-neck, elegant", gender: "women" },
  { id: "W11_02", name: "Black Tailored Blazer", type: "outerwear", color: "black", formality: 4, styles: ["office", "formal", "smart"], cut: "tailored, structured", gender: "women" },
  { id: "W12_01", name: "White Linen Overshirt", type: "top", color: "white", formality: 2, styles: ["beach", "holiday", "casual"], cut: "oversized, resort", gender: "women" },
  { id: "W13_01", name: "Blush Satin Slip Dress", type: "dress", color: "blush pink", formality: 4, styles: ["date", "evening", "party"], cut: "slip dress, delicate", gender: "women" },
  { id: "W14_01", name: "Gray Cropped Hoodie", type: "top", color: "gray", formality: 1, styles: ["sports", "casual", "street"], cut: "cropped, athletic", gender: "women" },
  { id: "W15_01", name: "Black Off-Shoulder Top", type: "top", color: "black", formality: 3, styles: ["party", "bar", "evening"], cut: "off-shoulder, glamorous", gender: "women" },
  // Accessories & Other (type: "other")
  { id: "W01_03", name: "Silver Evening Clutch", type: "other", color: "silver", formality: 4, styles: ["bar", "evening", "party"], cut: "clutch, metallic", gender: "women" },
  { id: "W01_04", name: "Black Strappy Heels", type: "other", color: "black", formality: 4, styles: ["bar", "evening", "party"], cut: "heels, strappy", gender: "women" },
  { id: "W02_03", name: "Black Shoulder Bag", type: "other", color: "black", formality: 4, styles: ["evening", "party", "smart"], cut: "shoulder bag, leather", gender: "women" },
  { id: "W02_04", name: "Black Evening Heels", type: "other", color: "black", formality: 5, styles: ["evening", "formal", "party"], cut: "heels, pointed", gender: "women" },
  { id: "W03_03", name: "Black Chain Bag", type: "other", color: "black", formality: 3, styles: ["bar", "date"], cut: "crossbody, chain", gender: "women" },
  { id: "W03_04", name: "Black Ankle Boots", type: "other", color: "black", formality: 3, styles: ["bar", "date", "street"], cut: "boots, ankle", gender: "women" },
  { id: "W04_04", name: "Black Structured Handbag", type: "other", color: "black", formality: 4, styles: ["office", "formal", "smart"], cut: "handbag, structured", gender: "women" },
  { id: "W04_05", name: "Black Leather Loafers", type: "other", color: "black", formality: 4, styles: ["office", "smart", "formal"], cut: "loafers, leather", gender: "women" },
  { id: "W05_03", name: "Tan Crossbody Bag", type: "other", color: "tan", formality: 2, styles: ["casual", "daily"], cut: "crossbody, leather", gender: "women" },
  { id: "W05_04", name: "White Casual Sneakers", type: "other", color: "white", formality: 2, styles: ["casual", "daily", "street"], cut: "sneakers, low-top", gender: "women" },
  { id: "W06_04", name: "Black Duffel Gym Bag", type: "other", color: "black", formality: 1, styles: ["sports", "gym"], cut: "duffel, athletic", gender: "women" },
  { id: "W06_05", name: "White Running Shoes", type: "other", color: "white", formality: 1, styles: ["sports", "gym", "running"], cut: "running, cushioned", gender: "women" },
  { id: "W07_03", name: "Wide-Brim Straw Hat", type: "other", color: "beige", formality: 2, styles: ["beach", "holiday", "summer"], cut: "hat, straw", gender: "women" },
  { id: "W07_04", name: "Straw Beach Tote", type: "other", color: "beige", formality: 2, styles: ["beach", "holiday", "summer"], cut: "tote, straw", gender: "women" },
  { id: "W07_05", name: "Woven Beach Slides", type: "other", color: "beige", formality: 1, styles: ["beach", "holiday"], cut: "slides, woven", gender: "women" },
  { id: "W08_02", name: "Ribbon Straw Hat", type: "other", color: "beige", formality: 3, styles: ["beach", "holiday"], cut: "hat, ribbon", gender: "women" },
  { id: "W08_03", name: "Raffia Hobo Bag", type: "other", color: "beige", formality: 3, styles: ["beach", "holiday"], cut: "hobo, raffia", gender: "women" },
  { id: "W08_04", name: "Tan Strappy Sandals", type: "other", color: "tan", formality: 3, styles: ["beach", "holiday", "resort"], cut: "sandals, strappy", gender: "women" },
  { id: "W09_02", name: "Cream Cat-Eye Sunglasses", type: "other", color: "cream", formality: 3, styles: ["summer", "date"], cut: "sunglasses, cat-eye", gender: "women" },
  { id: "W09_03", name: "Gold Hoop Earrings", type: "other", color: "gold", formality: 3, styles: ["summer", "date", "party"], cut: "earrings, hoops", gender: "women" },
  { id: "W09_04", name: "Delicate Gold Necklace", type: "other", color: "gold", formality: 3, styles: ["summer", "date", "party"], cut: "necklace, pendant", gender: "women" },
  { id: "W09_05", name: "Woven Shoulder Bag", type: "other", color: "beige", formality: 3, styles: ["summer", "date", "casual"], cut: "shoulder bag, woven", gender: "women" },
  { id: "W09_06", name: "White Espadrille Wedges", type: "other", color: "white", formality: 3, styles: ["summer", "date", "holiday"], cut: "wedges, espadrille", gender: "women" },
  { id: "W10_02", name: "Tortoise Shell Sunglasses", type: "other", color: "brown", formality: 3, styles: ["beach", "holiday"], cut: "sunglasses, tortoise", gender: "women" },
  { id: "W10_03", name: "Straw Market Tote", type: "other", color: "beige", formality: 3, styles: ["beach", "holiday"], cut: "tote, market", gender: "women" },
  { id: "W10_04", name: "White Canvas Sneakers", type: "other", color: "white", formality: 2, styles: ["beach", "casual", "daily"], cut: "sneakers, canvas", gender: "women" },
  // Men's Accessories (Shoes, Watches, Belts, Bags, Hats, Eyewear, Scarf, Wallet, Bracelet)
  { id: "M_ACC_001", name: "White Low-Top Sneakers", type: "other", color: "white", formality: 2, styles: ["casual", "streetwear"], cut: "sneakers, low-top", gender: "men" },
  { id: "M_ACC_002", name: "Black Sport Sneakers", type: "other", color: "black", formality: 1, styles: ["casual", "streetwear", "sport"], cut: "sneakers, athletic", gender: "men" },
  { id: "M_ACC_003", name: "Gray Running Sneakers", type: "other", color: "gray", formality: 1, styles: ["sport", "casual"], cut: "running, cushioned", gender: "men" },
  { id: "M_ACC_004", name: "Black Leather Loafers", type: "other", color: "black", formality: 4, styles: ["office", "smart casual", "formal"], cut: "loafers, leather", gender: "men" },
  { id: "M_ACC_005", name: "Black Derby Shoes", type: "other", color: "black", formality: 5, styles: ["formal", "office"], cut: "derby, formal", gender: "men" },
  { id: "M_ACC_006", name: "Black Chelsea Boots", type: "other", color: "black", formality: 3, styles: ["date", "party", "smart"], cut: "boots, chelsea", gender: "men" },
  { id: "M_ACC_007", name: "Classic Brown Leather Watch", type: "other", color: "brown", formality: 4, styles: ["office", "smart casual"], cut: "watch, leather strap", gender: "men" },
  { id: "M_ACC_008", name: "Minimal Black Dial Watch", type: "other", color: "black", formality: 3, styles: ["date", "office", "minimal"], cut: "watch, minimal", gender: "men" },
  { id: "M_ACC_009", name: "Silver Chronograph Watch", type: "other", color: "silver", formality: 2, styles: ["sport", "casual", "smart"], cut: "watch, chronograph", gender: "men" },
  { id: "M_ACC_010", "name": "Blue Diver Watch", type: "other", color: "blue", formality: 2, styles: ["casual", "travel"], cut: "watch, diver", gender: "men" },
  { id: "M_ACC_011", name: "Black Leather Belt", type: "other", color: "black", formality: 4, styles: ["office", "formal", "smart"], cut: "belt, leather", gender: "men" },
  { id: "M_ACC_012", name: "Brown Leather Belt", type: "other", color: "brown", formality: 3, styles: ["smart casual", "office"], cut: "belt, leather", gender: "men" },
  { id: "M_ACC_013", name: "Navy Braided Belt", type: "other", color: "navy", formality: 2, styles: ["casual", "travel"], cut: "belt, braided", gender: "men" },
  { id: "M_ACC_014", name: "Olive Canvas Belt", type: "other", color: "olive", formality: 1, styles: ["streetwear", "outdoor"], cut: "belt, canvas", gender: "men" },
  { id: "M_ACC_015", name: "Black Crossbody Bag", type: "other", color: "black", formality: 2, styles: ["casual", "travel"], cut: "crossbody, leather", gender: "men" },
  { id: "M_ACC_016", name: "Black Sling Bag", type: "other", color: "black", formality: 1, styles: ["streetwear", "travel"], cut: "sling bag, streetwear", gender: "men" },
  { id: "M_ACC_017", name: "Brown Messenger Bag", type: "other", color: "brown", formality: 4, styles: ["office", "casual", "smart"], cut: "messenger, briefcase", gender: "men" },
  { id: "M_ACC_018", name: "Black Travel Backpack", type: "other", color: "black", formality: 2, styles: ["daily", "travel"], cut: "backpack, travel", gender: "men" },
  { id: "M_ACC_019", name: "Cream Canvas Tote", type: "other", color: "cream", formality: 2, styles: ["casual", "beach"], cut: "tote, canvas", gender: "men" },
  { id: "M_ACC_020", name: "Navy Baseball Cap", type: "other", color: "navy", formality: 1, styles: ["casual", "streetwear"], cut: "cap, baseball", gender: "men" },
  { id: "M_ACC_021", name: "Beige Bucket Hat", type: "other", color: "beige", formality: 2, styles: ["beach", "casual"], cut: "hat, bucket", gender: "men" },
  { id: "M_ACC_022", name: "Black Knit Beanie", type: "other", color: "black", formality: 2, styles: ["winter", "streetwear"], cut: "beanie, knit", gender: "men" },
  { id: "M_ACC_023", name: "Brown Fedora", type: "other", color: "brown", formality: 3, styles: ["date", "travel"], cut: "hat, fedora", gender: "men" },
  { id: "M_ACC_024", name: "Black Rectangular Sunglasses", type: "other", color: "black", formality: 3, styles: ["casual", "beach"], cut: "sunglasses, rectangular", gender: "men" },
  { id: "M_ACC_025", name: "Gold Aviator Sunglasses", type: "other", color: "gold", formality: 3, styles: ["travel", "beach"], cut: "sunglasses, aviator", gender: "men" },
  { id: "M_ACC_026", name: "Dark Round Sunglasses", type: "other", color: "black", formality: 3, styles: ["casual", "streetwear"], cut: "sunglasses, round", gender: "men" },
  { id: "M_ACC_027", name: "Black Optical Glasses", type: "other", color: "black", formality: 3, styles: ["daily", "office"], cut: "glasses, optical", gender: "men" },
  { id: "M_ACC_028", name: "Gray Winter Scarf", type: "other", color: "gray", formality: 3, styles: ["winter", "casual"], cut: "scarf, winter knit", gender: "men" },
  { id: "M_ACC_029", name: "Black Leather Wallet", type: "other", color: "black", formality: 4, styles: ["daily", "formal"], cut: "wallet, bifold", gender: "men" },
  { id: "M_ACC_030", name: "Silver Chain Bracelet", type: "other", color: "silver", formality: 2, styles: ["streetwear", "party"], cut: "bracelet, silver chain", gender: "men" },
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
