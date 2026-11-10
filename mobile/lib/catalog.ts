// Catalog + occasions, mirrored from docs/plan.md section "Prompt cho AI Stylist"
// (and api/src/catalog.ts). The server is the source of truth for what the LLM
// sees; this copy is for display and for building try-on prompts.
// Keep ids, names and attributes identical to the plan.

export const GARMENT_IDS = [
  "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10",
  "P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "P10",
  "W01-01", "W01-02", "W02-01", "W02-02", "W03-01", "W03-02", "W04-01", "W04-02", "W04-03",
  "W05-01", "W05-02", "W06-01", "W06-02", "W06-03", "W07-01", "W07-02", "W08-01", "W09-01", "W10-01",
] as const;
export type GarmentId = (typeof GARMENT_IDS)[number] | string;

export const OCCASION_IDS = ["job_interview", "campus_day", "coffee_date", "other"] as const;
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
  gender?: "men" | "women" | "unisex";
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
  /** Custom VTON prompt for user uploaded pieces */
  customPrompt?: string;
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

  // 19 mẫu trang phục Nữ (Women Collection - VTON HD)
  { id: "W01-01", name: "Black Satin Camisole", nameVi: "Áo Hai Dây Lụa Satin Đen", type: "top", gender: "women", color: "black", formality: 3, styles: ["bar", "evening"], cut: "strappy, fluid", image: require("../assets/garments/women/W01_01_black_satin_camisole.png"), imagePath: "assets/garments/women/W01_01_black_satin_camisole.png", sample: true, credit: null, fitAdvice: "Chất lụa satin rủ nhẹ quyến rũ. Rất đẹp khi phối cùng quần ống rộng hoặc khoác blazer bên ngoài.", matchingPantsIds: ["W01-02", "P06", "P03"] },
  { id: "W01-02", name: "Black Wide-leg Trousers", nameVi: "Quần Ống Rộng Đen Lụa", type: "pants", gender: "women", color: "black", formality: 3, styles: ["bar", "evening"], cut: "wide-leg, high-waist", image: require("../assets/garments/women/W01_02_black_wide_leg_trousers.png"), imagePath: "assets/garments/women/W01_02_black_wide_leg_trousers.png", sample: true, credit: null, fitAdvice: "Cạp cao ống suông rộng tôn dáng và kéo dài chân tối đa. Nên mang cùng giày cao gót." },
  { id: "W02-01", name: "Emerald Satin Maxi Dress", nameVi: "Đầm Dạ Hội Satin Xanh Ngọc Bích", type: "dress", gender: "women", color: "emerald green", formality: 5, styles: ["evening", "party", "formal"], cut: "maxi, slip dress", image: require("../assets/garments/women/W02_01_emerald_satin_dress.png"), imagePath: "assets/garments/women/W02_01_emerald_satin_dress.png", sample: true, credit: null, fitAdvice: "Đầm lụa maxi quý phái dáng suông dài qua mắt cá. Tôn trọn bờ vai và đường cong thanh thoát." },
  { id: "W02-02", name: "Black Cropped Blazer", nameVi: "Áo Blazer Lửng Đen", type: "outerwear", gender: "women", color: "black", formality: 4, styles: ["evening", "smart"], cut: "cropped, tailored", image: require("../assets/garments/women/W02_02_black_cropped_blazer.png"), imagePath: "assets/garments/women/W02_02_black_cropped_blazer.png", sample: true, credit: null, fitAdvice: "Dáng blazer cắt lửng ngang eo giúp chân trông dài hơn. Khoác ngoài đầm maxi hoặc áo hai dây cực sang." },
  { id: "W03-01", name: "Burgundy Ruched Top", nameVi: "Áo Kiểu Nhún Eo Đỏ Rượu Burgundy", type: "top", gender: "women", color: "burgundy", formality: 3, styles: ["bar", "date"], cut: "ruched, fitted", image: require("../assets/garments/women/W03_01_burgundy_ruched_top.png"), imagePath: "assets/garments/women/W03_01_burgundy_ruched_top.png", sample: true, credit: null, fitAdvice: "Chi tiết nhún eo tôn vòng 1 và thắt eo quyến rũ. Màu đỏ rượu vang cuốn hút cho buổi hẹn tối." },
  { id: "W03-02", name: "Black Wrap Mini Skirt", nameVi: "Chân Váy Ngắn Vạt Đắp Đen", type: "skirt", gender: "women", color: "black", formality: 3, styles: ["bar", "date"], cut: "wrap, mini", image: require("../assets/garments/women/W03_02_black_wrap_mini_skirt.png"), imagePath: "assets/garments/women/W03_02_black_wrap_mini_skirt.png", sample: true, credit: null, fitAdvice: "Vạt đắp chéo thời thượng, khoe trọn đôi chân thon dài." },
  { id: "W04-01", name: "Camel Blazer", nameVi: "Áo Blazer Nữ Màu Lạc Đà", type: "outerwear", gender: "women", color: "camel", formality: 4, styles: ["office", "formal", "smart"], cut: "tailored, structured", image: require("../assets/garments/women/W04_01_camel_blazer.png"), imagePath: "assets/garments/women/W04_01_camel_blazer.png", sample: true, credit: null, fitAdvice: "Tông màu camel ấm áp trang nhã chuẩn quý cô công sở. Phom suông vừa vặn có đệm vai nhẹ." },
  { id: "W04-02", name: "White Collared Blouse", nameVi: "Áo Sơ Mi Nữ Trắng Cổ Đức", type: "top", gender: "women", color: "white", formality: 4, styles: ["office", "formal"], cut: "crisp, collared", image: require("../assets/garments/women/W04_02_white_blouse.png"), imagePath: "assets/garments/women/W04_02_white_blouse.png", sample: true, credit: null, fitAdvice: "Vải voan lụa mềm chống nhăn, cổ bẻ thanh lịch tôn nét tri thức." },
  { id: "W04-03", name: "Navy Tailored Trousers", nameVi: "Quần Âu Nữ Ống Đứng Xanh Navy", type: "pants", gender: "women", color: "navy", formality: 4, styles: ["office", "smart"], cut: "tailored, pressed", image: require("../assets/garments/women/W04_03_navy_tailored_trousers.png"), imagePath: "assets/garments/women/W04_03_navy_tailored_trousers.png", sample: true, credit: null, fitAdvice: "Ly ủi sắc nét, cạp cao tôn dáng cho phong cách công sở chuyên nghiệp." },
  { id: "W05-01", name: "Cream Knit Sweater", nameVi: "Áo Len Nữ Cổ Tròn Màu Kem", type: "knitwear", gender: "women", color: "cream", formality: 2, styles: ["casual", "cozy"], cut: "knit, relaxed", image: require("../assets/garments/women/W05_01_cream_knit_sweater.png"), imagePath: "assets/garments/women/W05_01_cream_knit_sweater.png", sample: true, credit: null, fitAdvice: "Len sợi mềm mịn giữ ấm nhẹ, mang phong cách Hàn Quốc dịu dàng." },
  { id: "W05-02", name: "Light Wash Straight Jeans", nameVi: "Quần Jeans Ống Suông Xanh Nhạt", type: "pants", gender: "women", color: "light blue", formality: 2, styles: ["casual"], cut: "straight, high-rise", image: require("../assets/garments/women/W05_02_light_wash_jeans.png"), imagePath: "assets/garments/women/W05_02_light_wash_jeans.png", sample: true, credit: null, fitAdvice: "Jeans xanh sáng năng động, cạp vừa ôm hông thoải mái cả ngày." },
  { id: "W06-01", name: "White Hooded Zip Jacket", nameVi: "Áo Khoác Gió Thể Thao Trắng", type: "outerwear", gender: "women", color: "white", formality: 1, styles: ["sports", "casual"], cut: "hooded, athletic", image: require("../assets/garments/women/W06_01_white_zip_jacket.png"), imagePath: "assets/garments/women/W06_01_white_zip_jacket.png", sample: true, credit: null, fitAdvice: "Chất dù mỏng nhẹ kháng nước, có mũ trùm cho hoạt động thể thao ngoài trời." },
  { id: "W06-02", name: "Black Sports Top", nameVi: "Áo Croptop Thể Thao Đen", type: "top", gender: "women", color: "black", formality: 1, styles: ["sports"], cut: "cropped, athletic", image: require("../assets/garments/women/W06_02_black_sports_top.png"), imagePath: "assets/garments/women/W06_02_black_sports_top.png", sample: true, credit: null, fitAdvice: "Chun ôm co giãn 4 chiều thoáng khí, nâng đỡ tốt khi tập gym/yoga." },
  { id: "W06-03", name: "Gray Leggings", nameVi: "Quần Legging Tập Gym Xám", type: "pants", gender: "women", color: "gray", formality: 1, styles: ["sports"], cut: "high-waisted, compression", image: require("../assets/garments/women/W06_03_gray_leggings.png"), imagePath: "assets/garments/women/W06_03_gray_leggings.png", sample: true, credit: null, fitAdvice: "Cạp cao ôm sát tạo dáng thon gọn, chất vải co giãn đàn hồi cao." },
  { id: "W07-01", name: "White Linen Shirt", nameVi: "Áo Sơ Mi Đũi Linen Trắng", type: "top", gender: "women", color: "white", formality: 3, styles: ["beach", "holiday", "casual"], cut: "relaxed, breathable", image: require("../assets/garments/women/W07_01_white_linen_shirt.png"), imagePath: "assets/garments/women/W07_01_white_linen_shirt.png", sample: true, credit: null, fitAdvice: "Vải đũi thoáng mát bay bổng, có thể cài cúc hoặc khoác ngoài bikini dạo biển." },
  { id: "W07-02", name: "Beige Linen Shorts", nameVi: "Quần Shorts Đũi Be Đi Biển", type: "pants", gender: "women", color: "beige", formality: 2, styles: ["beach", "holiday"], cut: "relaxed, drawstring", image: require("../assets/garments/women/W07_02_beige_linen_shorts.png"), imagePath: "assets/garments/women/W07_02_beige_linen_shorts.png", sample: true, credit: null, fitAdvice: "Cạp chun dây rút nhẹ nhàng, ống rộng thoải mái dạo biển mùa hè." },
  { id: "W08-01", name: "Sky-blue Maxi Dress", nameVi: "Đầm Maxi Xanh Da Trời Đi Biển", type: "dress", gender: "women", color: "sky blue", formality: 3, styles: ["beach", "holiday"], cut: "maxi, flared", image: require("../assets/garments/women/W08_01_blue_maxi_dress.png"), imagePath: "assets/garments/women/W08_01_blue_maxi_dress.png", sample: true, credit: null, fitAdvice: "Đầm maxi hai dây xanh dịu mát, chân váy xòe bồng bềnh tung bay trong gió biển." },
  { id: "W09-01", name: "Floral Sundress", nameVi: "Đầm Xòe Hoa Nhí Dạo Phố", type: "dress", gender: "women", color: "floral", formality: 3, styles: ["date", "casual"], cut: "fit-and-flare, puff sleeves", image: require("../assets/garments/women/W09_01_floral_sundress.png"), imagePath: "assets/garments/women/W09_01_floral_sundress.png", sample: true, credit: null, fitAdvice: "Họa tiết hoa nhí vintage, cổ vuông tay phồng tiểu thư cực kỳ tôn dáng và ngọt ngào." },
  { id: "W10-01", name: "Coral Wrap Dress", nameVi: "Đầm Quấn Vạt Chéo Màu San Hô", type: "dress", gender: "women", color: "coral", formality: 3, styles: ["beach", "travel"], cut: "wrap dress, v-neck", image: require("../assets/garments/women/W10_01_coral_wrap_dress.png"), imagePath: "assets/garments/women/W10_01_coral_wrap_dress.png", sample: true, credit: null, fitAdvice: "Dáng wrap dress buộc eo tôn vòng 2 và cổ chữ V thanh thoát, màu san hô rực rỡ dưới nắng." },
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
  other: {
    id: "other",
    label: "Custom Occasion",
    dressCode: "User-defined custom occasion. Versatile, elegant, and stylish.",
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
  return (
    (GARMENT_IDS as readonly string[]).includes(value) ||
    CUSTOM_GARMENTS.has(value) ||
    value.startsWith("u_") ||
    value.startsWith("WISHLIST_")
  );
}

