'use client';

/**
 * Client-only cart. Persisted in localStorage under `restaurant-cart`.
 * Backend-agnostic: same shape works with Supabase or the Go API.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartStore, OrderType } from '@/types';

function calculateItemTotal(item: Omit<CartItem, 'cartId' | 'itemTotal'>): number {
  const sizeModifier = item.selectedSize?.price_modifier ?? 0;
  const extrasTotal = item.selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  return (item.base_price + sizeModifier + extrasTotal) * item.quantity;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: 'pickup' as OrderType,

      setOrderType: (type: OrderType) => set({ orderType: type }),

      addItem: (item) => {
        const cartId = `${item.menuItemId}-${item.selectedSize?.name ?? 'default'}-${item.selectedExtras.map((e) => e.name).join(',')}-${Date.now()}`;
        const itemTotal = calculateItemTotal(item);
        set((state) => ({
          items: [...state.items, { ...item, cartId, itemTotal }],
        }));
      },

      removeItem: (cartId: string) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartId !== cartId),
        })),

      updateQuantity: (cartId: string, quantity: number) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.cartId !== cartId) return item;
            const updatedItem = { ...item, quantity };
            updatedItem.itemTotal = calculateItemTotal(updatedItem);
            return updatedItem;
          }),
        })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () => get().items.reduce((sum, item) => sum + item.itemTotal, 0),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'restaurant-cart',
    }
  )
);
