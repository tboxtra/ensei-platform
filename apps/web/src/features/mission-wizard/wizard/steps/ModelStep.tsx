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
        description: 'Predictable costs with fixed participant cap',
        icon: '📊',
        color: 'from-purple-500 to-indigo-600',
        gradient: 'from-purple-500/20 to-indigo-600/20',
        borderColor: 'border-purple-500/30',
        features: [
            'Set exact participant limit',
            'Predictable total cost',
            'Task-based rewards',
            'Immediate payouts',
        ],
        pricing: 'Pay per participant',
        bestFor: 'Campaigns with specific reach goals',
    },
    {
        id: 'degen' as const,
        title: 'Degen Mission',
        description: 'Time-boxed with unlimited applicants',
        icon: '⚡',
        color: 'from-orange-500 to-red-600',
        gradient: 'from-orange-500/20 to-red-600/20',
        borderColor: 'border-orange-500/30',
        features: [
            'Unlimited applicants',
            'Time-based competition',
            'Winner-takes-all rewards',
            'Viral potential',
        ],
        pricing: 'Fixed cost, winner selection',
        bestFor: 'Viral campaigns and competitions',
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
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Choose Mission Model
                </h2>
                <p className="text-gray-400 text-lg">Select how your mission will be structured and priced</p>
            </div>

            {/* V1 Pre-selected Settings */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                            <span className="text-blue-300 text-lg">𝕏</span>
                        </div>
                        <div>
                            <span className="text-blue-300 font-medium">Platform:</span>
                            <span className="ml-2 bg-blue-500/30 px-3 py-1 rounded-full text-blue-200 font-medium">Twitter</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center">
                            <span className="text-purple-300 text-lg">🎯</span>
                        </div>
                        <div>
                            <span className="text-purple-300 font-medium">Type:</span>
                            <span className="ml-2 bg-purple-500/30 px-3 py-1 rounded-full text-purple-200 font-medium">Engage</span>
                        </div>
                    </div>
                    <div className="text-gray-400 text-xs bg-gray-700/30 px-2 py-1 rounded-full">V1 defaults</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {MODELS.map((model) => {
                    const isSelected = state.model === model.id;
                    const isFixed = model.id === 'fixed';

                    return (
                        <button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id)}
                            className={`group relative p-8 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl ${
                                isSelected || isFixed
                                    ? `bg-gradient-to-br ${model.color} text-white shadow-xl border-2 ${model.borderColor}`
                                    : `bg-gradient-to-br ${model.gradient} text-gray-300 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50`
                            }`}
                        >
                            {/* Selection indicator */}
                            {(isSelected || isFixed) && (
                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-white"></div>
                                </div>
                            )}

                            {/* Icon */}
                            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                {model.icon}
                            </div>

                            {/* Title and Description */}
                            <div className="mb-6">
                                <h3 className="font-bold text-2xl mb-3">{model.title}</h3>
                                <p className="text-sm opacity-90 leading-relaxed">{model.description}</p>
                            </div>

                            {/* Features */}
                            <div className="mb-6">
                                <ul className="space-y-3">
                                    {model.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current mr-3 opacity-60"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pricing and Best For */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div>
                                    <span className="text-xs opacity-75 font-medium">Pricing:</span>
                                    <p className="text-sm font-medium">{model.pricing}</p>
                                </div>
                                <div>
                                    <span className="text-xs opacity-75 font-medium">Best for:</span>
                                    <p className="text-sm opacity-90">{model.bestFor}</p>
                                </div>
                            </div>

                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </button>
                    );
                })}
            </div>

            {/* Help text */}
            <div className="text-center">
                <p className="text-gray-500 text-sm">
                    💡 <strong>Need help choosing?</strong> Fixed missions are great for predictable campaigns, while Degen missions work best for viral competitions.
                </p>
            </div>
        </div>
    );
};
