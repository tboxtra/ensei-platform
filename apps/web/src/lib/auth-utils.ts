/**
 * Authentication utility functions for managing user sessions
 */

export interface AuthState {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
}

/**
 * Get the current authentication state from localStorage
 */
export function getAuthState(): AuthState {
    if (typeof window === 'undefined') {
        return { isAuthenticated: false, user: null, token: null };
    }

    try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('firebaseToken');

        return {
            isAuthenticated: !!(user && token),
            user: user ? JSON.parse(user) : null,
            token
        };
    } catch (error) {
        console.error('Error reading auth state from localStorage:', error);
        return { isAuthenticated: false, user: null, token: null };
    }
}

/**
 * Clear authentication state from localStorage
 */
export function clearAuthState(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('user');
        localStorage.removeItem('firebaseToken');
        console.log('Authentication state cleared');
    } catch (error) {
        console.error('Error clearing auth state:', error);
    }
}

/**
 * Check if the current token is expired (basic check)
 */
export function isTokenExpired(token: string): boolean {
    try {
        // Firebase tokens are JWT tokens, we can decode them to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true; // Assume expired if we can't parse it
    }
}

/**
 * Validate authentication state and clear if invalid
 */
export function validateAuthState(): AuthState {
    const authState = getAuthState();

    if (authState.isAuthenticated && authState.token) {
        if (isTokenExpired(authState.token)) {
            console.log('Token is expired, clearing auth state');
            clearAuthState();
            return { isAuthenticated: false, user: null, token: null };
        }
    }

    return authState;
}
