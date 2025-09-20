'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCombinedUserData } from './useUserDataQuery';

/**
 * Hook to force refresh user data when navigating between pages
 * This ensures data consistency across all pages
 */
export const useNavigationRefresh = () => {
    const pathname = usePathname();
    const { refetch } = useCombinedUserData();

    useEffect(() => {
        // Force refresh user data when pathname changes
        refetch();
    }, [pathname, refetch]);
};
