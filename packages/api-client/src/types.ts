import type { Platform, MissionType, MissionModel, TargetProfile, TaskType } from '@ensei/shared-types';

// Mission Creation Types
export interface CreateFixedMissionRequest {
    model: 'fixed';
    platform: Platform;
    type: MissionType;
    target: TargetProfile;
    cap: number;
    tasks: TaskType[];
}

export interface CreateDegenMissionRequest {
    model: 'degen';
    platform: Platform;
    type: MissionType;
    target: TargetProfile;
    durationHours: number;
    winnersCap: number;
    tasks: TaskType[];
}

export type CreateMissionRequest = CreateFixedMissionRequest | CreateDegenMissionRequest;

// Mission Response Types
export interface FixedMissionResponse {
    id: string;
    model: 'fixed';
    total_cost_usd: number;
    total_cost_honors: number;
    per_user_honors: number;
}

export interface DegenMissionResponse {
    id: string;
    model: 'degen';
    total_cost_usd: number;
    total_cost_honors: number;
    user_pool_honors: number;
    per_winner_honors: number;
}

export type MissionResponse = FixedMissionResponse | DegenMissionResponse;

// Mission List Types
export interface Mission {
    id: string;
    creator_id: string;
    title: string;
    description?: string;
    platform: Platform;
    mission_type: MissionType;
    mission_model: MissionModel;
    target_profile: TargetProfile;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
    created_at: string;
}

export interface MissionListResponse {
    missions: Mission[];
}

// Submission Types
export interface Proof {
    type: 'screenshot' | 'video' | 'link';
    content: string;
}

export interface CreateSubmissionRequest {
    userId: string;
    proofs: Proof[];
}

export interface SubmissionResponse {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

// Review Types
export interface ReviewDecisionRequest {
    action: 'approve' | 'reject';
    reviewerId: string;
    reason?: string;
}

export interface ReviewResponse {
    id: string;
    status: 'approve' | 'reject';
    reviewed_at: string;
}

// Degen Preset Types
export interface DegenPreset {
    hours: number;
    costUSD: number;
    maxWinners: number;
    label: string;
}

export interface DegenPresetsResponse {
    presets: DegenPreset[];
}

// Payment Types
export interface FundMissionRequest {
    missionId: string;
    amount: number;
}

export interface FundingReceiptResponse {
    id: string;
    amount: number;
    honorsAmount: number;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: string;
    txHash?: string;
}

export interface WithdrawalRequest {
    userId: string;
    honorsAmount: number;
}

export interface WithdrawalResponse {
    id: string;
    userId: string;
    honorsAmount: number;
    usdAmount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    completedAt?: string;
    txHash?: string;
}

export interface UserWithdrawalsResponse {
    userId: string;
    withdrawals: WithdrawalResponse[];
}

// Conversion Types
export interface ConvertHonorsToUsdRequest {
    honors: number;
}

export interface ConvertHonorsToUsdResponse {
    honors: number;
    usd: number;
    formatted: string;
}

export interface ConvertUsdToHonorsRequest {
    usd: number;
}

export interface ConvertUsdToHonorsResponse {
    usd: number;
    honors: number;
    formatted: string;
}

// Error Types
export interface ErrorResponse {
    error: string;
}

// API Client Configuration
export interface ApiClientConfig {
    baseUrl: string;
    timeout?: number;
    headers?: Record<string, string>;
}

// Refund Types
export interface RefundRequest {
    reason: 'incomplete' | 'cancelled' | 'expired' | 'manual';
    requestedBy: string;
    notes?: string;
}

export interface RefundResponse {
    missionId: string;
    model: 'fixed' | 'degen';
    totalRefundHonors: number;
    totalRefundUsd: number;
    reason: string;
    breakdown: {
        unusedSlots?: number;
        unusedTimeHours?: number;
        timeRemainingPercentage?: number;
        baseRefund: number;
        platformFeeRefund: number;
    };
}

// Telegram Types
export interface TelegramProofValidationRequest {
    proofType: 'join_channel' | 'react_to_post' | 'reply_in_group' | 'share_invite' | 'channel_post';
    channelId: string;
    messageId?: string;
    inviteLink?: string;
    screenshot?: string;
    telegramUsername?: string;
}

export interface TelegramProofValidationResponse {
    isValid: boolean;
    errors: string[];
    validationData?: Record<string, any>;
}

export interface TelegramChannelResponse {
    channelId: string;
    channelName: string;
    channelUsername?: string;
    memberCount?: number;
    isVerified: boolean;
    inviteLink?: string;
}
