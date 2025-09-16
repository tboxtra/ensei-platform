'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth } from '../lib/firebase';
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
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
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

    useEffect(() => {
        // First, try to restore user from localStorage while Firebase initializes
        const restoreUserFromStorage = () => {
            try {
                const authState = validateAuthState();

                if (authState.isAuthenticated && authState.user) {
                    setUser(authState.user);
                    console.log('Restored user from localStorage:', authState.user.email);
                }
            } catch (err) {
                console.error('Error restoring user from localStorage:', err);
                clearAuthState();
            }
        };

        // Restore user immediately
        restoreUserFromStorage();

        const auth = getFirebaseAuth();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                try {
                    // Get Firebase ID token
                    const token = await firebaseUser.getIdToken();

                    // Store token in localStorage for API calls
                    localStorage.setItem('firebaseToken', token);

                    // Create user object
                    const userData: User = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || firebaseUser.email || '',
                        firstName: firebaseUser.displayName?.split(' ')[0] || '',
                        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                        avatar: firebaseUser.photoURL || '',
                        joinedAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
                    };

                    // Store user data
                    localStorage.setItem('user', JSON.stringify(userData));
                    setUser(userData);
                    console.log('User authenticated via Firebase:', userData.email);
                } catch (err) {
                    console.error('Error getting Firebase token:', err);
                    setError('Failed to get authentication token');
                }
            } else {
                // User is signed out - clear everything
                clearAuthState();
                setUser(null);
                console.log('User signed out');
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
            const auth = getFirebaseAuth();
            await signOut(auth);
            // onAuthStateChanged will handle clearing the state
        } catch (err) {
            console.error('Logout error:', err);
            // Clear local storage even if logout fails
            clearAuthState();
            setUser(null);
        }
    };

    const refreshToken = async (): Promise<void> => {
        try {
            const auth = getFirebaseAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
                const token = await currentUser.getIdToken(true); // Force refresh
                localStorage.setItem('firebaseToken', token);
                console.log('Token refreshed successfully');
            } else {
                // No current user, clear storage
                clearAuthState();
                setUser(null);
                console.log('No current user found, cleared storage');
            }
        } catch (err) {
            console.error('Token refresh error:', err);
            // If token refresh fails, user might need to re-authenticate
            clearAuthState();
            setUser(null);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        refreshToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
