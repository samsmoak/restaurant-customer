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
        const extrasSorted = [...item.selectedExtras].sort((a, b) => a.name.localeCompare(b.name)).map((e) => e.name).join(',');
        const cartId = `${item.menuItemId}-${item.selectedSize?.name ?? 'default'}-${extrasSorted}`;

        // If an identical line (same item + size + extras + instructions) already
        // exists just increment its quantity instead of appending a duplicate.
        const existing = get().items.find(
          (i) =>
            i.cartId === cartId &&
            (i.specialInstructions ?? '') === (item.specialInstructions ?? '')
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) => {
              if (i.cartId !== cartId || (i.specialInstructions ?? '') !== (item.specialInstructions ?? '')) return i;
              const updated = { ...i, quantity: i.quantity + item.quantity };
              updated.itemTotal = calculateItemTotal(updated);
              return updated;
            }),
          }));
          return;
        }

        // Different instructions for same item/size/extras → unique cart line.
        const uniqueCartId = item.specialInstructions
          ? `${cartId}-${item.specialInstructions.slice(0, 20)}`
          : cartId;
        const itemTotal = calculateItemTotal(item);
        set((state) => ({
          items: [...state.items, { ...item, cartId: uniqueCartId, itemTotal }],
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
      skipHydration: true,
    }
  )
);

// Call once on the client to sync from localStorage.
export function hydrateCart() {
  void useCartStore.persist.rehydrate();
}
