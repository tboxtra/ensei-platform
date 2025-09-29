'use client';

import React from 'react';
import { useWizardState } from '../state/useWizardState';
import { Platform, PlatformConfig } from '../types/wizard.types';

const platforms: PlatformConfig[] = [
    {
        id: 'twitter',
        name: 'X (Twitter)',
        icon: '𝕏',
        available: true
    },
    {
        id: 'telegram',
        name: 'Telegram',
        icon: '📱',
        available: false // Not yet implemented
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: '📸',
        available: false // Not yet implemented
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        available: false // Not yet implemented
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: '📘',
        available: false // Not yet implemented
    },
    {
        id: 'snapchat',
        name: 'Snapchat',
        icon: '👻',
        available: false // Not yet implemented
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: '💬',
        available: false // Not yet implemented
    },
    {
        id: 'custom',
        name: 'Custom',
        icon: '⚡',
        available: true
    }
];

interface PlatformStepProps {
    onNext: () => void;
    onPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
}

export function PlatformStep({ onNext, canGoNext }: PlatformStepProps) {
    const { platform, setPlatform } = useWizardState();

    const handlePlatformSelect = (selectedPlatform: Platform) => {
        setPlatform(selectedPlatform);
        // Auto-advance to next step when platform is selected
        setTimeout(() => {
            onNext();
        }, 300); // Small delay for visual feedback
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Choose Your Platform</h2>
            <p className="text-gray-400 mb-8">Select the social media platform for your mission</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {platforms.map((platformConfig) => {
                    const isSelected = platform === platformConfig.id;
                    const isAvailable = platformConfig.available;

                    return (
                        <button
                            key={platformConfig.id}
                            onClick={() => isAvailable && handlePlatformSelect(platformConfig.id)}
                            disabled={!isAvailable}
                            className={clsx(
                                'p-6 rounded-xl flex flex-col items-center transition-all duration-300 transform hover:scale-105',
                                isSelected && isAvailable && 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg',
                                !isSelected && isAvailable && 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50',
                                !isAvailable && 'bg-gray-800/30 text-gray-500 border border-gray-700/30 cursor-not-allowed opacity-50'
                            )}
                        >
                            <span className="text-4xl mb-3">{platformConfig.icon}</span>
                            <span className="font-medium text-lg">{platformConfig.name}</span>
                            {!isAvailable && (
                                <span className="text-xs mt-1 opacity-75">Coming Soon</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Show selected platform feedback */}
            {platform && (
                <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">
                        ✓ Selected: {platforms.find(p => p.id === platform)?.name}
                    </p>
                </div>
            )}
        </div>
    );
}

// Helper function for conditional classes
function clsx(...classes: (string | boolean | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
