'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0, // Always consider data stale
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnMount: 'always', // Always refetch on mount
            refetchOnReconnect: true, // Refetch when reconnecting
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

interface QueryProviderProps {
    children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
