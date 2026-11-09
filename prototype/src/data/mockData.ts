import { ProductItem } from "../types";

export const DEMO_LOOK: ProductItem = {
  id: "demo-look-01",
  name: "Áo Blazer Lụa Linen Dáng Rộng",
  shopName: "Minimalist Studio",
  price: "1.450.000₫",
  imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
  sourceUrl: "https://shop.example.com/blazer-linen",
  status: "demo",
};

export const RECENTLY_TRIED: ProductItem[] = [
  {
    id: "look-01",
    name: "Đầm Linen Dáng Suông Tự Nhiên",
    shopName: "Oat Atelier",
    price: "890.000₫",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
    sourceUrl: "https://oat-atelier.vn/linen-dress",
    triedAt: "2 giờ trước",
    status: "recent",
  },
  {
    id: "look-02",
    name: "Áo Len Dệt Kim Cổ Tròn Mềm",
    shopName: "Komorebi Minimal",
    price: "680.000₫",
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop",
    sourceUrl: "https://komorebi.vn/crewneck-knit",
    triedAt: "Hôm qua",
    status: "recent",
  },
];
