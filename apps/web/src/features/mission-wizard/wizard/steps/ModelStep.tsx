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
        title: 'Fixed Mission',
        description: 'Fixed participants, task-based pricing',
        icon: '📊',
        color: 'from-purple-500 to-indigo-600',
        features: [
            'Predictable costs',
            'Fixed timeline',
            'Task-based rewards',
        ],
    },
    {
        id: 'degen' as const,
        title: 'Degen Mission',
        description: 'Time-boxed, unlimited applicants',
        icon: '⚡',
        color: 'from-gray-800/50 to-gray-700/50',
        features: [
            'Unlimited applicants',
            'Time-based rewards',
            'Competitive pool',
        ],
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
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Mission Model</h2>
                <p className="text-gray-400">Choose how your mission will be structured</p>
            </div>

            {/* V1 Pre-selected Settings */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-300">Platform:</span>
                        <span className="bg-blue-500/30 px-2 py-1 rounded text-blue-200">Twitter</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-purple-300">Type:</span>
                        <span className="bg-purple-500/30 px-2 py-1 rounded text-purple-200">Engage</span>
                    </div>
                    <span className="text-gray-400">(V1 defaults)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {MODELS.map((model) => {
                    const isSelected = state.model === model.id;
                    const isFixed = model.id === 'fixed';

                    return (
                        <button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id)}
                            className={`p-8 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${isSelected || isFixed
                                    ? `bg-gradient-to-br ${model.color} text-white shadow-lg`
                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                }`}
                        >
                            <div className="text-4xl mb-4">{model.icon}</div>
                            <div className="font-bold text-xl mb-3">{model.title}</div>
                            <div className="text-sm opacity-90 mb-6">{model.description}</div>
                            <ul className="text-sm space-y-2">
                                {model.features.map((feature, index) => (
                                    <li key={index}>• {feature}</li>
                                ))}
                            </ul>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
