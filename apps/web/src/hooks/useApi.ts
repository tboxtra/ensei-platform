import { useState, useCallback } from 'react';

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
    platform: string;
    type: string;
    model: 'fixed' | 'degen';
    title: string;
    description: string;
    status: 'active' | 'completed' | 'cancelled';
    participants: number;
    maxParticipants: number;
    reward: number;
    totalCost: number;
    endsAt: string;
    tasks: string[];
    submissions: number;
    createdAt: string;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const makeRequest = useCallback(async <T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
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

    // Mission APIs
    const createMission = useCallback(async (missionData: CreateMissionRequest): Promise<Mission> => {
        return makeRequest<Mission>('/v1/missions', {
            method: 'POST',
            body: JSON.stringify(missionData),
        });
    }, [makeRequest]);

    const getMissions = useCallback(async (): Promise<Mission[]> => {
        return makeRequest<Mission[]>('/v1/missions');
    }, [makeRequest]);

    const getMission = useCallback(async (id: string): Promise<Mission> => {
        return makeRequest<Mission>(`/v1/missions/${id}`);
    }, [makeRequest]);

    const getMyMissions = useCallback(async (): Promise<Mission[]> => {
        return makeRequest<Mission[]>('/v1/missions/my');
    }, [makeRequest]);

    // Submission APIs
    const submitMission = useCallback(async (missionId: string, submissionData: any): Promise<any> => {
        return makeRequest(`/v1/missions/${missionId}/submit`, {
            method: 'POST',
            body: JSON.stringify(submissionData),
        });
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
        return makeRequest<any[]>('/v1/meta/degen-presets');
    }, [makeRequest]);

    const getTaskCatalog = useCallback(async (): Promise<any> => {
        return makeRequest<any>('/v1/meta/task-catalog');
    }, [makeRequest]);

    return {
        loading,
        error,
        // Mission methods
        createMission,
        getMissions,
        getMission,
        getMyMissions,
        // Submission methods
        submitMission,
        getSubmissions,
        reviewSubmission,
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
            const data = await api.getMissions();
            setMissions(data);
        } catch (err) {
            console.error('Failed to fetch missions:', err);
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
