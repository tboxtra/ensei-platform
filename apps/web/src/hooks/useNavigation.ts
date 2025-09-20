'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Industry Standard: Typed route definitions
 * Prevents stringly-typed paths and ensures route consistency
 */
export const ROUTES = {
    // Auth routes
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    
    // Main app routes
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    WALLET: '/wallet',
    
    // Mission routes
    MISSIONS: '/missions',
    CREATE_MISSION: '/missions/create',
    MY_MISSIONS: '/missions/my',
    MISSION_DETAIL: (id: string) => `/missions/${id}`,
    
    // Review routes
    REVIEW: '/review',
    CLAIM: '/claim',
    
    // Admin routes
    ADMIN: '/admin',
    ADMIN_MISSIONS: '/admin/missions',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = string;

/**
 * Industry Standard: Centralized navigation hook
 * Provides consistent navigation behavior across the entire application
 */
export const useNavigation = () => {
    const router = useRouter();

    const navigateTo = useCallback((path: RoutePath) => {
        // Industry standard: Use Next.js router for client-side navigation
        router.push(path);
    }, [router]);

    const navigateBack = useCallback(() => {
        router.back();
    }, [router]);

    const navigateReplace = useCallback((path: RoutePath) => {
        router.replace(path);
    }, [router]);

    const prefetch = useCallback((path: RoutePath) => {
        router.prefetch(path);
    }, [router]);

    const refresh = useCallback(() => {
        router.refresh();
    }, [router]);

    return {
        navigateTo,
        navigateBack,
        navigateReplace,
        prefetch,
        refresh,
        ROUTES, // Export routes for typed navigation
    };
};
