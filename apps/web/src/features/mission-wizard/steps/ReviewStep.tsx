'use client';

import React from 'react';
import { useWizardState } from '../state/useWizardState';

interface ReviewStepProps {
    onNext: () => void;
    onPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function ReviewStep({ onSubmit, isSubmitting }: ReviewStepProps) {
    const {
        platform,
        model,
        type,
        tasks,
        cap,
        audience,
        details,
        rewardPerUserHonors,
        totals
    } = useWizardState();

    // Get task display names
    const getTaskDisplayName = (taskId: string) => {
        const taskNames: Record<string, string> = {
            like: 'Like',
            retweet: 'Retweet',
            comment: 'Comment',
            quote: 'Quote Tweet',
            follow: 'Follow',
            meme: 'Meme Creation',
            thread: 'Thread Creation',
            article: 'Article Writing',
            videoreview: 'Video Review',
            pfp: 'Profile Picture',
            name_bio_keywords: 'Bio Keywords',
            pinned_tweet: 'Pinned Tweet',
            poll: 'Poll Creation',
            spaces: 'Spaces Hosting',
            community_raid: 'Community Raid',
            story_repost: 'Story Repost',
            feed_post: 'Feed Post',
            reel: 'Reel Creation',
            carousel: 'Carousel Post',
            hashtag_in_bio: 'Bio Hashtag',
            story_highlight: 'Story Highlight',
            repost_duet: 'Duet/Repost',
            skit: 'Skit Creation',
            challenge: 'Challenge',
            product_review: 'Product Review',
            status_style: 'Status Style',
            pinned_branded_video: 'Pinned Video',
            share_post: 'Share Post',
            group_post: 'Group Post',
            video: 'Video Creation',
            meme_flyer: 'Meme/Flyer',
            bio_keyword: 'Bio Keyword',
            pinned_post: 'Pinned Post',
            status_50_views: 'Status Views',
            flyer_clip_status: 'Flyer Status',
            broadcast_message: 'Broadcast',
            keyword_in_about: 'About Keyword',
            story_100_views: 'Story Views',
            snap_repost: 'Snap Repost',
            story_post: 'Story Post',
            spotlight_submission: 'Spotlight',
            message_reaction: 'Message Reaction',
            channel_join: 'Channel Join',
            channel_post: 'Channel Post',
            group_message: 'Group Message',
            social_engagement: 'Social Engagement',
            community_building: 'Community Building',
            content_creation: 'Content Creation',
            brand_promotion: 'Brand Promotion',
            brand_representation: 'Brand Representation',
            community_leadership: 'Community Leadership'
        };

        return taskNames[taskId] || taskId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const totalCost = rewardPerUserHonors * (cap || 0);
    const totalUsd = totalCost * 0.0015;

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Review & Create</h2>
            <p className="text-gray-400 mb-8">Review your mission configuration and pricing</p>

            {/* Mission Summary */}
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Cost Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-8 border border-green-500/30">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                            ${totalUsd.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">Total Cost (USD)</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30">
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                            {totalCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Honors</div>
                    </div>
                </div>

                {/* Mission Details */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Mission Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Platform:</span>
                                <span className="text-white capitalize font-medium">{platform}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Model:</span>
                                <span className="text-white capitalize font-medium">{model}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Type:</span>
                                <span className="text-white capitalize font-medium">{type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Audience:</span>
                                <span className="text-white capitalize font-medium">
                                    {audience === 'premium' ? 'Premium Users (5x cost)' : 'All Users'}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Max Participants:</span>
                                <span className="text-white font-medium">{cap}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Reward per User:</span>
                                <span className="text-white font-medium">{rewardPerUserHonors} Honors</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Tasks Selected:</span>
                                <span className="text-white font-medium">{tasks.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Tasks:</span>
                                <span className="text-white font-medium">{tasks.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Tasks */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Selected Tasks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tasks.map((task, index) => (
                            <div key={task} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                <span className="text-white font-medium">{getTaskDisplayName(task)}</span>
                                <span className="text-green-400 text-sm">✓ Selected</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Details */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Content & Instructions</h3>
                    <div className="space-y-4">
                        {details.tweetLink && (
                            <div>
                                <span className="text-gray-400 block mb-2">Content Link:</span>
                                <a
                                    href={details.tweetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 break-all"
                                >
                                    {details.tweetLink}
                                </a>
                            </div>
                        )}
                        <div>
                            <span className="text-gray-400 block mb-2">Instructions:</span>
                            <div className="bg-gray-700/30 p-4 rounded-lg">
                                <p className="text-white whitespace-pre-wrap">{details.instructions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Pricing Breakdown</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Reward per User:</span>
                            <span className="text-white">{rewardPerUserHonors} Honors</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Max Participants:</span>
                            <span className="text-white">{cap}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Audience Multiplier:</span>
                            <span className="text-white">{audience === 'premium' ? '5x (Premium)' : '1x (All Users)'}</span>
                        </div>
                        <hr className="border-gray-600" />
                        <div className="flex justify-between text-lg font-semibold">
                            <span className="text-white">Total Cost:</span>
                            <span className="text-green-400">{totalCost.toLocaleString()} Honors (${totalUsd.toFixed(2)} USD)</span>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-left">
                    <h4 className="text-sm font-bold text-yellow-400 mb-2">⚠️ Important Notes</h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Mission will be live immediately after creation</li>
                        <li>• Participants can start completing tasks right away</li>
                        <li>• You can monitor progress in your mission dashboard</li>
                        <li>• Rewards are distributed automatically upon task completion</li>
                        <li>• Mission can be paused or cancelled at any time</li>
                    </ul>
                </div>
            </div>

            {/* Create Mission Button */}
            <div className="mt-8">
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className={clsx(
                        'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-12 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-xl',
                        isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    {isSubmitting ? 'Creating Mission...' : '🚀 Create Mission'}
                </button>
            </div>
        </div>
    );
}

// Helper function for conditional classes
function clsx(...classes: (string | boolean | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
