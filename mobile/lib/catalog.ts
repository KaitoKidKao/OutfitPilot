// Catalog + occasions, mirrored from docs/plan.md section "Prompt cho AI Stylist"
// (and api/src/catalog.ts). The server is the source of truth for what the LLM
// sees; this copy is for display and for building try-on prompts.
// Keep ids, names and attributes identical to the plan.

export const GARMENT_IDS = [
  "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10",
  "P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "P10",
] as const;
export type GarmentId = (typeof GARMENT_IDS)[number] | string;

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
  nameVi?: string;
  type: string;
  color: string;
  formality: number;
  styles: string[];
  cut: string;
  /**
   * Bundled garment photo: require("../assets/garments/G0X.png") or image object.
   * To send one to Decart it is converted to base64 first (lib/tryOnSession.ts).
   */
  image: any;
  /** Asset path of `image`, relative to mobile/. */
  imagePath: string;
  /**
   * true while the photo is a stand-in sample rather than a licensed
   * product photo. The UI shows a "Sample" tag on it (DESIGN.md Chips).
   */
  sample: boolean;
  /** Provenance of the photo; null until the asset owner fills it in. */
  credit: GarmentCredit | null;
  /** Fit advice or size notes for pre-purchase confidence */
  fitAdvice?: string;
  /** Matching pants from the closet */
  matchingPantsIds?: string[];
}

