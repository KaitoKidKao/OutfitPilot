export interface ProductItem {
  id: string;
  name: string;
  shopName: string;
  price?: string;
  imageUrl: string;
  sourceUrl?: string;
  triedAt?: string;
  status: 'saved' | 'recent' | 'demo';
}

export type AppScreen = 'home' | 'import' | 'camera-setup' | 'fitting' | 'decision' | 'saved-looks';

