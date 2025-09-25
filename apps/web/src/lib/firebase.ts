'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator, sendEmailVerification, applyActionCode, checkActionCode, setPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

const config = {
    apiKey: "AIzaSyCA-bn41GjFSjM7LEVTIiow6N18cbV8oJY",
    authDomain: "ensei-6c8e0.firebaseapp.com",
    projectId: "ensei-6c8e0",
    storageBucket: "ensei-6c8e0.firebasestorage.app",
    messagingSenderId: "542777590186",
    appId: "1:542777590186:web:59a664f5053a6057d5abd3",
    measurementId: "G-XHHBG5RLVQ"
};

// Single Firebase app instance
export const app = getApps().length ? getApp() : initializeApp(config);

// Important: set persistence once
export const auth = getAuth(app);
void setPersistence(auth, browserLocalPersistence);

// Legacy function for backward compatibility
export function getFirebaseApp(): FirebaseApp {
    return app;
}

// Initialize Firebase services
export const getFirebaseAuth = () => {
    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development' && !auth.emulatorConfig) {
        try {
            connectAuthEmulator(auth, 'http://localhost:9099');
        } catch (error) {
            // Emulator already connected or not available
        }
    }

    // Firebase Auth automatically persists authentication state by default
    // This includes:
    // - User session persistence across browser tabs/windows
    // - Automatic token refresh
    // - Restoration of authentication state on page reload
    console.log('Firebase Auth initialized with persistence enabled');

    return auth;
};

export const db = getFirestore(app);

export const getFirebaseFirestore = () => {
    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development') {
        try {
            connectFirestoreEmulator(db, 'localhost', 8080);
        } catch (error) {
            // Emulator already connected or not available
        }
    }

    return db;
};

export const storage = getStorage(app);

export const getFirebaseStorage = () => {
    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development') {
        try {
            connectStorageEmulator(storage, 'localhost', 9199);
        } catch (error) {
            // Emulator already connected or not available
        }
    }

    return storage;
};

// Initialize Analytics
export const getFirebaseAnalytics = async () => {
    if (typeof window === 'undefined') return null;

    const supported = await isSupported();
    if (!supported) return null;

    return getAnalytics(getFirebaseApp());
};

// Initialize Messaging
export const getFirebaseMessaging = async () => {
    if (typeof window === 'undefined') return null;

    const supported = await isMessagingSupported();
    if (!supported) return null;

    return getMessaging(getFirebaseApp());
};

// Initialize Functions
export const fns = getFunctions(app, 'us-central1');

export const getFirebaseFunctions = () => {
    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development') {
        try {
            connectFunctionsEmulator(fns, 'localhost', 5001);
        } catch (error) {
            // Emulator already connected or not available
        }
    }

    return fns;
};

// Export functions as alias for backward compatibility
export const functions = fns;

// For debugging in browser console
if (typeof window !== "undefined") {
    (window as any).firebaseApp = app;
    (window as any).firebaseAuth = auth;
    (window as any).firebaseDb = db;
    (window as any).firebaseFns = fns;
    (window as any).firebaseFunctions = { httpsCallable };
}

export const googleProvider = new GoogleAuthProvider();

// Email verification utilities
export const sendVerificationEmail = async (user: any) => {
    try {
        // Create action code settings with a mobile-friendly URL
        const actionCodeSettings = {
            // Use the main domain for better mobile compatibility
            url: `${window.location.origin}/auth/verify-email/action`,
            handleCodeInApp: true,
            // Configure for better mobile experience
            iOS: {
                bundleId: 'com.ensei.app'
            },
            android: {
                packageName: 'com.ensei.app',
                installApp: false,
                minimumVersion: '1.0.0'
            }
        };

        await sendEmailVerification(user, actionCodeSettings);
        console.log('Verification email sent successfully to:', user.email);
        return true;
    } catch (error: any) {
        console.error('Error sending verification email:', error);

        // Provide more specific error information
        if (error.code === 'auth/too-many-requests') {
            throw new Error('Too many verification emails sent. Please wait before requesting another.');
        } else if (error.code === 'auth/user-not-found') {
            throw new Error('User account not found. Please try signing up again.');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address. Please check your email and try again.');
        }

        throw error;
    }
};

export const verifyEmailWithCode = async (actionCode: string) => {
    try {
        const auth = getFirebaseAuth();
        await applyActionCode(auth, actionCode);
        console.log('Email verified successfully');
        return true;
    } catch (error) {
        console.error('Error verifying email:', error);
        throw error;
    }
};

export const checkEmailVerificationCode = async (actionCode: string) => {
    try {
        const auth = getFirebaseAuth();
        const info = await checkActionCode(auth, actionCode);
        return info;
    } catch (error) {
        console.error('Error checking verification code:', error);
        throw error;
    }
};

// Firebase Auth persistence control functions
export const disableAuthPersistence = async () => {
    try {
        const auth = getFirebaseAuth();
        await setPersistence(auth, inMemoryPersistence);
        console.log('🔒 Firebase Auth persistence disabled (in-memory only)');
    } catch (error) {
        console.error('Error disabling auth persistence:', error);
        throw error;
    }
};

export const enableAuthPersistence = async () => {
    try {
        const auth = getFirebaseAuth();
        await setPersistence(auth, browserLocalPersistence);
        console.log('🔓 Firebase Auth persistence enabled (local storage)');
    } catch (error) {
        console.error('Error enabling auth persistence:', error);
        throw error;
    }
};


