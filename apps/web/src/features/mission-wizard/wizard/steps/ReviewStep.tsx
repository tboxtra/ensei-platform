'use client';

import React from 'react';
import { WizardState } from '../types/wizard.types';
import { getConfig, calculateTotalReward, honorsToUsd, usdToHonors } from '../../../../lib/config';

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
        const config = getConfig();

        if (state.model === 'degen') {
            // For degen missions, use the selected preset cost
            const presetCost = state.selectedDegenPreset?.costUSD || 0;
            const totalHonors = Math.round(usdToHonors(presetCost));

            return {
                totalUsd: presetCost,
                totalHonors,
            };
        } else {
            // For fixed missions, calculate based on tasks and participants
            const rewardPerUser = calculateTotalReward(state.tasks, state.isPremium);
            const participants = state.cap || 1;
            const totalHonors = rewardPerUser * participants;
            const totalUsd = Number(honorsToUsd(totalHonors).toFixed(2));

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
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Review & Create
                </h2>
                <p className="text-gray-400 text-lg">Review your mission configuration and pricing before launching</p>
            </div>

            {/* Mission Summary */}
            <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold mb-6 text-white">Mission Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-700/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Platform</div>
                        <div className="text-lg font-semibold text-white">{getPlatformName(state.platform)}</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Model</div>
                        <div className="text-lg font-semibold text-white capitalize">{state.model}</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Tasks</div>
                        <div className="text-lg font-semibold text-white">{state.tasks.length} selected</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-1">Participants</div>
                        <div className="text-lg font-semibold text-white">
                            {state.model === 'degen' ? '∞ (Unlimited)' : state.cap}
                        </div>
                    </div>
                    {state.model === 'degen' && (
                        <>
                            <div className="bg-gray-700/30 rounded-xl p-4">
                                <div className="text-sm text-gray-400 mb-1">Duration</div>
                                <div className="text-lg font-semibold text-white">
                                    {state.selectedDegenPreset?.hours || state.duration} hours
                                </div>
                            </div>
                            <div className="bg-gray-700/30 rounded-xl p-4">
                                <div className="text-sm text-gray-400 mb-1">Winners</div>
                                <div className="text-lg font-semibold text-white">
                                    {state.winnersCap || state.selectedDegenPreset?.maxWinners || 0}
                                </div>
                            </div>
                        </>
                    )}
                    {state.model === 'fixed' && (
                        <div className="bg-gray-700/30 rounded-xl p-4">
                            <div className="text-sm text-gray-400 mb-1">Audience</div>
                            <div className="text-lg font-semibold text-white">{state.isPremium ? 'Premium' : 'All Users'}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Pricing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-8 border border-green-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center">
                            <span className="text-green-300 text-xl">💰</span>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-400">${pricing.totalUsd.toFixed(2)}</div>
                            <div className="text-sm text-gray-400">Total Cost (USD)</div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center">
                            <span className="text-blue-300 text-xl">🏆</span>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-400">{pricing.totalHonors.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Total Honors</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Preview */}
            {state.contentLink && (
                <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold mb-4 text-white">Content Link</h3>
                    <div className="bg-gray-700/30 rounded-xl p-4">
                        <a
                            href={state.contentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 break-all text-sm font-medium"
                        >
                            {state.contentLink}
                        </a>
                    </div>
                </div>
            )}

            {/* Instructions Preview */}
            {state.instructions && (
                <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold mb-4 text-white">Instructions</h3>
                    <div className="bg-gray-700/30 rounded-xl p-4">
                        <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{state.instructions}</p>
                    </div>
                </div>
            )}

            {/* Create Button */}
            <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
                    <button
                        onClick={onSubmit}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-16 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                Creating Mission...
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span>🚀</span>
                                <span>Create Mission</span>
                            </div>
                        )}
                    </button>
                    <p className="text-gray-400 text-sm mt-4">
                        Your mission will be live immediately after creation
                    </p>
                </div>

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
