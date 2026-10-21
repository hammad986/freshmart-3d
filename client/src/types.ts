export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  emoji: string;
  color: string;
  unit: string;
  shape: string;
  is_active: boolean;
  category_id: number;
  category_name: string;
  category_slug: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  stock: number;
  emoji: string;
  color: string;
  unit: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Order {
  id: number;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  status: string;
  total: number;
  created_at: string;
  item_count: number;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  name: string;
  price: number;
  quantity: number;
}

export interface AdminStats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
}
