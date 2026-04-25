'use client';

import { create } from 'zustand';
import { addressesApi } from '@/lib/api/endpoints';
import type { GoSavedAddress } from '@/lib/api/dto';

type AddressState = {
  addresses: GoSavedAddress[];
  loading: boolean;
  fetchAddresses: (token: string | null) => Promise<void>;
  saveAddress: (body: Omit<GoSavedAddress, 'id'>) => Promise<GoSavedAddress>;
  deleteAddress: (id: string) => Promise<void>;
  clear: () => void;
};

export const useAddressStore = create<AddressState>((set) => ({
  addresses: [],
  loading: false,

  async fetchAddresses(token) {
    if (!token) return;
    set({ loading: true });
    try {
      const data = await addressesApi.list();
      set({ addresses: data.addresses ?? [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  async saveAddress(body) {
    const saved = await addressesApi.create(body);
    set((s) => ({ addresses: [...s.addresses, saved] }));
    return saved;
  },

  async deleteAddress(id) {
    await addressesApi.delete(id);
    set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }));
  },

  clear() {
    set({ addresses: [] });
  },
}));
