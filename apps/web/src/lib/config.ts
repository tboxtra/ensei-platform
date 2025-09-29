// Centralized configuration for the entire platform
// This should be the single source of truth for all pricing and configuration

export interface SystemConfig {
    pricing: {
        honorsPerUsd: number;
        premiumMultiplier: number;
        platformFeeRate: number;
        taskPrices: Record<string, number>;
    };
    limits: {
        maxMissionsPerUser: number;
        maxSubmissionsPerMission: number;
        maxTasksPerDegenMission: number;
    };
    features: {
        maintenanceMode: boolean;
        enablePremiumMultiplier: boolean;
    };
}

// Default configuration (fallback if system config is not available)
export const DEFAULT_CONFIG: SystemConfig = {
    pricing: {
        honorsPerUsd: 450,
        premiumMultiplier: 5,
        platformFeeRate: 0.25,
        taskPrices: {
            // Twitter tasks
            like: 50,
            retweet: 100,
            comment: 150,
            quote: 200,
            follow: 250,
            meme: 300,
            thread: 500,
            article: 400,
            videoreview: 600,
            pfp: 250,
            name_bio_keywords: 200,
            pinned_tweet: 300,
            poll: 150,
            spaces: 800,
            community_raid: 400,
            status_50_views: 300,

            // Instagram tasks
            like_instagram: 50,
            comment_instagram: 150,
            follow_instagram: 250,
            story_instagram: 200,
            post_instagram: 400,

            // TikTok tasks
            like_tiktok: 50,
            comment_tiktok: 150,
            follow_tiktok: 250,
            share_tiktok: 200,

            // Facebook tasks
            like_facebook: 50,
            comment_facebook: 150,
            share_facebook: 200,
            follow_facebook: 250,

            // WhatsApp tasks
            join_whatsapp: 100,
            share_whatsapp: 150,

            // Custom tasks
            custom: 100
        }
    },
    limits: {
        maxMissionsPerUser: 20,
        maxSubmissionsPerMission: 500,
        maxTasksPerDegenMission: 3
    },
    features: {
        maintenanceMode: false,
        enablePremiumMultiplier: true
    }
};

// Global config instance
let globalConfig: SystemConfig = DEFAULT_CONFIG;

// Configuration management functions
export const getConfig = (): SystemConfig => globalConfig;

export const setConfig = (config: SystemConfig): void => {
    globalConfig = config;
};

export const updateConfig = (updates: Partial<SystemConfig>): void => {
    globalConfig = { ...globalConfig, ...updates };
};

// Helper functions for common operations
export const getTaskPrice = (taskId: string): number => {
    return globalConfig.pricing.taskPrices[taskId] || 0;
};

export const calculateTaskReward = (taskId: string, isPremium: boolean = false): number => {
    const basePrice = getTaskPrice(taskId);
    return isPremium ? basePrice * globalConfig.pricing.premiumMultiplier : basePrice;
};

export const calculateTotalReward = (tasks: string[], isPremium: boolean = false): number => {
    return tasks.reduce((total, taskId) => total + calculateTaskReward(taskId, isPremium), 0);
};

export const honorsToUsd = (honors: number): number => {
    return honors / globalConfig.pricing.honorsPerUsd;
};

export const usdToHonors = (usd: number): number => {
    return usd * globalConfig.pricing.honorsPerUsd;
};

// Standardized field names
export const FIELD_NAMES = {
    // Mission fields
    MISSION_ID: 'id',
    MISSION_TITLE: 'title',
    MISSION_PLATFORM: 'platform',
    MISSION_MODEL: 'model',
    MISSION_TYPE: 'type',
    MISSION_STATUS: 'status',
    MISSION_CREATED_BY: 'created_by',
    MISSION_CREATED_AT: 'created_at',
    MISSION_UPDATED_AT: 'updated_at',
    MISSION_DEADLINE: 'deadline',
    MISSION_EXPIRES_AT: 'expires_at',
    MISSION_CONTENT_LINK: 'contentLink',
    MISSION_TWEET_LINK: 'tweetLink',
    MISSION_INSTRUCTIONS: 'instructions',
    MISSION_TASKS: 'tasks',
    MISSION_CAP: 'cap',
    MISSION_MAX_PARTICIPANTS: 'max_participants',
    MISSION_WINNERS_CAP: 'winners_cap',
    MISSION_DURATION_HOURS: 'duration_hours',
    MISSION_REWARD_PER_USER: 'rewardPerUser',
    MISSION_IS_PREMIUM: 'isPremium',
    MISSION_REWARDS: 'rewards',
    MISSION_WINNERS_PER_TASK: 'winnersPerTask',
    MISSION_WINNERS_PER_MISSION: 'winnersPerMission', // ✅ add this

    // User fields
    USER_ID: 'id',
    USER_NAME: 'name',
    USER_EMAIL: 'email',
    USER_CREATED_AT: 'created_at',
    USER_UPDATED_AT: 'updated_at',

    // Submission fields
    SUBMISSION_ID: 'id',
    SUBMISSION_USER_ID: 'user_id',
    SUBMISSION_MISSION_ID: 'mission_id',
    SUBMISSION_STATUS: 'status',
    SUBMISSION_CREATED_AT: 'created_at',
    SUBMISSION_UPDATED_AT: 'updated_at'
} as const;

