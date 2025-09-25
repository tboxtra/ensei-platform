/**
 * Firebase Initializer Component
 * Industry Standard: Firebase initialization provider
 */

'use client';

import React from 'react';
// This import ensures Firebase is initialized on every page load
import '../../lib/firebase';

interface FirebaseInitializerProps {
    children: React.ReactNode;
}

export default function FirebaseInitializer({ children }: FirebaseInitializerProps) {
    // Firebase is initialized by the import above
    // No need for async initialization or loading states
    return <>{children}</>;
}
