// OutfitPilot My Closet (Tủ Đồ Riêng & Kiểm Chứng Mua Sắm)
// Holds all 20 default pieces (10 tops/outerwear G01-G10 and 10 pants P01-P10),
// plus user-added pieces with image upload, shop link, pricing, and category.
// Persists on device via AsyncStorage.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { CATALOG, registerCustomGarment, type Garment } from "./catalog";

export type ClosetCategory = "all" | "outerwear" | "top" | "knitwear" | "pants" | "dress" | "skirt";
export type OwnershipStatus = "all" | "wishlist" | "owned";
export type GenderFilter = "all" | "women" | "men";

export interface ClosetItem {
  id: string;
  name: string;
  nameVi: string;
  category: "outerwear" | "top" | "knitwear" | "pants" | "dress" | "skirt";
  gender?: "women" | "men" | "unisex";
  color: string;
  styles: string[];
  formality: number; // 1-5
  status: "wishlist" | "owned"; // wishlist = đang ngắm mua, owned = đã có trong tủ
  price?: string;
  shop?: string;
  url?: string;
  image: any;
  imagePath?: string;
  fitAdvice?: string;
  matchingPantsIds?: string[];
  isCustom?: boolean;
}

export const INITIAL_CLOSET_ITEMS: ClosetItem[] = [
  // 10 mẫu áo & áo khoác
  {
    id: "G01",
    name: "Navy Blazer",
    nameVi: "Áo Blazer Xanh Navy",
    category: "outerwear",
    color: "navy",
    styles: ["formal", "smart"],
    formality: 4,
    status: "wishlist",
    price: "1.450.000₫",
    shop: "Zara Men",
    image: require("../assets/garments/G01.png"),
    fitAdvice: "Dáng may đo vừa vặn. Nên đo bề ngang vai và vòng ngực trước khi chọn size.",
    matchingPantsIds: ["P03", "P06", "P08", "P10"],
  },
  {
    id: "G02",
    name: "White Oxford Shirt",
    nameVi: "Sơ Mi Oxford Trắng",
    category: "top",
    color: "white",
    styles: ["formal", "minimal"],
    formality: 4,
    status: "wishlist",
    price: "550.000₫",
    shop: "Uniqlo",
    image: require("../assets/garments/G02.png"),
    fitAdvice: "Vải Oxford đứng dáng. Nên chọn đúng số đo vòng cổ và chiều dài tay áo.",
    matchingPantsIds: ["P02", "P03", "P05", "P08", "P09"],
  },
  {
    id: "G03",
    name: "Brown Cardigan",
    nameVi: "Áo Khoác Len Nâu",
    category: "knitwear",
    color: "brown",
    styles: ["casual", "smart"],
    formality: 3,
    status: "wishlist",
    price: "720.000₫",
    shop: "Shopee Mall",
    image: require("../assets/garments/G03.png"),
    fitAdvice: "Len dệt êm cổ V. Dáng hơi thụng nhẹ, mặc khoác ngoài sơ mi rất tôn dáng.",
    matchingPantsIds: ["P02", "P05", "P09", "P10"],
  },
  {
    id: "G04",
    name: "Blue Denim Jacket",
    nameVi: "Áo Khoác Denim Xanh",
    category: "outerwear",
    color: "blue denim",
    styles: ["casual", "street"],
    formality: 1,
    status: "wishlist",
    price: "890.000₫",
    shop: "Levi's",
    image: require("../assets/garments/G04.png"),
    fitAdvice: "Chất jeans dệt dày dặn, phom hộp boxy. Nếu thích mặc kèm hoodie bên trong nên tăng 1 size.",
    matchingPantsIds: ["P01", "P04", "P05"],
  },
  {
    id: "G05",
    name: "Black Bomber Jacket",
    nameVi: "Áo Khoác Bomber Đen",
    category: "outerwear",
    color: "black",
    styles: ["street", "minimal"],
    formality: 2,
    status: "wishlist",
    price: "950.000₫",
    shop: "H&M",
    image: require("../assets/garments/G05.png"),
    fitAdvice: "Phom thể thao ngắn ngang hông. Hãy kiểm tra chiều dài thân áo để đảm bảo không bị ngắn lưng.",
    matchingPantsIds: ["P01", "P02", "P04", "P06"],
  },
  {
    id: "G06",
    name: "Olive Field Jacket",
    nameVi: "Áo Khoác Túi Hộp Rêu",
    category: "outerwear",
    color: "olive green",
    styles: ["casual", "smart"],
    formality: 3,
    status: "wishlist",
    price: "1.100.000₫",
    shop: "Zara",
    image: require("../assets/garments/G06.png"),
    fitAdvice: "4 túi hộp tiện dụng phong cách dã ngoại. Dáng suông thoải mái, phối với quần chinos hoặc jeans.",
    matchingPantsIds: ["P02", "P04", "P05", "P09"],
  },
  {
    id: "G07",
    name: "Gray Hoodie",
    nameVi: "Áo Hoodie Nỉ Xám",
    category: "knitwear",
    color: "gray",
    styles: ["casual", "street"],
    formality: 1,
    status: "wishlist",
    price: "480.000₫",
    shop: "Shopee",
    image: require("../assets/garments/G07.png"),
    fitAdvice: "Nỉ bông mềm dày dặn, mũ trùm sâu. Thích hợp mặc hàng ngày đi học, đi chơi.",
    matchingPantsIds: ["P01", "P02", "P04"],
  },
  {
    id: "G08",
    name: "Cream Knit Sweater",
    nameVi: "Áo Len Dệt Màu Kem",
    category: "knitwear",
    color: "cream",
    styles: ["casual", "soft"],
    formality: 2,
    status: "wishlist",
    price: "650.000₫",
    shop: "Uniqlo",
    image: require("../assets/garments/G08.png"),
    fitAdvice: "Len dệt gân nổi tông màu ấm áp. Cổ tròn ôm vừa, tạo cảm giác nhẹ nhàng, dễ mến.",
    matchingPantsIds: ["P02", "P03", "P05", "P09"],
  },
  {
    id: "G09",
    name: "Navy Polo Shirt",
    nameVi: "Áo Polo Xanh Navy",
    category: "top",
    color: "navy",
    styles: ["smart", "casual"],
    formality: 3,
    status: "wishlist",
    price: "390.000₫",
    shop: "Coolmate",
    image: require("../assets/garments/G09.png"),
    fitAdvice: "Polo dệt piqué thoáng khí, cổ bẻ có viền trắng. Thích hợp đi làm thường ngày hoặc cafe.",
    matchingPantsIds: ["P05", "P08", "P09"],
  },
  {
    id: "G10",
    name: "Beige Trench Coat",
    nameVi: "Áo Măng Tô Màu Be",
    category: "outerwear",
    color: "beige",
    styles: ["formal", "smart"],
    formality: 4,
    status: "wishlist",
    price: "2.100.000₫",
    shop: "Mango",
    image: require("../assets/garments/G10.png"),
    fitAdvice: "Dáng dài qua gối sang trọng có thắt lưng. Hãy đối chiếu chiều cao tổng thể và vòng ngực khi chọn size.",
    matchingPantsIds: ["P03", "P06", "P08", "P10"],
  },

  // 10 mẫu quần trong tủ đồ
  {
    id: "P01",
    name: "Gray Jogger Sweatpants",
    nameVi: "Quần Jogger Nỉ Xám",
    category: "pants",
    color: "gray",
    styles: ["casual", "street"],
    formality: 1,
    status: "owned",
    image: require("../assets/pants/P01.jpg"),
    fitAdvice: "Cạp chun dây rút co giãn, ống bo gấu năng động.",
  },
  {
    id: "P02",
    name: "Dark Indigo Jeans",
    nameVi: "Quần Jeans Xanh Đậm",
    category: "pants",
    color: "dark indigo",
    styles: ["casual", "smart"],
    formality: 2,
    status: "owned",
    image: require("../assets/pants/P02.jpg"),
    fitAdvice: "Jeans xanh chàm không mài, ống đứng kinh điển dễ phối với mọi loại áo.",
  },
  {
    id: "P03",
    name: "Charcoal Pleated Trousers",
    nameVi: "Quần Âu Xám Xếp Ly",
    category: "pants",
    color: "charcoal",
    styles: ["formal", "smart"],
    formality: 4,
    status: "owned",
    image: require("../assets/pants/P03.jpg"),
    fitAdvice: "Xếp ly trước cổ điển, cạp cao tôn dáng cho sự kiện trang trọng.",
  },
  {
    id: "P04",
    name: "Olive Cargo Pants",
    nameVi: "Quần Túi Hộp Xanh Rêu",
    category: "pants",
    color: "olive green",
    styles: ["street", "utility"],
    formality: 2,
    status: "owned",
    image: require("../assets/pants/P04.jpg"),
    fitAdvice: "Vải kaki dày dặn có túi hộp hai bên, đậm chất quân đội dã ngoại.",
  },
  {
    id: "P05",
    name: "Beige Relaxed Chinos",
    nameVi: "Quần Chinos Be Dáng Thoải Mái",
    category: "pants",
    color: "beige",
    styles: ["casual", "smart"],
    formality: 3,
    status: "owned",
    image: require("../assets/pants/P05.jpg"),
    fitAdvice: "Chất cotton co giãn nhẹ, ống suông nhẹ màu be cát thanh lịch.",
  },
  {
    id: "P06",
    name: "Black Tapered Trousers",
    nameVi: "Quần Âu Đen Ống Côn",
    category: "pants",
    color: "black",
    styles: ["formal", "minimal"],
    formality: 4,
    status: "owned",
    image: require("../assets/pants/P06.jpg"),
    fitAdvice: "Dáng ôm gọn dần về gấu quần, tạo hiệu ứng kéo dài chân.",
  },
  {
    id: "P07",
    name: "Black Straight Dress Trousers",
    nameVi: "Quần Tây Đen Ống Đứng",
    category: "pants",
    color: "black",
    styles: ["formal"],
    formality: 5,
    status: "owned",
    image: require("../assets/pants/P07.jpg"),
    fitAdvice: "Quần tây may đo chuẩn mực cho lễ tiệc hoặc phỏng vấn cấp cao.",
  },
  {
    id: "P08",
    name: "Navy Tailored Trousers",
    nameVi: "Quần Âu Xanh Navy",
    category: "pants",
    color: "navy",
    styles: ["formal", "smart"],
    formality: 4,
    status: "owned",
    image: require("../assets/pants/P08.jpg"),
    fitAdvice: "Màu xanh navy chuyên nghiệp, nếp ly ủi sắc nét.",
  },
  {
    id: "P09",
    name: "Beige Slim Chinos",
    nameVi: "Quần Chinos Be Dáng Ôm Vừa",
    category: "pants",
    color: "beige",
    styles: ["smart", "minimal"],
    formality: 3,
    status: "owned",
    image: require("../assets/pants/P09.jpg"),
    fitAdvice: "Dáng slim hiện đại, hoàn hảo cho phong cách smart-casual công sở.",
  },
  {
    id: "P10",
    name: "Charcoal Flat-Front Trousers",
    nameVi: "Quần Âu Xám Không Ly",
    category: "pants",
    gender: "men",
    color: "charcoal",
    styles: ["formal", "minimal"],
    formality: 4,
    status: "owned",
    image: require("../assets/pants/P10.jpg"),
    fitAdvice: "Mặt trước phẳng tối giản, hiện đại và trẻ trung.",
  },

  // 19 mẫu trang phục Nữ (Women Collection - VTON HD)
  {
    id: "W01-01",
    name: "Black Satin Camisole",
    nameVi: "Áo Hai Dây Lụa Satin Đen",
    category: "top",
    gender: "women",
    color: "black",
    styles: ["bar", "evening"],
    formality: 3,
    status: "wishlist",
    price: "450.000₫",
    shop: "Zara Women",
    image: require("../assets/garments/women/W01_01_black_satin_camisole.png"),
    fitAdvice: "Chất lụa satin rủ nhẹ quyến rũ. Rất đẹp khi phối cùng quần ống rộng hoặc khoác blazer bên ngoài.",
    matchingPantsIds: ["W01-02", "P06", "P03"],
  },
  {
    id: "W01-02",
    name: "Black Wide-leg Trousers",
    nameVi: "Quần Ống Rộng Đen Lụa",
    category: "pants",
    gender: "women",
    color: "black",
    styles: ["bar", "evening"],
    formality: 3,
    status: "wishlist",
    price: "680.000₫",
    shop: "Mango",
    image: require("../assets/garments/women/W01_02_black_wide_leg_trousers.png"),
    fitAdvice: "Cạp cao ống suông rộng tôn dáng và kéo dài chân tối đa. Nên mang cùng giày cao gót.",
  },
  {
    id: "W02-01",
    name: "Emerald Satin Maxi Dress",
    nameVi: "Đầm Dạ Hội Satin Xanh Ngọc Bích",
    category: "dress",
    gender: "women",
    color: "emerald green",
    styles: ["evening", "party", "formal"],
    formality: 5,
    status: "wishlist",
    price: "1.890.000₫",
    shop: "Zara Evening",
    image: require("../assets/garments/women/W02_01_emerald_satin_dress.png"),
    fitAdvice: "Đầm lụa maxi quý phái dáng suông dài qua mắt cá. Tôn trọn bờ vai và đường cong thanh thoát.",
  },
  {
    id: "W02-02",
    name: "Black Cropped Blazer",
    nameVi: "Áo Blazer Lửng Đen",
    category: "outerwear",
    gender: "women",
    color: "black",
    styles: ["evening", "smart"],
    formality: 4,
    status: "wishlist",
    price: "950.000₫",
    shop: "H&M Studio",
    image: require("../assets/garments/women/W02_02_black_cropped_blazer.png"),
    fitAdvice: "Dáng blazer cắt lửng ngang eo giúp chân trông dài hơn. Khoác ngoài đầm maxi hoặc áo hai dây cực sang.",
  },
  {
    id: "W03-01",
    name: "Burgundy Ruched Top",
    nameVi: "Áo Kiểu Nhún Eo Đỏ Rượu Burgundy",
    category: "top",
    gender: "women",
    color: "burgundy",
    styles: ["bar", "date"],
    formality: 3,
    status: "wishlist",
    price: "520.000₫",
    shop: "Shopee Mall",
    image: require("../assets/garments/women/W03_01_burgundy_ruched_top.png"),
    fitAdvice: "Chi tiết nhún eo tôn vòng 1 và thắt eo quyến rũ. Màu đỏ rượu vang cuốn hút cho buổi hẹn tối.",
    matchingPantsIds: ["W03-02", "W01-02", "P06"],
  },
  {
    id: "W03-02",
    name: "Black Wrap Mini Skirt",
    nameVi: "Chân Váy Ngắn Vạt Đắp Đen",
    category: "skirt",
    gender: "women",
    color: "black",
    styles: ["bar", "date"],
    formality: 3,
    status: "wishlist",
    price: "480.000₫",
    shop: "Zara",
    image: require("../assets/garments/women/W03_02_black_wrap_mini_skirt.png"),
    fitAdvice: "Vạt đắp chéo thời thượng, khoe trọn đôi chân thon dài.",
  },
  {
    id: "W04-01",
    name: "Camel Blazer",
    nameVi: "Áo Blazer Nữ Màu Lạc Đà",
    category: "outerwear",
    gender: "women",
    color: "camel",
    styles: ["office", "formal", "smart"],
    formality: 4,
    status: "wishlist",
    price: "1.350.000₫",
    shop: "Mango Office",
    image: require("../assets/garments/women/W04_01_camel_blazer.png"),
    fitAdvice: "Tông màu camel ấm áp trang nhã chuẩn quý cô công sở. Phom suông vừa vặn có đệm vai nhẹ.",
    matchingPantsIds: ["W04-03", "P03", "P08"],
  },
  {
    id: "W04-02",
    name: "White Collared Blouse",
    nameVi: "Áo Sơ Mi Nữ Trắng Cổ Đức",
    category: "top",
    gender: "women",
    color: "white",
    styles: ["office", "formal"],
    formality: 4,
    status: "wishlist",
    price: "490.000₫",
    shop: "Uniqlo",
    image: require("../assets/garments/women/W04_02_white_blouse.png"),
    fitAdvice: "Vải voan lụa mềm chống nhăn, cổ bẻ thanh lịch tôn nét tri thức.",
    matchingPantsIds: ["W04-03", "P03", "P08"],
  },
  {
    id: "W04-03",
    name: "Navy Tailored Trousers",
    nameVi: "Quần Âu Nữ Ống Đứng Xanh Navy",
    category: "pants",
    gender: "women",
    color: "navy",
    styles: ["office", "smart"],
    formality: 4,
    status: "wishlist",
    price: "720.000₫",
    shop: "Mango",
    image: require("../assets/garments/women/W04_03_navy_tailored_trousers.png"),
    fitAdvice: "Ly ủi sắc nét, cạp cao tôn dáng cho phong cách công sở chuyên nghiệp.",
  },
  {
    id: "W05-01",
    name: "Cream Knit Sweater",
    nameVi: "Áo Len Nữ Cổ Tròn Màu Kem",
    category: "knitwear",
    gender: "women",
    color: "cream",
    styles: ["casual", "cozy"],
    formality: 2,
    status: "wishlist",
    price: "690.000₫",
    shop: "Uniqlo",
    image: require("../assets/garments/women/W05_01_cream_knit_sweater.png"),
    fitAdvice: "Len sợi mềm mịn giữ ấm nhẹ, mang phong cách Hàn Quốc dịu dàng.",
    matchingPantsIds: ["W05-02", "P02", "P05"],
  },
  {
    id: "W05-02",
    name: "Light Wash Straight Jeans",
    nameVi: "Quần Jeans Ống Suông Xanh Nhạt",
    category: "pants",
    gender: "women",
    color: "light blue",
    styles: ["casual"],
    formality: 2,
    status: "wishlist",
    price: "650.000₫",
    shop: "Levis",
    image: require("../assets/garments/women/W05_02_light_wash_jeans.png"),
    fitAdvice: "Jeans xanh sáng năng động, cạp vừa ôm hông thoải mái cả ngày.",
  },
  {
    id: "W06-01",
    name: "White Hooded Zip Jacket",
    nameVi: "Áo Khoác Gió Thể Thao Trắng",
    category: "outerwear",
    gender: "women",
    color: "white",
    styles: ["sports", "casual"],
    formality: 1,
    status: "wishlist",
    price: "550.000₫",
    shop: "Nike",
    image: require("../assets/garments/women/W06_01_white_zip_jacket.png"),
    fitAdvice: "Chất dù mỏng nhẹ kháng nước, có mũ trùm cho hoạt động thể thao ngoài trời.",
    matchingPantsIds: ["W06-03", "P01"],
  },
  {
    id: "W06-02",
    name: "Black Sports Top",
    nameVi: "Áo Croptop Thể Thao Đen",
    category: "top",
    gender: "women",
    color: "black",
    styles: ["sports"],
    formality: 1,
    status: "wishlist",
    price: "380.000₫",
    shop: "Adidas",
    image: require("../assets/garments/women/W06_02_black_sports_top.png"),
    fitAdvice: "Chun ôm co giãn 4 chiều thoáng khí, nâng đỡ tốt khi tập gym/yoga.",
    matchingPantsIds: ["W06-03", "P01"],
  },
  {
    id: "W06-03",
    name: "Gray Leggings",
    nameVi: "Quần Legging Tập Gym Xám",
    category: "pants",
    gender: "women",
    color: "gray",
    styles: ["sports"],
    formality: 1,
    status: "wishlist",
    price: "420.000₫",
    shop: "Lululemon",
    image: require("../assets/garments/women/W06_03_gray_leggings.png"),
    fitAdvice: "Cạp cao ôm sát tạo dáng thon gọn, chất vải co giãn đàn hồi cao.",
  },
  {
    id: "W07-01",
    name: "White Linen Shirt",
    nameVi: "Áo Sơ Mi Đũi Linen Trắng",
    category: "top",
    gender: "women",
    color: "white",
    styles: ["beach", "holiday", "casual"],
    formality: 3,
    status: "wishlist",
    price: "580.000₫",
    shop: "Zara Linen",
    image: require("../assets/garments/women/W07_01_white_linen_shirt.png"),
    fitAdvice: "Vải đũi thoáng mát bay bổng, có thể cài cúc hoặc khoác ngoài bikini dạo biển.",
    matchingPantsIds: ["W07-02", "P05"],
  },
  {
    id: "W07-02",
    name: "Beige Linen Shorts",
    nameVi: "Quần Shorts Đũi Be Đi Biển",
    category: "pants",
    gender: "women",
    color: "beige",
    styles: ["beach", "holiday"],
    formality: 2,
    status: "wishlist",
    price: "420.000₫",
    shop: "Zara",
    image: require("../assets/garments/women/W07_02_beige_linen_shorts.png"),
    fitAdvice: "Cạp chun dây rút nhẹ nhàng, ống rộng thoải mái dạo biển mùa hè.",
  },
  {
    id: "W08-01",
    name: "Sky-blue Maxi Dress",
    nameVi: "Đầm Maxi Xanh Da Trời Đi Biển",
    category: "dress",
    gender: "women",
    color: "sky blue",
    styles: ["beach", "holiday"],
    formality: 3,
    status: "wishlist",
    price: "850.000₫",
    shop: "Shopee Mall",
    image: require("../assets/garments/women/W08_01_blue_maxi_dress.png"),
    fitAdvice: "Đầm maxi hai dây xanh dịu mát, chân váy xòe bồng bềnh tung bay trong gió biển.",
  },
  {
    id: "W09-01",
    name: "Floral Sundress",
    nameVi: "Đầm Xòe Hoa Nhí Dạo Phố",
    category: "dress",
    gender: "women",
    color: "floral",
    styles: ["date", "casual"],
    formality: 3,
    status: "wishlist",
    price: "760.000₫",
    shop: "Zara Floral",
    image: require("../assets/garments/women/W09_01_floral_sundress.png"),
    fitAdvice: "Họa tiết hoa nhí vintage, cổ vuông tay phồng tiểu thư cực kỳ tôn dáng và ngọt ngào.",
  },
  {
    id: "W10-01",
    name: "Coral Wrap Dress",
    nameVi: "Đầm Quấn Vạt Chéo Màu San Hô",
    category: "dress",
    gender: "women",
    color: "coral",
    styles: ["beach", "travel"],
    formality: 3,
    status: "wishlist",
    price: "790.000₫",
    shop: "Mango Summer",
    image: require("../assets/garments/women/W10_01_coral_wrap_dress.png"),
    fitAdvice: "Dáng wrap dress buộc eo tôn vòng 2 và cổ chữ V thanh thoát, màu san hô rực rỡ dưới nắng.",
  },
];

