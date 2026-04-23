'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';

/**
 * Returns `true` after the persisted auth store has finished rehydrating
 * from localStorage. Use this to gate any route-redirect decisions so we
 * don't bounce the user to /login on the initial render (when zustand still
 * has its default state and `token` is always null).
 */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = useAuthStore.persist.rehydrate();
    if (p && typeof (p as Promise<unknown>).then === 'function') {
      (p as Promise<unknown>).then(() => setHydrated(true));
    } else {
      setHydrated(true);
    }
  }, []);

  return hydrated;
}
