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
    // V1 RESTRICTION: Auto-select Twitter and proceed
    React.useEffect(() => {
        updateState({ platform: 'twitter' });
        // Auto-proceed to next step after a brief delay to show the selection
        const timer = setTimeout(() => {
            onNext();
        }, 1000);
        return () => clearTimeout(timer);
    }, [updateState, onNext]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Platform Selection</h2>
                <p className="text-gray-400">Currently only Twitter missions are supported</p>
            </div>

            {/* V1: Show only Twitter as selected */}
            <div className="flex justify-center">
                <div className="p-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg max-w-sm">
                    <div className="text-center">
                        <span className="text-6xl mb-4 block">𝕏</span>
                        <span className="font-medium text-2xl">X (Twitter)</span>
                        <p className="text-blue-100 mt-2 text-sm">Automatically selected for V1</p>
                    </div>
                </div>
            </div>

            {/* V1 Notice */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                <p className="text-blue-300 text-sm">
                    <strong>V1 Launch:</strong> Currently only Twitter engage missions are supported. More platforms coming soon!
                </p>
            </div>
        </div>
    );
};
