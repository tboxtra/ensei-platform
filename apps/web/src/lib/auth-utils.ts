/**
 * Authentication utility functions for managing user sessions
 */

// Production logging control
const isDevelopment = process.env.NODE_ENV === 'development';
const log = (message: string, ...args: any[]) => {
    if (isDevelopment) {
        console.log(message, ...args);
    }
};

export interface AuthState {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
    emailVerified: boolean;
}

/**
 * Get the current authentication state from localStorage
 * Note: This function is kept for potential future use but not currently used
 */
export function getAuthState(): AuthState {
    if (typeof window === 'undefined') {
        return { isAuthenticated: false, user: null, token: null, emailVerified: false };
    }

    try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('firebaseToken');

        const userData = user ? JSON.parse(user) : null;

        return {
            isAuthenticated: !!(user && token),
            user: userData,
            token,
            emailVerified: userData?.emailVerified || false
        };
    } catch (error) {
        console.error('Error reading auth state from localStorage:', error);
        return { isAuthenticated: false, user: null, token: null, emailVerified: false };
    }
}

/**
 * Clear authentication state from localStorage
 */
export function clearAuthState(): void {
    if (typeof window === 'undefined') return;

    try {
        log('🧹 clearAuthState: Removing user and firebaseToken from localStorage');
        localStorage.removeItem('user');
        localStorage.removeItem('firebaseToken');
        // Clear any old logout flags that might be causing issues
        localStorage.removeItem('user_logged_out');
        log('✅ clearAuthState: Authentication state cleared from localStorage');
    } catch (error) {
        console.error('❌ Error clearing auth state:', error);
    }
}

/**
 * Check if the current token is expired (basic check)
 * Note: This function is kept for potential future use but not currently used
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
 * Note: This function is kept for potential future use but not currently used
 */
export function validateAuthState(): AuthState {
    const authState = getAuthState();

    if (authState.isAuthenticated && authState.token) {
        if (isTokenExpired(authState.token)) {
            log('Token is expired, clearing auth state');
            clearAuthState();
            return { isAuthenticated: false, user: null, token: null, emailVerified: false };
        }
    }

    return authState;
}
