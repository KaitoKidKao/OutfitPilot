// OutfitPilot My Closet (Tủ Đồ Riêng & Kiểm Chứng Mua Sắm)
// Holds all 20 default pieces (10 tops/outerwear G01-G10 and 10 pants P01-P10),
// plus user-added pieces with image upload, shop link, pricing, and category.
// Persists on device via AsyncStorage.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { CATALOG, registerCustomGarment, type Garment } from "./catalog";

export type ClosetCategory = "all" | "outerwear" | "top" | "knitwear" | "pants";
export type OwnershipStatus = "all" | "wishlist" | "owned";

export interface ClosetItem {
  id: string;
  name: string;
  nameVi: string;
  category: "outerwear" | "top" | "knitwear" | "pants";
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
    color: "charcoal",
    styles: ["formal", "minimal"],
    formality: 4,
    status: "owned",
    image: require("../assets/pants/P10.jpg"),
    fitAdvice: "Mặt trước phẳng tối giản, hiện đại và trẻ trung.",
  },
];

const CLOSET_STORAGE_KEY = "outfitpilot.closet.v2";

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
                    type: it.category === "pants" ? "pants" : "shirt",
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
              setItems(parsed);
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

