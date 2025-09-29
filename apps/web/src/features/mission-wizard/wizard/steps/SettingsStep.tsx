'use client';

import React from 'react';
import { WizardState } from '../types/wizard.types';

interface SettingsStepProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    onNext: () => void;
}

export const SettingsStep: React.FC<SettingsStepProps> = ({
    state,
    updateState,
    onNext,
}) => {
    const handleCapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0) {
            updateState({ cap: value });
        }
    };

    const handleAudienceSelect = (isPremium: boolean) => {
        updateState({ isPremium });
    };

    const calculateRewardPerUser = () => {
        // This would integrate with the existing pricing logic
        // For now, using a simple calculation
        const baseReward = 250; // Base reward
        return state.isPremium ? baseReward * 2 : baseReward;
    };

    const rewardPerUser = calculateRewardPerUser();

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Mission Settings</h2>
                <p className="text-gray-400">Configure your mission parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <label className="block text-sm font-medium mb-3">Participant Cap</label>
                    <input
                        type="number"
                        value={state.cap}
                        onChange={handleCapChange}
                        className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                        min="1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">Target Audience</label>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleAudienceSelect(false)}
                            className={`w-full p-4 rounded-xl text-center transition-all ${!state.isPremium
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-gray-700/50 text-gray-300'
                                }`}
                        >
                            🌍 All Users
                        </button>
                        <button
                            onClick={() => handleAudienceSelect(true)}
                            className={`w-full p-4 rounded-xl text-center transition-all ${state.isPremium
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
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
                        <div className="text-sm text-gray-400">≈ ${(rewardPerUser / 450).toFixed(2)} USD</div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={onNext}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    Continue to Details →
                </button>
            </div>
        </div>
    );
};
