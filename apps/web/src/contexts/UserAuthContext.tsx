'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth, sendVerificationEmail } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getAuthState, clearAuthState, validateAuthState } from '../lib/auth-utils';

interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    avatar: string;
    joinedAt: string;
    emailVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    sendEmailVerification: () => Promise<void>;
    isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a UserAuthProvider');
    }
    return context;
};

interface UserAuthProviderProps {
    children: React.ReactNode;
}

export const UserAuthProvider: React.FC<UserAuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Production logging control
    const isDevelopment = process.env.NODE_ENV === 'development';
    const log = (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.log(message, ...args);
        }
    };

    useEffect(() => {
        // Clear any old logout flags that might be causing issues
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user_logged_out');
        }

        const auth = getFirebaseAuth();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            log('🔥 Firebase onAuthStateChanged triggered:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');

            if (firebaseUser) {
                try {
                    // Get Firebase ID token
                    const token = await firebaseUser.getIdToken();

                    // Store token in localStorage for API calls
                    localStorage.setItem('firebaseToken', token);

                    // Create user data from Firebase (primary source of truth)
                    const userData: User = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || firebaseUser.email || '',
                        firstName: firebaseUser.displayName?.split(' ')[0] || '',
                        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                        avatar: firebaseUser.photoURL || '',
                        joinedAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
                        emailVerified: firebaseUser.emailVerified,
                    };

                    // Store user data
                    localStorage.setItem('user', JSON.stringify(userData));
                    setUser(userData);
                    log('User authenticated via Firebase:', userData.email);
                } catch (err) {
                    console.error('Error getting Firebase token:', err);
                    setError('Failed to get authentication token');
                }
            } else {
                // User is signed out - clear everything
                log('🧹 Firebase confirmed user signed out, clearing state...');
                clearAuthState();
                setUser(null);
                log('✅ User signed out and state cleared');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const auth = getFirebaseAuth();
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the rest
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            log('🔄 Starting logout process...');

            const auth = getFirebaseAuth();

            // Standard Firebase logout - this should handle everything
            log('🔥 Calling Firebase signOut...');
            await signOut(auth);
            log('✅ Firebase signOut completed');

            // Firebase onAuthStateChanged will handle clearing the state
            // No need for manual state clearing or complex persistence control

            log('✅ User logged out successfully');
        } catch (err) {
            console.error('❌ Logout error:', err);
            // Only clear state if Firebase signOut fails
            clearAuthState();
            setUser(null);
            setError(null);
        }
    };

    const refreshToken = async (): Promise<void> => {
        try {
            const auth = getFirebaseAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
                const token = await currentUser.getIdToken(true); // Force refresh
                localStorage.setItem('firebaseToken', token);
                log('Token refreshed successfully');
            } else {
                // No current user, clear storage
                clearAuthState();
                setUser(null);
                log('No current user found, cleared storage');
            }
        } catch (err) {
            console.error('Token refresh error:', err);
            // If token refresh fails, user might need to re-authenticate
            clearAuthState();
            setUser(null);
        }
    };

    const sendEmailVerification = async (): Promise<void> => {
        try {
            const auth = getFirebaseAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
                await sendVerificationEmail(currentUser);
                log('Verification email sent successfully');
            } else {
                throw new Error('No authenticated user found');
            }
        } catch (err) {
            console.error('Error sending verification email:', err);
            throw err;
        }
    };

    // Computed property for email verification status
    const isEmailVerified = user?.emailVerified || false;

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        refreshToken,
        sendEmailVerification,
        isEmailVerified,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
