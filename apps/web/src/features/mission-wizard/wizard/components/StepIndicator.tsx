'use client';

import React from 'react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    steps: Array<{
        id: number;
        title: string;
        description: string;
    }>;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep,
    totalSteps,
    steps,
}) => {
    const getStepStatus = (stepId: number) => {
        if (stepId < currentStep) return 'completed';
        if (stepId === currentStep) return 'active';
        return 'pending';
    };

    const getStepIcon = (stepId: number, status: string) => {
        if (status === 'completed') {
            return (
                <div className="w-8 h-8 rounded-full bg-white text-green-600 flex items-center justify-center text-sm font-bold">
                    ✓
                </div>
            );
        }
        return (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${status === 'active'
                    ? 'bg-white text-blue-600'
                    : 'bg-gray-600 text-gray-400'
                }`}>
                {stepId}
            </div>
        );
    };

    return (
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 mb-8 inset-shadow border border-gray-700/50">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={step.id}>
                            <div className={`step-indicator ${status} flex items-center group`}>
                                <div className="relative">
                                    {getStepIcon(step.id, status)}
                                    {status === 'active' && (
                                        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                                    )}
                                </div>
                                <div className="hidden sm:block ml-4">
                                    <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                                        {step.title}
                                    </div>
                                    <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                                        {step.description}
                                    </div>
                                </div>
                            </div>

                            {!isLast && (
                                <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-500 ${
                                    step.id < currentStep 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                        : 'bg-gray-700'
                                }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
