// Task classification system for different verification types
export interface TaskAction {
    id: string;
    label: string;
    type: 'auto' | 'manual' | 'verify' | 'intent';
    requiresConnection?: boolean;
    apiEndpoint?: string;
    verificationRequired?: boolean;
    intentUrl?: string;
    intentAction?: string;
}

export interface TaskType {
    id: string;
    name: string;
    description: string;
    actions: TaskAction[];
    verificationType: 'api' | 'manual' | 'hybrid';
    requiresSocialConnection: boolean;
    platform: string;
    missionType: string;
}

// Twitter Engage Tasks
export const TWITTER_ENGAGE_TASKS: TaskType[] = [
    {
        id: 'like',
        name: 'Like Tweet',
        description: 'Like the posted tweet',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'engage',
        actions: [
            {
                id: 'like_intent',
                label: 'Like on Twitter',
                type: 'intent',
                intentAction: 'like',
                verificationRequired: true
            },
            {
                id: 'verify_like',
                label: 'Verify Like',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'retweet',
        name: 'Retweet',
        description: 'Retweet the posted tweet',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'engage',
        actions: [
            {
                id: 'retweet_intent',
                label: 'Retweet on Twitter',
                type: 'intent',
                intentAction: 'retweet',
                verificationRequired: true
            },
            {
                id: 'verify_retweet',
                label: 'Verify Retweet',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'comment',
        name: 'Comment',
        description: 'Comment on the posted tweet',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'engage',
        actions: [
            {
                id: 'comment_intent',
                label: 'Comment on Twitter',
                type: 'intent',
                intentAction: 'comment',
                verificationRequired: true
            },
            {
                id: 'verify_comment',
                label: 'Verify Comment',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'quote',
        name: 'Quote Tweet',
        description: 'Quote tweet with your thoughts',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'engage',
        actions: [
            {
                id: 'quote_intent',
                label: 'Quote on Twitter',
                type: 'intent',
                intentAction: 'quote',
                verificationRequired: true
            },
            {
                id: 'verify_quote',
                label: 'Verify Quote',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'follow',
        name: 'Follow User',
        description: 'Follow the user who posted the tweet',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'engage',
        actions: [
            {
                id: 'follow_intent',
                label: 'Follow on Twitter',
                type: 'intent',
                intentAction: 'follow',
                verificationRequired: true
            },
            {
                id: 'verify_follow',
                label: 'Verify Follow',
                type: 'verify',
                verificationRequired: true
            }
        ]
    }
];

// Twitter Content Tasks
export const TWITTER_CONTENT_TASKS: TaskType[] = [
    {
        id: 'meme',
        name: 'Create Meme',
        description: 'Create and post a meme',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'content',
        actions: [
            {
                id: 'create_meme',
                label: 'Create Meme',
                type: 'manual'
            },
            {
                id: 'verify_meme',
                label: 'Verify Meme',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'thread',
        name: 'Create Thread',
        description: 'Create a Twitter thread',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'content',
        actions: [
            {
                id: 'create_thread',
                label: 'Create Thread',
                type: 'manual'
            },
            {
                id: 'verify_thread',
                label: 'Verify Thread',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'article',
        name: 'Write Article',
        description: 'Write and share an article',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'content',
        actions: [
            {
                id: 'write_article',
                label: 'Write Article',
                type: 'manual'
            },
            {
                id: 'verify_article',
                label: 'Verify Article',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'videoreview',
        name: 'Video Review',
        description: 'Create a video review',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'content',
        actions: [
            {
                id: 'create_review',
                label: 'Create Review',
                type: 'manual'
            },
            {
                id: 'verify_review',
                label: 'Verify Review',
                type: 'verify',
                verificationRequired: true
            }
        ]
    }
];

// Twitter Ambassador Tasks
export const TWITTER_AMBASSADOR_TASKS: TaskType[] = [
    {
        id: 'pfp',
        name: 'Update Profile Picture',
        description: 'Update your profile picture',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'ambassador',
        actions: [
            {
                id: 'update_pfp',
                label: 'Update PFP',
                type: 'manual'
            },
            {
                id: 'verify_pfp',
                label: 'Verify PFP',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'name_bio_keywords',
        name: 'Update Name & Bio',
        description: 'Update name and bio with keywords',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'ambassador',
        actions: [
            {
                id: 'update_bio',
                label: 'Update Bio',
                type: 'manual'
            },
            {
                id: 'verify_bio',
                label: 'Verify Bio',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'pinned_tweet',
        name: 'Pin Tweet',
        description: 'Pin a specific tweet',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'ambassador',
        actions: [
            {
                id: 'pin_tweet',
                label: 'Pin Tweet',
                type: 'manual'
            },
            {
                id: 'verify_pin',
                label: 'Verify Pin',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'poll',
        name: 'Create Poll',
        description: 'Create a poll on Twitter',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'ambassador',
        actions: [
            {
                id: 'create_poll',
                label: 'Create Poll',
                type: 'manual'
            },
            {
                id: 'verify_poll',
                label: 'Verify Poll',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'spaces',
        name: 'Host Spaces',
        description: 'Host a Twitter Spaces session',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'ambassador',
        actions: [
            {
                id: 'host_spaces',
                label: 'Host Spaces',
                type: 'manual'
            },
            {
                id: 'verify_spaces',
                label: 'Verify Spaces',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'community_raid',
        name: 'Community Raid',
        description: 'Organize a community raid',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'twitter',
        missionType: 'ambassador',
        actions: [
            {
                id: 'organize_raid',
                label: 'Organize Raid',
                type: 'manual'
            },
            {
                id: 'verify_raid',
                label: 'Verify Raid',
                type: 'verify',
                verificationRequired: true
            }
        ]
    }
];

// Instagram Tasks
export const INSTAGRAM_ENGAGE_TASKS: TaskType[] = [
    {
        id: 'like',
        name: 'Like Post',
        description: 'Like the Instagram post',
        verificationType: 'api',
        requiresSocialConnection: true,
        platform: 'instagram',
        missionType: 'engage',
        actions: [
            {
                id: 'auto_like',
                label: 'Like',
                type: 'auto',
                requiresConnection: true,
                apiEndpoint: '/api/instagram/like'
            },
            {
                id: 'view_post',
                label: 'View Post',
                type: 'manual'
            }
        ]
    },
    {
        id: 'comment',
        name: 'Comment',
        description: 'Comment on the Instagram post',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'instagram',
        missionType: 'engage',
        actions: [
            {
                id: 'comment',
                label: 'Comment',
                type: 'manual'
            },
            {
                id: 'verify_comment',
                label: 'Verify Comment',
                type: 'verify',
                verificationRequired: true
            },
            {
                id: 'view_post',
                label: 'View Post',
                type: 'manual'
            }
        ]
    },
    {
        id: 'follow',
        name: 'Follow User',
        description: 'Follow the Instagram user',
        verificationType: 'api',
        requiresSocialConnection: true,
        platform: 'instagram',
        missionType: 'engage',
        actions: [
            {
                id: 'auto_follow',
                label: 'Follow',
                type: 'auto',
                requiresConnection: true,
                apiEndpoint: '/api/instagram/follow'
            },
            {
                id: 'view_profile',
                label: 'View Profile',
                type: 'manual'
            }
        ]
    },
    {
        id: 'story_repost',
        name: 'Repost Story',
        description: 'Repost the story',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'instagram',
        missionType: 'engage',
        actions: [
            {
                id: 'repost_story',
                label: 'Repost Story',
                type: 'manual'
            },
            {
                id: 'verify_repost',
                label: 'Verify Repost',
                type: 'verify',
                verificationRequired: true
            }
        ]
    }
];

// Platform-specific Content Tasks
export const PLATFORM_CONTENT_TASKS: TaskType[] = [
    {
        id: 'channel_post',
        name: 'Channel Post',
        description: 'Create a channel post',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'telegram',
        missionType: 'content',
        actions: [
            {
                id: 'create_channel_post',
                label: 'Create Post',
                type: 'manual'
            },
            {
                id: 'verify_channel_post',
                label: 'Verify Post',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'flyer_clip_status',
        name: 'Flyer Clip',
        description: 'Create a flyer clip status',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'whatsapp',
        missionType: 'content',
        actions: [
            {
                id: 'create_flyer_clip',
                label: 'Create Flyer',
                type: 'manual'
            },
            {
                id: 'verify_flyer_clip',
                label: 'Verify Flyer',
                type: 'verify',
                verificationRequired: true
            }
        ]
    },
    {
        id: 'status_style',
        name: 'Status Style',
        description: 'Create a styled status',
        verificationType: 'hybrid',
        requiresSocialConnection: false,
        platform: 'tiktok',
        missionType: 'content',
        actions: [
            {
                id: 'create_status_style',
                label: 'Create Status',
                type: 'manual'
            },
            {
                id: 'verify_status_style',
                label: 'Verify Status',
                type: 'verify',
                verificationRequired: true
            }
        ]
    }
];

// All task types organized by platform and mission type
export const ALL_TASK_TYPES = {
    twitter: {
        engage: TWITTER_ENGAGE_TASKS,
        content: TWITTER_CONTENT_TASKS,
        ambassador: TWITTER_AMBASSADOR_TASKS
    },
    instagram: {
        engage: INSTAGRAM_ENGAGE_TASKS,
        content: INSTAGRAM_ENGAGE_TASKS, // Use same tasks for now
        ambassador: INSTAGRAM_ENGAGE_TASKS // Use same tasks for now
    },
    tiktok: {
        engage: TWITTER_ENGAGE_TASKS, // Use Twitter tasks as fallback
        content: [...TWITTER_CONTENT_TASKS, ...PLATFORM_CONTENT_TASKS.filter(t => t.platform === 'tiktok')],
        ambassador: TWITTER_AMBASSADOR_TASKS
    },
    facebook: {
        engage: TWITTER_ENGAGE_TASKS, // Use Twitter tasks as fallback
        content: TWITTER_CONTENT_TASKS,
        ambassador: TWITTER_AMBASSADOR_TASKS
    },
    whatsapp: {
        engage: TWITTER_ENGAGE_TASKS, // Use Twitter tasks as fallback
        content: [...TWITTER_CONTENT_TASKS, ...PLATFORM_CONTENT_TASKS.filter(t => t.platform === 'whatsapp')],
        ambassador: TWITTER_AMBASSADOR_TASKS
    },
    snapchat: {
        engage: TWITTER_ENGAGE_TASKS, // Use Twitter tasks as fallback
        content: TWITTER_CONTENT_TASKS,
        ambassador: TWITTER_AMBASSADOR_TASKS
    },
    telegram: {
        engage: TWITTER_ENGAGE_TASKS, // Use Twitter tasks as fallback
        content: [...TWITTER_CONTENT_TASKS, ...PLATFORM_CONTENT_TASKS.filter(t => t.platform === 'telegram')],
        ambassador: TWITTER_AMBASSADOR_TASKS
    }
};

// Helper function to get task type by platform, mission type, and task id
export function getTaskType(platform: string, missionType: string, taskId: string): TaskType | null {
    const platformTasks = ALL_TASK_TYPES[platform as keyof typeof ALL_TASK_TYPES];
    if (!platformTasks) return null;

    const missionTasks = platformTasks[missionType as keyof typeof platformTasks];
    if (!missionTasks) return null;

    return missionTasks.find(task => task.id === taskId) || null;
}

// Helper function to get all tasks for a platform and mission type
export function getTasksForMission(platform: string, missionType: string): TaskType[] {
    const platformTasks = ALL_TASK_TYPES[platform as keyof typeof ALL_TASK_TYPES];
    if (!platformTasks) {
        // Fallback to Twitter tasks if platform not found
        return ALL_TASK_TYPES.twitter[missionType as keyof typeof ALL_TASK_TYPES.twitter] || TWITTER_ENGAGE_TASKS;
    }

    const missionTasks = platformTasks[missionType as keyof typeof platformTasks];
    if (!missionTasks || missionTasks.length === 0) {
        // Fallback to engage tasks if mission type not found
        return platformTasks.engage || TWITTER_ENGAGE_TASKS;
    }

    return missionTasks;
}
