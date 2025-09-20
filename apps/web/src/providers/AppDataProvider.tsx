'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import providers to prevent SSR issues
const QueryProvider = dynamic(() => import('../components/providers/QueryProvider'), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

const FirebaseInitializer = dynamic(() => import('../components/providers/FirebaseInitializer'), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

const UserAuthProvider = dynamic(() => import('../contexts/UserAuthContext').then(mod => ({ default: mod.UserAuthProvider })), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

/**
 * Industry Standard: Unified App Data Provider
 * Wraps the entire application with all necessary providers for consistent data management
 * 
 * Features:
 * - React Query for server state management
 * - Firebase initialization
 * - User authentication context
 * - Centralized data synchronization
 * - SSR-safe dynamic imports
 */
interface AppDataProviderProps {
    children: React.ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
    return (
        <Suspense fallback={<div>Loading providers...</div>}>
            <QueryProvider>
                <FirebaseInitializer>
                    <UserAuthProvider>
                        {children}
                    </UserAuthProvider>
                </FirebaseInitializer>
            </QueryProvider>
        </Suspense>
    );
};

export default AppDataProvider;
