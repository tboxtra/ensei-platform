'use client';

import React from 'react';
import { WizardState } from '../types/wizard.types';

interface ModelStepProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    onNext: () => void;
}

const MODELS = [
    {
        id: 'fixed' as const,
        title: 'Fixed',
        icon: '📊',
        features: ['Fixed participants', 'Predictable cost'],
    },
    {
        id: 'degen' as const,
        title: 'Degen',
        icon: '⚡',
        features: ['Unlimited applicants', 'Time-based'],
    },
];

export const ModelStep: React.FC<ModelStepProps> = ({
    state,
    updateState,
    onNext,
}) => {
    const handleModelSelect = (model: 'fixed' | 'degen') => {
        updateState({ model });
        onNext();
    };

    return (
        <div className="h-full flex flex-col">
            <div className="text-left mb-2">
                <h2 className="text-lg font-bold text-white mb-1">Mission Model</h2>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
                {MODELS.map((model) => {
                    const isSelected = state.model === model.id;
                    const isFixed = model.id === 'fixed';

                    return (
                        <button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id)}
                            className={`relative p-4 rounded-xl text-center transition-all duration-300 ${isSelected || isFixed
                                ? 'bg-blue-500/20 border-2 border-blue-500 text-white'
                                : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:border-gray-600'
                                }`}
                        >
                            {(isSelected || isFixed) && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            )}

                            <div className="text-3xl mb-2">{model.icon}</div>
                            <h3 className="font-bold text-sm mb-2">{model.title}</h3>
                            <div className="space-y-1">
                                {model.features.map((feature, index) => (
                                    <div key={index} className="text-xs opacity-80">{feature}</div>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
