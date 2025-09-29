'use client';

import React from 'react';
import { useWizardState } from '../state/useWizardState';
import { Task, TaskConfig } from '../types/wizard.types';

// Task pricing data (matching the existing structure)
const TASK_PRICES = {
    twitter: {
        engage: {
            like: 50,
            retweet: 100,
            comment: 150,
            quote: 200,
            follow: 250
        },
        content: {
            meme: 300,
            thread: 500,
            article: 400,
            videoreview: 600
        },
        ambassador: {
            pfp: 250,
            name_bio_keywords: 200,
            pinned_tweet: 300,
            poll: 150,
            spaces: 800,
            community_raid: 400
        }
    },
    instagram: {
        engage: {
            like: 50,
            comment: 150,
            follow: 250,
            story_repost: 200
        },
        content: {
            feed_post: 300,
            reel: 500,
            carousel: 400,
            meme: 250
        },
        ambassador: {
            pfp: 250,
            hashtag_in_bio: 200,
            story_highlight: 300
        }
    },
    tiktok: {
        engage: {
            like: 50,
            comment: 150,
            repost_duet: 300,
            follow: 250
        },
        content: {
            skit: 400,
            challenge: 500,
            product_review: 600,
            status_style: 350
        },
        ambassador: {
            pfp: 250,
            hashtag_in_bio: 200,
            pinned_branded_video: 400
        }
    },
    facebook: {
        engage: {
            like: 50,
            comment: 150,
            follow: 250,
            share_post: 200
        },
        content: {
            group_post: 300,
            video: 400,
            meme_flyer: 250
        },
        ambassador: {
            pfp: 250,
            bio_keyword: 200,
            pinned_post: 300
        }
    },
    whatsapp: {
        engage: {
            status_50_views: 300
        },
        content: {
            flyer_clip_status: 400,
            broadcast_message: 500
        },
        ambassador: {
            pfp: 250,
            keyword_in_about: 200
        }
    },
    snapchat: {
        engage: {
            story_100_views: 400,
            snap_repost: 300
        },
        content: {
            story_post: 500,
            spotlight_submission: 600
        },
        ambassador: {
            pfp: 250,
            bio_keyword: 200
        }
    },
    telegram: {
        engage: {
            message_reaction: 100,
            channel_join: 200
        },
        content: {
            channel_post: 400,
            group_message: 300
        },
        ambassador: {
            pfp: 250,
            bio_keyword: 200
        }
    },
    custom: {
        engage: {
            social_engagement: 200,
            community_building: 300
        },
        content: {
            content_creation: 400,
            brand_promotion: 500
        },
        ambassador: {
            brand_representation: 600,
            community_leadership: 700
        }
    }
};

// Task display names and descriptions
const TASK_DISPLAY_INFO: Record<string, { name: string; description: string; icon: string }> = {
    // Twitter tasks
    like: { name: 'Like', description: 'Like the post', icon: '👍' },
    retweet: { name: 'Retweet', description: 'Retweet the post', icon: '🔄' },
    comment: { name: 'Comment', description: 'Leave a meaningful comment', icon: '💬' },
    quote: { name: 'Quote Tweet', description: 'Quote tweet with your thoughts', icon: '💭' },
    follow: { name: 'Follow', description: 'Follow the account', icon: '👥' },
    meme: { name: 'Meme Creation', description: 'Create and share a meme', icon: '😂' },
    thread: { name: 'Thread Creation', description: 'Create an engaging thread', icon: '🧵' },
    article: { name: 'Article Writing', description: 'Write a detailed article', icon: '📝' },
    videoreview: { name: 'Video Review', description: 'Create a video review', icon: '🎥' },
    pfp: { name: 'Profile Picture', description: 'Update profile picture', icon: '🖼️' },
    name_bio_keywords: { name: 'Bio Keywords', description: 'Add keywords to bio', icon: '🏷️' },
    pinned_tweet: { name: 'Pinned Tweet', description: 'Pin a specific tweet', icon: '📌' },
    poll: { name: 'Poll Creation', description: 'Create an engaging poll', icon: '📊' },
    spaces: { name: 'Spaces Hosting', description: 'Host a Twitter Space', icon: '🎙️' },
    community_raid: { name: 'Community Raid', description: 'Organize community engagement', icon: '⚔️' },

    // Instagram tasks
    story_repost: { name: 'Story Repost', description: 'Repost to your story', icon: '📱' },
    feed_post: { name: 'Feed Post', description: 'Create a feed post', icon: '📸' },
    reel: { name: 'Reel Creation', description: 'Create an engaging reel', icon: '🎬' },
    carousel: { name: 'Carousel Post', description: 'Create a carousel post', icon: '🎠' },
    hashtag_in_bio: { name: 'Bio Hashtag', description: 'Add hashtag to bio', icon: '#️⃣' },
    story_highlight: { name: 'Story Highlight', description: 'Add to story highlights', icon: '⭐' },

    // TikTok tasks
    repost_duet: { name: 'Duet/Repost', description: 'Create a duet or repost', icon: '🎭' },
    skit: { name: 'Skit Creation', description: 'Create a funny skit', icon: '🎪' },
    challenge: { name: 'Challenge', description: 'Participate in challenge', icon: '🏆' },
    product_review: { name: 'Product Review', description: 'Review a product', icon: '🔍' },
    status_style: { name: 'Status Style', description: 'Show your style', icon: '✨' },
    pinned_branded_video: { name: 'Pinned Video', description: 'Pin branded video', icon: '📌' },

    // Facebook tasks
    share_post: { name: 'Share Post', description: 'Share the post', icon: '📤' },
    group_post: { name: 'Group Post', description: 'Post in relevant groups', icon: '👥' },
    video: { name: 'Video Creation', description: 'Create a video', icon: '🎥' },
    meme_flyer: { name: 'Meme/Flyer', description: 'Create meme or flyer', icon: '📄' },
    bio_keyword: { name: 'Bio Keyword', description: 'Add keyword to bio', icon: '🏷️' },
    pinned_post: { name: 'Pinned Post', description: 'Pin a specific post', icon: '📌' },

    // WhatsApp tasks
    status_50_views: { name: 'Status Views', description: 'Get 50+ status views', icon: '👀' },
    flyer_clip_status: { name: 'Flyer Status', description: 'Share flyer as status', icon: '📄' },
    broadcast_message: { name: 'Broadcast', description: 'Send broadcast message', icon: '📢' },
    keyword_in_about: { name: 'About Keyword', description: 'Add keyword to about', icon: 'ℹ️' },

    // Snapchat tasks
    story_100_views: { name: 'Story Views', description: 'Get 100+ story views', icon: '👀' },
    snap_repost: { name: 'Snap Repost', description: 'Repost the snap', icon: '📱' },
    story_post: { name: 'Story Post', description: 'Create story post', icon: '📸' },
    spotlight_submission: { name: 'Spotlight', description: 'Submit to Spotlight', icon: '🌟' },

    // Telegram tasks
    message_reaction: { name: 'Message Reaction', description: 'React to messages', icon: '👍' },
    channel_join: { name: 'Channel Join', description: 'Join the channel', icon: '📢' },
    channel_post: { name: 'Channel Post', description: 'Post in channel', icon: '📝' },
    group_message: { name: 'Group Message', description: 'Message in group', icon: '💬' },

    // Custom tasks
    social_engagement: { name: 'Social Engagement', description: 'Engage on social media', icon: '🤝' },
    community_building: { name: 'Community Building', description: 'Build community', icon: '🏗️' },
    content_creation: { name: 'Content Creation', description: 'Create original content', icon: '✍️' },
    brand_promotion: { name: 'Brand Promotion', description: 'Promote the brand', icon: '📢' },
    brand_representation: { name: 'Brand Representation', description: 'Represent the brand', icon: '👑' },
    community_leadership: { name: 'Community Leadership', description: 'Lead the community', icon: '🎯' }
};

