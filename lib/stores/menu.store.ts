'use client';

/**
 * Menu store — fetches `/api/r/:slug/menu` once on load, caches in memory.
 * The component calls `fetch()` on mount; subsequent mounts get the cached data.
 */

import { create } from 'zustand';
import { isApiError } from '@/lib/api/client';
import { menuApi } from '@/lib/api/endpoints';
import type { GoCategoryWithItems, GoMenuItem } from '@/lib/api/dto';

type MenuState = {
  categories: GoCategoryWithItems[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  allItems: () => GoMenuItem[];
  featured: () => GoMenuItem[];
};

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  loading: false,
  loaded: false,
  error: null,

  async fetch() {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const { categories } = await menuApi.get();
      set({ categories, loading: false, loaded: true });
    } catch (e) {
      set({ loading: false, error: isApiError(e) ? e.error : 'failed to load menu' });
    }
  },

  allItems() {
    return get().categories.flatMap((c) => c.items);
  },

  featured() {
    return get().categories
      .flatMap((c) => c.items)
      .filter((i) => i.is_featured && i.is_available);
  },
}));
