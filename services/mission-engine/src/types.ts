// Basic types for mission engine
export type Platform = 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'snapchat' | 'telegram' | 'custom';
export type MissionType = 'engage' | 'content' | 'ambassador';
export type MissionModel = 'fixed' | 'degen';
export type TargetProfile = 'all' | 'premium';
export type TaskType = string; // Simplified for now - will be properly typed later
export type DegenDurationPreset = {
    hours: number;
    costUSD: number;
    maxWinners: number;
    label: string;
};

// Engine-specific types
export interface MissionPricingRequest {
    platform: Platform;
    type: MissionType;
    model: MissionModel;
    target: TargetProfile;
    tasks: TaskType[];
    cap?: number; // For fixed missions
    durationHours?: number; // For degen missions
    winnersCap?: number; // For degen missions
}

export interface MissionPricingResponse {
    model: MissionModel;
    totalCostUsd: number;
    totalCostHonors: number;
    perUserHonors?: number; // For fixed missions
    userPoolHonors?: number; // For degen missions
    perWinnerHonors?: number; // For degen missions
    breakdown: {
        tasksHonors: number;
        platformFee: number;
        premiumMultiplier?: number;
    };
}

export interface TaskValidationResult {
    isValid: boolean;
    availableTasks: TaskType[];
    invalidTasks: TaskType[];
    totalHonors: number;
}

export interface DegenPresetValidationResult {
    isValid: boolean;
    preset?: DegenDurationPreset;
    maxWinners: number;
    error?: string;
}
