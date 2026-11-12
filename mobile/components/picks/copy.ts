// Copy for Screen 2 · AI Picks. English primary, Vietnamese helper (DESIGN.md
// Bilingual Line Rule). Kept here so the screen file stays about layout and state.
import type { OccasionId } from "@/lib/catalog";
import type { Slot } from "@/lib/store";

/** Headline that names the occasion. */
export const PICKS_HEADLINE: Record<OccasionId, { en: string; vi: string }> = {
  job_interview: { en: "Two looks for your job interview", vi: "Hai bộ đồ cho buổi phỏng vấn xin việc" },
  campus_day: { en: "Two looks for a day on campus", vi: "Hai bộ đồ cho một ngày ở trường" },
  coffee_date: { en: "Two looks for your coffee date", vi: "Hai bộ đồ cho buổi hẹn cà phê" },
  other: { en: "Two looks for your occasion", vi: "Hai bộ đồ cho dịp của bạn" },
};

/** Role of each slot on its card. A is always the stronger match (contract: [0] = Look A). */
export const SLOT_ROLE: Record<Slot, { en: string; vi: string }> = {
  a: { en: "Best match", vi: "Phù hợp nhất" },
  b: { en: "Alternative", vi: "Lựa chọn thay thế" },
};

export const slotName = (slot: Slot) => `Look ${slot.toUpperCase()}`;
