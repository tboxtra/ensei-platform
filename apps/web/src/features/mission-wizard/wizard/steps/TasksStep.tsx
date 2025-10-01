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
            // V1: Hide other tasks that aren't supported yet
            // { id: 'meme', name: 'Meme', price: 300 },
            // { id: 'thread', name: 'Thread', price: 500 },
            // { id: 'article', name: 'Article', price: 400 },
            // { id: 'videoreview', name: 'Video Review', price: 600 },
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

        if (currentTasks.includes(taskId)) {
            // Remove task if already selected
            const newTasks = currentTasks.filter(id => id !== taskId);
            updateState({ tasks: newTasks });
        } else {
            // Add task if not selected, but check limit for degen missions
            if (state.model === 'degen' && currentTasks.length >= 3) {
                // Don't allow more than 3 tasks for degen missions
                return;
            }
            const newTasks = [...currentTasks, taskId];
            updateState({ tasks: newTasks });
        }
    };

    const handleContinue = () => {
        if (state.tasks.length > 0) {
            onNext();
        }
    };

    const getTaskButtonClass = (taskId: string) => {
        const isSelected = state.tasks.includes(taskId);
        const isDisabled = state.model === 'degen' && !isSelected && state.tasks.length >= 3;

        if (isSelected) {
            return 'group relative p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl border-2 border-green-400/30';
        } else if (isDisabled) {
            return 'p-6 rounded-2xl text-left transition-all duration-300 bg-gray-800/30 text-gray-500 border border-gray-700/30 cursor-not-allowed opacity-50';
        } else {
            return 'group relative p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 hover:shadow-lg';
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Select Tasks
                </h2>
                <p className="text-gray-400 text-lg">Choose which engagement tasks participants need to complete</p>
                
                {/* V1 Notice */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                            <span className="text-green-300 text-lg">🚀</span>
                        </div>
                        <div>
                            <p className="text-green-300 text-sm font-medium">
                                <strong>V1 Launch:</strong> Basic engagement tasks available
                            </p>
                            <p className="text-green-200 text-xs mt-1">More task types coming soon!</p>
                        </div>
                    </div>
                </div>

                {state.model === 'degen' && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center">
                                <span className="text-purple-300 text-lg">⚡</span>
                            </div>
                            <div>
                                <p className="text-purple-300 text-sm font-medium">
                                    <strong>Degen Mission:</strong> Select up to 3 tasks
                                </p>
                                <p className="text-purple-200 text-xs mt-1">
                                    Selected: {state.tasks.length}/3 tasks
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {availableTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableTasks.map((task) => {
                        const isSelected = state.tasks.includes(task.id);
                        const isDisabled = state.model === 'degen' && !isSelected && state.tasks.length >= 3;

                        return (
                            <button
                                key={task.id}
                                onClick={() => handleTaskToggle(task.id)}
                                disabled={isDisabled}
                                className={getTaskButtonClass(task.id)}
                            >
                                {/* Selection indicator */}
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full bg-white"></div>
                                    </div>
                                )}

                                <div className="flex flex-col h-full">
                                    <div className="flex-1">
                                        <div className="font-bold text-xl mb-2 group-hover:text-white transition-colors">
                                            {task.name}
                                        </div>
                                        <div className="text-sm opacity-75 mb-4">
                                            {task.price} honors
                                        </div>
                                        
                                        {/* Task description based on type */}
                                        <div className="text-xs opacity-60 leading-relaxed">
                                            {task.id === 'like' && 'Users will like the specified content'}
                                            {task.id === 'retweet' && 'Users will retweet/share the content'}
                                            {task.id === 'comment' && 'Users will leave a comment on the content'}
                                            {task.id === 'quote' && 'Users will quote tweet with their own message'}
                                            {task.id === 'follow' && 'Users will follow the specified account'}
                                        </div>
                                    </div>

                                    {/* Selection checkbox */}
                                    <div className="flex justify-center mt-4">
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                            isSelected 
                                                ? 'border-white bg-white/20' 
                                                : 'border-gray-400 group-hover:border-gray-300'
                                        }`}>
                                            {isSelected && <span className="text-white text-lg">✓</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover effect overlay */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl text-lg"
                    >
                        Continue to Settings →
                    </button>
                    <p className="text-gray-500 text-sm mt-3">
                        Selected {state.tasks.length} task{state.tasks.length > 1 ? 's' : ''} • Ready to configure settings
                    </p>
                </div>
            )}
        </div>
    );
};
