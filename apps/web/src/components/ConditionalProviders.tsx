/**
 * Conditional Providers Component
 * Industry Standard: Progressive enhancement for context providers
 * Loads providers only when needed to prevent blocking
 */

'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import providers to prevent SSR issues
const QueryProvider = dynamic(() => import('./providers/QueryProvider'), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

const UserAuthProvider = dynamic(() => import('../contexts/UserAuthContext').then(mod => ({ default: mod.UserAuthProvider })), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

interface ConditionalProvidersProps {
    children: React.ReactNode;
}

export const ConditionalProviders: React.FC<ConditionalProvidersProps> = ({ children }) => {
    return (
        <Suspense fallback={<div>Loading providers...</div>}>
            <QueryProvider>
                <UserAuthProvider>
                    {children}
                </UserAuthProvider>
            </QueryProvider>
        </Suspense>
    );
};
