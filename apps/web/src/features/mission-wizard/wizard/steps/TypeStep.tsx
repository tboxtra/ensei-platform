'use client';

import React from 'react';
import { WizardState } from '../types/wizard.types';

interface TypeStepProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    onNext: () => void;
}

const TYPES = [
    {
        id: 'engage' as const,
        title: 'Engage',
        description: 'Interact with content',
        icon: '🎯',
        color: 'from-blue-500 to-purple-600',
    },
    {
        id: 'content' as const,
        title: 'Content Creation',
        description: 'Create original content',
        icon: '✍️',
        color: 'from-gray-800/50 to-gray-700/50',
    },
    {
        id: 'ambassador' as const,
        title: 'Ambassador',
        description: 'Represent the brand',
        icon: '👑',
        color: 'from-gray-800/50 to-gray-700/50',
    },
];

export const TypeStep: React.FC<TypeStepProps> = ({
    state,
    updateState,
    onNext,
}) => {
    // V1 RESTRICTION: Auto-select "engage" and proceed
    React.useEffect(() => {
        updateState({ type: 'engage' });
        // Auto-proceed to next step after a brief delay to show the selection
        const timer = setTimeout(() => {
            onNext();
        }, 1000);
        return () => clearTimeout(timer);
    }, [updateState, onNext]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Mission Type</h2>
                <p className="text-gray-400">Currently only engage missions are supported</p>
            </div>

            {/* V1: Show only Engage as selected */}
            <div className="flex justify-center">
                <div className="p-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg max-w-sm">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <div className="font-bold text-2xl mb-3">Engage</div>
                        <div className="text-blue-100 text-sm">Interact with content</div>
                        <p className="text-blue-200 mt-2 text-xs">Automatically selected for V1</p>
                    </div>
                </div>
            </div>

            {/* V1 Notice */}
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                <p className="text-purple-300 text-sm">
                    <strong>V1 Launch:</strong> Currently only engage missions are supported. Content creation and ambassador missions coming soon!
                </p>
            </div>
        </div>
    );
};