export function getGarment(id: GarmentId): Garment {
  const custom = CUSTOM_GARMENTS.get(id);
  if (custom) return custom;
  const normalized = id.includes("_") ? id.replace("_", "-") : id.replace("-", "_");
  const garment = CATALOG.find((g) => g.id === id || g.id === normalized);
  if (garment) return garment;
  return {
    id,
    name: "Custom Piece",
    nameVi: "Món đồ phối",
    type: "shirt",
    color: "black",
    formality: 2,
    styles: ["casual"],
    cut: "custom piece",
    image: null,
    imagePath: "",
    sample: false,
    credit: null,
  };
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
  // Women VTON prompts (including full-body dresses)
  "W01-01": "A sleek black satin camisole top worn on the upper body by the person in the video.",
  "W01-02": "A pair of black high-waisted wide-leg trousers worn on the lower body by the person in the video.",
  "W02-01": "An elegant emerald green satin maxi slip dress worn as a full-body dress by the person in the video.",
  "W02-02": "A tailored black cropped blazer worn on the upper body by the person in the video.",
  "W03-01": "A burgundy ruched chic top worn on the upper body by the person in the video.",
  "W03-02": "A black wrap mini skirt worn on the lower body by the person in the video.",
  "W04-01": "A tailored camel blazer worn on the upper body by the person in the video.",
  "W04-02": "A crisp white collared blouse worn on the upper body by the person in the video.",
  "W04-03": "A pair of navy blue tailored trousers worn on the lower body by the person in the video.",
  "W05-01": "A cozy cream knit crewneck sweater worn on the upper body by the person in the video.",
  "W05-02": "A pair of light wash straight-leg jeans worn on the lower body by the person in the video.",
  "W06-01": "A sporty white hooded zip-up athletic jacket worn on the upper body by the person in the video.",
  "W06-02": "A black athletic sports crop top worn on the upper body by the person in the video.",
  "W06-03": "A pair of gray high-waisted athletic leggings worn on the lower body by the person in the video.",
  "W07-01": "A relaxed white breathable linen button-up shirt worn on the upper body by the person in the video.",
  "W07-02": "A pair of beige linen drawstring shorts worn on the lower body by the person in the video.",
  "W08-01": "A sky-blue breezy maxi sundress worn as a full-body dress by the person in the video.",
  "W09-01": "A charming vintage floral fit-and-flare dress with puff sleeves worn as a full-body dress by the person in the video.",
  "W10-01": "A vibrant coral v-neck wrap dress with belted waist worn as a full-body dress by the person in the video.",
};

/**
 * Try-on prompt for Lucy VTON.
 * Supports full-body dresses, skirts, pants, and complete outfits.
 */
export function tryOnPrompt(garment: Garment): string {
  if (garment.customPrompt) return garment.customPrompt;
  const prompt = GARMENT_PROMPTS[garment.id] || GARMENT_PROMPTS[garment.id.replace("_", "-")];
  if (prompt) return prompt;
  if (garment.type === "dress") {
    return `An elegant ${garment.color} ${garment.name} worn as a full-body dress by the person in the video.`;
  }
  if (garment.type === "pants" || garment.type === "skirt") {
    return `A ${garment.color} ${garment.name} worn on the lower body by the person in the video.`;
  }
  if (garment.type === "outfit") {
    return `The complete outfit from the reference image, including all garments and accessories, worn by the person in the video.`;
  }
  return `A ${garment.color} ${garment.name} worn on the upper body by the person in the video.`;
}
