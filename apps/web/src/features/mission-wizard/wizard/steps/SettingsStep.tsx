'use client';

import React, { useEffect, useMemo } from 'react';
import { WizardState } from '../types/wizard.types';

interface SettingsStepProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    onNext: () => void;
}

import { getConfig, calculateTaskReward, calculateTotalReward, honorsToUsd } from '../../../../lib/config';

// Degen mission presets
type DegenPreset = { hours: number; costUSD: number; maxWinners: number; label: string };
const DEGEN_PRESETS: Readonly<DegenPreset[]> = [
    { hours: 1, costUSD: 15, maxWinners: 1, label: '1h - $15' },
    { hours: 3, costUSD: 30, maxWinners: 2, label: '3h - $30' },
    { hours: 6, costUSD: 80, maxWinners: 3, label: '6h - $80' },
    { hours: 8, costUSD: 150, maxWinners: 3, label: '8h - $150' },
    { hours: 12, costUSD: 180, maxWinners: 5, label: '12h - $180' },
    { hours: 18, costUSD: 300, maxWinners: 5, label: '18h - $300' },
    { hours: 24, costUSD: 400, maxWinners: 5, label: '24h - $400' },
    { hours: 36, costUSD: 500, maxWinners: 10, label: '36h - $500' },
    { hours: 48, costUSD: 600, maxWinners: 10, label: '48h - $600' },
    { hours: 72, costUSD: 800, maxWinners: 10, label: '3d - $800' },
    { hours: 96, costUSD: 1000, maxWinners: 10, label: '4d - $1000' },
    { hours: 168, costUSD: 1500, maxWinners: 10, label: '7d - $1500' },
    { hours: 240, costUSD: 2000, maxWinners: 10, label: '10d - $2000' },
    { hours: 336, costUSD: 3000, maxWinners: 15, label: '14d - $3000' },
    { hours: 480, costUSD: 4000, maxWinners: 20, label: '20d - $4000' },
    { hours: 720, costUSD: 5000, maxWinners: 25, label: '30d - $5000' }
];