interface TasksStepProps {
    onNext: () => void;
    onPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
}

export function TasksStep({ onNext, canGoNext }: TasksStepProps) {
    const { platform, type, tasks, toggleTask } = useWizardState();

    // Get available tasks for the current platform/type combination
    const getAvailableTasks = (): TaskConfig[] => {
        if (!platform || !type) return [];

        const platformTasks = TASK_PRICES[platform as keyof typeof TASK_PRICES]?.[type as keyof typeof TASK_PRICES[keyof typeof TASK_PRICES]] || {};

        return Object.entries(platformTasks).map(([taskId, price]) => {
            const displayInfo = TASK_DISPLAY_INFO[taskId] || {
                name: taskId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: 'Complete this task',
                icon: '📋'
            };

            return {
                id: taskId as Task,
                name: displayInfo.name,
                price,
                description: displayInfo.description,
                icon: displayInfo.icon
            };
        });
    };

    const availableTasks = getAvailableTasks();

    const handleTaskToggle = (task: Task) => {
        toggleTask(task);
    };

    const handleContinue = () => {
        if (tasks.length > 0) {
            onNext();
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Select Tasks</h2>
            <p className="text-gray-400 mb-8">Choose which tasks participants need to complete</p>

            {availableTasks.length === 0 ? (
                <div className="p-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400">
                        No tasks available for {platform} {type} missions yet.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                        Please select a different platform or type combination.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {availableTasks.map((task) => {
                            const isSelected = tasks.includes(task.id);

                            return (
                                <button
                                    key={task.id}
                                    onClick={() => handleTaskToggle(task.id)}
                                    className={clsx(
                                        'p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105',
                                        isSelected && 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg',
                                        !isSelected && 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-3">{task.icon}</span>
                                            <div>
                                                <div className="font-medium text-xl">{task.name}</div>
                                                <div className="text-sm opacity-75">{task.description}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold">{task.price} honors</div>
                                            <div className={clsx(
                                                'w-8 h-8 rounded-full border-2 flex items-center justify-center mt-2',
                                                isSelected ? 'border-white' : 'border-gray-500'
                                            )}>
                                                {isSelected && <span className="text-white text-lg">✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected tasks summary */}
                    {tasks.length > 0 && (
                        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm mb-2">
                                ✓ {tasks.length} task{tasks.length !== 1 ? 's' : ''} selected
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {tasks.map((taskId) => {
                                    const task = availableTasks.find(t => t.id === taskId);
                                    return task ? (
                                        <span key={taskId} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                                            {task.icon} {task.name}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {/* Continue button */}
                    <button
                        onClick={handleContinue}
                        disabled={tasks.length === 0}
                        className={clsx(
                            'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg',
                            tasks.length === 0 && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        Continue to Settings →
                    </button>
                </>
            )}
        </div>
    );
}

// Helper function for conditional classes
function clsx(...classes: (string | boolean | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
