/**
 * API utility functions with proper cache control
 * Ensures missions and user data are always fresh
 */

export async function apiGet<T>(url: string, token?: string): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers,
        cache: 'no-store', // Critical: never cache API responses
        next: { revalidate: 0 }, // For Next.js app router
        credentials: 'include',
    });

    if (!response.ok) {
        // Bubble up errors so UI can leave loading state
        const text = await response.text().catch(() => '');
        throw new Error(`GET ${url} ${response.status} ${response.statusText} :: ${text}`);
    }

    return response.json();
}

export async function apiPost<T>(url: string, data: any, token?: string): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        cache: 'no-store',
        next: { revalidate: 0 },
    });

    if (!response.ok) {
        throw new Error(`POST ${url} failed ${response.status}`);
    }

    return response.json();
}

export async function apiPut<T>(url: string, data: any, token?: string): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        cache: 'no-store',
        next: { revalidate: 0 },
    });

    if (!response.ok) {
        throw new Error(`PUT ${url} failed ${response.status}`);
    }

    return response.json();
}
