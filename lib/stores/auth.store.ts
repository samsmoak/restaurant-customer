'use client';

/**
 * Customer-side auth store, backed by the Go API.
 * Persists: token + user + profile + memberships.
 *
 * `skipHydration: true` + explicit `hydrate()` on first mount is the standard
 * pattern for zustand persist in Next.js 16 / React 19 apps. Without it, SSR
 * default state and client localStorage state disagree and you get the
 * classic "profile icon doesn't show after login" flash.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { setStoredToken, isApiError } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';
import type { GoAuthResponse, GoCustomerProfile, GoMembership, GoUser } from '@/lib/api/dto';

type AuthState = {
  token: string | null;
  user: GoUser | null;
  profile: GoCustomerProfile | null;
  memberships: GoMembership[];
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  _hydrated: boolean;

  signup: (input: { full_name: string; email: string; phone: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  signInWithGoogle: (id_token: string) => Promise<void>;
  signout: () => Promise<void>;
  hydrate: () => void;
  setProfile: (p: GoCustomerProfile | null) => void;
};

function apply(set: (p: Partial<AuthState>) => void, resp: GoAuthResponse) {
  setStoredToken(resp.token);
  set({
    token: resp.token,
    user: resp.user,
    profile: resp.profile ?? null,
    memberships: resp.memberships ?? [],
    isAdmin: resp.is_admin,
    loading: false,
    error: null,
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      profile: null,
      memberships: [],
      isAdmin: false,
      loading: false,
      error: null,
      _hydrated: false,

      async signup(input) {
        set({ loading: true, error: null });
        try {
          const resp = await authApi.signup(input);
          apply(set, resp);
        } catch (e) {
          set({ loading: false, error: isApiError(e) ? e.error : 'signup failed' });
          throw e;
        }
      },

      async login(input) {
        set({ loading: true, error: null });
        try {
          const resp = await authApi.login(input);
          apply(set, resp);
        } catch (e) {
          set({ loading: false, error: isApiError(e) ? e.error : 'login failed' });
          throw e;
        }
      },

      async signInWithGoogle(id_token) {
        set({ loading: true, error: null });
        try {
          const resp = await authApi.google(id_token);
          apply(set, resp);
        } catch (e) {
          set({ loading: false, error: isApiError(e) ? e.error : 'google sign-in failed' });
          throw e;
        }
      },

      async signout() {
        try {
          await authApi.signout();
        } catch {
          /* ignore */
        }
        setStoredToken(null);
        set({ token: null, user: null, profile: null, memberships: [], isAdmin: false });
      },

      hydrate() {
        // Trigger zustand-persist rehydration + mark as done.
        void useAuthStore.persist.rehydrate()?.then(() => {
          useAuthStore.setState({ _hydrated: true });
        });
      },

      setProfile(p) {
        set({ profile: p });
      },
    }),
    {
      name: 'rs-customer-auth',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : undefined) as Storage),
      skipHydration: true,
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        profile: s.profile,
        memberships: s.memberships,
        isAdmin: s.isAdmin,
      }),
    }
  )
);
