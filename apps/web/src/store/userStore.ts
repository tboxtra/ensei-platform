import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserStats {
  missionsCreated: number;
  missionsCompleted: number;
  honorsEarned: number;
  usdSpent: number;
  usdBalance: number;
  totalHonors: number;
  pendingReviews: number;
  reviewsDone: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string;
  joinedAt: string;
  emailVerified?: boolean;
  twitterUsername?: string;
  twitter?: string;
  twitter_handle?: string;
  updated_at?: string;
}

interface UserState {
  user: User | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Merge setters - never replace entire objects
  setUser: (partial: Partial<User>) => void;
  setStats: (partial: Partial<UserStats>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Reset functions
  resetUser: () => void;
  resetStats: () => void;
  resetAll: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      stats: null,
      isLoading: false,
      error: null,

      // Merge setters - preserve existing data
      setUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : (partial as User)
        })),

      setStats: (partial) =>
        set((state) => ({
          stats: state.stats ? { ...state.stats, ...partial } : (partial as UserStats)
        })),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Reset functions
      resetUser: () => set({ user: null }),
      resetStats: () => set({ stats: null }),
      resetAll: () => set({ user: null, stats: null, isLoading: false, error: null }),
    }),
    {
      name: 'user-store',
      // Only persist user data, not loading states
      partialize: (state) => ({
        user: state.user,
        stats: state.stats,
      }),
    }
  )
);
