import type { Platform, MissionType, TaskType } from '../types';

// Task honors mapping for each platform and mission type
export const TASK_CATALOG: Record<Platform, Record<MissionType, Partial<Record<TaskType, number>>>> = {
    twitter: {
        engage: {
            like: 20,
            retweet: 300,
            comment: 200,
            quote: 700
        },
        content: {
            meme: 700,
            thread: 1800,
            article: 2400,
            videoreview: 3600
        },
        ambassador: {
            pfp: 400,
            name_bio_keywords: 600,
            pinned_tweet: 800,
            poll: 900,
            spaces: 1800,
            community_raid: 1200
        }
    },
    instagram: {
        engage: {
            like: 30,
            comment: 220,
            follow: 250,
            story_repost: 350
        },
        content: {
            feed_post: 700,
            reel: 3600,
            carousel: 1600,
            meme: 700
        },
        ambassador: {
            pfp: 400,
            hashtag_in_bio: 600,
            story_highlight: 800
        }
    },
    tiktok: {
        engage: {
            like: 25,
            comment: 200,
            repost_duet: 350,
            follow: 250
        },
        content: {
            skit: 3600,
            challenge: 3600,
            product_review: 2400,
            status_style: 700
        },
        ambassador: {
            pfp: 400,
            hashtag_in_bio: 600,
            pinned_branded_video: 1200
        }
    },
    facebook: {
        engage: {
            like: 20,
            comment: 180,
            follow: 200,
            share_post: 300
        },
        content: {
            group_post: 700,
            video: 2400,
            meme_flyer: 700
        },
        ambassador: {
            pfp: 400,
            bio_keyword: 600,
            pinned_post: 800
        }
    },
    whatsapp: {
        engage: {
            status_50_views: 600
        },
        content: {
            flyer_clip_status: 900,
            broadcast_message: 1200
        },
        ambassador: {
            pfp: 400,
            keyword_in_about: 600
        }
    },
    snapchat: {
        engage: {
            story_100_views: 800,
            snap_repost: 400
        },
        content: {
            story_highlight: 600
        },
        ambassador: {
            pfp: 400,
            story_highlight: 600
        }
    },
    telegram: {
        engage: {
            channel_post: 300,
            group_message: 200
        },
        content: {
            channel_join: 400,
            group_join: 300
        },
        ambassador: {
            channel_join: 400,
            group_join: 300
        }
    }
};

/**
 * Get task honors for a specific platform, mission type, and task
 * @param platform - The platform
 * @param type - The mission type
 * @param task - The task type
 * @returns Honors value for the task, or 0 if not found
 */
export function getTaskHonors(platform: Platform, type: MissionType, task: TaskType): number {
    return TASK_CATALOG[platform]?.[type]?.[task] ?? 0;
}

/**
 * Get all available tasks for a platform and mission type
 * @param platform - The platform
 * @param type - The mission type
 * @returns Array of available task types
 */
export function getAvailableTasks(platform: Platform, type: MissionType): TaskType[] {
    const tasks = TASK_CATALOG[platform]?.[type];
    return tasks ? Object.keys(tasks) as TaskType[] : [];
}

/**
 * Calculate total honors for a list of tasks
 * @param platform - The platform
 * @param type - The mission type
 * @param tasks - Array of task types
 * @returns Total honors value
 */
export function calculateTasksHonors(platform: Platform, type: MissionType, tasks: TaskType[]): number {
    return tasks.reduce((total, task) => total + getTaskHonors(platform, type, task), 0);
}

/**
 * Validate if tasks are valid for a platform and mission type
 * @param platform - The platform
 * @param type - The mission type
 * @param tasks - Array of task types to validate
 * @returns True if all tasks are valid
 */
export function validateTasks(platform: Platform, type: MissionType, tasks: TaskType[]): boolean {
    const availableTasks = getAvailableTasks(platform, type);
    return tasks.every(task => availableTasks.includes(task));
}
