'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Industry Standard: Centralized navigation hook
 * Provides consistent navigation behavior across the entire application
 */
export const useNavigation = () => {
    const router = useRouter();

    const navigateTo = useCallback((path: string) => {
        // Industry standard: Use Next.js router for client-side navigation
        router.push(path);
    }, [router]);

    const navigateBack = useCallback(() => {
        router.back();
    }, [router]);

    const navigateReplace = useCallback((path: string) => {
        router.replace(path);
    }, [router]);

    const refresh = useCallback(() => {
        router.refresh();
    }, [router]);

    return {
        navigateTo,
        navigateBack,
        navigateReplace,
        refresh
    };
};
