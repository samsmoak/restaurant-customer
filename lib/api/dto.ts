/**
 * Wire shape of the Go backend responses.
 * Kept separate from the Supabase-shape types in /types so we can evolve
 * them independently during the migration.
 */

export type GoRestaurant = {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  phone?: string;
  formatted_address?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  delivery_fee: number;
  min_order_amount: number;
  estimated_pickup_time: number;
  estimated_delivery_time: number;
  currency: string;
  opening_hours: Record<string, { open: string; close: string; closed: boolean }>;
  manual_closed: boolean;
};

export type GoMenuSize = {
  id: string;
  name: string;
  price_modifier: number;
  is_default: boolean;
};

export type GoMenuExtra = {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
};

export type GoMenuItem = {
  id: string;
  restaurant_id: string;
  category_id?: string;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  sizes: GoMenuSize[];
  extras: GoMenuExtra[];
  created_at: string;
};

export type GoCategory = {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type GoCategoryWithItems = GoCategory & { items: GoMenuItem[] };

export type GoOrderLineSize = { name: string; price_modifier: number } | null;
export type GoOrderLineExtra = { name: string; price: number };

export type GoOrderLine = {
  id: string;
  name: string;
  quantity: number;
  base_price: number;
  selected_size: GoOrderLineSize;
  selected_extras: GoOrderLineExtra[];
  special_instructions?: string;
  item_total: number;
};

export type GoOrderStatus = 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type GoOrderType = 'pickup' | 'delivery';
export type GoPaymentStatus = 'pending' | 'paid' | 'failed';

export type GoOrder = {
  id: string;
  restaurant_id: string;
  order_number: string;
  status: GoOrderStatus;
  order_type: GoOrderType;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address?: string;
  delivery_notes?: string;
  items: GoOrderLine[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_intent_id?: string;
  payment_status: GoPaymentStatus;
  special_instructions?: string;
  estimated_ready_time?: string;
  created_at: string;
};

export type GoUser = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type GoCustomerProfile = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  default_address: string;
  created_at: string;
};

export type GoMembership = {
  restaurant_id: string;
  restaurant_name: string;
  role: 'owner' | 'admin' | 'staff';
};

export type GoAuthResponse = {
  token: string;
  user: GoUser;
  profile?: GoCustomerProfile;
  is_admin: boolean;
  memberships: GoMembership[];
};

export type GoFinalizeResult = {
  restaurant_id: string;
  token: string;
  role: string;
};

export type GoCheckoutIntent = {
  client_secret: string;
  clientSecret: string;
  order_id: string;
  orderId: string;
  order_number: string;
  orderNumber: string;
  total: number;
  currency: string;
};

export type GoPaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
};

export type GoSavedAddress = {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

export type GoRealtimeEvent<T = unknown> = {
  type: 'order.created' | 'order.updated' | 'order.deleted' | 'ready' | 'error';
  order?: T;
  ts: number;
};
