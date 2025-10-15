import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/UserAuthContext';
import { Pack, Entitlement } from '../types/packs';
import { makeAuthedRequest } from '../lib/api';

interface ApiResponse<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface CreateMissionRequest {
    platform: string;
    type: string;
    model: 'fixed' | 'degen';
    tasks: string[];
    cap?: number;
    durationHours?: number;
    winnersCap?: number;
    isPremium: boolean;
    tweetLink: string;
    instructions: string;
}

interface Mission {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    status: 'active' | 'completed' | 'cancelled' | 'draft';
    participants_count: number;
    submissions_count: number;
    max_participants?: number;
    cap?: number;
    total_cost_honors?: number;
    rewards?: {
        honors: number;
        usd: number;
    };
    requirements: string[];
    deliverables?: string[];
    deadline?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    // Legacy fields for backward compatibility
    platform?: string;
    type?: string;
    model?: string;
    participants?: number;
    maxParticipants?: number;
    reward?: number;
    totalCost?: number;
    endsAt?: string;
    tasks?: string[];
    submissions?: any[]; // Changed from number to any[] for inline submissions
    duration_hours?: number;
    // Additional fields for clicks calculation
    tasks_done?: number;
    tasksDone?: number;
    verified_clicks?: number;
    verifiedCount?: number;
    verifications_count?: number;
    stats?: {
        verified_tasks_total?: number;
        verifiedTasksTotal?: number;
    };
    submissions_verified_tasks?: number;
    clicks_count?: number;
    clicks?: number;
    // Additional submission field variants
    submissions_list?: any[];
    _submissions?: any[];
    subs?: any[];
    submissionItems?: any[];
}

interface Submission {
    id: string;
    missionId: string;
    missionTitle: string;
    platform: string;
    type: string;
    user: string;
    tasks: string[];
    proof: {
        type: string;
        url?: string;
        description: string;
    };
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    reward: number;
    rejectionReason?: string;
}

interface ClaimableReward {
    id: string;
    missionId: string;
    missionTitle: string;
    platform: string;
    type: string;
    reward: number;
    submittedAt: string;
    approvedAt: string;
    status: 'claimable' | 'claimed';
}

interface WalletBalance {
    honors: number;
    usd: number;
    pendingHonors: number;
    pendingUsd: number;
    crypto?: {
        ETH: number;
        BTC: number;
        USDC: number;
        USDT: number;
    };
}

interface Transaction {
    id: string;
    type: 'earned' | 'deposited' | 'withdrawn' | 'pending';
    amount: number;
    description: string;
    date: string;
    status: 'completed' | 'pending';
}

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    agreeToTerms: boolean;
    agreeToMarketing?: boolean;
}

interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        firstName: string;
        lastName: string;
        avatar: string;
        joinedAt: string;
    };
    token: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-ensei-6c8e0.cloudfunctions.net/api';
const API_VERSION = 'v2.2'; // Force cache invalidation
const CACHE_BUST = Date.now(); // Aggressive cache busting

// Reuse the same base everywhere (fallback to API_BASE_URL)
const API_BASE_FOR_PACKS = process.env.NEXT_PUBLIC_API_BASE || API_BASE_URL;

