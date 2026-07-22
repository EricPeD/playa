// ── Existing ──────────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  description?: string | null;
  emoji?: string | null;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  is_active: boolean;
  description?: string | null;
  image_url?: string | null;
  brand?: string | null;
  stock?: number | null;
  badge?: string | null;
  is_featured?: boolean;
  is_pack?: boolean;
  unit?: string | null;
  sku?: string | null;
  sort_order?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// ── Orders ────────────────────────────────────────────────────────────────────
export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  customer_id: number | null;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  beach_location: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  paid_at: string | null;
  payment_method: string | null;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface DeliveryTracking {
  id: number;
  order_id: number;
  status: string;
  notes: string | null;
  created_at: string;
}

// ── Payloads (para las funciones de creación) ─────────────────────────────────
export interface CreateOrderPayload {
  cart: CartItem[];
  phone: string | null;
  countryCode: string;
  gpsData: { latitude: number; longitude: number } | null;
  notes: string | null;
  deliveryFee?: number;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: number;
  error?: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: number;
  error?: string;

  total?: number;
  currency?: string;
  items?: PurchaseItem[];
}