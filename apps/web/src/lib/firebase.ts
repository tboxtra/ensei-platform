import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';

let app: FirebaseApp;

export function getFirebaseApp(): FirebaseApp {
    if (!getApps().length) {
        app = initializeApp({
            apiKey: "AIzaSyCA-bn41GjFSjM7LEVTIiow6N18cbV8oJY",
            authDomain: "ensei-6c8e0.firebaseapp.com",
            projectId: "ensei-6c8e0",
            storageBucket: "ensei-6c8e0.firebasestorage.app",
            messagingSenderId: "542777590186",
            appId: "1:542777590186:web:59a664f5053a6057d5abd3",
            measurementId: "G-XHHBG5RLVQ"
        });
    }
    return app;
}

// Initialize Firebase services
export const getFirebaseAuth = () => {
    const auth = getAuth(getFirebaseApp());
    
    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development' && !auth.emulatorConfig) {
        try {
            connectAuthEmulator(auth, 'http://localhost:9099');
        } catch (error) {
            // Emulator already connected or not available
        }
    }
    
    return auth;
};

export const getFirebaseFirestore = () => {
    const firestore = getFirestore(getFirebaseApp());
    
    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development' && !firestore._delegate._databaseId.projectId.includes('demo-')) {
        try {
            connectFirestoreEmulator(firestore, 'localhost', 8080);
        } catch (error) {
            // Emulator already connected or not available
        }
    }
    
    return firestore;
};

export const getFirebaseStorage = () => {
    const storage = getStorage(getFirebaseApp());
    
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

export const googleProvider = new GoogleAuthProvider();


