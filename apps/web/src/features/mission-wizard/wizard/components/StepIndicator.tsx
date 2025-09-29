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
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 mb-8 inset-shadow">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={step.id}>
                            <div className={`step-indicator ${status} flex items-center`}>
                                {getStepIcon(step.id, status)}
                                <div className="hidden sm:block ml-3">
                                    <div className="text-sm font-medium">{step.title}</div>
                                    <div className="text-xs opacity-75">{step.description}</div>
                                </div>
                            </div>

                            {!isLast && (
                                <div className={`flex-1 h-0.5 mx-4 ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-700'
                                    }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
