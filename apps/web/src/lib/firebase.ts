import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

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

export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const googleProvider = new GoogleAuthProvider();