const CLOSET_STORAGE_KEY = "outfitpilot.closet.v3";

export function useCloset() {
  const [items, setItems] = useState<ClosetItem[]>(INITIAL_CLOSET_ITEMS);
  const [loaded, setLoaded] = useState(false);

  // Load from AsyncStorage once on mount
  useEffect(() => {
    AsyncStorage.getItem(CLOSET_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Register custom garments into catalog map
              parsed.forEach((it: ClosetItem) => {
                if (it.isCustom) {
                  registerCustomGarment({
                    id: it.id,
                    name: it.name,
                    nameVi: it.nameVi,
                    type: it.category === "pants" ? "pants" : it.category === "dress" ? "dress" : "shirt",
                    color: it.color,
                    formality: it.formality,
                    styles: it.styles,
                    cut: "custom piece",
                    image: it.image,
                    imagePath: it.imagePath ?? it.image?.uri ?? "",
                    sample: false,
                    credit: null,
                    fitAdvice: it.fitAdvice,
                  });
                }
              });

              // Merge any new initial items (such as the women's collection)
              const existingIds = new Set(parsed.map((p: ClosetItem) => p.id));
              const missingInitials = INITIAL_CLOSET_ITEMS.filter((i) => !existingIds.has(i.id));
              const merged = [...parsed, ...missingInitials];
              setItems(merged);
            }
          } catch (e) {
            console.warn("Failed to parse closet storage", e);
          }
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  // Save to AsyncStorage
  const save = useCallback((next: ClosetItem[]) => {
    setItems(next);
    AsyncStorage.setItem(CLOSET_STORAGE_KEY, JSON.stringify(next)).catch((e) =>
      console.warn("Could not save closet", e)
    );
  }, []);

  const addItem = useCallback(
    (item: Omit<ClosetItem, "id">): ClosetItem => {
      const id = `u_${Date.now()}`;
      const newItem: ClosetItem = { ...item, id, isCustom: true };
      // Register in catalog for try-on support
      registerCustomGarment({
        id,
        name: newItem.name,
        nameVi: newItem.nameVi,
        type: newItem.category === "pants" ? "pants" : "shirt",
        color: newItem.color,
        formality: newItem.formality,
        styles: newItem.styles,
        cut: "user upload",
        image: newItem.image,
        imagePath: newItem.imagePath ?? newItem.image?.uri ?? "",
        sample: false,
        credit: null,
        fitAdvice: newItem.fitAdvice,
      });

      const next = [newItem, ...items];
      save(next);
      return newItem;
    },
    [items, save]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<ClosetItem>) => {
      const next = items.map((it) => (it.id === id ? { ...it, ...updates } : it));
      save(next);
    },
    [items, save]
  );

  const deleteItem = useCallback(
    (id: string) => {
      const next = items.filter((it) => it.id !== id);
      save(next);
    },
    [items, save]
  );

  const getItem = useCallback(
    (id: string): ClosetItem | undefined => {
      return items.find((it) => it.id === id);
    },
    [items]
  );

  const getMatchingPants = useCallback(
    (garmentId: string): ClosetItem[] => {
      const garment = items.find((it) => it.id === garmentId);
      const matchingIds = garment?.matchingPantsIds ?? ["P02", "P03", "P05", "P08"];
      return items.filter((it) => it.category === "pants" && matchingIds.includes(it.id));
    },
    [items]
  );

  return {
    items,
    loaded,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    getMatchingPants,
  };
}

export function getInitialClosetItem(id: string): ClosetItem | undefined {
  return INITIAL_CLOSET_ITEMS.find((it) => it.id === id);
}

export function getInitialMatchingPants(garmentId: string): ClosetItem[] {
  const garment = INITIAL_CLOSET_ITEMS.find((it) => it.id === garmentId);
  const matchingIds = garment?.matchingPantsIds ?? ["P02", "P03", "P05", "P08"];
  return INITIAL_CLOSET_ITEMS.filter((it) => it.category === "pants" && matchingIds.includes(it.id));
}

