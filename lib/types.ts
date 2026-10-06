export type Gender = "women" | "men" | "kids";

export type Category =
  | "Dresses"
  | "Tops"
  | "T-shirts"
  | "Shirts"
  | "Jeans"
  | "Trousers"
  | "Two-Piece Sets"
  | "Native Wear"
  | "Shoes"
  | "Bags"
  | "Accessories";

export type Occasion =
  | "Wedding"
  | "Birthday"
  | "Date"
  | "Church"
  | "Office"
  | "Interview"
  | "Graduation"
  | "Party"
  | "Dinner"
  | "Beach"
  | "Travel"
  | "Casual";

export type Style =
  | "Casual"
  | "Corporate"
  | "Streetwear"
  | "Classic"
  | "Luxury"
  | "Native"
  | "Party"
  | "Romantic"
  | "Sporty"
  | "Trendy";

export type SortKey =
  | "featured"
  | "newest"
  | "bestselling"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "popular";

export interface Colorway {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sellerId: string;
  gender: Gender;
  category: Category;
  price: number;
  compareAt?: number;
  images: string[];
  shot?: string;
  video?: string;
  hidden?: boolean;
  colors: Colorway[];
  sizes: string[];
  ukSizes?: string[];
  occasions: Occasion[];
  styles: Style[];
  material: string;
  care: string;
  description: string;
  details: string[];
  note?: string;
  rating: number;
  reviewCount: number;
  inventory: number;
  sales: number;
  popularity: number;
  createdAt: string;
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  deal?: boolean;
  plusSize?: boolean;
  tags: string[];
  returnable?: boolean;
}

export interface Seller {
  id: string;
  slug: string;
  name: string;
  type: string;
  city: string;
  area: string;
  state: string;
  verified: boolean;
  rating: number;
  reviews: number;
  responseRate: number;
  responseTime: string;
  deliveryScore: number;
  since: number;
  bio: string;
  specialties: string[];
  image?: string;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  size?: string;
  photos?: string[];
  helpful?: number;
}

export interface Look {
  id: string;
  slug: string;
  name: string;
  gender: Gender;
  occasion: Occasion;
  description: string;
  image: string;
  productIds: string[];
  colours: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  read: string;
  category: string;
  body: string[];
}

export interface Filters {
  gender: Gender | "all";
  categories: string[];
  priceMin?: number;
  priceMax?: number;
  sizes: string[];
  colors: string[];
  occasions: string[];
  styles: string[];
  locations: string[];
  availability: "all" | "in" | "low";
  q: string;
  sort: SortKey;
  flag?: "newArrival" | "trending" | "bestSeller" | "deal" | "featured";
}

export interface CartLine {
  lineId: string;
  productId: string;
  size: string;
  color: string;
  qty: number;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  area?: string;
  landmark?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  addresses: Address[];
  sizes: { top?: string; bottom?: string; shoe?: string; dress?: string };
  stylePreferences: string[];
  budgetPreference?: string;
  insider: boolean;
  insiderSince?: string;
  referralCode: string;
  referralCredits: number;
  referredBy?: string;
  joinedAt: string;
  birthday?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  sellerId: string;
  size: string;
  color: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  number: string;
  items: OrderItem[];
  contact: { name: string; email: string; phone: string };
  address: Address;
  delivery: { method: string; fee: number; estimate: string };
  payment: { method: string; status: "paid" | "pending" | "failed"; last4?: string };
  subtotal: number;
  discount: number;
  coupon?: string;
  total: number;
  createdAt: string;
  userId?: string;
  referral?: string;
}

export interface SellerApplication {
  id: string;
  brand: string;
  owner: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  type: string;
  instagram?: string;
  products: string;
  story: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  props: Record<string, unknown>;
  at: string;
}

export type PluginSlotName =
  | "announcement"
  | "home-after-hero"
  | "home-before-footer"
  | "product-aside"
  | "cart-note"
  | "checkout-aside"
  | "footer";

export type PluginKind = "html" | "script" | "link" | "webhook";

export interface SitePlugin {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  version: string;
  description: string;
  author?: string;
  slots: PluginSlotName[];
  kind: PluginKind;
  html?: string;
  scriptSrc?: string;
  href?: string;
  label?: string;
  webhookUrl?: string;
  events: string[];
  config: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOverride {
  price?: number;
  compareAt?: number | null;
  inventory?: number;
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  deal?: boolean;
  hidden?: boolean;
  name?: string;
}
