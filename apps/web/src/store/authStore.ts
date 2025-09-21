'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * AUTH STORE - SINGLE SOURCE OF TRUTH FOR USER IDENTITY
 * 
 * This store provides the stable Firebase UID that should be used for all user-scoped queries.
 * 
 * IMPORTANT RULES:
 * 1. All user-scoped React Query keys must use authUser.uid (never displayName, email, or transient objects)
 * 2. Always MERGE user patches - never replace the entire user object
 * 3. Only clear user state on explicit sign-out
 * 
 * Usage in React Query:
 * - Query keys: ['feature-name', authUser?.uid]
 * - Enabled: !!authUser?.uid
 * - Invalidation: queryClient.invalidateQueries({ queryKey: ['feature-name', authUser?.uid] })
 */

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
          // Development guard: warn if setUser(null) is called outside explicit sign-out
          if (process.env.NODE_ENV === 'development') {
            console.warn('[AuthStore] setUser(null) called - ensure this is intentional sign-out');
          }
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
