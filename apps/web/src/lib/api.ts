import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-ensei-6c8e0.cloudfunctions.net/api';

export async function makeAuthedRequest(path: string, options: RequestInit = {}) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error('User not authenticated');
    }

    const token = await user.getIdToken(true); // Force refresh to ensure fresh token

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
    };

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
    }

    return res.json();
}// Cache bust: Wed Oct 15 14:24:21 WAT 2025
