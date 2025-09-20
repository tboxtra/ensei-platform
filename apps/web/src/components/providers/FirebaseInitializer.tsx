/**
 * Firebase Initializer Component
 * Industry Standard: Firebase initialization provider
 */

'use client';

import React, { useEffect, useState } from 'react';
import { getFirebaseAuth } from '../../lib/firebase';

interface FirebaseInitializerProps {
    children: React.ReactNode;
}

export default function FirebaseInitializer({ children }: FirebaseInitializerProps) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                // Initialize Firebase Auth
                await getFirebaseAuth();
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize Firebase:', error);
                // Still render children even if Firebase fails to initialize
                setIsInitialized(true);
            }
        };

        initializeFirebase();
    }, []);

    if (!isInitialized) {
        return <div>Initializing Firebase...</div>;
    }

    return <>{children}</>;
}
