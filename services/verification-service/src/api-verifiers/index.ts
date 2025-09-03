// API Verifier Registry
// Central registry for all available API verifiers

export interface ApiVerifier {
    key: string;
    name: string;
    description: string;
    verify: (data: any) => Promise<VerificationResult>;
}

export interface VerificationResult {
    isValid: boolean;
    score: number; // 0-100
    metadata?: Record<string, any>;
    error?: string;
}

// Verifier registry - lazy loaded
export const API_VERIFIERS: Record<string, () => Promise<ApiVerifier>> = {
    'steam_playtime': () => import('./steam-playtime').then(m => m.steamPlaytimeVerifier),
    'spotify_listen': () => import('./spotify-listen').then(m => m.spotifyListenVerifier),
    'http_ping': () => import('./http-ping').then(m => m.httpPingVerifier),
    'website_visit': () => import('./website-visit').then(m => m.websiteVisitVerifier),
};

/**
 * Get a verifier by key
 */
export async function getVerifier(key: string): Promise<ApiVerifier | undefined> {
    const verifierLoader = API_VERIFIERS[key];
    if (!verifierLoader) {
        return undefined;
    }
    return await verifierLoader();
}

/**
 * List all available verifiers
 */
export async function listVerifiers(): Promise<ApiVerifier[]> {
    const verifiers = await Promise.all(
        Object.values(API_VERIFIERS).map(loader => loader())
    );
    return verifiers;
}

/**
 * Check if a verifier exists
 */
export function hasVerifier(key: string): boolean {
    return key in API_VERIFIERS;
}

/**
 * Verify data using a specific verifier
 */
export async function verifyWithApi(key: string, data: any): Promise<VerificationResult> {
    const verifier = await getVerifier(key);
    if (!verifier) {
        return {
            isValid: false,
            score: 0,
            error: `Unknown verifier: ${key}`
        };
    }

    try {
        return await verifier.verify(data);
    } catch (error) {
        return {
            isValid: false,
            score: 0,
            error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
