'use client';

import React from 'react';
import { WizardState } from '../types/wizard.types';

interface PlatformStepProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    onNext: () => void;
}

const PLATFORMS = [
    { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: 'from-blue-500 to-blue-600' },
    { id: 'telegram', name: 'Telegram', icon: '📱', color: 'from-gray-800/50 to-gray-700/50' },
    { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-gray-800/50 to-gray-700/50' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-gray-800/50 to-gray-700/50' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'from-gray-800/50 to-gray-700/50' },
    { id: 'snapchat', name: 'Snapchat', icon: '👻', color: 'from-gray-800/50 to-gray-700/50' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'from-gray-800/50 to-gray-700/50' },
    { id: 'custom', name: 'Custom', icon: '⚡', color: 'from-gray-800/50 to-gray-700/50' },
];

export const PlatformStep: React.FC<PlatformStepProps> = ({
    state,
    updateState,
    onNext,
}) => {
    const handlePlatformSelect = (platform: string) => {
        updateState({ platform });
        onNext();
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Choose Your Platform</h2>
                <p className="text-gray-400">Select the social media platform for your mission</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {PLATFORMS.map((platform) => {
                    const isSelected = state.platform === platform.id;
                    const isTwitter = platform.id === 'twitter';

                    return (
                        <button
                            key={platform.id}
                            onClick={() => handlePlatformSelect(platform.id)}
                            className={`p-6 rounded-xl flex flex-col items-center transition-all duration-300 transform hover:scale-105 ${isSelected || isTwitter
                                    ? `bg-gradient-to-br ${platform.color} text-white shadow-lg`
                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                }`}
                        >
                            <span className="text-4xl mb-3">{platform.icon}</span>
                            <span className="font-medium text-lg">{platform.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
