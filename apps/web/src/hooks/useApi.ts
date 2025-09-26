import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/UserAuthContext';

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
    submissions?: number;
    duration_hours?: number;
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
}

interface Transaction {
    id: string;
    type: 'earned' | 'withdrawn' | 'pending';
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
            const missions = await makeRequest<Mission[]>('/v1/missions');
            console.log('getMissions: Successfully fetched missions:', {
                count: missions?.length || 0,
                missions: missions
            });
            return missions || [];
        } catch (error) {
            console.error('getMissions: Failed to fetch missions:', error);
            throw error;
        }
    }, [makeRequest]);

    const getMission = useCallback(async (id: string): Promise<Mission> => {
        return makeRequest<Mission>(`/v1/missions/${id}`);
    }, [makeRequest]);

    const getMyMissions = useCallback(async (): Promise<Mission[]> => {
        console.log('getMyMissions: Starting to fetch user missions...');

        // This endpoint doesn't exist, so we'll get all missions and filter on frontend
        const allMissions = await makeRequest<Mission[]>('/v1/missions');
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
        const tryJson = async (url: string) => {
            const res = await makeRequest<any[]>(url);
            return Array.isArray(res) ? res : [];
        };

        // 1) canonical
        try { return await tryJson(`/v1/missions/${missionId}/submissions`); } catch (e: any) {
            // 2) common alternates
            const q = encodeURIComponent(missionId);
            const candidates = [
                `/v1/submissions?missionId=${q}`,
                `/v1/submissions?mission_id=${q}`,
                `/v1/submissions?mission=${q}`,
                `/v1/submissions/by-mission/${missionId}`,
                `/v1/submissions/mission/${missionId}`,
            ];
            for (const url of candidates) {
                try { return await tryJson(url); } catch { }
            }
            throw e;
        }
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
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const fetchBalance = useCallback(async () => {
        try {
            const data = await api.getWalletBalance();
            setBalance(data);
        } catch (err) {
            console.error('Failed to fetch wallet balance:', err);
        }
    }, [api]);

    const fetchTransactions = useCallback(async () => {
        try {
            const data = await api.getTransactions();
            setTransactions(data);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        }
    }, [api]);

    return {
        balance,
        transactions,
        fetchBalance,
        fetchTransactions,
        withdrawFunds: api.withdrawFunds,
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