// Standardized status values
export const STATUS_VALUES = {
    PENDING: 'pending',
    SUBMITTED: 'submitted',
    VERIFIED: 'verified',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    ACTIVE: 'active',
    PAUSED: 'paused',
    EXPIRED: 'expired'
} as const;

// Status normalization function
export const normalizeStatus = (status: any): string => {
    if (!status) return STATUS_VALUES.PENDING;

    const statusStr = String(status).toLowerCase();

    // Map legacy statuses to standard ones
    const legacyMap: Record<string, string> = {
        'verified': STATUS_VALUES.VERIFIED,
        'VERIFIED': STATUS_VALUES.VERIFIED,
        'approved': STATUS_VALUES.APPROVED,
        'APPROVED': STATUS_VALUES.APPROVED,
        'completed': STATUS_VALUES.COMPLETED,
        'COMPLETED': STATUS_VALUES.COMPLETED,
        'active': STATUS_VALUES.ACTIVE,
        'ACTIVE': STATUS_VALUES.ACTIVE,
        'paused': STATUS_VALUES.PAUSED,
        'PAUSED': STATUS_VALUES.PAUSED,
        'expired': STATUS_VALUES.EXPIRED,
        'EXPIRED': STATUS_VALUES.EXPIRED,
        'pending': STATUS_VALUES.PENDING,
        'PENDING': STATUS_VALUES.PENDING,
        'submitted': STATUS_VALUES.SUBMITTED,
        'SUBMITTED': STATUS_VALUES.SUBMITTED,
        'rejected': STATUS_VALUES.REJECTED,
        'REJECTED': STATUS_VALUES.REJECTED
    };

    return legacyMap[statusStr] || statusStr;
};

// Field normalization functions
export const normalizeMissionData = (data: any): any => {
    const normalized = { ...data };

    // Duration field normalization
    if (normalized.durationHours && !normalized.duration_hours) {
        normalized.duration_hours = normalized.durationHours;
    }
    if (normalized.duration && !normalized.duration_hours) {
        normalized.duration_hours = normalized.duration;
    }

    // Cap field normalization
    if (normalized.cap && !normalized.max_participants) {
        normalized.max_participants = normalized.cap;
    }
    if (normalized.winnersCap && !normalized.winners_cap) {
        normalized.winners_cap = normalized.winnersCap;
    }

    // Timestamp normalization
    if (normalized.createdAt && !normalized.created_at) {
        normalized.created_at = normalized.createdAt;
    }
    if (normalized.updatedAt && !normalized.updated_at) {
        normalized.updated_at = normalized.updatedAt;
    }

    // Content link normalization
    if (normalized.tweetLink && !normalized.contentLink) {
        normalized.contentLink = normalized.tweetLink;
    }
    if (normalized.link && !normalized.contentLink) {
        normalized.contentLink = normalized.link;
    }
    if (normalized.url && !normalized.contentLink) {
        normalized.contentLink = normalized.url;
    }
    if (normalized.postUrl && !normalized.contentLink) {
        normalized.contentLink = normalized.postUrl;
    }

    // ✅ Winners normalization (canonical mission-wide winners)
    if (normalized.winnersPerMission == null) {
        normalized.winnersPerMission =
            normalized.winnersPerMission ??
            normalized.winners_cap ??
            normalized.winnersCap ??
            normalized.winnersPerTask ??
            null;
    }

    // Status normalization
    if (normalized.status) {
        normalized.status = normalizeStatus(normalized.status);
    }

    return normalized;
};

// Response serialization function
export const serializeMissionResponse = (data: any): any => ({
    ...data,
    durationHours: data.duration_hours || data.durationHours || data.duration,
    maxParticipants: data.max_participants || data.maxParticipants || data.cap,
    winnersCap: data.winners_cap || data.winnersCap,
    winnersPerMission: data.winnersPerMission || data.winners_cap || data.winnersCap || data.winnersPerTask,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    deadline: data.deadline,
    expiresAt: data.expires_at,
    // ✅ add canonical fields for components that use startAt/endAt
    startAt: data.startAt || data.created_at,
    endAt: data.endAt || data.deadline || data.expires_at,
    contentLink: data.contentLink || data.tweetLink || data.link || data.url || data.postUrl,
});