export const SettingsStep: React.FC<SettingsStepProps> = ({
    state,
    updateState,
    onNext,
}) => {
    // Get system config values
    const config = getConfig();
    const honorsPerUsd = config.pricing.honorsPerUsd;
    const premiumMultiplier = config.pricing.premiumMultiplier;

    // Clamp utility function
    const clamp = (n: number, min: number, max = Number.MAX_SAFE_INTEGER) =>
        Math.min(Math.max(n, min), max);

    const handleCapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parsed = parseInt(e.target.value, 10);
        if (!Number.isFinite(parsed)) return;
        updateState({ cap: clamp(parsed, 1) });
    };

    const handleWinnersCapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parsed = parseInt(e.target.value, 10);
        if (!Number.isFinite(parsed)) return;
        const maxW = state.selectedDegenPreset?.maxWinners ?? 10;
        updateState({ winnersCap: clamp(parsed, 1, maxW) });
    };

    const handleAudienceSelect = (isPremium: boolean) => {
        updateState({ isPremium });
    };

    const handleDegenPresetSelect = (preset: DegenPreset) => {
        const maxW = preset.maxWinners;
        updateState({
            selectedDegenPreset: preset,
            duration: preset.hours,
            winnersCap: clamp(state.winnersCap ?? maxW, 1, maxW),
            winnersPerMission: clamp(state.winnersCap ?? maxW, 1, maxW) // Ensure winnersPerMission is set
        });
    };

    const rewardPerUser = useMemo(() => {
        if (!state?.tasks?.length) return 0;
        return calculateTotalReward(state.tasks, state.isPremium);
    }, [state.tasks, state.isPremium]);

    // Update rewardPerUser in wizard state when tasks or premium status changes
    useEffect(() => {
        if (state.model === 'fixed' && state.rewardPerUser !== rewardPerUser) {
            updateState({ rewardPerUser });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.tasks, state.isPremium, state.model]); // rewardPerUser excluded intentionally

    // Validation for Continue button
    const canContinue =
        state.model === 'fixed'
            ? (state.cap ?? 0) >= 1 && rewardPerUser > 0
            : !!state.selectedDegenPreset && (state.winnersCap ?? 0) >= 1;

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Mission Settings</h2>
                <p className="text-gray-400">Configure your mission parameters</p>
            </div>

            {state.model === 'fixed' ? (
                // Fixed Mission Settings
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-sm font-medium mb-3">Participant Cap</label>
                        <input
                            type="number"
                            value={state.cap ?? ''}
                            onChange={handleCapChange}
                            className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Target Audience</label>
                        <div className="space-y-3" role="radiogroup" aria-label="Target audience selection">
                            <button
                                onClick={() => handleAudienceSelect(false)}
                                role="radio"
                                aria-pressed={!state.isPremium}
                                className={`w-full p-4 rounded-xl text-center transition-all ${!state.isPremium
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-gray-700/50 text-gray-300'
                                    }`}
                            >
                                🌍 All Users
                            </button>
                            <button
                                onClick={() => handleAudienceSelect(true)}
                                role="radio"
                                aria-pressed={state.isPremium}
                                className={`w-full p-4 rounded-xl text-center transition-all ${state.isPremium
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                                    : 'bg-gray-700/50 text-gray-300'
                                    }`}
                            >
                                👑 Premium Users
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Reward per User</label>
                        <div className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
                            <div className="text-xl font-bold text-green-400">{rewardPerUser} Honors</div>
                            <div className="text-sm text-gray-400">≈ ${honorsToUsd(rewardPerUser).toFixed(2)} USD</div>
                            {(!state.tasks || state.tasks.length === 0) && (
                                <div className="text-xs text-gray-400 mt-1">Select at least one task to compute rewards</div>
                            )}
                            {state.tasks && state.tasks.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500">
                                    <div>Based on {state.tasks.length} task{state.tasks.length > 1 ? 's' : ''}</div>
                                    {state.isPremium && <div className="text-yellow-400">Premium {premiumMultiplier}x multiplier applied</div>}
                                    <div className="mt-1 text-gray-600">
                                        {state.tasks?.map((task, idx) => (
                                            <span key={idx} className="inline-block mr-2 text-xs">
                                                {task}: {calculateTaskReward(task, false)}H
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // Degen Mission Settings
                <div className="space-y-8">
                    {/* Duration Preset Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-4">Duration Preset</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {DEGEN_PRESETS.map((preset) => {
                                const isSelected = state.selectedDegenPreset?.hours === preset.hours;
                                return (
                                    <button
                                        key={preset.hours}
                                        onClick={() => handleDegenPresetSelect(preset)}
                                        className={`p-3 rounded-xl text-center transition-all ${isSelected
                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                            }`}
                                    >
                                        <div className="font-semibold text-sm">{preset.label}</div>
                                        <div className="text-xs opacity-75">Max {preset.maxWinners} winners</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Winners Cap and Target Audience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium mb-3">Winners Cap</label>
                            <input
                                type="number"
                                value={state.winnersCap ?? ''}
                                onChange={handleWinnersCapChange}
                                className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                                min="1"
                                max={state.selectedDegenPreset?.maxWinners || 10}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Max: {state.selectedDegenPreset?.maxWinners || 10} winners
                            </p>
                            {state.winnersCap > (state.selectedDegenPreset?.maxWinners || 10) && (
                                <p className="text-xs text-red-400 mt-1">
                                    ⚠️ Winners cap cannot exceed {state.selectedDegenPreset?.maxWinners || 10}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Target Audience</label>
                            <div className="space-y-3" role="radiogroup" aria-label="Target audience selection">
                                <button
                                    onClick={() => handleAudienceSelect(false)}
                                    role="radio"
                                    aria-pressed={!state.isPremium}
                                    className={`w-full p-4 rounded-xl text-center transition-all ${!state.isPremium
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                        : 'bg-gray-700/50 text-gray-300'
                                        }`}
                                >
                                    🌍 All Users
                                </button>
                                <button
                                    onClick={() => handleAudienceSelect(true)}
                                    role="radio"
                                    aria-pressed={state.isPremium}
                                    className={`w-full p-4 rounded-xl text-center transition-all ${state.isPremium
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                                        : 'bg-gray-700/50 text-gray-300'
                                        }`}
                                >
                                    👑 Premium Users
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            <div className="text-center">
                <button
                    onClick={onNext}
                    disabled={!canContinue}
                    className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${!canContinue ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    Continue to Details →
                </button>
            </div>
        </div>
    );
};
