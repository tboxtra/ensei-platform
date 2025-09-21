'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';
import { useAuthStore } from '../store/authStore';

/**
 * PROFILE UPDATE HOOK - PRECISE QUERY INVALIDATION
 *
 * This hook demonstrates the correct pattern for profile updates:
 * - Only invalidates affected queries (not all queries)
 * - Uses UID-based query keys for precise invalidation
 * - Merges profile data without affecting other user data
 * - No global refresh or router.refresh() calls
 */

interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    email?: string;
    twitter?: string;
    twitter_handle?: string;
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { user: authUser } = useAuthStore();
    const api = useApi();

    return useMutation({
        mutationFn: async (profileData: UpdateProfileData) => {
            return await api.updateProfile(profileData);
        },
        onSuccess: async (updatedUser) => {
            // Precisely invalidate related caches (don't nuke everything)
            if (authUser?.uid) {
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['profile', authUser.uid] }),
                    queryClient.invalidateQueries({ queryKey: ['missions', 'owner', authUser.uid] }),
                    queryClient.invalidateQueries({ queryKey: ['dashboard', authUser.uid] }),
                    queryClient.invalidateQueries({ queryKey: ['quickStats', authUser.uid] }),
                    queryClient.invalidateQueries({ queryKey: ['user-stats', authUser.uid] }),
                ]);
            }

            // Debug: log profile update for regression tracking
            if (process.env.NODE_ENV === 'development') {
                console.debug('[Profile] Profile updated with precise invalidation:', {
                    uid: authUser?.uid,
                    invalidatedQueries: [
                        'profile',
                        'missions',
                        'dashboard',
                        'quickStats',
                        'user-stats'
                    ]
                });
            }
        },
        onError: (error) => {
            console.error('[Profile] Profile update failed:', error);
        },
    });
}
