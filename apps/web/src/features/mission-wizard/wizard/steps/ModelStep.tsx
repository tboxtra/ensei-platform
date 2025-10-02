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
        borderColor: 'border-purple-500/30',
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
        borderColor: 'border-gray-700/50',
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
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">Mission Model</h2>
                <p className="text-gray-400 text-sm">Choose how your mission will be structured</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODELS.map((model) => {
                    const isSelected = state.model === model.id;
                    const isFixed = model.id === 'fixed';
                    return (
                        <button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id)}
                            className={`p-6 rounded-xl text-left transition ${isSelected || isFixed
                                ? `bg-gradient-to-br ${model.color} text-white shadow-lg`
                                : 'card text-gray-300 hover:bg-gray-700/50'
                            }`}
                        >
                            <div className="text-3xl mb-2">{model.icon}</div>
                            <div className="font-bold text-lg mb-1">{model.title}</div>
                            <div className="text-sm opacity-90 mb-3">{model.description}</div>
                            <ul className="text-sm space-y-1">
                                {model.features.map((f, i) => <li key={i}>• {f}</li>)}
                            </ul>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
