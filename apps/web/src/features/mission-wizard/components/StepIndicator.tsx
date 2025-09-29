'use client';

import React from 'react';
import { clsx } from 'clsx';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps?: number;
}

const steps = [
    { number: 1, title: 'Platform', subtitle: 'Choose platform' },
    { number: 2, title: 'Model', subtitle: 'Mission structure' },
    { number: 3, title: 'Type', subtitle: 'Mission category' },
    { number: 4, title: 'Tasks', subtitle: 'Select activities' },
    { number: 5, title: 'Settings', subtitle: 'Configure' },
    { number: 6, title: 'Details', subtitle: 'Content' },
    { number: 7, title: 'Review', subtitle: 'Create' }
];

export function StepIndicator({ currentStep, totalSteps = 7 }: StepIndicatorProps) {
    return (
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 mb-8 inset-shadow">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = step.number < currentStep;
                    const isActive = step.number === currentStep;
                    const isPending = step.number > currentStep;

                    return (
                        <React.Fragment key={step.number}>
                            <div className={clsx(
                                'step-indicator flex items-center transition-all duration-300',
                                isCompleted && 'completed',
                                isActive && 'active',
                                isPending && 'pending'
                            )}>
                                <div className={clsx(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3',
                                    isCompleted && 'bg-white text-green-600',
                                    isActive && 'bg-white text-blue-600',
                                    isPending && 'bg-gray-600 text-gray-400'
                                )}>
                                    {isCompleted ? '✓' : step.number}
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-medium">{step.title}</div>
                                    <div className="text-xs opacity-75">{step.subtitle}</div>
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 bg-gray-700 mx-4"></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

// Add the CSS styles that were in the demo
const styles = `
  .inset-shadow {
    box-shadow: inset -2px -2px 6px rgba(0, 0, 0, 0.4), inset 2px 2px 6px rgba(255, 255, 255, 0.05);
  }
  
  .step-indicator.completed {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }
  
  .step-indicator.active {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
  }
  
  .step-indicator.pending {
    background: #374151;
    color: #9ca3af;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
