'use client';

import { useEffect } from 'react';
import { initializeFirebase } from '../lib/firebase-services';

export function FirebaseInitializer() {
    useEffect(() => {
        // Initialize Firebase services when the app starts
        initializeFirebase().catch(error => {
            console.error('Failed to initialize Firebase:', error);
        });
    }, []);

    // This component doesn't render anything
    return null;
}
