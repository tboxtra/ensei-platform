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
    { hours: 1, costUSD: 15, maxWinners: 1, label: '1h · $15' },
    { hours: 3, costUSD: 30, maxWinners: 2, label: '3h · $30' },
    { hours: 6, costUSD: 80, maxWinners: 3, label: '6h · $80' },
    { hours: 8, costUSD: 150, maxWinners: 3, label: '8h · $150' },
    { hours: 12, costUSD: 180, maxWinners: 5, label: '12h · $180' },
    { hours: 18, costUSD: 300, maxWinners: 5, label: '18h · $300' },
    { hours: 24, costUSD: 400, maxWinners: 5, label: '24h · $400' },
    { hours: 36, costUSD: 500, maxWinners: 10, label: '36h · $500' },
    { hours: 48, costUSD: 600, maxWinners: 10, label: '48h · $600' },
    { hours: 72, costUSD: 800, maxWinners: 10, label: '3d · $800' },
    { hours: 96, costUSD: 1000, maxWinners: 10, label: '4d · $1000' },
    { hours: 168, costUSD: 1500, maxWinners: 10, label: '7d · $1500' },
    { hours: 240, costUSD: 2000, maxWinners: 10, label: '10d · $2000' },
    { hours: 336, costUSD: 3000, maxWinners: 15, label: '14d · $3000' },
    { hours: 480, costUSD: 4000, maxWinners: 20, label: '20d · $4000' },
    { hours: 720, costUSD: 5000, maxWinners: 25, label: '30d · $5000' }
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
        const value = e.target.value;
        if (value === '') {
            updateState({ cap: undefined });
            return;
        }
        const parsed = parseInt(value, 10);
        if (!isFinite(parsed)) return;
        const clamped = clamp(parsed, 1);
        updateState({ cap: clamped });
    };

    const handleWinnersCapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            updateState({ winnersCap: undefined });
            return;
        }
        const parsed = parseInt(e.target.value, 10);
        if (!isFinite(parsed)) return;
        const clamped = clamp(parsed, 1, state.selectedDegenPreset?.maxWinners || 10);
        updateState({ winnersCap: clamped });
    };

    const handleAudienceSelect = (isPremium: boolean) => {
        updateState({ isPremium });
    };

    const handleDegenPresetSelect = (preset: DegenPreset) => {
        updateState({
            selectedDegenPreset: preset,
            duration: preset.hours,
            winnersCap: preset.maxWinners,
        });
    };

    // Calculate reward per user for fixed missions
    const rewardPerUser = useMemo(() => {
        if (!state.tasks || state.tasks.length === 0) return 0;
        return calculateTotalReward(state.tasks, state.isPremium);
    }, [state.tasks, state.isPremium]);

    const canContinue =
        state.model === 'fixed'
            ? (state.cap ?? 0) >= 1 && rewardPerUser > 0
            : !!state.selectedDegenPreset && (state.winnersCap ?? 0) >= 1;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">Mission Settings</h2>
                <p className="text-gray-400 text-sm">Configure your mission parameters</p>
            </div>

            {state.model === 'fixed' ? (
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium mb-3">Participant Cap</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'starter', label: 'Starter', cap: 100, description: '100 participants' },
                                { id: 'boost', label: 'Boost', cap: 200, description: '200 participants' },
                                { id: 'explosive', label: 'Explosive', cap: 500, description: '500 participants' }
                            ].map((option) => {
                                const isSelected = state.cap === option.cap;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => updateState({ cap: option.cap })}
                                        className={`p-4 rounded-xl text-center transition ${
                                            isSelected 
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                        }`}
                                    >
                                        <div className="font-semibold text-lg">{option.label}</div>
                                        <div className="text-sm opacity-90">{option.description}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-2">Target Audience</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleAudienceSelect(false)}
                                    className={`w-full p-3 rounded-lg ${!state.isPremium ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-700/50 text-gray-300'}`}
                                >🌍 All Users</button>
                                <button
                                    onClick={() => handleAudienceSelect(true)}
                                    className={`w-full p-3 rounded-lg ${state.isPremium ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' : 'bg-gray-700/50 text-gray-300'}`}
                                >👑 Premium</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-2">Reward per User</label>
                            <div className="p-3 card">
                                <div className="text-lg font-bold text-green-400">{rewardPerUser} Honors</div>
                                <div className="hint">≈ ${honorsToUsd(rewardPerUser).toFixed(2)} USD</div>
                                {state.tasks?.length > 0 && (
                                    <div className="mt-1 hint">
                                        Based on {state.tasks.length} task{state.tasks.length > 1 ? 's' : ''}
                                        {state.isPremium && <span className="block text-yellow-400">Premium multiplier applied</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium mb-2">Duration Preset</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {DEGEN_PRESETS.map((preset) => {
                                const isSelected = state.selectedDegenPreset?.hours === preset.hours;
                                return (
                                    <button
                                        key={preset.hours}
                                        onClick={() => handleDegenPresetSelect(preset)}
                                        className={`p-3 rounded-lg text-center ${isSelected ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg' : 'card text-gray-300 hover:bg-gray-700/50'}`}
                                    >
                                        <div className="font-semibold text-sm">{preset.label}</div>
                                        <div className="hint">Max {preset.maxWinners} winners</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-2">Winners Cap</label>
                            <input
                                type="number"
                                value={state.winnersCap ?? ''}
                                onChange={handleWinnersCapChange}
                                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                min="1"
                                max={state.selectedDegenPreset?.maxWinners || 10}
                            />
                            <p className="hint mt-1">Max: {state.selectedDegenPreset?.maxWinners || 10}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-2">Target Audience</label>
                            <div className="space-y-2">
                                <button onClick={() => handleAudienceSelect(false)} className={`w-full p-3 rounded-lg ${!state.isPremium ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-700/50 text-gray-300'}`}>🌍 All Users</button>
                                <button onClick={() => handleAudienceSelect(true)} className={`w-full p-3 rounded-lg ${state.isPremium ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' : 'bg-gray-700/50 text-gray-300'}`}>👑 Premium</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};