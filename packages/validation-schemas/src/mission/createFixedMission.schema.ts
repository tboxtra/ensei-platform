import { z } from 'zod';
import type { Platform, MissionType, TaskType } from '@ensei/shared-types';
import { PLATFORM_TASKS } from '@ensei/shared-types';
import { DEGEN_PRESETS } from '@ensei/shared-types';

// Base schemas
export const PlatformSchema = z.enum(['twitter', 'instagram', 'tiktok', 'facebook', 'whatsapp', 'snapchat', 'telegram']);
export const MissionTypeSchema = z.enum(['engage', 'content', 'ambassador']);
export const TargetProfileSchema = z.enum(['all', 'premium']);

// Task type schemas for each platform and mission type
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

const CustomTasks = {
    engage: ['custom_task'] as const,
    content: ['custom_task'] as const,
    ambassador: ['custom_task'] as const
};

// Platform task mapping
const PlatformTaskMap: Record<Platform, Record<MissionType, readonly string[]>> = {
    twitter: TwitterTasks,
    instagram: InstagramTasks,
    tiktok: TikTokTasks,
    facebook: FacebookTasks,
    whatsapp: WhatsAppTasks,
    snapchat: SnapchatTasks,
    telegram: TelegramTasks,
    custom: CustomTasks
};

// Dynamic task schema based on platform and type
function createTaskSchema(platform: Platform, type: MissionType) {
    const validTasks = PlatformTaskMap[platform]?.[type] || [];
    return z.enum(validTasks as [string, ...string[]]);
}

// Create Fixed Mission Schema
export const CreateFixedMissionSchema = z.object({
    // Required fields
    platform: PlatformSchema,
    type: MissionTypeSchema,
    target: TargetProfileSchema,
    cap: z.number().int().min(60, 'Cap must be at least 60').max(10000, 'Cap cannot exceed 10,000'),
    tasks: z.array(z.string()).min(1, 'At least one task is required'),

    // Optional fields
    rewardsPerUserHonors: z.number().positive('Rewards must be positive').optional(),

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
    // Validate that tasks are valid for the selected platform and type
    const validTasks = PlatformTaskMap[data.platform]?.[data.type] || [];
    return data.tasks.every(task => validTasks.includes(task as any));
}, {
    message: 'Invalid tasks for selected platform and mission type',
    path: ['tasks']
}).refine((data) => {
    // Validate that at least one task is provided
    return data.tasks.length > 0;
}, {
    message: 'At least one task is required',
    path: ['tasks']
});

// Type exports
export type CreateFixedMissionRequest = z.infer<typeof CreateFixedMissionSchema>;
export type CreateFixedMissionInput = z.input<typeof CreateFixedMissionSchema>;
export type CreateFixedMissionOutput = z.output<typeof CreateFixedMissionSchema>;

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
    const validTasks = getValidTasks(platform, type);
    return tasks.every(task => validTasks.includes(task));
}
