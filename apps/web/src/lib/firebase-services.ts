import {
    getFirebaseAuth,
    getFirebaseFirestore,
    getFirebaseStorage,
    getFirebaseAnalytics,
    getFirebaseMessaging
} from './firebase';

// Firebase Services Configuration
export class FirebaseServices {
    private static instance: FirebaseServices;

    private constructor() { }

    public static getInstance(): FirebaseServices {
        if (!FirebaseServices.instance) {
            FirebaseServices.instance = new FirebaseServices();
        }
        return FirebaseServices.instance;
    }

    // Authentication Service
    public getAuth() {
        return getFirebaseAuth();
    }

    // Firestore Database Service
    public getFirestore() {
        return getFirebaseFirestore();
    }

    // Storage Service
    public getStorage() {
        return getFirebaseStorage();
    }

    // Analytics Service
    public async getAnalytics() {
        return await getFirebaseAnalytics();
    }

    // Messaging Service
    public async getMessaging() {
        return await getFirebaseMessaging();
    }

    // Initialize all services
    public async initializeServices() {
        try {
            const auth = this.getAuth();
            const firestore = this.getFirestore();
            const storage = this.getStorage();
            const analytics = await this.getAnalytics();
            const messaging = await this.getMessaging();

            console.log('Firebase services initialized:', {
                auth: !!auth,
                firestore: !!firestore,
                storage: !!storage,
                analytics: !!analytics,
                messaging: !!messaging
            });

            return {
                auth,
                firestore,
                storage,
                analytics,
                messaging
            };
        } catch (error) {
            console.error('Error initializing Firebase services:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const firebaseServices = FirebaseServices.getInstance();

// Service Worker for Firebase Messaging
export const registerServiceWorker = async () => {
    if (typeof window === 'undefined') return null;

    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
};

// Initialize Firebase services on app start
export const initializeFirebase = async () => {
    try {
        await firebaseServices.initializeServices();
        await registerServiceWorker();
        console.log('Firebase initialization complete');
    } catch (error) {
        console.error('Firebase initialization failed:', error);
    }
};
