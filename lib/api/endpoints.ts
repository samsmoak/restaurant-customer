import { api, tenantPath } from './client';
import type {
  GoAuthResponse,
  GoCategoryWithItems,
  GoCheckoutIntent,
  GoCustomerProfile,
  GoFinalizeResult,
  GoMembership,
  GoOrder,
  GoRestaurant,
} from './dto';

export type CheckoutPayload = {
  order_type: 'pickup' | 'delivery';
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  delivery_notes?: string;
  special_instructions?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    selected_size: { name: string } | null;
    selected_extras: { name: string }[];
    special_instructions?: string;
  }[];
};

export const authApi = {
  signup: (input: { full_name: string; email: string; phone: string; password: string }) =>
    api.post<GoAuthResponse>('/api/auth/signup/customer', input, { anonymous: true }),
  login: (input: { email: string; password: string }) =>
    api.post<GoAuthResponse>('/api/auth/login', input, { anonymous: true }),
  google: (id_token: string) =>
    api.post<GoAuthResponse>('/api/auth/google', { id_token }, { anonymous: true }),
  memberships: () =>
    api.get<{ memberships: GoMembership[] }>('/api/auth/memberships'),
  finalizeAdmin: (invite_code: string) =>
    api.post<GoFinalizeResult>('/api/auth/admin/finalize', { invite_code }),
  activateAdmin: (restaurant_id: string) =>
    api.post<GoAuthResponse>('/api/auth/admin/activate', { restaurant_id }),
  signout: () => api.post<void>('/api/auth/signout', {}, { anonymous: true }),
};

export const profileApi = {
  me: () => api.get<GoCustomerProfile>('/api/me/profile'),
  update: (input: { full_name: string; phone: string; default_address: string }) =>
    api.put<GoCustomerProfile>('/api/me/profile', input),
  orders: (restaurantId?: string) =>
    api.get<{ orders: GoOrder[] }>(
      `/api/me/orders${restaurantId ? `?restaurant_id=${restaurantId}` : ''}`
    ),
};

export const restaurantApi = {
  getPublic: () => api.get<GoRestaurant>(tenantPath('/restaurant'), { anonymous: true }),
  getStatus: () =>
    api.get<{
      manual_closed: boolean;
      opening_hours: GoRestaurant['opening_hours'];
      name: string;
      slug: string;
      timezone?: string;
      currency: string;
    }>(tenantPath('/restaurant/status'), { anonymous: true }),
  lookupBySlug: (slug: string) =>
    api.get<GoRestaurant>(`/api/restaurants/lookup?slug=${encodeURIComponent(slug)}`, {
      anonymous: true,
    }),
};

export const menuApi = {
  get: () =>
    api.get<{ categories: GoCategoryWithItems[] }>(tenantPath('/menu'), { anonymous: true }),
};

export const ordersApi = {
  getByNumber: (orderNumber: string) =>
    api.get<GoOrder>(tenantPath(`/orders/${encodeURIComponent(orderNumber)}`), {
      anonymous: true,
    }),
};

export const checkoutApi = {
  createIntent: (body: CheckoutPayload) =>
    api.post<GoCheckoutIntent>(tenantPath('/checkout/create-intent'), body),
};
