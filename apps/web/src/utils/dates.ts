/**
 * Bulletproof date parsing that handles all possible timestamp formats
 * from Firestore, legacy data, and various API responses
 */
export function dateFromAny(v: any): Date | null {
    if (!v) return null;

    // Firestore Timestamp object
    if (typeof v?.toDate === 'function') return v.toDate();

    // Admin/REST-like { seconds, nanoseconds }
    if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000);

    // ISO string or millis number
    if (typeof v === 'string' || typeof v === 'number') {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }

    return null;
}

/**
 * Format a date safely, showing fallback for null/invalid dates
 */
export function formatDateSafe(date: Date | null, fallback: string = '—'): string {
    if (!date) return fallback;

    try {
        return date.toLocaleString();
    } catch {
        return fallback;
    }
}

/**
 * Get time in milliseconds safely for sorting
 */
export function getTimeSafe(date: Date | null): number {
    return date?.getTime() ?? 0;
}