export const CATALOG: readonly Garment[] = [
  { id: "G01", name: "Navy Blazer", nameVi: "Áo Blazer Xanh Navy", type: "outerwear", color: "navy", formality: 4, styles: ["formal", "smart"], cut: "tailored, structured", image: require("../assets/garments/G01.png"), imagePath: "assets/garments/G01.png", sample: true, credit: null, fitAdvice: "Dáng may đo vừa vặn. Nên đo bề ngang vai và vòng ngực trước khi chọn size.", matchingPantsIds: ["P03", "P06", "P08", "P10"] },
  { id: "G02", name: "White Oxford Shirt", nameVi: "Sơ Mi Oxford Trắng", type: "shirt", color: "white", formality: 4, styles: ["formal", "minimal"], cut: "crisp, classic", image: require("../assets/garments/G02.png"), imagePath: "assets/garments/G02.png", sample: true, credit: null, fitAdvice: "Vải Oxford đứng dáng. Nên chọn đúng số đo vòng cổ và chiều dài tay áo.", matchingPantsIds: ["P02", "P03", "P05", "P08", "P09"] },
  { id: "G03", name: "Brown Cardigan", nameVi: "Áo Khoác Len Nâu", type: "knitwear", color: "brown", formality: 3, styles: ["casual", "smart"], cut: "knit, relaxed", image: require("../assets/garments/G03.png"), imagePath: "assets/garments/G03.png", sample: true, credit: null, fitAdvice: "Len dệt êm cổ V. Dáng hơi thụng nhẹ, mặc khoác ngoài sơ mi hoặc thun rất tôn dáng.", matchingPantsIds: ["P02", "P05", "P09", "P10"] },
  { id: "G04", name: "Blue Denim Jacket", nameVi: "Áo Khoác Denim Xanh", type: "outerwear", color: "blue denim", formality: 1, styles: ["casual", "street"], cut: "boxy, rugged", image: require("../assets/garments/G04.png"), imagePath: "assets/garments/G04.png", sample: true, credit: null, fitAdvice: "Chất jeans dệt dày dặn, phom hộp boxy. Nếu thích mặc kèm hoodie bên trong nên tăng 1 size.", matchingPantsIds: ["P01", "P04", "P05"] },
  { id: "G05", name: "Black Bomber Jacket", nameVi: "Áo Khoác Bomber Đen", type: "outerwear", color: "black", formality: 2, styles: ["street", "minimal"], cut: "sporty, cropped", image: require("../assets/garments/G05.png"), imagePath: "assets/garments/G05.png", sample: true, credit: null, fitAdvice: "Phom thể thao ngắn ngang hông. Hãy kiểm tra chiều dài thân áo để đảm bảo không bị ngắn lưng.", matchingPantsIds: ["P01", "P02", "P04", "P06"] },
  { id: "G06", name: "Olive Field Jacket", nameVi: "Áo Khoác Túi Hộp Rêu", type: "outerwear", color: "olive green", formality: 3, styles: ["casual", "smart"], cut: "relaxed, utilitarian", image: require("../assets/garments/G06.png"), imagePath: "assets/garments/G06.png", sample: true, credit: null, fitAdvice: "4 túi hộp tiện dụng phong cách dã ngoại. Dáng suông thoải mái, rất dễ phối với quần chinos hoặc jeans.", matchingPantsIds: ["P02", "P04", "P05", "P09"] },
  { id: "G07", name: "Gray Hoodie", nameVi: "Áo Hoodie Nỉ Xám", type: "knitwear", color: "gray", formality: 1, styles: ["casual", "street"], cut: "relaxed, pullover", image: require("../assets/garments/G07.png"), imagePath: "assets/garments/G07.png", sample: true, credit: null, fitAdvice: "Nỉ bông mềm dày dặn, mũ trùm sâu. Thích hợp mặc hàng ngày đi học, đi chơi hoặc tập luyện.", matchingPantsIds: ["P01", "P02", "P04"] },
  { id: "G08", name: "Cream Knit Sweater", nameVi: "Áo Len Dệt Màu Kem", type: "knitwear", color: "cream", formality: 2, styles: ["casual", "soft"], cut: "knit, relaxed", image: require("../assets/garments/G08.png"), imagePath: "assets/garments/G08.png", sample: true, credit: null, fitAdvice: "Len dệt gân nổi tông màu ấm áp. Cổ tròn ôm vừa, tạo cảm giác nhẹ nhàng, dễ mến.", matchingPantsIds: ["P02", "P03", "P05", "P09"] },
  { id: "G09", name: "Navy Polo Shirt", nameVi: "Áo Polo Xanh Navy", type: "shirt", color: "navy", formality: 3, styles: ["smart", "casual"], cut: "fitted, athletic", image: require("../assets/garments/G09.png"), imagePath: "assets/garments/G09.png", sample: true, credit: null, fitAdvice: "Polo dệt piqué thoáng khí, cổ bẻ có viền trắng. Thích hợp đi làm thường ngày hoặc cafe cuối tuần.", matchingPantsIds: ["P05", "P08", "P09"] },
  { id: "G10", name: "Beige Trench Coat", nameVi: "Áo Măng Tô Màu Be", type: "outerwear", color: "beige", formality: 4, styles: ["formal", "smart"], cut: "longline, belted", image: require("../assets/garments/G10.png"), imagePath: "assets/garments/G10.png", sample: true, credit: null, fitAdvice: "Dáng dài qua gối sang trọng có thắt lưng. Hãy đối chiếu chiều cao tổng thể và vòng ngực khi chọn size.", matchingPantsIds: ["P03", "P06", "P08", "P10"] },

  // 10 mẫu quần trong tủ đồ
  { id: "P01", name: "Gray Jogger Sweatpants", nameVi: "Quần Jogger Nỉ Xám", type: "pants", color: "gray", formality: 1, styles: ["casual", "street"], cut: "tapered, cuffed", image: require("../assets/pants/P01.jpg"), imagePath: "assets/pants/P01.jpg", sample: true, credit: null, fitAdvice: "Cạp chun dây rút co giãn, ống bo gấu năng động." },
  { id: "P02", name: "Dark Indigo Jeans", nameVi: "Quần Jeans Xanh Đậm", type: "pants", color: "dark indigo", formality: 2, styles: ["casual", "smart"], cut: "straight, classic", image: require("../assets/pants/P02.jpg"), imagePath: "assets/pants/P02.jpg", sample: true, credit: null, fitAdvice: "Jeans xanh chàm không mài, ống đứng kinh điển dễ phối với mọi loại áo." },
  { id: "P03", name: "Charcoal Pleated Trousers", nameVi: "Quần Âu Xám Xếp Ly", type: "pants", color: "charcoal", formality: 4, styles: ["formal", "smart"], cut: "pleated, tailored", image: require("../assets/pants/P03.jpg"), imagePath: "assets/pants/P03.jpg", sample: true, credit: null, fitAdvice: "Xếp ly trước cổ điển, cạp cao tôn dáng cho sự kiện trang trọng." },
  { id: "P04", name: "Olive Cargo Pants", nameVi: "Quần Túi Hộp Xanh Rêu", type: "pants", color: "olive green", formality: 2, styles: ["street", "utility"], cut: "relaxed, multi-pocket", image: require("../assets/pants/P04.jpg"), imagePath: "assets/pants/P04.jpg", sample: true, credit: null, fitAdvice: "Vải kaki dày dặn có túi hộp hai bên, đậm chất quân đội dã ngoại." },
  { id: "P05", name: "Beige Relaxed Chinos", nameVi: "Quần Chinos Be Dáng Thoải Mái", type: "pants", color: "beige", formality: 3, styles: ["casual", "smart"], cut: "relaxed, flat-front", image: require("../assets/pants/P05.jpg"), imagePath: "assets/pants/P05.jpg", sample: true, credit: null, fitAdvice: "Chất cotton co giãn nhẹ, ống suông nhẹ màu be cát thanh lịch." },
  { id: "P06", name: "Black Tapered Trousers", nameVi: "Quần Âu Đen Ống Côn", type: "pants", color: "black", formality: 4, styles: ["formal", "minimal"], cut: "tapered, slim", image: require("../assets/pants/P06.jpg"), imagePath: "assets/pants/P06.jpg", sample: true, credit: null, fitAdvice: "Dáng ôm gọn dần về gấu quần, tạo hiệu ứng kéo dài chân." },
  { id: "P07", name: "Black Straight Dress Trousers", nameVi: "Quần Tây Đen Ống Đứng", type: "pants", color: "black", formality: 5, styles: ["formal"], cut: "straight, structured", image: require("../assets/pants/P07.jpg"), imagePath: "assets/pants/P07.jpg", sample: true, credit: null, fitAdvice: "Quần tây may đo chuẩn mực cho lễ tiệc hoặc phỏng vấn cấp cao." },
  { id: "P08", name: "Navy Tailored Trousers", nameVi: "Quần Âu Xanh Navy", type: "pants", color: "navy", formality: 4, styles: ["formal", "smart"], cut: "tailored, pressed", image: require("../assets/pants/P08.jpg"), imagePath: "assets/pants/P08.jpg", sample: true, credit: null, fitAdvice: "Màu xanh navy chuyên nghiệp, nếp ly ủi sắc nét." },
  { id: "P09", name: "Beige Slim Chinos", nameVi: "Quần Chinos Be Dáng Ôm Vừa", type: "pants", color: "beige", formality: 3, styles: ["smart", "minimal"], cut: "slim, clean", image: require("../assets/pants/P09.jpg"), imagePath: "assets/pants/P09.jpg", sample: true, credit: null, fitAdvice: "Dáng slim hiện đại, hoàn hảo cho phong cách smart-casual công sở." },
  { id: "P10", name: "Charcoal Flat-Front Trousers", nameVi: "Quần Âu Xám Không Ly", type: "pants", color: "charcoal", formality: 4, styles: ["formal", "minimal"], cut: "flat-front, clean", image: require("../assets/pants/P10.jpg"), imagePath: "assets/pants/P10.jpg", sample: true, credit: null, fitAdvice: "Mặt trước phẳng tối giản, hiện đại và trẻ trung." },
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

const CUSTOM_GARMENTS = new Map<string, Garment>();

export function registerCustomGarment(garment: Garment): void {
  CUSTOM_GARMENTS.set(garment.id, garment);
}

export function isGarmentId(value: unknown): value is GarmentId {
  if (typeof value !== "string") return false;
  return (GARMENT_IDS as readonly string[]).includes(value) || CUSTOM_GARMENTS.has(value) || value.startsWith("u_");
}

export function getGarment(id: GarmentId): Garment {
  const custom = CUSTOM_GARMENTS.get(id);
  if (custom) return custom;
  const garment = CATALOG.find((g) => g.id === id);
  if (!garment) throw new Error(`Unknown garment id ${id}`);
  return garment;
}

const GARMENT_PROMPTS: Record<string, string> = {
  G01: "A tailored navy blue blazer worn on the upper body by the person in the video.",
  G02: "A crisp white oxford button-up shirt worn on the upper body by the person in the video.",
  G03: "A brown knit cardigan worn on the upper body by the person in the video.",
  G04: "A blue denim jacket worn on the upper body by the person in the video.",
  G05: "A sporty black bomber jacket worn on the upper body by the person in the video.",
  G06: "An olive green field jacket worn on the upper body by the person in the video.",
  G07: "A gray fleece hoodie worn on the upper body by the person in the video.",
  G08: "A relaxed cream knit sweater worn on the upper body by the person in the video.",
  G09: "A navy polo shirt worn on the upper body by the person in the video.",
  G10: "A beige trench coat worn on the upper body by the person in the video.",
  P01: "A pair of gray jogger sweatpants worn on the lower body by the person in the video.",
  P02: "A pair of dark indigo jeans worn on the lower body by the person in the video.",
  P03: "A pair of charcoal pleated trousers worn on the lower body by the person in the video.",
  P04: "A pair of olive green cargo pants worn on the lower body by the person in the video.",
  P05: "A pair of beige chinos worn on the lower body by the person in the video.",
  P06: "A pair of black tailored trousers worn on the lower body by the person in the video.",
  P07: "A pair of black straight dress trousers worn on the lower body by the person in the video.",
  P08: "A pair of navy tailored trousers worn on the lower body by the person in the video.",
  P09: "A pair of slim beige chinos worn on the lower body by the person in the video.",
  P10: "A pair of flat-front charcoal trousers worn on the lower body by the person in the video.",
};

/**
 * Try-on prompt for Lucy VTON. Explicitly specifies upper-body or lower-body placement.
 */
export function tryOnPrompt(garment: Garment): string {
  const prompt = GARMENT_PROMPTS[garment.id];
  if (prompt) return prompt;
  if (garment.type === "pants") {
    return `A pair of ${garment.color} ${garment.name} worn on the lower body by the person in the video.`;
  }
  return `A ${garment.color} ${garment.name} worn on the upper body by the person in the video.`;
}
