'use client';

import React from 'react';
import { WizardState } from '../types/wizard.types';

interface TasksStepProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    onNext: () => void;
}

// Task definitions with pricing
const TASK_DEFINITIONS = {
    twitter: {
        engage: [
            { id: 'like', name: 'Like', price: 50 },
            { id: 'retweet', name: 'Retweet', price: 100 },
            { id: 'comment', name: 'Comment', price: 150 },
            { id: 'quote', name: 'Quote', price: 200 },
            { id: 'follow', name: 'Follow', price: 250 },
        ],
        content: [
            { id: 'meme', name: 'Meme', price: 300 },
            { id: 'thread', name: 'Thread', price: 500 },
            { id: 'article', name: 'Article', price: 400 },
            { id: 'videoreview', name: 'Video Review', price: 600 },
        ],
        ambassador: [
            { id: 'pfp', name: 'Profile Picture', price: 250 },
            { id: 'name_bio_keywords', name: 'Name/Bio Keywords', price: 200 },
            { id: 'pinned_tweet', name: 'Pinned Tweet', price: 300 },
            { id: 'poll', name: 'Poll', price: 150 },
            { id: 'spaces', name: 'Spaces', price: 800 },
            { id: 'community_raid', name: 'Community Raid', price: 400 },
        ],
    },
    instagram: {
        engage: [
            { id: 'like', name: 'Like', price: 50 },
            { id: 'comment', name: 'Comment', price: 150 },
            { id: 'follow', name: 'Follow', price: 250 },
            { id: 'story_repost', name: 'Story Repost', price: 200 },
        ],
        content: [
            { id: 'feed_post', name: 'Feed Post', price: 300 },
            { id: 'reel', name: 'Reel', price: 500 },
            { id: 'carousel', name: 'Carousel', price: 400 },
            { id: 'meme', name: 'Meme', price: 250 },
        ],
        ambassador: [
            { id: 'pfp', name: 'Profile Picture', price: 250 },
            { id: 'hashtag_in_bio', name: 'Hashtag in Bio', price: 200 },
            { id: 'story_highlight', name: 'Story Highlight', price: 300 },
        ],
    },
    tiktok: {
        engage: [
            { id: 'like', name: 'Like', price: 50 },
            { id: 'comment', name: 'Comment', price: 150 },
            { id: 'repost_duet', name: 'Repost/Duet', price: 300 },
            { id: 'follow', name: 'Follow', price: 250 },
        ],
        content: [
            { id: 'skit', name: 'Skit', price: 400 },
            { id: 'challenge', name: 'Challenge', price: 500 },
            { id: 'product_review', name: 'Product Review', price: 600 },
            { id: 'status_style', name: 'Status Style', price: 350 },
        ],
        ambassador: [
            { id: 'pfp', name: 'Profile Picture', price: 250 },
            { id: 'hashtag_in_bio', name: 'Hashtag in Bio', price: 200 },
            { id: 'pinned_branded_video', name: 'Pinned Branded Video', price: 400 },
        ],
    },
    facebook: {
        engage: [
            { id: 'like', name: 'Like', price: 50 },
            { id: 'comment', name: 'Comment', price: 150 },
            { id: 'follow', name: 'Follow', price: 250 },
            { id: 'share_post', name: 'Share Post', price: 200 },
        ],
        content: [
            { id: 'group_post', name: 'Group Post', price: 300 },
            { id: 'video', name: 'Video', price: 400 },
            { id: 'meme_flyer', name: 'Meme/Flyer', price: 250 },
        ],
        ambassador: [
            { id: 'pfp', name: 'Profile Picture', price: 250 },
            { id: 'bio_keyword', name: 'Bio Keyword', price: 200 },
            { id: 'pinned_post', name: 'Pinned Post', price: 300 },
        ],
    },
    whatsapp: {
        engage: [
            { id: 'status_50_views', name: 'Status 50 Views', price: 300 },
        ],
        content: [],
        ambassador: [],
    },
    custom: {
        engage: [
            { id: 'social_engagement', name: 'Social Engagement', price: 100 },
        ],
        content: [
            { id: 'content_creation', name: 'Content Creation', price: 200 },
        ],
        ambassador: [
            { id: 'brand_promotion', name: 'Brand Promotion', price: 150 },
            { id: 'community_building', name: 'Community Building', price: 180 },
        ],
    },
};

export const TasksStep: React.FC<TasksStepProps> = ({
    state,
    updateState,
    onNext,
}) => {
    const availableTasks = TASK_DEFINITIONS[state.platform as keyof typeof TASK_DEFINITIONS]?.[state.type] || [];

    const handleTaskToggle = (taskId: string) => {
        const currentTasks = state.tasks || [];
        const newTasks = currentTasks.includes(taskId)
            ? currentTasks.filter(id => id !== taskId)
            : [...currentTasks, taskId];

        updateState({ tasks: newTasks });
    };

    const handleContinue = () => {
        if (state.tasks.length > 0) {
            onNext();
        }
    };

    const getTaskButtonClass = (taskId: string) => {
        const isSelected = state.tasks.includes(taskId);
        return isSelected
            ? 'p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
            : 'p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50';
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Select Tasks</h2>
                <p className="text-gray-400">Choose which tasks participants need to complete</p>
            </div>

            {availableTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableTasks.map((task) => {
                        const isSelected = state.tasks.includes(task.id);

                        return (
                            <button
                                key={task.id}
                                onClick={() => handleTaskToggle(task.id)}
                                className={getTaskButtonClass(task.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-xl">{task.name}</div>
                                        <div className="text-sm opacity-75">{task.price} honors</div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-white">
                                        {isSelected && <span className="text-white text-lg">✓</span>}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-400">No tasks available for this platform and type combination.</p>
                </div>
            )}

            {state.tasks.length > 0 && (
                <div className="text-center">
                    <button
                        onClick={handleContinue}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Continue to Settings →
                    </button>
                </div>
            )}
        </div>
    );
};
