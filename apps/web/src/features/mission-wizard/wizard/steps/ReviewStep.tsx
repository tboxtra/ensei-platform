'use client';

import React from 'react';
import { WizardState } from '../types/wizard.types';

interface ReviewStepProps {
    state: WizardState;
    onSubmit: () => void;
    onReset?: () => void;
    isLoading?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
    state,
    onSubmit,
    onReset,
    isLoading = false,
}) => {
    const calculateTotalCost = () => {
        // Centralized configuration - should match backend
        const HONORS_PER_USD = 450;
        const PREMIUM_MULTIPLIER = 5; // Match backend system config

        if (state.model === 'degen') {
            // For degen missions, use the selected preset cost
            const presetCost = state.selectedDegenPreset?.costUSD || 0;
            const totalHonors = Math.round(presetCost * HONORS_PER_USD);

            return {
                totalUsd: presetCost,
                totalHonors,
            };
        } else {
            // For fixed missions, calculate based on tasks and participants
            const prices: Record<string, number> = {
                like: 50, retweet: 100, comment: 150, quote: 200, follow: 250,
                meme: 300, thread: 500, article: 400, videoreview: 600,
                pfp: 250, name_bio_keywords: 200, pinned_tweet: 300, poll: 150,
                spaces: 800, community_raid: 400, status_50_views: 300
            };

            const baseTaskCost = state.tasks.reduce((sum: number, task: string) => {
                return sum + (prices[task as keyof typeof prices] || 0);
            }, 0);

            // Apply premium multiplier if applicable
            const rewardPerUser = state.isPremium ? baseTaskCost * PREMIUM_MULTIPLIER : baseTaskCost;

            const participants = state.cap || 1;
            const totalHonors = rewardPerUser * participants;
            const totalUsd = Number((totalHonors / HONORS_PER_USD).toFixed(2));

            return {
                totalUsd: totalUsd,
                totalHonors,
            };
        }
    };

    const pricing = calculateTotalCost();

    const getPlatformName = (platform: string) => {
        const names: Record<string, string> = {
            twitter: 'X (Twitter)',
            instagram: 'Instagram',
            tiktok: 'TikTok',
            facebook: 'Facebook',
            whatsapp: 'WhatsApp',
            telegram: 'Telegram',
            snapchat: 'Snapchat',
            custom: 'Custom',
        };
        return names[platform] || platform;
    };


    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Review & Create</h2>
                <p className="text-gray-400">Review your mission configuration and pricing</p>
            </div>

            {/* Mission Summary */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold mb-4">Mission Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-400">Platform:</span>
                        <span className="ml-2 text-white">{getPlatformName(state.platform)}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Model:</span>
                        <span className="ml-2 text-white capitalize">{state.model}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Tasks:</span>
                        <span className="ml-2 text-white">{state.tasks.length} selected</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Participants:</span>
                        <span className="ml-2 text-white">
                            {state.model === 'degen' ? '∞ (Unlimited)' : state.cap}
                        </span>
                    </div>
                    {state.model === 'degen' && (
                        <>
                            <div>
                                <span className="text-gray-400">Duration:</span>
                                <span className="ml-2 text-white">
                                    {state.selectedDegenPreset?.hours || state.duration} hours (inclusive)
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">Number of Winners:</span>
                                <span className="ml-2 text-white">
                                    {state.winnersCap || state.selectedDegenPreset?.maxWinners || 0}
                                </span>
                            </div>
                        </>
                    )}
                    {state.model === 'fixed' && (
                        <div>
                            <span className="text-gray-400">Audience:</span>
                            <span className="ml-2 text-white">{state.isPremium ? 'Premium' : 'All Users'}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Pricing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-8 border border-green-500/30">
                    <div className="text-3xl font-bold text-green-400 mb-2">${pricing.totalUsd.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">Total Cost (USD)</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{pricing.totalHonors.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total Honors</div>
                </div>
            </div>

            {/* Content Preview */}
            {state.contentLink && (
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold mb-4">Content Link</h3>
                    <a
                        href={state.contentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 break-all"
                    >
                        {state.contentLink}
                    </a>
                </div>
            )}

            {/* Instructions Preview */}
            {state.instructions && (
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold mb-4">Instructions</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{state.instructions}</p>
                </div>
            )}

            {/* Create Button */}
            <div className="text-center space-y-4">
                <button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-12 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creating Mission...' : '🚀 Create Mission'}
                </button>

                {onReset && (
                    <div>
                        <button
                            onClick={onReset}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-white text-sm underline transition-colors disabled:opacity-50"
                        >
                            🔄 Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
