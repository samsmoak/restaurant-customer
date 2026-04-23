'use client';

import { create } from 'zustand';
import { isApiError } from '@/lib/api/client';
import { checkoutApi, type CheckoutPayload } from '@/lib/api/endpoints';
import type { GoCheckoutIntent } from '@/lib/api/dto';

type CheckoutState = {
  loading: boolean;
  error: string | null;
  intent: GoCheckoutIntent | null;
  createIntent: (body: CheckoutPayload) => Promise<GoCheckoutIntent | null>;
  reset: () => void;
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  loading: false,
  error: null,
  intent: null,
  async createIntent(body) {
    set({ loading: true, error: null });
    try {
      const intent = await checkoutApi.createIntent(body);
      set({ loading: false, intent });
      return intent;
    } catch (e) {
      set({ loading: false, error: isApiError(e) ? e.error : 'checkout failed' });
      return null;
    }
  },
  reset() {
    set({ loading: false, error: null, intent: null });
  },
}));
