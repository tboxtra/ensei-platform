/**
 * Authentication utility functions for managing user sessions
 */

export interface AuthState {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
    emailVerified: boolean;
}

/**
 * Get the current authentication state from localStorage
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
        console.log('🧹 clearAuthState: Removing user and firebaseToken from localStorage');
        localStorage.removeItem('user');
        localStorage.removeItem('firebaseToken');
        // Set logout flag to prevent automatic restoration
        localStorage.setItem('user_logged_out', 'true');
        console.log('✅ clearAuthState: Authentication state cleared from localStorage');
    } catch (error) {
        console.error('❌ Error clearing auth state:', error);
    }
}

export function clearLogoutFlag(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem('user_logged_out');
        console.log('✅ Logout flag cleared');
    } catch (error) {
        console.error('❌ Error clearing logout flag:', error);
    }
}

export function isUserLoggedOut(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem('user_logged_out') === 'true';
    } catch (error) {
        console.error('❌ Error checking logout flag:', error);
        return false;
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
            return { isAuthenticated: false, user: null, token: null, emailVerified: false };
        }
    }

    return authState;
}
