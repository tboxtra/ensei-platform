'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '../store/authStore';

/**
 * AUTH USER HOOK - CENTRALIZED AUTH READINESS
 * 
 * This hook provides a single source of truth for auth readiness.
 * It ensures that queries are only enabled after Firebase auth state is determined.
 * 
 * IMPORTANT: This prevents "forever loading" states during auth hydration.
 */

export function useAuthUser() {
    const { user, ready, setUser, setReady } = useAuthStore();

    useEffect(() => {

        // Set ready to false initially
        setReady(false);

        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is authenticated - merge Firebase data into store
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                });
            } else {
                // User is not authenticated - clear user data
                setUser(null);
            }

            // IMPORTANT: Set ready to true after first auth check
            // This prevents queries from running before auth state is determined
            setReady(true);
        });

        return () => unsub();
    }, [setUser, setReady]);

    return {
        user,
        ready,
        isAuthenticated: !!user?.uid
    };
}
