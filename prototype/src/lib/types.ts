export type Slot = "a" | "b";

export type Product = {
  id: string;
  name: string;
  shop?: string;
  /** Always typed by the user; never fetched or verified. */
  price?: string;
  /** Only used to reopen the shop. We never read the page. */
  url?: string;
  image: string;
  note?: string;
  sample?: boolean;
  addedAt: number;
};

export type SavedLook = {
  productId: string;
  savedAt: number;
};
