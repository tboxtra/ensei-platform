import type { Platform, MissionType, MissionModel } from './missions';
export type TargetProfile = 'all' | 'premium';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type UserRole = 'user' | 'creator' | 'admin' | 'moderator';
export type MissionStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'disputed';
export type LedgerEntryType = 'mission_creation' | 'mission_reward' | 'withdrawal' | 'refund' | 'bonus' | 'penalty';
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export interface User {
    id: string;
    wallet_address: string;
    username?: string;
    email?: string;
    avatar_url?: string;
    bio?: string;
    status: UserStatus;
    role: UserRole;
    is_premium: boolean;
    total_earned_honors: number;
    total_spent_honors: number;
    missions_created: number;
    missions_completed: number;
    created_at: Date;
    updated_at: Date;
    last_active_at: Date;
    twitter_handle?: string;
    instagram_handle?: string;
    tiktok_handle?: string;
    facebook_handle?: string;
    telegram_username?: string;
    email_verified: boolean;
    phone_verified: boolean;
    kyc_verified: boolean;
    notification_preferences: NotificationPreferences;
    privacy_settings: PrivacySettings;
}
export interface Mission {
    id: string;
    creator_id: string;
    platform: Platform;
    type: MissionType;
    model: MissionModel;
    title: string;
    description?: string;
    tasks: MissionTask[];
    premium: boolean;
    target_profile: TargetProfile;
    cap?: number;
    rewards_per_user?: number;
    duration_hours?: number;
    winners_cap?: number;
    total_cost_usd?: number;
    user_pool_honors?: number;
    per_winner_honors?: number;
    status: MissionStatus;
    created_at: Date;
    updated_at: Date;
    expires_at: Date;
    started_at?: Date;
    completed_at?: Date;
    submissions_count: number;
    approved_count: number;
    rejected_count: number;
    total_rewards_distributed: number;
    platform_data?: Record<string, any>;
    creator?: User;
}
export interface MissionTask {
    id: string;
    mission_id: string;
    task_type: string;
    task_name: string;
    task_description: string;
    base_honors: number;
    proof_requirements: ProofRequirement[];
    created_at: Date;
    mission?: Mission;
}
export interface ProofRequirement {
    type: 'image' | 'video' | 'text' | 'url' | 'screenshot';
    required: boolean;
    max_size_mb?: number;
    allowed_formats?: string[];
    validation_rules?: Record<string, any>;
}
export interface Submission {
    id: string;
    mission_id: string;
    user_id: string;
    status: SubmissionStatus;
    submitted_at: Date;
    reviewed_at?: Date;
    reviewer_id?: string;
    rejection_reason?: string;
    proofs: Proof[];
    earned_honors: number;
    paid_at?: Date;
    mission?: Mission;
    user?: User;
    reviewer?: User;
}
export interface Proof {
    id: string;
    submission_id: string;
    task_id: string;
    type: 'image' | 'video' | 'text' | 'url';
    content: string;
    metadata?: Record<string, any>;
    verification_score?: number;
    verified_at?: Date;
    ai_verification_result?: AIVerificationResult;
    created_at: Date;
    submission?: Submission;
    task?: MissionTask;
}
export interface AIVerificationResult {
    score: number;
    confidence: number;
    is_valid: boolean;
    feedback?: string;
    flagged_reasons?: string[];
    processed_at: Date;
}
export interface LedgerEntry {
    id: string;
    user_id: string;
    type: LedgerEntryType;
    amount_honors: number;
    balance_before: number;
    balance_after: number;
    reference_id?: string;
    reference_type?: string;
    description: string;
    metadata?: Record<string, any>;
    created_at: Date;
    user?: User;
}
export interface Withdrawal {
    id: string;
    user_id: string;
    amount_honors: number;
    amount_usd: number;
    ton_address: string;
    status: WithdrawalStatus;
    tx_hash?: string;
    created_at: Date;
    processed_at?: Date;
    failed_at?: Date;
    failure_reason?: string;
    user?: User;
}
export interface NotificationPreferences {
    email: {
        mission_updates: boolean;
        reward_notifications: boolean;
        security_alerts: boolean;
        marketing: boolean;
    };
    push: {
        mission_updates: boolean;
        reward_notifications: boolean;
        security_alerts: boolean;
    };
    telegram: {
        enabled: boolean;
        mission_updates: boolean;
        reward_notifications: boolean;
    };
}
export interface PrivacySettings {
    profile_visibility: 'public' | 'private' | 'friends_only';
    show_earnings: boolean;
    show_missions: boolean;
    allow_analytics: boolean;
    allow_marketing: boolean;
}
export interface UserMissionStats {
    user_id: string;
    total_missions_created: number;
    total_missions_completed: number;
    total_earned_honors: number;
    total_spent_honors: number;
    average_rating: number;
    last_mission_at?: Date;
}
export interface PlatformStats {
    platform: Platform;
    total_missions: number;
    active_missions: number;
    total_submissions: number;
    total_rewards_distributed: number;
    average_completion_rate: number;
    last_updated: Date;
}
