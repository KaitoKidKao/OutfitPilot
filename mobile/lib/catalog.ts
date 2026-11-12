// Catalog + occasions, mirrored from docs/plan.md section "Prompt cho AI Stylist"
// (and api/src/catalog.ts). The server is the source of truth for what the LLM
// sees; this copy is for display and for building try-on prompts.
// Keep ids, names and attributes identical to the plan.

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

  // Batch 1 24 items (12 Women + 12 Men - 1024x1024 HD)
  { id: "W11_01", name: "Cream Tie-Neck Blouse", nameVi: "Sơ Mi Lụa Thắt Nơ Màu Kem", type: "top", gender: "women", color: "cream", formality: 4, styles: ["office", "formal", "smart"], cut: "tie-neck, elegant", image: require("../assets/garments/batch1/W11_01_cream_tie_neck_blouse.jpg"), imagePath: "assets/garments/batch1/W11_01_cream_tie_neck_blouse.jpg", sample: true, credit: null, fitAdvice: "Chất lụa mềm mại có nơ cổ thanh lịch, chuẩn mực phong cách công sở.", matchingPantsIds: ["W11_03", "P06", "P08"] },
  { id: "W11_02", name: "Black Tailored Blazer", nameVi: "Áo Blazer Nữ Cắt May Đen", type: "outerwear", gender: "women", color: "black", formality: 4, styles: ["office", "formal", "smart"], cut: "tailored, structured", image: require("../assets/garments/batch1/W11_02_black_tailored_blazer.jpg"), imagePath: "assets/garments/batch1/W11_02_black_tailored_blazer.jpg", sample: true, credit: null, fitAdvice: "Dáng blazer đứng phom chuẩn công sở, tôn nét thanh lịch và chuyên nghiệp.", matchingPantsIds: ["W11_03", "P06", "P03"] },
  { id: "W11_03", name: "Black Tailored Trousers", nameVi: "Quần Tây Nữ Đen Cắt May", type: "pants", gender: "women", color: "black", formality: 4, styles: ["office", "formal"], cut: "tailored, straight", image: require("../assets/garments/batch1/W11_03_black_tailored_trousers.jpg"), imagePath: "assets/garments/batch1/W11_03_black_tailored_trousers.jpg", sample: true, credit: null, fitAdvice: "Quần âu nữ cạp cao ống đứng tôn dáng, dễ phối cùng blazer hoặc sơ mi." },
  { id: "W12_01", name: "White Linen Overshirt", nameVi: "Áo Sơ Mi Đũi Rộng Trắng", type: "top", gender: "women", color: "white", formality: 2, styles: ["beach", "holiday", "casual"], cut: "oversized, resort", image: require("../assets/garments/batch1/W12_01_white_linen_overshirt.jpg"), imagePath: "assets/garments/batch1/W12_01_white_linen_overshirt.jpg", sample: true, credit: null, fitAdvice: "Vải đũi bay bổng thoáng mát, khoác ngoài bikini hoặc phối cùng shorts đi biển.", matchingPantsIds: ["W12_04", "W07-02"] },
  { id: "W12_02", name: "Turquoise Bikini Top", nameVi: "Áo Bikini Xanh Ngọc Lam", type: "top", gender: "women", color: "turquoise", formality: 1, styles: ["beach", "swimwear"], cut: "bikini, halter", image: require("../assets/garments/batch1/W12_02_turquoise_bikini_top.jpg"), imagePath: "assets/garments/batch1/W12_02_turquoise_bikini_top.jpg", sample: true, credit: null, fitAdvice: "Áo tắm hai mảnh màu xanh ngọc lam rực rỡ, thích hợp bơi và tắm nắng.", matchingPantsIds: ["W12_03", "W12_04"] },
  { id: "W12_03", name: "Turquoise Bikini Bottom", nameVi: "Quần Bikini Xanh Ngọc Lam", type: "pants", gender: "women", color: "turquoise", formality: 1, styles: ["beach", "swimwear"], cut: "bikini, low-rise", image: require("../assets/garments/batch1/W12_03_turquoise_bikini_bottom.jpg"), imagePath: "assets/garments/batch1/W12_03_turquoise_bikini_bottom.jpg", sample: true, credit: null, fitAdvice: "Quần bơi đồng bộ chất liệu co giãn nhanh khô." },
  { id: "W12_04", name: "Beige Linen Shorts", nameVi: "Quần Shorts Đũi Be Nữ", type: "pants", gender: "women", color: "beige", formality: 2, styles: ["beach", "resort", "casual"], cut: "drawstring, relaxed", image: require("../assets/garments/batch1/W12_04_beige_linen_shorts.jpg"), imagePath: "assets/garments/batch1/W12_04_beige_linen_shorts.jpg", sample: true, credit: null, fitAdvice: "Cạp chun dây rút mát mẻ, hoàn hảo cho kỳ nghỉ dạo biển." },
  { id: "W13_01", name: "Blush Satin Slip Dress", nameVi: "Đầm Lụa Hai Dây Hồng Phấn", type: "dress", gender: "women", color: "blush pink", formality: 4, styles: ["date", "evening", "party"], cut: "slip dress, delicate", image: require("../assets/garments/batch1/W13_01_blush_satin_slip_dress.jpg"), imagePath: "assets/garments/batch1/W13_01_blush_satin_slip_dress.jpg", sample: true, credit: null, fitAdvice: "Lụa satin hồng phấn ngọt ngào quyến rũ, tôn đường cong thanh thoát cho buổi hẹn hò." },
  { id: "W14_01", name: "Gray Cropped Hoodie", nameVi: "Áo Hoodie Lửng Xám Nữ", type: "top", gender: "women", color: "gray", formality: 1, styles: ["sports", "casual", "street"], cut: "cropped, athletic", image: require("../assets/garments/batch1/W14_01_gray_cropped_hoodie.jpg"), imagePath: "assets/garments/batch1/W14_01_gray_cropped_hoodie.jpg", sample: true, credit: null, fitAdvice: "Phom croptop trẻ trung năng động, dễ phối cùng legging tập gym hoặc dạo phố.", matchingPantsIds: ["W14_02", "W06-03"] },
  { id: "W14_02", name: "Black High-Waist Leggings", nameVi: "Quần Legging Cạp Cao Đen", type: "pants", gender: "women", color: "black", formality: 1, styles: ["sports", "gym"], cut: "high-waist, compression", image: require("../assets/garments/batch1/W14_02_black_high_waist_leggings.jpg"), imagePath: "assets/garments/batch1/W14_02_black_high_waist_leggings.jpg", sample: true, credit: null, fitAdvice: "Co giãn 4 chiều định hình vóc dáng thon thả khi tập luyện." },
  { id: "W15_01", name: "Black Off-Shoulder Top", nameVi: "Áo Trễ Vai Đen Dự Tiệc", type: "top", gender: "women", color: "black", formality: 3, styles: ["party", "bar", "evening"], cut: "off-shoulder, glamorous", image: require("../assets/garments/batch1/W15_01_black_off_shoulder_top.jpg"), imagePath: "assets/garments/batch1/W15_01_black_off_shoulder_top.jpg", sample: true, credit: null, fitAdvice: "Thiết kế trễ vai khoe xương quai xanh quyến rũ cho buổi tiệc đêm hoặc đi bar.", matchingPantsIds: ["W15_02", "W03-02", "P06"] },
  { id: "W15_02", name: "Silver Metallic Mini Skirt", nameVi: "Chân Váy Ngắn Ánh Kim Bạc", type: "skirt", gender: "women", color: "silver", formality: 3, styles: ["party", "bar", "glam"], cut: "mini, metallic", image: require("../assets/garments/batch1/W15_02_silver_metallic_mini_skirt.jpg"), imagePath: "assets/garments/batch1/W15_02_silver_metallic_mini_skirt.jpg", sample: true, credit: null, fitAdvice: "Ánh kim bạc lấp lánh bắt sáng dưới đèn tiệc club, cực kỳ nổi bật." },
  // Batch 1 Men
  { id: "M11_01", name: "Navy Polo Shirt", nameVi: "Áo Polo Xanh Navy Nam", type: "shirt", gender: "men", color: "navy", formality: 3, styles: ["smart", "casual"], cut: "fitted, collared", image: require("../assets/garments/batch1/M11_01_navy_polo_shirt.jpg"), imagePath: "assets/garments/batch1/M11_01_navy_polo_shirt.jpg", sample: true, credit: null, fitAdvice: "Chất thun dệt kim cổ bẻ lịch sự, phù hợp đi làm hoặc cafe cuối tuần.", matchingPantsIds: ["M11_02", "P05", "P09"] },
  { id: "M11_02", name: "Beige Chinos", nameVi: "Quần Chinos Be Nam", type: "pants", gender: "men", color: "beige", formality: 3, styles: ["smart", "casual"], cut: "straight, clean", image: require("../assets/garments/batch1/M11_02_beige_chinos.jpg"), imagePath: "assets/garments/batch1/M11_02_beige_chinos.jpg", sample: true, credit: null, fitAdvice: "Chất kaki co giãn nhẹ, phom suông thanh lịch dễ phối đồ." },
  { id: "M12_01", name: "Light Blue Linen Shirt", nameVi: "Áo Sơ Mi Đũi Xanh Nhạt", type: "shirt", gender: "men", color: "light blue", formality: 2, styles: ["beach", "holiday", "casual"], cut: "relaxed, breathable", image: require("../assets/garments/batch1/M12_01_light_blue_linen_shirt.jpg"), imagePath: "assets/garments/batch1/M12_01_light_blue_linen_shirt.jpg", sample: true, credit: null, fitAdvice: "Vải đũi thoáng mát bay bổng, mang phong cách nghỉ dưỡng bãi biển.", matchingPantsIds: ["M12_02", "P05"] },
  { id: "M12_02", name: "White Resort Shorts", nameVi: "Quần Shorts Trắng Đi Biển", type: "pants", gender: "men", color: "white", formality: 2, styles: ["beach", "holiday"], cut: "resort, comfortable", image: require("../assets/garments/batch1/M12_02_white_resort_shorts.jpg"), imagePath: "assets/garments/batch1/M12_02_white_resort_shorts.jpg", sample: true, credit: null, fitAdvice: "Màu trắng tinh khôi, ống vừa vặn thoáng mát cho ngày hè." },
  { id: "M13_01", name: "Black Oversized Hoodie", nameVi: "Áo Hoodie Đen Phom Rộng", type: "knitwear", gender: "men", color: "black", formality: 1, styles: ["street", "casual"], cut: "oversized, streetwear", image: require("../assets/garments/batch1/M13_01_black_oversized_hoodie.jpg"), imagePath: "assets/garments/batch1/M13_01_black_oversized_hoodie.jpg", sample: true, credit: null, fitAdvice: "Nỉ dày dặn phom rộng thùng thình chuẩn phong cách streetwear cá tính.", matchingPantsIds: ["M13_02", "P04", "P01"] },
  { id: "M13_02", name: "Olive Cargo Pants", nameVi: "Quần Túi Hộp Xanh Rêu Nam", type: "pants", gender: "men", color: "olive green", formality: 2, styles: ["street", "utility"], cut: "relaxed, multi-pocket", image: require("../assets/garments/batch1/M13_02_olive_cargo_pants.jpg"), imagePath: "assets/garments/batch1/M13_02_olive_cargo_pants.jpg", sample: true, credit: null, fitAdvice: "Vải kaki túi hộp hai bên hông đậm chất dã ngoại quân đội." },
  { id: "M14_01", name: "Charcoal Blazer", nameVi: "Áo Blazer Xám Than Nam", type: "outerwear", gender: "men", color: "charcoal", formality: 5, styles: ["formal", "evening", "party"], cut: "structured, formal", image: require("../assets/garments/batch1/M14_01_charcoal_blazer.jpg"), imagePath: "assets/garments/batch1/M14_01_charcoal_blazer.jpg", sample: true, credit: null, fitAdvice: "Blazer dạ tiệc cao cấp ve sam chỉn chu cho các sự kiện trang trọng.", matchingPantsIds: ["M14_03", "P07", "P03"] },
  { id: "M14_02", name: "White Dress Shirt", nameVi: "Áo Sơ Mi Trắng May Đo", type: "shirt", gender: "men", color: "white", formality: 4, styles: ["formal", "smart"], cut: "crisp, tailored", image: require("../assets/garments/batch1/M14_02_white_dress_shirt.jpg"), imagePath: "assets/garments/batch1/M14_02_white_dress_shirt.jpg", sample: true, credit: null, fitAdvice: "Cổ đứng cứng cáp, phom ôm vừa chuẩn mực mặc cùng vest.", matchingPantsIds: ["M14_03", "P06", "P08"] },
  { id: "M14_03", name: "Black Dress Trousers", nameVi: "Quần Âu Nam Đen May Đo", type: "pants", gender: "men", color: "black", formality: 5, styles: ["formal"], cut: "tailored, pressed", image: require("../assets/garments/batch1/M14_03_black_dress_trousers.jpg"), imagePath: "assets/garments/batch1/M14_03_black_dress_trousers.jpg", sample: true, credit: null, fitAdvice: "Nếp ly ủi sắc cạnh chuẩn mực dạ tiệc hoặc lễ cưới." },
  { id: "M15_01", name: "Cream Cable-Knit Sweater", nameVi: "Áo Len Vặn Thừng Màu Kem", type: "knitwear", gender: "men", color: "cream", formality: 2, styles: ["casual", "soft"], cut: "cable-knit, cozy", image: require("../assets/garments/batch1/M15_01_cream_cable_knit_sweater.jpg"), imagePath: "assets/garments/batch1/M15_01_cream_cable_knit_sweater.jpg", sample: true, credit: null, fitAdvice: "Họa tiết đan vặn thừng cổ điển ấm áp, mang vẻ thư sinh lịch thiệp.", matchingPantsIds: ["M15_03", "P02", "P05"] },
  { id: "M15_02", name: "Blue Denim Jacket", nameVi: "Áo Khoác Jeans Xanh Cổ Điển", type: "outerwear", gender: "men", color: "blue denim", formality: 2, styles: ["casual", "street"], cut: "classic, rugged", image: require("../assets/garments/batch1/M15_02_blue_denim_jacket.jpg"), imagePath: "assets/garments/batch1/M15_02_blue_denim_jacket.jpg", sample: true, credit: null, fitAdvice: "Jeans xanh mài nhẹ bụi bặm, dễ khoác ngoài áo thun hoặc sơ mi.", matchingPantsIds: ["M15_03", "P02", "P04"] },
  { id: "M15_03", name: "Dark Indigo Jeans", nameVi: "Quần Jeans Xanh Chàm Đậm", type: "pants", gender: "men", color: "dark indigo", formality: 2, styles: ["casual", "smart"], cut: "straight, classic", image: require("../assets/garments/batch1/M15_03_dark_indigo_jeans.jpg"), imagePath: "assets/garments/batch1/M15_03_dark_indigo_jeans.jpg", sample: true, credit: null, fitAdvice: "Jeans xanh chàm ống đứng kinh điển, bộ đồ không thể thiếu trong tủ đồ." },
  // Accessories & Other (Giày, Mũ, Túi xách, Kính, Trang sức - Category "other")
  { id: "W01_03", name: "Silver Evening Clutch", nameVi: "Ví Cầm Tay Ánh Bạc Dạ Tiệc", type: "other", gender: "women", color: "silver", formality: 4, styles: ["bar", "evening", "party"], cut: "clutch, metallic", image: require("../assets/accessories/W01_03_silver_clutch.jpg"), imagePath: "assets/accessories/W01_03_silver_clutch.jpg", sample: true, credit: null, fitAdvice: "Ánh bạc lấp lánh sang trọng, hoàn hảo cho tiệc đêm và quầy bar." },
  { id: "W01_04", name: "Black Strappy Heels", nameVi: "Giày Cao Gót Quai Mảnh Đen", type: "other", gender: "women", color: "black", formality: 4, styles: ["bar", "evening", "party"], cut: "heels, strappy", image: require("../assets/accessories/W01_04_black_strappy_heels.jpg"), imagePath: "assets/accessories/W01_04_black_strappy_heels.jpg", sample: true, credit: null, fitAdvice: "Quai mảnh thanh thoát cao 7cm, tôn dáng tối đa cho đầm dạ tiệc." },
  { id: "W02_03", name: "Black Shoulder Bag", nameVi: "Túi Kẹp Nách Da Đen", type: "other", gender: "women", color: "black", formality: 4, styles: ["evening", "party", "smart"], cut: "shoulder bag, leather", image: require("../assets/accessories/W02_03_black_shoulder_bag.jpg"), imagePath: "assets/accessories/W02_03_black_shoulder_bag.jpg", sample: true, credit: null, fitAdvice: "Dáng baguette kẹp nách thời thượng, chất da trơn bóng sắc sảo." },
  { id: "W02_04", name: "Black Evening Heels", nameVi: "Giày Cao Gót Mũi Nhọn Đen", type: "other", gender: "women", color: "black", formality: 5, styles: ["evening", "formal", "party"], cut: "heels, pointed", image: require("../assets/accessories/W02_04_black_evening_heels.jpg"), imagePath: "assets/accessories/W02_04_black_evening_heels.jpg", sample: true, credit: null, fitAdvice: "Mũi nhọn cổ điển gót nhọn quyền lực cho các sự kiện trang trọng." },
  { id: "W03_03", name: "Black Chain Bag", nameVi: "Túi Đeo Chéo Dây Xích Đen", type: "other", gender: "women", color: "black", formality: 3, styles: ["bar", "date"], cut: "crossbody, chain", image: require("../assets/accessories/W03_03_black_chain_bag.jpg"), imagePath: "assets/accessories/W03_03_black_chain_bag.jpg", sample: true, credit: null, fitAdvice: "Dây xích kim loại cá tính, kích thước gọn nhẹ cho buổi tối đi bar." },
  { id: "W03_04", name: "Black Ankle Boots", nameVi: "Bốt Cổ Thấp Da Đen", type: "other", gender: "women", color: "black", formality: 3, styles: ["bar", "date", "street"], cut: "boots, ankle", image: require("../assets/accessories/W03_04_black_ankle_boots.jpg"), imagePath: "assets/accessories/W03_04_black_ankle_boots.jpg", sample: true, credit: null, fitAdvice: "Bốt da ôm cổ chân gót vuông 5cm dễ đi, tạo nét cá tính sành điệu." },
  { id: "W04_04", name: "Black Structured Handbag", nameVi: "Túi Xách Tay Công Sở Đen", type: "other", gender: "women", color: "black", formality: 4, styles: ["office", "formal", "smart"], cut: "handbag, structured", image: require("../assets/accessories/W04_04_black_handbag.jpg"), imagePath: "assets/accessories/W04_04_black_handbag.jpg", sample: true, credit: null, fitAdvice: "Phom hộp đứng cứng cáp chuyên nghiệp, vừa vặn đựng tài liệu và ipad." },
  { id: "W04_05", name: "Black Leather Loafers", nameVi: "Giày Loafer Da Đen Công Sở", type: "other", gender: "women", color: "black", formality: 4, styles: ["office", "smart", "formal"], cut: "loafers, leather", image: require("../assets/accessories/W04_05_black_loafers.jpg"), imagePath: "assets/accessories/W04_05_black_loafers.jpg", sample: true, credit: null, fitAdvice: "Đế đúc êm ái, khóa kim loại trang nhã chuẩn phong cách quý cô văn phòng." },
  { id: "W05_03", name: "Tan Crossbody Bag", nameVi: "Túi Đeo Chéo Màu Nâu Da Bò", type: "other", gender: "women", color: "tan", formality: 2, styles: ["casual", "daily"], cut: "crossbody, leather", image: require("../assets/accessories/W05_03_tan_crossbody_bag.jpg"), imagePath: "assets/accessories/W05_03_tan_crossbody_bag.jpg", sample: true, credit: null, fitAdvice: "Chất da mềm tông nâu ấm áp, cực kỳ dễ phối cùng áo len và quần jeans." },
  { id: "W05_04", name: "White Casual Sneakers", nameVi: "Giày Sneaker Trắng Năng Động", type: "other", gender: "women", color: "white", formality: 2, styles: ["casual", "daily", "street"], cut: "sneakers, low-top", image: require("../assets/accessories/W05_04_white_sneakers.jpg"), imagePath: "assets/accessories/W05_04_white_sneakers.jpg", sample: true, credit: null, fitAdvice: "Giày da trắng phom gọn nhẹ, êm chân và phối được với mọi outfit dạo phố." },
  { id: "W06_04", name: "Black Duffel Gym Bag", nameVi: "Túi Trống Thể Thao Đen", type: "other", gender: "women", color: "black", formality: 1, styles: ["sports", "gym"], cut: "duffel, athletic", image: require("../assets/accessories/W06_04_black_gym_bag.jpg"), imagePath: "assets/accessories/W06_04_black_gym_bag.jpg", sample: true, credit: null, fitAdvice: "Túi vải dù kháng nước có ngăn riêng để giày, tiện dụng khi đi tập." },
  { id: "W06_05", name: "White Running Shoes", nameVi: "Giày Chạy Bộ Thể Thao Trắng", type: "other", gender: "women", color: "white", formality: 1, styles: ["sports", "gym", "running"], cut: "running, cushioned", image: require("../assets/accessories/W06_05_white_running_shoes.jpg"), imagePath: "assets/accessories/W06_05_white_running_shoes.jpg", sample: true, credit: null, fitAdvice: "Đệm khí trợ lực êm ái, bám đường tốt cho chạy bộ và tập gym." },
  { id: "W07_03", name: "Wide-Brim Straw Hat", nameVi: "Mũ Cói Rộng Vành Đi Biển", type: "other", gender: "women", color: "beige", formality: 2, styles: ["beach", "holiday", "summer"], cut: "hat, straw", image: require("../assets/accessories/W07_03_straw_hat.jpg"), imagePath: "assets/accessories/W07_03_straw_hat.jpg", sample: true, credit: null, fitAdvice: "Vành rộng chống nắng hiệu quả, chất cói tự nhiên thoáng mát cho kỳ nghỉ hè." },
  { id: "W07_04", name: "Straw Beach Tote", nameVi: "Túi Cói Dạo Biển Mùa Hè", type: "other", gender: "women", color: "beige", formality: 2, styles: ["beach", "holiday", "summer"], cut: "tote, straw", image: require("../assets/accessories/W07_04_straw_tote.jpg"), imagePath: "assets/accessories/W07_04_straw_tote.jpg", sample: true, credit: null, fitAdvice: "Không gian rộng đựng khăn tắm, kính râm và kem chống nắng." },
  { id: "W07_05", name: "Woven Beach Slides", nameVi: "Dép Lê Đan Cói Đi Biển", type: "other", gender: "women", color: "beige", formality: 1, styles: ["beach", "holiday"], cut: "slides, woven", image: require("../assets/accessories/W07_05_woven_slides.jpg"), imagePath: "assets/accessories/W07_05_woven_slides.jpg", sample: true, credit: null, fitAdvice: "Quai đan cói mộc mạc, nhẹ tênh và êm ái khi dạo bước trên bãi cát." },
  { id: "W08_02", name: "Ribbon Straw Hat", nameVi: "Mũ Cói Thắt Nơ Nữ Tính", type: "other", gender: "women", color: "beige", formality: 3, styles: ["beach", "holiday"], cut: "hat, ribbon", image: require("../assets/accessories/W08_02_ribbon_straw_hat.jpg"), imagePath: "assets/accessories/W08_02_ribbon_straw_hat.jpg", sample: true, credit: null, fitAdvice: "Điểm nhấn ruy băng đen mềm mại, phối cực duyên cùng đầm maxi xanh." },
  { id: "W08_03", name: "Raffia Hobo Bag", nameVi: "Túi Hobo Sợi Raffia Đi Biển", type: "other", gender: "women", color: "beige", formality: 3, styles: ["beach", "holiday"], cut: "hobo, raffia", image: require("../assets/accessories/W08_03_raffia_hobo_bag.jpg"), imagePath: "assets/accessories/W08_03_raffia_hobo_bag.jpg", sample: true, credit: null, fitAdvice: "Chất liệu sợi raffia cao cấp đan móc thủ công, phom mềm buông rủ thanh lịch." },
  { id: "W08_04", name: "Tan Strappy Sandals", nameVi: "Sandal Quai Mảnh Nâu Da", type: "other", gender: "women", color: "tan", formality: 3, styles: ["beach", "holiday", "resort"], cut: "sandals, strappy", image: require("../assets/accessories/W08_04_tan_strappy_sandals.jpg"), imagePath: "assets/accessories/W08_04_tan_strappy_sandals.jpg", sample: true, credit: null, fitAdvice: "Dây mảnh buộc cổ chân nhẹ nhàng, màu da nâu tự nhiên cực kỳ tôn da." },
  { id: "W09_02", name: "Cream Cat-Eye Sunglasses", nameVi: "Kính Râm Mắt Mèo Gọng Kem", type: "other", gender: "women", color: "cream", formality: 3, styles: ["summer", "date"], cut: "sunglasses, cat-eye", image: require("../assets/accessories/W09_02_cream_sunglasses.jpg"), imagePath: "assets/accessories/W09_02_cream_sunglasses.jpg", sample: true, credit: null, fitAdvice: "Gọng mắt mèo retro màu kem, tạo vẻ sang chảnh và bảo vệ mắt dưới nắng." },
  { id: "W09_03", name: "Gold Hoop Earrings", nameVi: "Khuyên Tai Tròn Mạ Vàng", type: "other", gender: "women", color: "gold", formality: 3, styles: ["summer", "date", "party"], cut: "earrings, hoops", image: require("../assets/accessories/W09_03_gold_hoop_earrings.jpg"), imagePath: "assets/accessories/W09_03_gold_hoop_earrings.jpg", sample: true, credit: null, fitAdvice: "Thiết kế khoen tròn mạ vàng 18K sáng bóng, tạo điểm nhấn rạng rỡ cho gương mặt." },
  { id: "W09_04", name: "Delicate Gold Necklace", nameVi: "Dây Chuyền Vàng Thanh Mảnh", type: "other", gender: "women", color: "gold", formality: 3, styles: ["summer", "date", "party"], cut: "necklace, pendant", image: require("../assets/accessories/W09_04_gold_necklace.jpg"), imagePath: "assets/accessories/W09_04_gold_necklace.jpg", sample: true, credit: null, fitAdvice: "Mặt dây nhỏ nhắn tinh tế, tôn lên nét duyên của phần cổ và xương quai xanh." },
  { id: "W09_05", name: "Woven Shoulder Bag", nameVi: "Túi Đeo Vai Đan Cói Dạo Phố", type: "other", gender: "women", color: "beige", formality: 3, styles: ["summer", "date", "casual"], cut: "shoulder bag, woven", image: require("../assets/accessories/W09_05_woven_shoulder_bag.jpg"), imagePath: "assets/accessories/W09_05_woven_shoulder_bag.jpg", sample: true, credit: null, fitAdvice: "Kích thước vừa vặn cho buổi hẹn cà phê, quai da kết hợp cói mộc mạc." },
  { id: "W09_06", name: "White Espadrille Wedges", nameVi: "Giày Đế Xuồng Đan Cói Trắng", type: "other", gender: "women", color: "white", formality: 3, styles: ["summer", "date", "holiday"], cut: "wedges, espadrille", image: require("../assets/accessories/W09_06_white_espadrille_wedges.jpg"), imagePath: "assets/accessories/W09_06_white_espadrille_wedges.jpg", sample: true, credit: null, fitAdvice: "Đế xuồng cói êm ái cao 6cm, quai ruy băng buộc cổ chân ngọt ngào phối cùng đầm xòe." },
  { id: "W10_02", name: "Tortoise Shell Sunglasses", nameVi: "Kính Râm Đồi Mồi Cổ Điển", type: "other", gender: "women", color: "brown", formality: 3, styles: ["beach", "holiday"], cut: "sunglasses, tortoise", image: require("../assets/accessories/W10_02_tortoise_sunglasses.jpg"), imagePath: "assets/accessories/W10_02_tortoise_sunglasses.jpg", sample: true, credit: null, fitAdvice: "Họa tiết đồi mồi ấm áp cổ điển, mắt kính polarized chống chói khi đi biển." },
  { id: "W10_03", name: "Straw Market Tote", nameVi: "Túi Cói Đan Phong Cách Chợ Hè", type: "other", gender: "women", color: "beige", formality: 3, styles: ["beach", "holiday"], cut: "tote, market", image: require("../assets/accessories/W10_03_straw_market_tote.jpg"), imagePath: "assets/accessories/W10_03_straw_market_tote.jpg", sample: true, credit: null, fitAdvice: "Quai xách tròn đôi độc đáo, chất cói đan tay bền chắc mang đậm phong cách Pháp." },
  { id: "W10_04", name: "White Canvas Sneakers", nameVi: "Giày Sneaker Vải Trắng Dạo Phố", type: "other", gender: "women", color: "white", formality: 2, styles: ["beach", "casual", "daily"], cut: "sneakers, canvas", image: require("../assets/accessories/W10_04_white_sneakers.jpg"), imagePath: "assets/accessories/W10_04_white_sneakers.jpg", sample: true, credit: null, fitAdvice: "Vải canvas thoáng chân, đế cao su chống trượt bền bỉ cho ngày dài hoạt động." },
  // Men's Accessories (Shoes, Watches, Belts, Bags, Hats, Eyewear, Scarf, Wallet, Bracelet)
  { id: "M_ACC_001", name: "White Low-Top Sneakers", nameVi: "Giày Sneaker Trắng Cổ Thấp", type: "other", gender: "men", color: "white", formality: 2, styles: ["casual", "streetwear"], cut: "sneakers, low-top", image: require("../assets/accessories/M_ACC_001_white_low_top_sneakers.jpg"), imagePath: "assets/accessories/M_ACC_001_white_low_top_sneakers.jpg", sample: true, credit: null, fitAdvice: "Sneaker trắng cổ thấp thanh lịch, đa năng phối cùng jeans, chinos hay quần short." },
  { id: "M_ACC_002", name: "Black Sport Sneakers", nameVi: "Giày Sneaker Thể Thao Đen", type: "other", gender: "men", color: "black", formality: 1, styles: ["casual", "streetwear", "sport"], cut: "sneakers, athletic", image: require("../assets/accessories/M_ACC_002_black_sport_sneakers.jpg"), imagePath: "assets/accessories/M_ACC_002_black_sport_sneakers.jpg", sample: true, credit: null, fitAdvice: "Sneaker đen thể thao đế êm, thích hợp phong cách streetwear năng động." },
  { id: "M_ACC_003", name: "Gray Running Sneakers", nameVi: "Giày Chạy Bộ Xám Năng Động", type: "other", gender: "men", color: "gray", formality: 1, styles: ["sport", "casual"], cut: "running, cushioned", image: require("../assets/accessories/M_ACC_003_gray_running_sneakers.jpg"), imagePath: "assets/accessories/M_ACC_003_gray_running_sneakers.jpg", sample: true, credit: null, fitAdvice: "Tông xám trung tính, đệm êm nâng đỡ bàn chân khi di chuyển nhiều." },
  { id: "M_ACC_004", name: "Black Leather Loafers", nameVi: "Giày Loafers Da Đen Công Sở", type: "other", gender: "men", color: "black", formality: 4, styles: ["office", "smart casual", "formal"], cut: "loafers, leather", image: require("../assets/accessories/M_ACC_004_black_leather_loafers.jpg"), imagePath: "assets/accessories/M_ACC_004_black_leather_loafers.jpg", sample: true, credit: null, fitAdvice: "Chất da bò cao cấp, form loafers kinh điển cho trang phục công sở và smart-casual." },
  { id: "M_ACC_005", name: "Black Derby Shoes", nameVi: "Giày Tây Derby Da Đen Lịch Lãm", type: "other", gender: "men", color: "black", formality: 5, styles: ["formal", "office"], cut: "derby, formal", image: require("../assets/accessories/M_ACC_005_black_derby_shoes.jpg"), imagePath: "assets/accessories/M_ACC_005_black_derby_shoes.jpg", sample: true, credit: null, fitAdvice: "Giày tây Derby mũi tròn lịch lãm, thích hợp cho sự kiện trang trọng và phỏng vấn." },
  { id: "M_ACC_006", name: "Black Chelsea Boots", nameVi: "Giày Bốt Chelsea Da Đen Cá Tính", type: "other", gender: "men", color: "black", formality: 3, styles: ["date", "party", "smart"], cut: "boots, chelsea", image: require("../assets/accessories/M_ACC_006_black_chelsea_boots.jpg"), imagePath: "assets/accessories/M_ACC_006_black_chelsea_boots.jpg", sample: true, credit: null, fitAdvice: "Chelsea boots da đen cá tính, tạo vẻ ngoài cuốn hút khi diện cùng skinny hoặc straight jeans." },
  { id: "M_ACC_007", name: "Classic Brown Leather Watch", nameVi: "Đồng Hồ Dây Da Nâu Cổ Điển", type: "other", gender: "men", color: "brown", formality: 4, styles: ["office", "smart casual"], cut: "watch, leather strap", image: require("../assets/accessories/M_ACC_007_classic_brown_leather_watch.jpg"), imagePath: "assets/accessories/M_ACC_007_classic_brown_leather_watch.jpg", sample: true, credit: null, fitAdvice: "Dây da nâu cổ điển kết hợp mặt số kim loại, toát lên phong thái quý ông điềm đạm." },
  { id: "M_ACC_008", name: "Minimal Black Dial Watch", nameVi: "Đồng Hồ Mặt Đen Tối Giản", type: "other", gender: "men", color: "black", formality: 3, styles: ["date", "office", "minimal"], cut: "watch, minimal", image: require("../assets/accessories/M_ACC_008_minimal_black_dial_watch.jpg"), imagePath: "assets/accessories/M_ACC_008_minimal_black_dial_watch.jpg", sample: true, credit: null, fitAdvice: "Mặt số đen siêu mỏng tối giản, mang lại nét tinh tế hiện đại cho cổ tay." },
  { id: "M_ACC_009", name: "Silver Chronograph Watch", nameVi: "Đồng Hồ Thể Thao Bạc Chronograph", type: "other", gender: "men", color: "silver", formality: 2, styles: ["sport", "casual", "smart"], cut: "watch, chronograph", image: require("../assets/accessories/M_ACC_009_silver_chronograph_watch.jpg"), imagePath: "assets/accessories/M_ACC_009_silver_chronograph_watch.jpg", sample: true, credit: null, fitAdvice: "Bộ máy chronograph thép không gỉ thể thao, mạnh mẽ và sang trọng." },
  { id: "M_ACC_010", name: "Blue Diver Watch", nameVi: "Đồng Hồ Lặn Mặt Xanh Biển", type: "other", gender: "men", color: "blue", formality: 2, styles: ["casual", "travel"], cut: "watch, diver", image: require("../assets/accessories/M_ACC_010_blue_diver_watch.jpg"), imagePath: "assets/accessories/M_ACC_010_blue_diver_watch.jpg", sample: true, credit: null, fitAdvice: "Mặt số xanh biển viền xoay nam tính, chống nước tuyệt hảo cho chuyến dạo biển." },
  { id: "M_ACC_011", name: "Black Leather Belt", nameVi: "Thắt Lưng Da Đen Khóa Cổ Điển", type: "other", gender: "men", color: "black", formality: 4, styles: ["office", "formal", "smart"], cut: "belt, leather", image: require("../assets/accessories/M_ACC_011_black_leather_belt.jpg"), imagePath: "assets/accessories/M_ACC_011_black_leather_belt.jpg", sample: true, credit: null, fitAdvice: "Da thật đen bóng nhẹ, mặt khóa kim loại sáng mờ cho âu phục chuẩn mực." },
  { id: "M_ACC_012", name: "Brown Leather Belt", nameVi: "Thắt Lưng Da Nâu Thanh Lịch", type: "other", gender: "men", color: "brown", formality: 3, styles: ["smart casual", "office"], cut: "belt, leather", image: require("../assets/accessories/M_ACC_012_brown_leather_belt.jpg"), imagePath: "assets/accessories/M_ACC_012_brown_leather_belt.jpg", sample: true, credit: null, fitAdvice: "Màu nâu hạt dẻ ấm áp, phối ăn ý với giày da nâu và quần chinos." },
  { id: "M_ACC_013", name: "Navy Braided Belt", nameVi: "Thắt Lưng Đan Co Giãn Xanh Navy", type: "other", gender: "men", color: "navy", formality: 2, styles: ["casual", "travel"], cut: "belt, braided", image: require("../assets/accessories/M_ACC_013_navy_braided_belt.jpg"), imagePath: "assets/accessories/M_ACC_013_navy_braided_belt.jpg", sample: true, credit: null, fitAdvice: "Dây dệt đan co giãn linh hoạt, mang lại cảm giác thoải mái cho trang phục thường ngày." },
  { id: "M_ACC_014", name: "Olive Canvas Belt", nameVi: "Thắt Lưng Vải Dù Màu Rêu Bền Bỉ", type: "other", gender: "men", color: "olive", formality: 1, styles: ["streetwear", "outdoor"], cut: "belt, canvas", image: require("../assets/accessories/M_ACC_014_olive_canvas_belt.jpg"), imagePath: "assets/accessories/M_ACC_014_olive_canvas_belt.jpg", sample: true, credit: null, fitAdvice: "Chất vải canvas xanh rêu bụi bặm, bền chắc cho phong cách dã ngoại và cargo pants." },
  { id: "M_ACC_015", name: "Black Crossbody Bag", nameVi: "Túi Đeo Chéo Đen Tiện Dụng", type: "other", gender: "men", color: "black", formality: 2, styles: ["casual", "travel"], cut: "crossbody, leather", image: require("../assets/accessories/M_ACC_015_black_crossbody_bag.jpg"), imagePath: "assets/accessories/M_ACC_015_black_crossbody_bag.jpg", sample: true, credit: null, fitAdvice: "Thiết kế đeo chéo nhỏ gọn, kháng nước nhẹ tiện cất điện thoại và ví tiền." },
  { id: "M_ACC_016", name: "Black Sling Bag", nameVi: "Túi Sling Bag Đen Đường Phố", type: "other", gender: "men", color: "black", formality: 1, styles: ["streetwear", "travel"], cut: "sling bag, streetwear", image: require("../assets/accessories/M_ACC_016_black_sling_bag.jpg"), imagePath: "assets/accessories/M_ACC_016_black_sling_bag.jpg", sample: true, credit: null, fitAdvice: "Túi sling đeo ngực cá tính, phong cách đường phố năng động." },
  { id: "M_ACC_017", name: "Brown Messenger Bag", nameVi: "Túi Messenger Da Nâu Đựng Tài Liệu", type: "other", gender: "men", color: "brown", formality: 4, styles: ["office", "casual", "smart"], cut: "messenger, briefcase", image: require("../assets/accessories/M_ACC_017_brown_messenger_bag.jpg"), imagePath: "assets/accessories/M_ACC_017_brown_messenger_bag.jpg", sample: true, credit: null, fitAdvice: "Túi messenger da nâu nắp gập, vừa vặn laptop và tài liệu cho ngày làm việc." },
  { id: "M_ACC_018", name: "Black Travel Backpack", nameVi: "Balo Du Lịch Đa Năng Màu Đen", type: "other", gender: "men", color: "black", formality: 2, styles: ["daily", "travel"], cut: "backpack, travel", image: require("../assets/accessories/M_ACC_018_black_travel_backpack.jpg"), imagePath: "assets/accessories/M_ACC_018_black_travel_backpack.jpg", sample: true, credit: null, fitAdvice: "Balo đen phom cứng cáp nhiều ngăn, lý tưởng cho đi học, đi làm hoặc du lịch." },
  { id: "M_ACC_019", name: "Cream Canvas Tote", nameVi: "Túi Vải Canvas Màu Kem Phong Cách Mộc", type: "other", gender: "men", color: "cream", formality: 2, styles: ["casual", "beach"], cut: "tote, canvas", image: require("../assets/accessories/M_ACC_019_cream_canvas_tote.jpg"), imagePath: "assets/accessories/M_ACC_019_cream_canvas_tote.jpg", sample: true, credit: null, fitAdvice: "Vải canvas tự nhiên dày dặn, phong cách mộc mạc thư thả dạo phố cuối tuần." },
  { id: "M_ACC_020", name: "Navy Baseball Cap", nameVi: "Nón Lưỡi Trai Xanh Navy Năng Động", type: "other", gender: "men", color: "navy", formality: 1, styles: ["casual", "streetwear"], cut: "cap, baseball", image: require("../assets/accessories/M_ACC_020_navy_baseball_cap.jpg"), imagePath: "assets/accessories/M_ACC_020_navy_baseball_cap.jpg", sample: true, credit: null, fitAdvice: "Nón lưỡi trai xanh navy thêu logo tinh gọn, che nắng và tăng vẻ trẻ trung." },
  { id: "M_ACC_021", name: "Beige Bucket Hat", nameVi: "Mũ Tai Bèo Màu Be Dạo Phố Đi Biển", type: "other", gender: "men", color: "beige", formality: 2, styles: ["beach", "casual"], cut: "hat, bucket", image: require("../assets/accessories/M_ACC_021_beige_bucket_hat.jpg"), imagePath: "assets/accessories/M_ACC_021_beige_bucket_hat.jpg", sample: true, credit: null, fitAdvice: "Mũ tai bèo vành mềm tông be mát mắt, che chắn nắng dịu mát khi đi biển." },
  { id: "M_ACC_022", name: "Black Knit Beanie", nameVi: "Mũ Len Beanie Đen Ấm Áp", type: "other", gender: "men", color: "black", formality: 2, styles: ["winter", "streetwear"], cut: "beanie, knit", image: require("../assets/accessories/M_ACC_022_black_knit_beanie.jpg"), imagePath: "assets/accessories/M_ACC_022_black_knit_beanie.jpg", sample: true, credit: null, fitAdvice: "Chất len dệt kim co giãn giữ ấm đầu và tai trong những ngày gió lạnh." },
  { id: "M_ACC_023", name: "Brown Fedora", nameVi: "Mũ Phớt Fedora Nâu Cổ Điển", type: "other", gender: "men", color: "brown", formality: 3, styles: ["date", "travel"], cut: "hat, fedora", image: require("../assets/accessories/M_ACC_023_brown_fedora.jpg"), imagePath: "assets/accessories/M_ACC_023_brown_fedora.jpg", sample: true, credit: null, fitAdvice: "Mũ phớt fedora nỉ nâu kinh điển, phụ kiện tạo điểm nhấn ấn tượng cho các set đồ nghệ sĩ." },
  { id: "M_ACC_024", name: "Black Rectangular Sunglasses", nameVi: "Kính Mát Chữ Nhật Đen Hiện Đại", type: "other", gender: "men", color: "black", formality: 3, styles: ["casual", "beach"], cut: "sunglasses, rectangular", image: require("../assets/accessories/M_ACC_024_black_rectangular_sunglasses.jpg"), imagePath: "assets/accessories/M_ACC_024_black_rectangular_sunglasses.jpg", sample: true, credit: null, fitAdvice: "Gọng vuông góc cạnh thời thượng, bảo vệ mắt và tôn đường nét gương mặt nam tính." },
  { id: "M_ACC_025", name: "Gold Aviator Sunglasses", nameVi: "Kính Phi Công Gọng Vàng Sang Trọng", type: "other", gender: "men", color: "gold", formality: 3, styles: ["travel", "beach"], cut: "sunglasses, aviator", image: require("../assets/accessories/M_ACC_025_gold_aviator_sunglasses.jpg"), imagePath: "assets/accessories/M_ACC_025_gold_aviator_sunglasses.jpg", sample: true, credit: null, fitAdvice: "Gọng kim loại mạ vàng hình giọt nước huyền thoại, phong thái phi công đầy lôi cuốn." },
  { id: "M_ACC_026", name: "Dark Round Sunglasses", nameVi: "Kính Mát Mắt Tròn Cổ Điển", type: "other", gender: "men", color: "black", formality: 3, styles: ["casual", "streetwear"], cut: "sunglasses, round", image: require("../assets/accessories/M_ACC_026_dark_round_sunglasses.jpg"), imagePath: "assets/accessories/M_ACC_026_dark_round_sunglasses.jpg", sample: true, credit: null, fitAdvice: "Mắt kính tròn đen cổ điển, đậm chất retro nghệ thuật." },
  { id: "M_ACC_027", name: "Black Optical Glasses", nameVi: "Kính Cận Gọng Vuông Đen Trí Thức", type: "other", gender: "men", color: "black", formality: 3, styles: ["daily", "office"], cut: "glasses, optical", image: require("../assets/accessories/M_ACC_027_black_optical_glasses.jpg"), imagePath: "assets/accessories/M_ACC_027_black_optical_glasses.jpg", sample: true, credit: null, fitAdvice: "Gọng kính cận mắt vuông đen nhẹ tênh, đem lại vẻ ngoài tri thức nhã nhặn." },
  { id: "M_ACC_028", name: "Gray Winter Scarf", nameVi: "Khăn Choàng Len Mùa Đông Màu Xám", type: "other", gender: "men", color: "gray", formality: 3, styles: ["winter", "casual"], cut: "scarf, winter knit", image: require("../assets/accessories/M_ACC_028_gray_winter_scarf.jpg"), imagePath: "assets/accessories/M_ACC_028_gray_winter_scarf.jpg", sample: true, credit: null, fitAdvice: "Khăn len xám mềm mại giữ ấm cổ, tạo lớp layer tinh tế cho áo khoác ngoài mùa đông." },
  { id: "M_ACC_029", name: "Black Leather Wallet", nameVi: "Ví Da Bỏ Túi Đen Tinh Tế", type: "other", gender: "men", color: "black", formality: 4, styles: ["daily", "formal"], cut: "wallet, bifold", image: require("../assets/accessories/M_ACC_029_black_leather_wallet.jpg"), imagePath: "assets/accessories/M_ACC_029_black_leather_wallet.jpg", sample: true, credit: null, fitAdvice: "Ví gập đôi da bò đen dập vân hạt, kích thước nhỏ gọn vừa vặn túi quần âu." },
  { id: "M_ACC_030", name: "Silver Chain Bracelet", nameVi: "Vòng Tay Xích Bạc Nam Tính", type: "other", gender: "men", color: "silver", formality: 2, styles: ["streetwear", "party"], cut: "bracelet, silver chain", image: require("../assets/accessories/M_ACC_030_silver_chain_bracelet.jpg"), imagePath: "assets/accessories/M_ACC_030_silver_chain_bracelet.jpg", sample: true, credit: null, fitAdvice: "Xích bạc mắt xích Cuban sáng bóng, điểm nhấn nam tính tinh tế trên cổ tay." },
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
