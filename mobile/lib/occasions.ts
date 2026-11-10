// Display copy for screen 1 (Choose Occasion), from DESIGN.md §6.1.
// Ids and dress codes live in lib/catalog.ts (mirrors the server); this file only
// adds the bilingual labels, the short descriptor and an icon per occasion.
import { Briefcase, Coffee, GraduationCap, Sparkles, type LucideIcon } from "lucide-react-native";

import { OCCASION_IDS, OCCASIONS, type OccasionId } from "./catalog";

export interface OccasionOption {
  id: OccasionId;
  /** English primary label. */
  label: string;
  /** Vietnamese helper label (muted line). */
  labelVi: string;
  /** Short English descriptor (DESIGN.md §6.1). */
  descriptor: string;
  /** Vietnamese descriptor, as written in DESIGN.md §6.1. */
  descriptorVi: string;
  icon: LucideIcon;
}

export const OCCASION_OPTIONS: readonly OccasionOption[] = [
  {
    id: "job_interview",
    label: OCCASIONS.job_interview.label,
    labelVi: "Phỏng vấn xin việc",
    descriptor: "Formal: shirt or blazer.",
    descriptorVi: "Trang trọng, gọn gàng, sơ mi/blazer.",
    icon: Briefcase,
  },
  {
    id: "campus_day",
    label: OCCASIONS.campus_day.label,
    labelVi: "Đi học & làm việc",
    descriptor: "Relaxed: easy all day.",
    descriptorVi: "Thoải mái, năng động, dễ vận động.",
    icon: GraduationCap,
  },
  {
    id: "coffee_date",
    label: OCCASIONS.coffee_date.label,
    labelVi: "Hẹn hò & cà phê",
    descriptor: "Smart casual in warm tones.",
    descriptorVi: "Smart casual, thanh lịch, dễ gần.",
    icon: Coffee,
  },
  {
    id: "other",
    label: "Custom occasion",
    labelVi: "Dịp khác...",
    descriptor: "Type your own occasion.",
    descriptorVi: "Tự do nhập dịp của riêng bạn.",
    icon: Sparkles,
  },
];

export function getOccasionOption(id: OccasionId): OccasionOption {
  const found = OCCASION_OPTIONS.find((o) => o.id === id);
  if (!found) throw new Error(`Unknown occasion id ${id}`);
  return found;
}

// Keep the list complete if catalog ids change.
if (__DEV__ && OCCASION_OPTIONS.length !== OCCASION_IDS.length) {
  console.warn("[occasions] OCCASION_OPTIONS is out of sync with OCCASION_IDS in lib/catalog.ts");
}

/** Style filter values: each is a catalog style tag (or "none"), so /api/style accepts it. */
export type StyleChoice = "none" | "minimal" | "casual" | "smart";

export interface StyleOption {
  value: StyleChoice;
  label: string;
  labelVi: string;
}

export const STYLE_OPTIONS: readonly StyleOption[] = [
  { value: "none", label: "None", labelVi: "Tất cả" },
  { value: "minimal", label: "Minimal", labelVi: "Tối giản" },
  { value: "casual", label: "Casual", labelVi: "Thoải mái" },
  { value: "smart", label: "Smart", labelVi: "Lịch sự" },
];

export function isStyleChoice(value: unknown): value is StyleChoice {
  return value === "none" || value === "minimal" || value === "casual" || value === "smart";
}

/** Bilingual source label for a pick. Fallback picks are never presented as AI. */
export const SOURCE_LABEL = {
  llm: { label: "AI Stylist pick", labelVi: "Gợi ý từ AI Stylist" },
  fallback: { label: "Default suggestion", labelVi: "Gợi ý mặc định" },
} as const;
