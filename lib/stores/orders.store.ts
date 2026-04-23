'use client';

/**
 * Customer orders store. Reads `/api/me/orders` (optionally scoped by tenant)
 * and provides a single-order tracking stream backed by a WebSocket.
 */

import { create } from 'zustand';
import { isApiError, wsUrl } from '@/lib/api/client';
import { ordersApi, profileApi } from '@/lib/api/endpoints';
import type { GoOrder, GoRealtimeEvent } from '@/lib/api/dto';

type OrdersState = {
  orders: GoOrder[];
  loading: boolean;
  error: string | null;
  fetchMine: (restaurantId?: string) => Promise<void>;

  tracked: GoOrder | null;
  trackingNumber: string | null;
  trackingSocket: WebSocket | null;
  trackOrder: (orderNumber: string) => Promise<void>;
  stopTracking: () => void;
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  tracked: null,
  trackingNumber: null,
  trackingSocket: null,

  async fetchMine(restaurantId) {
    set({ loading: true, error: null });
    try {
      const { orders } = await profileApi.orders(restaurantId);
      set({ orders, loading: false });
    } catch (e) {
      set({ loading: false, error: isApiError(e) ? e.error : 'failed to load orders' });
    }
  },

  async trackOrder(orderNumber) {
    const current = get().trackingNumber;
    if (current === orderNumber && get().trackingSocket) return;
    get().stopTracking();
    try {
      const order = await ordersApi.getByNumber(orderNumber);
      set({ tracked: order, trackingNumber: orderNumber });
    } catch (e) {
      set({ error: isApiError(e) ? e.error : 'order not found' });
      return;
    }
    if (typeof window === 'undefined') return;
    const socket = new WebSocket(wsUrl(`/ws/orders/${encodeURIComponent(orderNumber)}`));
    socket.onmessage = (msg) => {
      try {
        const evt: GoRealtimeEvent<GoOrder> = JSON.parse(msg.data);
        if (evt.type === 'order.updated' && evt.order) {
          set({ tracked: evt.order });
        } else if (evt.type === 'order.deleted') {
          set({ tracked: null });
        }
      } catch {
        /* ignore malformed */
      }
    };
    socket.onerror = () => {
      /* server will close */
    };
    set({ trackingSocket: socket });
  },

  stopTracking() {
    const s = get().trackingSocket;
    if (s && s.readyState < WebSocket.CLOSING) s.close();
    set({ trackingSocket: null, trackingNumber: null, tracked: null });
  },
}));
