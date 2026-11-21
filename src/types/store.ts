export type ProductCategory =
  | "gift-cards"
  | "game-keys"
  | "accounts"
  | "top-ups";

export type DeliveryType = "instant" | "manual";

export type ProductPlatform =
  | "PC"
  | "PlayStation"
  | "Xbox"
  | "Nintendo"
  | "Riot Games"
  | "Steam"
  | "Multi-Platform";

export type ProductBadge =
  | "Best Seller"
  | "Popular"
  | "New"
  | "Sale"
  | "Instant Delivery"
  | "Top-Up";

export type OrderStatus = "completed" | "in-progress";

export type PaymentMethod = "card" | "paypal" | "crypto";

export interface ProductPackage {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: "USD";
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  deliveryType: DeliveryType;
  platform: ProductPlatform;
  game?: string;
  publisher?: string;
  image: string;
  gallery?: string[];
  price: number;
  originalPrice?: number;
  currency: "USD";
  rating: number;
  reviewCount: number;
  badge?: ProductBadge;
  features: string[];
  packages?: ProductPackage[];
  requiresPlayerId: boolean;
  playerIdLabel?: string;
  playerIdPlaceholder?: string;
  inStock: boolean;
  featured: boolean;
  relatedProductIds?: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  category: ProductCategory;
  deliveryType: DeliveryType;
  quantity: number;
  unitPrice: number;
  currency: "USD";
  packageId?: string;
  packageName?: string;
  playerId?: string;
}

export interface AccountCredentials {
  username: string;
  password: string;
  email?: string;
  emailPassword?: string;
  recoveryCode?: string;
  additionalNotes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  category: ProductCategory;
  deliveryType: DeliveryType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: "USD";
  packageId?: string;
  packageName?: string;
  playerId?: string;
  digitalCode?: string;
  accountCredentials?: AccountCredentials;
  deliveredAt?: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  total: number;
  currency: "USD";
  createdAt: string;
  completedAt?: string;
}