'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    const isLoggingOutRef = useRef(false);

    useEffect(() => {
        const auth = getFirebaseAuth();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            console.log('🔥 Firebase onAuthStateChanged triggered:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
            console.log('🔄 isLoggingOut:', isLoggingOutRef.current);
            
            // If we're in the process of logging out, ignore Firebase auth state changes
            if (isLoggingOutRef.current) {
                console.log('🚫 Ignoring Firebase auth state change during logout');
                return;
            }
            
            if (firebaseUser) {
                try {
                    // Get Firebase ID token
                    const token = await firebaseUser.getIdToken();

                    // Store token in localStorage for API calls
                    localStorage.setItem('firebaseToken', token);

                    // Try to restore existing user data from localStorage first
                    let userData: User;
                    try {
                        const existingUser = localStorage.getItem('user');
                        if (existingUser) {
                            const parsedUser = JSON.parse(existingUser);
                            // Update with current Firebase data but preserve existing data
                            userData = {
                                ...parsedUser,
                                id: firebaseUser.uid,
                                email: firebaseUser.email || parsedUser.email,
                                emailVerified: firebaseUser.emailVerified,
                                // Keep existing name/avatar if they exist, otherwise use Firebase data
                                name: parsedUser.name || firebaseUser.displayName || firebaseUser.email || '',
                                firstName: parsedUser.firstName || firebaseUser.displayName?.split(' ')[0] || '',
                                lastName: parsedUser.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                                avatar: parsedUser.avatar || firebaseUser.photoURL || '',
                                joinedAt: parsedUser.joinedAt || firebaseUser.metadata.creationTime || new Date().toISOString(),
                            };
                        } else {
                            // Create new user object if no existing data
                            userData = {
                                id: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                name: firebaseUser.displayName || firebaseUser.email || '',
                                firstName: firebaseUser.displayName?.split(' ')[0] || '',
                                lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                                avatar: firebaseUser.photoURL || '',
                                joinedAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
                                emailVerified: firebaseUser.emailVerified,
                            };
                        }
                    } catch (err) {
                        console.error('Error parsing existing user data:', err);
                        // Fallback to creating new user object
                        userData = {
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: firebaseUser.displayName || firebaseUser.email || '',
                            firstName: firebaseUser.displayName?.split(' ')[0] || '',
                            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                            avatar: firebaseUser.photoURL || '',
                            joinedAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
                            emailVerified: firebaseUser.emailVerified,
                        };
                    }

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
                console.log('🧹 Firebase confirmed user signed out, clearing state...');
                clearAuthState();
                setUser(null);
                console.log('✅ User signed out and state cleared');
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
            console.log('🔄 Starting logout process...');
            
            // Set logout flag to prevent Firebase auth state changes from restoring user
            isLoggingOutRef.current = true;
            
            // Clear state immediately to prevent restoration
            console.log('🧹 Clearing localStorage and React state...');
            clearAuthState();
            setUser(null);
            setError(null);
            
            const auth = getFirebaseAuth();
            console.log('🔥 Calling Firebase signOut...');
            await signOut(auth);
            console.log('✅ Firebase signOut completed');
            
            // Force clear state again after signOut
            console.log('🧹 Force clearing state after signOut...');
            clearAuthState();
            setUser(null);
            setError(null);
            
            // Reset logout flag after a delay to allow normal auth flow to resume
            setTimeout(() => {
                isLoggingOutRef.current = false;
                console.log('🔄 Logout flag reset, normal auth flow resumed');
            }, 2000);
            
            console.log('✅ User logged out successfully');
        } catch (err) {
            console.error('❌ Logout error:', err);
            // Ensure state is cleared even if logout fails
            clearAuthState();
            setUser(null);
            setError(null);
            isLoggingOutRef.current = false;
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

    const sendEmailVerification = async (): Promise<void> => {
        try {
            const auth = getFirebaseAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
                await sendVerificationEmail(currentUser);
                console.log('Verification email sent successfully');
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
