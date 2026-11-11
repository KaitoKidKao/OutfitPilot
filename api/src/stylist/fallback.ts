// Deterministic rule-based picks used when the LLM is not configured or its
// reply stays invalid after one retry. The UI must label these as a default
// suggestion (response source "fallback"); they are not AI output.
//
// Ranking (mirrors the system prompt's order of priorities):
//   1. smallest |formality - targetFormality|
//   2. garment styles include the style preference (skipped for "none")
//   3. catalog order (stable, so results are reproducible)
// Look A = rank 1, Look B = rank 2 (always a different garment).

import { CATALOG, OCCASIONS, type Garment, type GarmentId, type Occasion, type OccasionId } from "../catalog.js";
import type { Locale, Recommendation } from "../contract.js";

export function rankGarments(occasionId: OccasionId, style: string, customOccasion?: string): Garment[] {
  let target = OCCASIONS[occasionId].targetFormality;
  if (occasionId === "other" && customOccasion) {
    if (/tiệc|party|cưới|wedding|formal|lễ|gala|hội thảo|bar|lounge/i.test(customOccasion)) {
      target = 4;
    } else if (/cà phê|coffee|date|hẹn|smart/i.test(customOccasion)) {
      target = 3;
    } else if (/beach|biển|campus|trường|street|bụi|dạo|casual|trip|du lịch|gym|sport/i.test(customOccasion)) {
      target = 2;
    }
  }
  const pool = occasionId === "other" ? CATALOG : CATALOG.filter((g) => ["G01", "G02", "G03", "G04", "G05", "G06"].includes(g.id));
  const matchesStyle = (g: Garment) => (style !== "none" && g.styles.includes(style) ? 0 : 1);
  return pool.map((g, index) => ({ g, index }))
    .sort(
      (x, y) =>
        Math.abs(x.g.formality - target) - Math.abs(y.g.formality - target) ||
        matchesStyle(x.g) - matchesStyle(y.g) ||
        x.index - y.index,
    )
    .map((x) => x.g);
}

const OCCASION_NAME: Record<Locale, Record<OccasionId, string>> = {
  en: { job_interview: "a job interview", campus_day: "a campus day", coffee_date: "a coffee date", other: "your occasion" },
  vi: { job_interview: "buổi phỏng vấn", campus_day: "một ngày ở trường", coffee_date: "buổi hẹn cà phê", other: "dịp của bạn" },
};

// Plain companion items per occasion. Never a catalog garment, no brands.
const PAIR_WITH: Record<Locale, Record<OccasionId, string>> = {
  en: {
    job_interview: "Dark tailored trousers and plain leather shoes",
    campus_day: "Straight jeans and clean sneakers",
    coffee_date: "Chinos and simple loafers or clean sneakers",
    other: "Matching trousers and plain clean shoes",
  },
  vi: {
    job_interview: "Quần tây tối màu và giày da trơn",
    campus_day: "Quần jeans ống đứng và giày sneaker sạch",
    coffee_date: "Quần chinos và giày lười hoặc sneaker trơn",
    other: "Quần âu hoặc chinos cùng giày trơn sạch",
  },
};

function fitNote(locale: Locale, garment: Garment, occasion: Occasion, customOccasion?: string): string {
  let target = occasion.targetFormality;
  if (occasion.id === "other" && customOccasion) {
    if (/tiệc|party|cưới|wedding|formal|lễ|gala|hội thảo|bar|lounge/i.test(customOccasion)) {
      target = 4;
    } else if (/beach|biển|campus|trường|street|bụi|dạo|casual|trip|du lịch|gym|sport/i.test(customOccasion)) {
      target = 2;
    }
  }
  const gap = garment.formality - target;
  if (locale === "vi") {
    if (gap === 0) return "đúng mức trang trọng";
    return gap > 0 ? "hơi trang trọng hơn mức cần" : "hơi thoải mái hơn mức cần";
  }
  if (gap === 0) return "right formality level";
  return gap > 0 ? "a little more formal than needed" : "a little more casual than needed";
}

const COLOR_VI: Record<string, string> = {
  white: "trắng",
  navy: "xanh navy",
  cream: "kem",
  black: "đen",
  beige: "be",
  "blue denim": "xanh denim",
  "light blue": "xanh nhạt",
  charcoal: "xám than",
  gray: "xám",
  "emerald green": "xanh ngọc",
  burgundy: "đỏ rượu",
  camel: "lạc đà",
  "sky blue": "xanh da trời",
  floral: "hoa nhí",
  coral: "san hô",
  "blush pink": "hồng phấn",
};

// Vietnamese color and cut for each catalog garment (catalog text is English).
const VI_DESCRIPTOR: Partial<Record<GarmentId, { color: string; cut: string }>> = {
  G01: { color: "xanh navy", cut: "cắt may gọn, đứng dáng" },
  G02: { color: "trắng", cut: "phẳng phiu, cổ điển" },
  G03: { color: "kem", cut: "len dệt, thoải mái" },
  G04: { color: "xanh denim", cut: "rộng, bụi bặm" },
  G05: { color: "đen", cut: "thể thao, ngắn" },
  G06: { color: "be", cut: "suông, dễ mặc lớp" },
};

function reasonFor(locale: Locale, garment: Garment, occasion: Occasion, customOccasion?: string): string {
  const where = (customOccasion && customOccasion.trim()) ? customOccasion.trim() : OCCASION_NAME[locale][occasion.id];
  const note = fitNote(locale, garment, occasion, customOccasion);
  if (locale === "vi") {
    const d = VI_DESCRIPTOR[garment.id] ?? {
      color: COLOR_VI[garment.color] ?? garment.color,
      cut: garment.cut,
    };
    return `${garment.name}: ${note} cho ${where}, màu ${d.color}, dáng ${d.cut}.`;
  }
  return `${garment.name}: ${note} for ${where}; ${garment.color}, ${garment.cut}.`;
}

export function fallbackRecommendations(
  occasionId: OccasionId,
  style: string,
  locale: Locale,
  customOccasion?: string,
): [Recommendation, Recommendation] {
  const occasion = OCCASIONS[occasionId];
  const [a, b] = rankGarments(occasionId, style, customOccasion) as [Garment, Garment, ...Garment[]];
  const make = (g: Garment): Recommendation => ({
    garmentId: g.id,
    reason: reasonFor(locale, g, occasion, customOccasion),
    pairWith: PAIR_WITH[locale][occasionId],
  });
  return [make(a), make(b)];
}
