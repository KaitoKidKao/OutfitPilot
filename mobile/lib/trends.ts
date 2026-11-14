// "Mặc gì hôm nay" feed: SAMPLE outfits built from the repo's mock data
// (data_mock/OutfitPilot_Women_Individual_Items_Light original_outfits W01–W10 and
// the men's Batch 1 sets M11–M15). These are illustrations, not real users' posts:
// no usernames, no view counts. Each outfit lists garments that exist in the
// catalog, so "Thử ngay" can hang them on hooks A/B and reuse the try-on flow.
import type { GarmentId } from "./catalog";

export interface TrendOutfit {
  id: string;
  title: string;
  titleVi: string;
  gender: "women" | "men";
  /** Short tags (occasion / style), Vietnamese. */
  tags: string[];
  /** Full outfit photo; men's sets have none, the card shows the first garment. */
  photo: number | null;
  /** Catalog garments in this outfit, try-on order (A first, then B). */
  garments: GarmentId[];
}

export const TREND_OUTFITS: readonly TrendOutfit[] = [
  { id: "W04", title: "Camel Office", titleVi: "Công sở tông camel", gender: "women", tags: ["Công sở", "Thanh lịch"], photo: require("../assets/outfits/W04.jpg"), garments: ["W04-01", "W04-02", "W04-03"] },
  { id: "M15", title: "Winter Layers", titleVi: "Len kem & khoác jeans", gender: "men", tags: ["Cuối tuần", "Ấm áp"], photo: null, garments: ["M15_01", "M15_02", "M15_03"] },
  { id: "W09", title: "Floral Brunch", titleVi: "Brunch váy hoa", gender: "women", tags: ["Hẹn hò", "Thoải mái"], photo: require("../assets/outfits/W09.jpg"), garments: ["W09-01"] },
  { id: "W01", title: "Midnight Satin", titleVi: "Satin đen buổi tối", gender: "women", tags: ["Đi bar", "Buổi tối"], photo: require("../assets/outfits/W01.jpg"), garments: ["W01-01", "W01-02"] },
  { id: "M14", title: "Sharp Formal", titleVi: "Blazer xám chỉn chu", gender: "men", tags: ["Phỏng vấn", "Trang trọng"], photo: null, garments: ["M14_01", "M14_02", "M14_03"] },
  { id: "W07", title: "Linen Holiday", titleVi: "Linen đi biển", gender: "women", tags: ["Đi biển", "Du lịch"], photo: require("../assets/outfits/W07.jpg"), garments: ["W07-01", "W07-02"] },
  { id: "W02", title: "Emerald Night", titleVi: "Đầm satin xanh ngọc", gender: "women", tags: ["Tiệc", "Sang trọng"], photo: require("../assets/outfits/W02.jpg"), garments: ["W02-01", "W02-02"] },
  { id: "M11", title: "Smart Casual Polo", titleVi: "Polo navy & chinos", gender: "men", tags: ["Cà phê", "Smart casual"], photo: null, garments: ["M11_01", "M11_02"] },
  { id: "W05", title: "Cozy Casual", titleVi: "Len kem dạo phố", gender: "women", tags: ["Đi học", "Thoải mái"], photo: require("../assets/outfits/W05.jpg"), garments: ["W05-01", "W05-02"] },
  { id: "W03", title: "Burgundy Chic", titleVi: "Đỏ rượu hẹn tối", gender: "women", tags: ["Hẹn hò", "Buổi tối"], photo: require("../assets/outfits/W03.jpg"), garments: ["W03-01", "W03-02"] },
  { id: "M13", title: "Street Hoodie", titleVi: "Hoodie đen & cargo", gender: "men", tags: ["Đường phố", "Năng động"], photo: null, garments: ["M13_01", "M13_02"] },
  { id: "W06", title: "Active Sport", titleVi: "Đồ tập năng động", gender: "women", tags: ["Thể thao"], photo: require("../assets/outfits/W06.jpg"), garments: ["W06-01", "W06-02", "W06-03"] },
  { id: "W08", title: "Blue Breeze", titleVi: "Xanh biển mát", gender: "women", tags: ["Đi biển"], photo: require("../assets/outfits/W08.jpg"), garments: ["W08-01"] },
  { id: "M12", title: "Resort Linen", titleVi: "Sơ mi đũi đi biển", gender: "men", tags: ["Đi biển", "Du lịch"], photo: null, garments: ["M12_01", "M12_02"] },
  { id: "W10", title: "Coral Summer", titleVi: "Mùa hè san hô", gender: "women", tags: ["Du lịch", "Mùa hè"], photo: require("../assets/outfits/W10.jpg"), garments: ["W10-01"] },
];
