'use client';

import { create } from 'zustand';
import { isApiError } from '@/lib/api/client';
import { profileApi } from '@/lib/api/endpoints';
import type { GoCustomerProfile } from '@/lib/api/dto';

type ProfileState = {
  profile: GoCustomerProfile | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  update: (input: { full_name: string; phone: string; default_address: string }) => Promise<void>;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  async fetch() {
    set({ loading: true, error: null });
    try {
      const profile = await profileApi.me();
      set({ profile, loading: false });
    } catch (e) {
      set({ loading: false, error: isApiError(e) ? e.error : 'failed to load profile' });
    }
  },

  async update(input) {
    set({ loading: true, error: null });
    try {
      const profile = await profileApi.update(input);
      set({ profile, loading: false });
    } catch (e) {
      set({ loading: false, error: isApiError(e) ? e.error : 'failed to update profile' });
      throw e;
    }
  },
}));
