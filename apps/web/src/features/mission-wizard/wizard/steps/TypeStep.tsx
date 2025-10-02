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
    const handleTypeSelect = (type: 'engage' | 'content' | 'ambassador') => {
        updateState({ type });
        onNext();
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Mission Type</h2>
                <p className="text-gray-400">What kind of mission do you want to create?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {TYPES.map((type) => {
                    const isSelected = state.type === type.id;
                    const isEngage = type.id === 'engage';

                    return (
                        <button
                            key={type.id}
                            onClick={() => handleTypeSelect(type.id)}
                            className={`p-8 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${isSelected || isEngage
                                ? `bg-gradient-to-br ${type.color} text-white shadow-lg`
                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                }`}
                        >
                            <div className="text-5xl mb-4">{type.icon}</div>
                            <div className="font-bold text-xl mb-3">{type.title}</div>
                            <div className="text-sm opacity-90">{type.description}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
