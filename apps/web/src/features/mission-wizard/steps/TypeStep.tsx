'use client';

import React from 'react';
import { useWizardState } from '../state/useWizardState';
import { Type, TypeConfig } from '../types/wizard.types';

const types: TypeConfig[] = [
    {
        id: 'engage',
        name: 'Engage',
        description: 'Interact with content',
        icon: '🎯'
    },
    {
        id: 'content',
        name: 'Content Creation',
        description: 'Create original content',
        icon: '✍️'
    },
    {
        id: 'ambassador',
        name: 'Ambassador',
        description: 'Represent the brand',
        icon: '👑'
    }
];

interface TypeStepProps {
    onNext: () => void;
    onPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
}

export function TypeStep({ onNext, canGoNext }: TypeStepProps) {
    const { type, setType } = useWizardState();

    const handleTypeSelect = (selectedType: Type) => {
        setType(selectedType);
        // Auto-advance to next step when type is selected
        setTimeout(() => {
            onNext();
        }, 300); // Small delay for visual feedback
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Mission Type</h2>
            <p className="text-gray-400 mb-8">What kind of mission do you want to create?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {types.map((typeConfig) => {
                    const isSelected = type === typeConfig.id;

                    return (
                        <button
                            key={typeConfig.id}
                            onClick={() => handleTypeSelect(typeConfig.id)}
                            className={clsx(
                                'p-8 rounded-xl text-center transition-all duration-300 transform hover:scale-105',
                                isSelected && 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg',
                                !isSelected && 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                            )}
                        >
                            <div className="text-5xl mb-4">{typeConfig.icon}</div>
                            <div className="font-bold text-xl mb-3">{typeConfig.name}</div>
                            <div className="text-sm opacity-90">{typeConfig.description}</div>
                        </button>
                    );
                })}
            </div>

            {/* Show selected type feedback */}
            {type && (
                <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">
                        ✓ Selected: {types.find(t => t.id === type)?.name}
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