export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { logout: authLogout } = useAuth();

    // Production logging control
    const isDevelopment = process.env.NODE_ENV === 'development';
    const log = (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.log(message, ...args);
        }
    };

    const makeRequest = useCallback(async <T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> => {
        setLoading(true);
        setError(null);

        try {
            // try to get a Firebase ID token if we don't have one
            const token =
                (typeof window !== 'undefined' && localStorage.getItem('firebaseToken')) ||
                (await (async () => {
                    try {
                        const { getFirebaseAuth } = await import('../lib/firebase');
                        const a = getFirebaseAuth();
                        const u = a.currentUser;
                        return u ? await u.getIdToken(/* forceRefresh */ false) : null;
                    } catch { return null; }
                })());

            // Debug logging
            log('API Request Debug:', {
                endpoint,
                hasToken: !!token,
                tokenLength: token?.length || 0,
                tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
                method: options.method || 'GET',
                version: API_VERSION,
                cacheBust: CACHE_BUST,
                timestamp: new Date().toISOString()
            });

            // Don't set Content-Type for FormData (let browser set it with boundary)
            const isFormData = options.body instanceof FormData;
            const headers: Record<string, string> = {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(options.headers as Record<string, string>),
            };

            if (!isFormData) {
                headers['Content-Type'] = 'application/json';
            }

            // Debug headers
            log('API Headers Debug:', {
                hasAuthHeader: !!headers.Authorization,
                authHeaderPreview: headers.Authorization ? headers.Authorization.substring(0, 30) + '...' : 'none',
                allHeaders: Object.keys(headers)
            });

            // Add cache-busting query parameter
            const separator = endpoint.includes('?') ? '&' : '?';
            const cacheBustParam = `${separator}_cb=${CACHE_BUST}&_v=${API_VERSION}`;
            const fullUrl = `${API_BASE_URL}${endpoint}${cacheBustParam}`;

            const response = await fetch(fullUrl, {
                headers,
                ...options,
            });

            if (!response.ok) {
                const raw = await response.text();       // capture raw body
                let body: any = undefined;
                try { body = JSON.parse(raw); } catch { }
                const msg =
                    body?.error || body?.message || raw || `HTTP ${response.status} ${response.statusText}`;
                const err = new Error(msg) as any;
                err.status = response.status;
                err.body = body ?? raw;

                // Handle specific status codes
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                }
                if (response.status === 401) {
                    console.log('API: Received 401 Unauthorized, attempting token refresh');

                    try {
                        // Try to refresh the token using Firebase Auth
                        const { getFirebaseAuth } = await import('../lib/firebase');
                        const auth = getFirebaseAuth();
                        const currentUser = auth.currentUser;

                        if (currentUser) {
                            const newToken = await currentUser.getIdToken(true); // Force refresh
                            localStorage.setItem('firebaseToken', newToken);
                            console.log('Token refreshed successfully, retrying request');

                            // Retry the request with the new token
                            const retryHeaders = {
                                ...headers,
                                'Authorization': `Bearer ${newToken}`
                            };

                            const retryResponse = await fetch(fullUrl, {
                                headers: retryHeaders,
                                ...options,
                            });

                            if (retryResponse.ok) {
                                return await retryResponse.json();
                            }
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                    }

                    // If refresh failed or no current user, clear auth data
                    console.log('API: Token refresh failed, clearing tokens');
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('firebaseToken');
                        localStorage.removeItem('user');
                    }
                    throw new Error('Authentication expired. Please log in again.');
                }
                if (response.status === 0 || !response.status) {
                    throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
                }

                throw err;
            }

            const data = await response.json();
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Authentication APIs
    const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await makeRequest<AuthResponse>('/v1/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });

            // Store Firebase token and user data
            if (typeof window !== 'undefined') {
                localStorage.setItem('firebaseToken', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (err) {
            throw err;
        }
    }, [makeRequest]);

    const register = useCallback(async (userData: RegisterRequest): Promise<AuthResponse> => {
        try {
            const response = await makeRequest<AuthResponse>('/v1/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            });

            // Store Firebase token and user data
            if (typeof window !== 'undefined') {
                localStorage.setItem('firebaseToken', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (err) {
            throw err;
        }
    }, [makeRequest]);

    const logout = useCallback(async (): Promise<void> => {
        try {
            log('🔄 useApi logout: Starting logout process...');

            // Call logout endpoint if available
            try {
                await makeRequest('/v1/auth/logout', {
                    method: 'POST',
                });
                log('✅ useApi logout: API logout successful');
            } catch (err) {
                console.warn('⚠️ useApi logout: API logout failed, but continuing with Firebase logout:', err);
            }

            // Use auth context logout to properly sign out from Firebase
            log('🔥 useApi logout: Calling Firebase signOut...');
            await authLogout();
            log('✅ useApi logout: Firebase signOut completed');

        } catch (err) {
            console.error('❌ useApi logout: Error during logout:', err);
            // Even if logout fails, clear local storage as fallback
            if (typeof window !== 'undefined') {
                localStorage.removeItem('firebaseToken');
                localStorage.removeItem('user');
                log('🧹 useApi logout: Fallback localStorage clearing completed');
            }
        }
    }, [makeRequest, authLogout, log]);

    const getCurrentUser = useCallback(async (): Promise<any> => {
        try {
            return await makeRequest('/v1/auth/me');
        } catch (err) {
            // Don't automatically clear localStorage - let the calling component decide
            // This prevents accidental logouts when the API is temporarily unavailable
            throw err;
        }
    }, [makeRequest]);

    const getUserProfile = useCallback(async (): Promise<any> => {
        try {
            return await makeRequest('/v1/user/profile');
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            throw err;
        }
    }, [makeRequest]);

    // Mission APIs
    const createMission = useCallback(async (missionData: CreateMissionRequest): Promise<Mission> => {
        return makeRequest<Mission>('/v1/missions', {
            method: 'POST',
            body: JSON.stringify(missionData),
        });
    }, [makeRequest]);

    const getMissions = useCallback(async (): Promise<Mission[]> => {
        console.log('getMissions: Starting to fetch all missions...');
        try {
            const response = await makeRequest<{ missions: Mission[], hasMore: boolean, nextPageToken: string | null }>('/v1/missions');
            console.log('getMissions: Successfully fetched missions:', {
                count: response?.missions?.length || 0,
                missions: response?.missions,
                hasMore: response?.hasMore,
                nextPageToken: response?.nextPageToken
            });
            return response?.missions || [];
        } catch (error) {
            console.error('getMissions: Failed to fetch missions:', error);
            throw error;
        }
    }, [makeRequest]);

    const getExpiredMissions = useCallback(async (): Promise<Mission[]> => {
        console.log('getExpiredMissions: Starting to fetch expired missions...');
        try {
            const response = await makeRequest<{ missions: Mission[], hasMore: boolean, nextPageToken: string | null }>('/v1/missions/expired');
            console.log('getExpiredMissions: Successfully fetched expired missions:', {
                count: response?.missions?.length || 0,
                missions: response?.missions,
                hasMore: response?.hasMore,
                nextPageToken: response?.nextPageToken
            });
            return response?.missions || [];
        } catch (error) {
            console.error('getExpiredMissions: Failed to fetch expired missions:', error);
            throw error;
        }
    }, [makeRequest]);

    const getMission = useCallback(async (id: string): Promise<Mission> => {
        return makeRequest<Mission>(`/v1/missions/${id}`);
    }, [makeRequest]);

    const getMyMissions = useCallback(async (): Promise<Mission[]> => {
        console.log('getMyMissions: Starting to fetch user missions...');

        // This endpoint doesn't exist, so we'll get all missions and filter on frontend
        const response = await makeRequest<{ missions: Mission[], hasMore: boolean, nextPageToken: string | null }>('/v1/missions');
        const allMissions = response?.missions || [];
        console.log('getMyMissions: Got all missions:', allMissions?.length || 0);

        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData).id : null;
        console.log('getMyMissions: User ID:', userId);

        const userMissions = Array.isArray(allMissions)
            ? allMissions.filter(mission => mission.created_by === userId)
            : [];

        console.log('getMyMissions: Filtered user missions:', userMissions.length);
        return userMissions;
    }, [makeRequest]);

    // Submission APIs
    const submitMission = useCallback(async (missionId: string, submissionData: any): Promise<any> => {
        return makeRequest(`/v1/missions/${missionId}/submit`, {
            method: 'POST',
            body: JSON.stringify(submissionData),
        });
    }, [makeRequest]);

    const participateInMission = useCallback(async (missionId: string, submissionData: any): Promise<any> => {
        return makeRequest(`/v1/missions/${missionId}/participate`, {
            method: 'POST',
            body: JSON.stringify(submissionData),
        });
    }, [makeRequest]);

    const completeTask = useCallback(async (missionId: string, taskId: string, actionId: string, verificationData?: any, platform?: string, missionType?: string): Promise<any> => {
        return makeRequest(`/v1/missions/${missionId}/tasks/${taskId}/complete`, {
            method: 'POST',
            body: JSON.stringify({
                actionId,
                verificationData,
                platform,
                missionType
            }),
        });
    }, [makeRequest]);

    const uploadFile = useCallback(async (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Data = (reader.result as string).split(',')[1];
                    const result = await makeRequest('/v1/upload', {
                        method: 'POST',
                        body: JSON.stringify({
                            fileName: file.name,
                            fileType: file.type,
                            base64Data
                        }),
                    });
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, [makeRequest]);

    const submitMissionWithFiles = useCallback(async (missionId: string, submissionData: any, files?: File[]): Promise<any> => {
        let uploadedFiles = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const uploadResult = await uploadFile(file);
                uploadedFiles.push({
                    fileName: file.name,
                    fileType: file.type,
                    base64Data: uploadResult.fileUrl // We'll use the URL instead of base64 for submission
                });
            }
        }

        return makeRequest(`/v1/missions/${missionId}/submit`, {
            method: 'POST',
            body: JSON.stringify({
                submissionData,
                files: uploadedFiles
            }),
        });
    }, [makeRequest, uploadFile]);

    const getMissionSubmissions = useCallback(async (missionId: string): Promise<any[]> => {
        console.log('🔍 getMissionSubmissions called with missionId:', missionId);
        // normalize helpers
        const toArray = (res: any) => {
            if (Array.isArray(res)) return res;
            if (Array.isArray(res?.items)) return res.items;
            if (Array.isArray(res?.data)) return res.data;
            if (Array.isArray(res?.submissions)) return res.submissions;
            if (Array.isArray(res?.taskCompletions)) return res.taskCompletions;
            return [];
        };

        // maps a taskCompletion doc to the UI's submission shape
        const nice = (s: string) => String(s || '').toLowerCase().replace(/^auto_/, '');

        const LABELS: Record<string, string> = {
            like: 'like', like_tweet: 'like', favorite: 'like',
            retweet: 'retweet', repost: 'retweet', rt: 'retweet',
            comment: 'comment', reply: 'comment',
            quote: 'quote', quote_tweet: 'quote',
            follow: 'follow', follow_user: 'follow'
        };

        const toUiStatus = (raw?: string) => {
            const s = String(raw || 'verified').toLowerCase();
            if (['flagged', 'rejected'].includes(s)) return 'flagged';
            if (['verified', 'approved', 'success', 'completed', 'done', 'ok'].includes(s)) return 'verified';
            // no pending in UI
            return 'verified';
        };

        const pickHandle = (t: any) =>
            t?.twitterHandle ??
            t?.user_handle ??
            t?.handle ??
            t?.twitter?.username ??
            t?.twitterUsername ??
            t?.metadata?.twitterHandle ??
            t?.metadata?.handle ??
            t?.metadata?.twitter?.username ??
            t?.metadata?.twitter_username ??
            t?.screen_name ??
            t?.user?.twitterHandle ??
            t?.user?.twitter?.handle ??
            t?.profile?.twitterHandle ??
            t?.profile?.twitter?.handle ??
            null;

        const firstFrom = (name?: string) =>
            (name || '').trim().split(/\s+/)[0] || null;

        const pickFirstName = (t: any) =>
            t?.firstName ??
            t?.first_name ??
            t?.userFirstName ??
            t?.user_first_name ??
            firstFrom(t?.userName) ??
            firstFrom(t?.user_name) ??
            firstFrom(t?.displayName) ??
            firstFrom(t?.display_name) ??
            firstFrom(t?.name) ??
            firstFrom(t?.profile?.name) ??
            t?.profile?.firstName ??
            t?.user?.firstName ??
            t?.user?.profile?.firstName ??
            null;

        const extractTaskId = (t: any) =>
            nice(t.taskId) ||
            nice(t.actionId) ||
            nice(t.type) ||
            nice(t.action) ||
            nice(t.activity) ||
            nice(t.eventType) ||
            nice(t?.task?.type) ||
            nice(t?.task?.action) ||
            nice(t?.metadata?.taskId) ||
            nice(t?.metadata?.actionId) ||
            nice(t?.metadata?.task) ||
            nice(t?.metadata?.action) ||
            nice(t?.metadata?.taskName);

        const mapTC = (t: any) => {
            const status = toUiStatus(t.status);   // 👈 replace previous normalization

            const taskId = extractTaskId(t);
            const task_label = LABELS[taskId] || taskId || 'task';

            return {
                id: t.id ?? t.docId ?? t._id ?? crypto.randomUUID(),
                user_handle: pickHandle(t),
                user_name: pickFirstName(t),                           // ✅ first-name fallback
                user_id: t.userId ?? t.user_id ?? t.userEmail ?? t.email ?? t.uid ?? null,
                created_at: t.completedAt ?? t.createdAt ?? t.updatedAt ?? null,
                status,                                                // only 'verified' | 'flagged'
                tasks_count: 1,
                verified_tasks: status === 'verified' ? 1 : 0,
                task_id: taskId,
                task_label,
                _raw: t,
            };
        };

        const q = encodeURIComponent(missionId);

        // Try taskCompletions routes first (they work without auth)
        const candidates = [
            `/v1/missions/${missionId}/taskCompletions`,
            `/v1/taskCompletions?missionId=${q}`,
            `/v1/taskcompletions?missionId=${q}`,
            `/v1/task-completions?missionId=${q}`,
            // Fallback to submissions-style routes (require auth)
            `/v1/missions/${missionId}/submissions`,
            `/v1/submissions?missionId=${q}`,
            `/v1/submissions?mission_id=${q}`,
            `/v1/submissions?mission=${q}`,
            `/v1/submissions/by-mission/${missionId}`,
            `/v1/submissions/mission/${missionId}`,
        ];

        let lastErr: any;
        for (const url of candidates) {
            try {
                console.log('🔍 Trying submissions endpoint:', url);
                const res = await makeRequest<any>(url);
                const arr = toArray(res);
                console.log('✅ Success with endpoint:', url, 'items:', arr.length);
                console.log('🔍 Raw response structure:', res);
                console.log('🔍 First item structure:', arr[0]);

                // Check if data is already normalized (has user_handle, task_label, etc.) or needs normalization
                const alreadyNormalized = arr.some((x: any) => x?.user_handle !== undefined || x?.task_label !== undefined);
                const needsNormalization = arr.some((x: any) => x?.missionId || x?.taskId || x?.metadata || x?.userEmail);

                let result = arr;
                if (needsNormalization && !alreadyNormalized) {
                    result = arr.map(mapTC);
                    console.log('📊 Applied mapTC normalization');
                } else if (alreadyNormalized) {
                    console.log('📊 Data already normalized by backend');
                } else {
                    console.log('📊 No normalization needed');
                }

                console.log('📊 Final result:', { normalized: needsNormalization && !alreadyNormalized, count: result.length });
                return result;
            } catch (e: any) {
                console.log('❌ Failed endpoint:', url, 'error:', e?.message || e);
                lastErr = e;
            }
        }

        // As a final fallback, try a very generic API path if you have a single "api" function
        try {
            const res = await makeRequest<any>(`/v1/api/taskCompletions?missionId=${q}`);
            const arr = toArray(res);
            return arr.map(mapTC);
        } catch (e) {
            lastErr = e;
        }

        throw lastErr || new Error('Unable to load submissions / task completions');
    }, [makeRequest]);

    const getSubmissions = useCallback(async (): Promise<Submission[]> => {
        return makeRequest<Submission[]>('/v1/submissions');
    }, [makeRequest]);

    const reviewSubmission = useCallback(async (submissionId: string, reviewData: any): Promise<any> => {
        return makeRequest(`/v1/submissions/${submissionId}/review`, {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }, [makeRequest]);

    const verifySubmission = useCallback(async (submissionId: string): Promise<any> => {
        return makeRequest(`/v1/submissions/${submissionId}/verify`, {
            method: 'POST',
        });
    }, [makeRequest]);

    const flagSubmission = useCallback(async (submissionId: string, reason?: string): Promise<any> => {
        return makeRequest(`/v1/submissions/${submissionId}/flag`, {
            method: 'POST',
            body: JSON.stringify({ reason: reason || 'Inappropriate content' }),
        });
    }, [makeRequest]);

    // Claim APIs
    const getClaimableRewards = useCallback(async (): Promise<ClaimableReward[]> => {
        return makeRequest<ClaimableReward[]>('/v1/rewards/claimable');
    }, [makeRequest]);

    const claimReward = useCallback(async (rewardId: string): Promise<any> => {
        return makeRequest(`/v1/rewards/${rewardId}/claim`, {
            method: 'POST',
        });
    }, [makeRequest]);

    const claimAllRewards = useCallback(async (): Promise<any> => {
        return makeRequest('/v1/rewards/claim-all', {
            method: 'POST',
        });
    }, [makeRequest]);

    // Wallet APIs
    const getWalletBalance = useCallback(async (): Promise<WalletBalance> => {
        return makeRequest<WalletBalance>('/v1/wallet/balance');
    }, [makeRequest]);

    const getTransactions = useCallback(async (): Promise<Transaction[]> => {
        return makeRequest<Transaction[]>('/v1/wallet/transactions');
    }, [makeRequest]);

    const withdrawFunds = useCallback(async (amount: number): Promise<any> => {
        return makeRequest('/v1/wallet/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }, [makeRequest]);

    const depositCrypto = useCallback(async (amount: number, currency: string, txHash: string, address: string): Promise<any> => {
        return makeRequest('/v1/wallet/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount, currency, txHash, address }),
        });
    }, [makeRequest]);

    const getDashboardSummary = useCallback(async (): Promise<any> => {
        return makeRequest('/v1/dashboard/summary');
    }, [makeRequest]);

    // Meta APIs
    const getDegenPresets = useCallback(async (): Promise<any[]> => {
        return makeRequest<any[]>('/v1/presets');
    }, [makeRequest]);

    const getTaskCatalog = useCallback(async (): Promise<any> => {
        return makeRequest<any>('/v1/tasks');
    }, [makeRequest]);

    // Profile methods
    const updateProfile = useCallback(async (profileData: any): Promise<any> => {
        return makeRequest('/v1/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }, [makeRequest]);

    // Pack methods
    const getPacks = useCallback(async (): Promise<any[]> => {
        console.log('getPacks: Starting to fetch packs catalog...');
        try {
            const response = await makeRequest<any[]>('/v1/packs');
            console.log('getPacks: Successfully fetched packs:', {
                count: response?.length || 0,
                packs: response
            });
            return response || [];
        } catch (error) {
            console.error('getPacks: Failed to fetch packs:', error);
            throw error;
        }
    }, [makeRequest]);

    const purchasePack = useCallback(async (packId: string): Promise<any> => {
        console.log('purchasePack: Starting purchase for pack:', packId);
        try {
            const clientRequestId = crypto.randomUUID();
            const response = await makeRequest<any>(`/v1/packs/${packId}/purchase`, {
                method: 'POST',
                body: JSON.stringify({ clientRequestId }),
            });
            console.log('purchasePack: Successfully purchased pack:', {
                packId,
                response
            });
            return response;
        } catch (error) {
            console.error('purchasePack: Failed to purchase pack:', error);
            // Convert backend errors to user-friendly messages
            if (error instanceof Error) {
                if (error.message.includes('Insufficient balance')) {
                    throw new Error('Insufficient balance');
                } else if (error.message.includes('Pack not found')) {
                    throw new Error('Pack not available');
                } else if (error.message.includes('already purchased')) {
                    throw new Error('Pack already purchased');
                } else if (error.message.includes('Network error')) {
                    throw new Error('Network error, please retry');
                }
            }
            throw new Error('Purchase failed, please try again');
        }
    }, [makeRequest]);

    const getEntitlements = useCallback(async (): Promise<any[]> => {
        console.log('getEntitlements: Starting to fetch user entitlements...');
        try {
            const response = await makeRequest<any[]>('/v1/entitlements');
            console.log('getEntitlements: Successfully fetched entitlements:', {
                count: response?.length || 0,
                entitlements: response
            });
            return response || [];
        } catch (error) {
            console.error('getEntitlements: Failed to fetch entitlements:', error);
            throw error;
        }
    }, [makeRequest]);

    return {
        loading,
        error,
        makeRequest,
        // Auth methods
        login,
        register,
        logout,
        getCurrentUser,
        getUserProfile,
        // Profile methods
        updateProfile,
        // Mission methods
        createMission,
        getMissions,
        getExpiredMissions,
        getMission,
        getMyMissions,
        // Submission methods
        submitMission,
        submitMissionWithFiles,
        participateInMission,
        completeTask,
        getSubmissions,
        getMissionSubmissions,
        reviewSubmission,
        verifySubmission,
        flagSubmission,
        // File upload methods
        uploadFile,
        // Claim methods
        getClaimableRewards,
        claimReward,
        claimAllRewards,
        // Wallet methods
        getWalletBalance,
        getTransactions,
        withdrawFunds,
        depositCrypto,
        getDashboardSummary,
        // Pack methods
        getPacks,
        purchasePack,
        getEntitlements,
        // Meta methods
        getDegenPresets,
        getTaskCatalog,
    };
}

// Custom hooks for specific features
export function useMissions() {
    const api = useApi();
    const [missions, setMissions] = useState<Mission[]>([]);

    const fetchMissions = useCallback(async () => {
        try {
            console.log('useMissions: Starting to fetch missions...');
            const data = await api.getMissions();
            console.log('useMissions: Received missions data:', {
                data,
                isArray: Array.isArray(data),
                length: data?.length || 0,
                type: typeof data
            });

            // Ensure data is an array
            const missionsArray = Array.isArray(data) ? data : [];
            console.log('useMissions: Processed missions array:', {
                missionsArray,
                length: missionsArray.length,
                firstMission: missionsArray[0]
            });

            setMissions(missionsArray);
            console.log('useMissions: Successfully set missions state');
        } catch (err) {
            console.error('useMissions: Failed to fetch missions:', err);
            // Set empty array on error to prevent undefined issues
            setMissions([]);
        }
    }, [api]);

    const fetchMyMissions = useCallback(async () => {
        try {
            const data = await api.getMyMissions();
            setMissions(data);
        } catch (err) {
            console.error('Failed to fetch my missions:', err);
        }
    }, [api]);

    return {
        missions,
        fetchMissions,
        fetchMyMissions,
        loading: api.loading,
        error: api.error,
    };
}

export function useWallet() {
    const api = useApi();
    const { user } = useAuth();
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const fetchBalance = useCallback(async () => {
        try {
            const data = await makeAuthedRequest('/v1/wallet/summary');
            setBalance({
                honors: data.availableHonors || 0,
                usd: (data.availableHonors || 0) * 0.0022, // Convert to USD
                pendingHonors: 0,
                pendingUsd: 0
            });
        } catch (err) {
            console.error('Failed to fetch wallet balance:', err);
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        try {
            const data = await makeAuthedRequest('/v1/wallet/transactions');
            setTransactions(data);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        }
    }, []);

    // Sequential refresh to prevent race conditions
    const refreshWallet = useCallback(async () => {
        // Sequential refresh – prevents race conditions
        await fetchBalance();
        await fetchTransactions();
    }, [fetchBalance, fetchTransactions]);

    // Auto-fetch when user is authenticated
    useEffect(() => {
        if (user) {
            fetchBalance();
            fetchTransactions();
        }
    }, [user, fetchBalance, fetchTransactions]);

    return {
        balance,
        transactions,
        fetchBalance,
        fetchTransactions,
        refreshWallet,
        withdrawFunds: api.withdrawFunds,
        depositCrypto: api.depositCrypto,
        loading: api.loading,
        error: api.error,
    };
}

export function useDashboardSummary() {
    const api = useApi();
    const { user } = useAuth();
    const [summary, setSummary] = useState<any>(null);

    const fetchSummary = useCallback(async () => {
        try {
            const data = await api.getDashboardSummary();
            setSummary(data);
        } catch (err) {
            console.error('Failed to fetch dashboard summary:', err);
        }
    }, [api]);

    // Auto-fetch when user is authenticated
    useEffect(() => {
        if (user) {
            fetchSummary();
        }
    }, [user, fetchSummary]);

    return {
        summary,
        fetchSummary,
        loading: api.loading,
        error: api.error,
    };
}

export function useSubmissions() {
    const api = useApi();
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const fetchSubmissions = useCallback(async () => {
        try {
            const data = await api.getSubmissions();
            setSubmissions(data);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        }
    }, [api]);

    return {
        submissions,
        fetchSubmissions,
        reviewSubmission: api.reviewSubmission,
        loading: api.loading,
        error: api.error,
    };
}

export function useRewards() {
    const api = useApi();
    const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>([]);

    const fetchClaimableRewards = useCallback(async () => {
        try {
            const data = await api.getClaimableRewards();
            setClaimableRewards(data);
        } catch (err) {
            console.error('Failed to fetch claimable rewards:', err);
        }
    }, [api]);

    return {
        claimableRewards,
        fetchClaimableRewards,
        claimReward: api.claimReward,
        claimAllRewards: api.claimAllRewards,
        loading: api.loading,
        error: api.error,
    };
}

export function usePacks() {
    const api = useApi();
    const { user } = useAuth();
    const [packs, setPacks] = useState<any[]>([]);
    const [entitlements, setEntitlements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingEntitlements, setIsLoadingEntitlements] = useState(false);
    const inFlight = useRef<Promise<any> | null>(null);

    const fetchPacks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getPacks();
            setPacks(data);
        } catch (err) {
            console.error('Failed to fetch packs:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch packs');
        } finally {
            setLoading(false);
        }
    }, [api.getPacks]);

    const fetchEntitlements = useCallback(async (source: 'page_load' | 'visibility' | 'purchase' | 'route' | 'manual' = 'page_load', force = false) => {
        if (inFlight.current && !force) return;
        setIsLoadingEntitlements(true);
        const p = (async () => {
            try {
                const res = await makeAuthedRequest('/v1/entitlements');
                setEntitlements(res?.items ?? []);
            } catch (error) {
                console.error('Failed to fetch entitlements:', error);
                setEntitlements([]);
            } finally {
                setIsLoadingEntitlements(false);
                inFlight.current = null;
            }
        })();
        inFlight.current = p;
        await p;
    }, []); // Empty dependency array to prevent infinite loops

    // Sequential refresh function to prevent race conditions
    const refreshEntitlements = useCallback(async () => {
        try {
            const res = await makeAuthedRequest('/v1/entitlements');
            setEntitlements(res?.items ?? []);
        } catch (error) {
            console.error('Failed to refresh entitlements:', error);
            setEntitlements([]);
        }
    }, []);

    const purchasePack = useCallback(async (packId: string) => {
        try {
            const result = await api.purchasePack(packId);
            // Sequential refresh after successful purchase
            await refreshEntitlements();
            return result;
        } catch (err) {
            console.error('Failed to purchase pack:', err);
            throw err;
        }
    }, [refreshEntitlements]);

    // on auth ready + mount
    useEffect(() => {
        if (user) fetchEntitlements('page_load', true);
    }, [user]); // Remove fetchEntitlements from dependencies to prevent infinite loops

    // on tab focus
    useEffect(() => {
        const onVis = () => document.visibilityState === 'visible' && fetchEntitlements('visibility');
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []); // Empty dependency array to prevent infinite loops

    // Post-purchase refresh function for external use
    const postPurchaseRefresh = useCallback(async () => {
        await refreshEntitlements();
        // Note: wallet summary refresh should be called separately to avoid circular dependencies
    }, [refreshEntitlements]);

    return {
        packs,
        entitlements,
        fetchPacks,
        fetchEntitlements,
        purchasePack,
        refreshEntitlements,
        postPurchaseRefresh,
        isLoadingEntitlements,
        loading,
        error,
    };
}

// ---- Packs API Functions ----
export async function apiGetPacks(): Promise<Pack[]> {
    const res = await fetch(`${API_BASE_FOR_PACKS}/v1/packs`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load packs');
    return res.json();
}

export async function apiGetEntitlements(): Promise<{ items: Entitlement[] }> {
    // Get the current user's auth token
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const res = await fetch(`${API_BASE_FOR_PACKS}/v1/entitlements`, {
        cache: 'no-store',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Failed to load entitlements');
    return res.json();
}

// start an onchain purchase; backend returns { txRequest } or { checkoutUrl }
export async function apiStartPurchase(packId: string, chainId?: number) {
    const res = await fetch(`${API_BASE_FOR_PACKS}/v1/packs/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ packId, method: 'onchain', chainId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<{ txRequest?: any; txId?: string }>;
}

export async function apiPaymentStatus(txId: string) {
    const res = await fetch(`${API_BASE_FOR_PACKS}/v1/payments/status/${txId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to check payment');
    return res.json();
}

export async function apiEthUsd() {
    const res = await fetch(`${API_BASE_FOR_PACKS}/v1/prices/ethusd`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load price');
    return res.json() as Promise<{ price: number }>;
}
