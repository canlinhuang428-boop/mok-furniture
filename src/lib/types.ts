export interface Product {
  id: string;
  category_id: string;
  name_th: string;
  name_en: string;
  name_zh: string;
  sku: string;
  size: string;
  images: string[];
  tags_th: string[];
  tags_en: string[];
  tags_zh: string[];
  featured: boolean;
  stock_status: "in_stock" | "out_of_stock";
  price?: number;
  original_price?: number;
}

export interface Category {
  id: string;
  name_th: string;
  name_en: string;
  name_zh: string;
  sort?: number;
}

export interface CartItem {
  product_id: string;
  qty: number;
}

export interface Cart {
  user_id: string;
  items: CartItem[];
  updated_at: string;
}

export interface Order {
  id?: string;
  user_id: string;
  name: string;
  phone: string;
  note: string;
  items: CartItem[];
  status: "pending" | "contacted" | "completed";
  created_at: string;
}

export type Lang = "th" | "en" | "zh";
