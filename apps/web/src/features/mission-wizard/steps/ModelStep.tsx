'use client';

import React from 'react';
import { useWizardState } from '../state/useWizardState';
import { Model, ModelConfig } from '../types/wizard.types';

const models: ModelConfig[] = [
    {
        id: 'fixed',
        name: 'Fixed Mission',
        description: 'Fixed participants, task-based pricing',
        icon: '📊',
        features: [
            'Predictable costs',
            'Fixed timeline',
            'Task-based rewards'
        ]
    },
    {
        id: 'degen',
        name: 'Degen Mission',
        description: 'Time-boxed, unlimited applicants',
        icon: '⚡',
        features: [
            'Unlimited applicants',
            'Time-based rewards',
            'Competitive pool'
        ]
    }
];

interface ModelStepProps {
    onNext: () => void;
    onPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
}

export function ModelStep({ onNext, canGoNext }: ModelStepProps) {
    const { model, setModel } = useWizardState();

    const handleModelSelect = (selectedModel: Model) => {
        setModel(selectedModel);
        // Auto-advance to next step when model is selected
        setTimeout(() => {
            onNext();
        }, 300); // Small delay for visual feedback
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Mission Model</h2>
            <p className="text-gray-400 mb-8">Choose how your mission will be structured</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {models.map((modelConfig) => {
                    const isSelected = model === modelConfig.id;

                    return (
                        <button
                            key={modelConfig.id}
                            onClick={() => handleModelSelect(modelConfig.id)}
                            className={clsx(
                                'p-8 rounded-xl text-left transition-all duration-300 transform hover:scale-105',
                                isSelected && 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg',
                                !isSelected && 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                            )}
                        >
                            <div className="text-4xl mb-4">{modelConfig.icon}</div>
                            <div className="font-bold text-xl mb-3">{modelConfig.name}</div>
                            <div className="text-sm opacity-90 mb-6">{modelConfig.description}</div>
                            <ul className="text-sm space-y-2">
                                {modelConfig.features.map((feature, index) => (
                                    <li key={index}>• {feature}</li>
                                ))}
                            </ul>
                        </button>
                    );
                })}
            </div>

            {/* Show selected model feedback */}
            {model && (
                <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">
                        ✓ Selected: {models.find(m => m.id === model)?.name}
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
