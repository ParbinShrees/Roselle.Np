export type Trend = 'up' | 'down' | 'stable';
export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name';
export type Page = 'home' | 'flowers' | 'new-arrivals' | 'about' | 'contact' | 'product' | 'checkout' | 'confirmation' | 'builder' | 'track';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  color: string;
  flowerType: string;
  occasions: string[];
  isNewArrival: boolean;
  description: string;
  stock: boolean;
  badge?: string;
  trend: Trend;
  trendPct: number;
  category: 'bouquet' | 'frame' | 'single';
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  qty: number;
  customDetails?: {
    stemsSummary?: string;
    wrapping?: string;
    ribbon?: string;
    cardMessage?: string;
    addons?: string[];
  };
}

