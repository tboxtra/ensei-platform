'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AuthUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  firstName?: string;
  lastName?: string;
  twitter?: string;
  twitter_handle?: string;
  updated_at?: string;
  // Add any other stable props used by queries
};

type AuthState = {
  user: AuthUser | null;
  setUser: (patch: Partial<AuthUser> | null) => void;
  clearUser: () => void;
  isInitialized: boolean;
  setInitialized: (initialized: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,

      // IMPORTANT: always MERGE patches; never replace the user object
      setUser: (patch) => {
        if (patch === null) {
          set({ user: null });
          return;
        }
        const current = get().user ?? ({} as AuthUser);
        set({ user: { ...current, ...patch } as AuthUser });
      },

      clearUser: () => set({ user: null }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
    }),
    {
      name: 'ensei-auth',
      storage: createJSONStorage(() => sessionStorage),
      // only persist what we need
      partialize: (s) => ({ user: s.user }),
    }
  )
);
