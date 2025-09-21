'use client';

import { onIdTokenChanged, getAuth } from 'firebase/auth';

/**
 * TOKEN FRESHNESS UTILITY
 * 
 * Handles automatic token refresh to prevent 401 errors
 * and keeps API calls authenticated.
 */

export function listenForTokenRefresh(cb: (token: string | null) => void) {
    const auth = getAuth();
    return onIdTokenChanged(auth, async (user) => {
        if (user) {
            try {
                const token = await user.getIdToken();
                cb(token);
            } catch (error) {
                console.error('Failed to get ID token:', error);
                cb(null);
            }
        } else {
            cb(null);
        }
    });
}

/**
 * Get current user's ID token
 */
export async function getCurrentToken(): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        return null;
    }

    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('Failed to get current token:', error);
        return null;
    }
}
