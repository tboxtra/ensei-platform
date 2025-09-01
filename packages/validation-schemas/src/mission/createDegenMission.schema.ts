import { z } from 'zod';
import type { Platform, MissionType } from '@ensei/shared-types';
import { DEGEN_PRESETS, getDegenPresetByHours, PLATFORM_TASKS } from '@ensei/shared-types';

// Base schemas (re-exported from createFixedMission for consistency)
export const PlatformSchema = z.enum(['twitter', 'instagram', 'tiktok', 'facebook', 'whatsapp', 'snapchat', 'telegram']);
export const MissionTypeSchema = z.enum(['engage', 'content', 'ambassador']);
export const TargetProfileSchema = z.enum(['all', 'premium']);

// Task type schemas for each platform and mission type (same as fixed mission)
const TwitterTasks = {
    engage: ['like', 'retweet', 'comment', 'quote'] as const,
    content: ['meme', 'thread', 'article', 'videoreview'] as const,
    ambassador: ['pfp', 'name_bio_keywords', 'pinned_tweet', 'poll', 'spaces', 'community_raid'] as const
};

const InstagramTasks = {
    engage: ['like', 'comment', 'follow', 'story_repost'] as const,
    content: ['feed_post', 'reel', 'carousel', 'meme'] as const,
    ambassador: ['pfp', 'hashtag_in_bio', 'story_highlight'] as const
};

const TikTokTasks = {
    engage: ['like', 'comment', 'repost_duet', 'follow'] as const,
    content: ['skit', 'challenge', 'product_review', 'status_style'] as const,
    ambassador: ['pfp', 'hashtag_in_bio', 'pinned_branded_video'] as const
};

const FacebookTasks = {
    engage: ['like', 'comment', 'follow', 'share_post'] as const,
    content: ['group_post', 'video', 'meme_flyer'] as const,
    ambassador: ['pfp', 'bio_keyword', 'pinned_post'] as const
};

const WhatsAppTasks = {
    engage: ['status_50_views'] as const,
    content: ['flyer_clip_status', 'broadcast_message'] as const,
    ambassador: ['pfp', 'keyword_in_about'] as const
};

const SnapchatTasks = {
    engage: ['story_100_views', 'snap_repost'] as const,
    content: ['story_highlight'] as const,
    ambassador: ['pfp', 'story_highlight'] as const
};

const TelegramTasks = {
    engage: ['channel_post', 'group_message'] as const,
    content: ['channel_join', 'group_join'] as const,
    ambassador: ['channel_join', 'group_join'] as const
};

// Platform task mapping
const PlatformTaskMap: Record<Platform, Record<MissionType, readonly string[]>> = {
    twitter: TwitterTasks,
    instagram: InstagramTasks,
    tiktok: TikTokTasks,
    facebook: FacebookTasks,
    whatsapp: WhatsAppTasks,
    snapchat: SnapchatTasks,
    telegram: TelegramTasks
};

// Create Degen Mission Schema
export const CreateDegenMissionSchema = z.object({
    // Required fields
    platform: PlatformSchema,
    type: MissionTypeSchema,
    target: TargetProfileSchema,
    durationHours: z.number().int().refine((hours) => {
        // Must be one of the preset durations
        return DEGEN_PRESETS.some(preset => preset.hours === hours);
    }, {
        message: 'Duration must be one of the valid preset durations',
        params: {
            validDurations: DEGEN_PRESETS.map(p => p.hours)
        }
    }),
    winnersCap: z.number().int().min(1, 'Winners cap must be at least 1').refine((cap) => {
        // Get the preset for the duration to validate max winners
        const preset = getDegenPresetByHours(cap);
        if (!preset) return false;
        return cap <= preset.maxWinners;
    }, {
        message: 'Winners cap exceeds maximum for selected duration',
        params: {
            maxWinners: (data: any) => {
                const preset = getDegenPresetByHours(data.durationHours);
                return preset?.maxWinners || 1;
            }
        }
    }),

    // Tasks can be empty for degen missions (pricing is duration-based)
    tasks: z.array(z.string()).default([]),

    // Additional metadata
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
    premium: z.boolean().default(false),

    // Platform-specific fields
    tweetUrl: z.string().url('Invalid URL format').optional(),
    telegramInvite: z.string().optional(),
    brief: z.string().max(1000, 'Brief cannot exceed 1000 characters').optional(),
    instructions: z.string().max(2000, 'Instructions cannot exceed 2000 characters').optional()
}).refine((data) => {
    // Validate that tasks are valid for the selected platform and type (if provided)
    if (data.tasks.length === 0) return true; // Empty tasks are allowed for degen
    const validTasks = PlatformTaskMap[data.platform]?.[data.type] || [];
    return data.tasks.every(task => validTasks.includes(task as any));
}, {
    message: 'Invalid tasks for selected platform and mission type',
    path: ['tasks']
}).refine((data) => {
    // Validate winners cap against duration preset
    const preset = getDegenPresetByHours(data.durationHours);
    if (!preset) return false;
    return data.winnersCap <= preset.maxWinners;
}, {
    message: 'Winners cap exceeds maximum for selected duration',
    path: ['winnersCap']
});

// Type exports
export type CreateDegenMissionRequest = z.infer<typeof CreateDegenMissionSchema>;
export type CreateDegenMissionInput = z.input<typeof CreateDegenMissionSchema>;
export type CreateDegenMissionOutput = z.output<typeof CreateDegenMissionSchema>;

// Helper function to get valid tasks for a platform and type
export function getValidTasks(platform: Platform, type: MissionType): string[] {
    const platformTasks = PLATFORM_TASKS[platform];
    if (!platformTasks) return [];

    const missionTypeTasks = platformTasks[type];
    if (!missionTypeTasks) return [];

    return missionTypeTasks.map(task => task.key);
}

// Helper function to validate tasks
export function validateTasks(platform: Platform, type: MissionType, tasks: string[]): boolean {
    if (tasks.length === 0) return true; // Empty tasks are allowed for degen
    const validTasks = getValidTasks(platform, type);
    return tasks.every(task => validTasks.includes(task));
}

// Helper function to get max winners for a duration
export function getMaxWinnersForDuration(durationHours: number): number {
    const preset = getDegenPresetByHours(durationHours);
    return preset?.maxWinners || 1;
}

// Helper function to validate winners cap
export function validateWinnersCap(durationHours: number, winnersCap: number): boolean {
    const maxWinners = getMaxWinnersForDuration(durationHours);
    return winnersCap >= 1 && winnersCap <= maxWinners;
}
