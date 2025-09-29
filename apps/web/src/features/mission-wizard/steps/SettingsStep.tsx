'use client';

import React from 'react';
import { useWizardState } from '../state/useWizardState';
import { Audience } from '../types/wizard.types';

interface SettingsStepProps {
    onNext: () => void;
    onPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
}

export function SettingsStep({ onNext, canGoNext }: SettingsStepProps) {
    const {
        platform,
        type,
        tasks,
        cap,
        audience,
        rewardPerUserHonors,
        totals,
        setCap,
        setAudience
    } = useWizardState();

    const handleCapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        setCap(value);
    };

    const handleAudienceSelect = (selectedAudience: Audience) => {
        setAudience(selectedAudience);
    };

    const handleContinue = () => {
        if (cap && cap > 0) {
            onNext();
        }
    };

    // Calculate pricing preview
    const calculatePricing = () => {
        if (!tasks.length || !cap) {
            return { perUser: 0, total: 0, usd: 0 };
        }

        // This would use the actual pricing logic from the state
        const perUser = rewardPerUserHonors;
        const total = perUser * cap;
        const usd = total * 0.0015; // Approximate conversion

        return {
            perUser,
            total,
            usd: Math.round(usd * 100) / 100
        };
    };

    const pricing = calculatePricing();

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Mission Settings</h2>
            <p className="text-gray-400 mb-8">Configure your mission parameters</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Participant Cap */}
                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">
                        Participant Cap
                    </label>
                    <input
                        type="number"
                        value={cap || ''}
                        onChange={handleCapChange}
                        min="1"
                        max="10000"
                        className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg text-center"
                        placeholder="100"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                        Maximum number of participants
                    </p>
                </div>

                {/* Target Audience */}
                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">
                        Target Audience
                    </label>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleAudienceSelect('all')}
                            className={clsx(
                                'w-full p-4 rounded-xl text-center transition-all',
                                audience === 'all'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            )}
                        >
                            🌍 All Users
                        </button>
                        <button
                            onClick={() => handleAudienceSelect('premium')}
                            className={clsx(
                                'w-full p-4 rounded-xl text-center transition-all',
                                audience === 'premium'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            )}
                        >
                            👑 Premium Users
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {audience === 'premium' ? '5x cost multiplier' : 'Standard pricing'}
                    </p>
                </div>

                {/* Reward Preview */}
                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">
                        Reward per User
                    </label>
                    <div className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
                        <div className="text-xl font-bold text-green-400">
                            {pricing.perUser} Honors
                        </div>
                        <div className="text-sm text-gray-400">
                            ≈ ${(pricing.perUser * 0.0015).toFixed(2)} USD
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Based on selected tasks
                    </p>
                </div>
            </div>

            {/* Pricing Summary */}
            {cap && cap > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
                    <h3 className="text-lg font-semibold text-green-400 mb-4">Mission Cost Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-white">{pricing.total.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Total Honors</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">${pricing.usd}</div>
                            <div className="text-sm text-gray-400">Total USD</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{cap}</div>
                            <div className="text-sm text-gray-400">Max Participants</div>
                        </div>
                    </div>

                    {audience === 'premium' && (
                        <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                            <p className="text-blue-300 text-sm">
                                <strong>Premium Mission:</strong> 5x cost multiplier applied for premium user targeting
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Mission Preview */}
            <div className="mb-8 p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl text-left">
                <h3 className="text-lg font-semibold text-white mb-4">Mission Preview</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Platform:</span>
                        <span className="text-white capitalize">{platform}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white capitalize">{type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Tasks:</span>
                        <span className="text-white">{tasks.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Audience:</span>
                        <span className="text-white capitalize">{audience}</span>
                    </div>
                    {cap && (
                        <div className="flex justify-between">
                            <span className="text-gray-400">Max Participants:</span>
                            <span className="text-white">{cap}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Continue button */}
            <button
                onClick={handleContinue}
                disabled={!cap || cap <= 0}
                className={clsx(
                    'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg',
                    (!cap || cap <= 0) && 'opacity-50 cursor-not-allowed'
                )}
            >
                Continue to Details →
            </button>
        </div>
    );
}

// Helper function for conditional classes
function clsx(...classes: (string | boolean | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
