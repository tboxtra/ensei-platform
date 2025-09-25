'use client';

// This file only needs to import the shared firebase module once.
// Side-effect: ensures initializeApp() runs on every page load.
import '@/lib/firebase';

export default function FirebaseBootstrap() {
    return null; // no UI
}
