'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUserData } from '../contexts/UserDataContext';

/**
 * Hook to force refresh user data when navigating between pages
 * This ensures data consistency across all pages
 */
export const useNavigationRefresh = () => {
    const pathname = usePathname();
    const { forceRefresh } = useUserData();

    useEffect(() => {
        // Force refresh user data when pathname changes
        forceRefresh();
    }, [pathname, forceRefresh]);
};
