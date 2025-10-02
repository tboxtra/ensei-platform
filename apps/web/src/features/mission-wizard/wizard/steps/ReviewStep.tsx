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
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">Review & Create</h2>
                <p className="text-gray-400 text-sm">Confirm configuration and pricing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-5">
                    <h3 className="text-sm font-semibold mb-3">Mission Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-400">Platform</div><div>X (Twitter)</div>
                        <div className="text-gray-400">Model</div><div className="capitalize">{state.model}</div>
                        <div className="text-gray-400">Tasks</div><div>{state.tasks.length} selected</div>
                        <div className="text-gray-400">Participants</div>
                        <div>{state.model === 'degen' ? '∞ (Unlimited)' : state.cap}</div>
                        {state.model === 'degen' && (
                            <>
                                <div className="text-gray-400">Duration</div><div>{state.selectedDegenPreset?.hours || state.duration}h</div>
                                <div className="text-gray-400">Winners</div><div>{state.winnersCap || state.selectedDegenPreset?.maxWinners || 0}</div>
                            </>
                        )}
                        {state.model === 'fixed' && (
                            <>
                                <div className="text-gray-400">Audience</div><div>{state.isPremium ? 'Premium' : 'All Users'}</div>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl border border-green-500/30 bg-green-500/10">
                        <div className="text-2xl font-bold text-green-400 mb-1">${pricing.totalUsd.toFixed(2)}</div>
                        <div className="hint">Total Cost (USD)</div>
                    </div>
                    <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/10">
                        <div className="text-2xl font-bold text-blue-400 mb-1">{pricing.totalHonors.toLocaleString()}</div>
                        <div className="hint">Total Honors</div>
                    </div>

                    {state.contentLink && (
                        <div className="col-span-2 card p-4">
                            <h3 className="text-sm font-semibold mb-2">Content Link</h3>
                            <a href={state.contentLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 break-all hover:text-blue-300 text-sm">
                                {state.contentLink}
                            </a>
                        </div>
                    )}
                    {state.instructions && (
                        <div className="col-span-2 card p-4">
                            <h3 className="text-sm font-semibold mb-2">Instructions</h3>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{state.instructions}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center space-y-3">
                <button onClick={onSubmit} disabled={isLoading} className="btn-primary px-10">
                    {isLoading ? 'Creating Mission…' : '🚀 Create Mission'}
                </button>
                {onReset && (
                    <div>
                        <button onClick={onReset} disabled={isLoading} className="text-gray-400 hover:text-white text-xs underline">
                            Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
