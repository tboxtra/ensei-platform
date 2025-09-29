'use client';

import React from 'react';
import { clsx } from 'clsx';

interface WizardNavProps {
    currentStep: number;
    totalSteps: number;
    canGoNext: boolean;
    canGoPrevious: boolean;
    isSubmitting: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onSubmit?: () => void;
    showSubmit?: boolean;
}

export function WizardNav({
    currentStep,
    totalSteps,
    canGoNext,
    canGoPrevious,
    isSubmitting,
    onNext,
    onPrevious,
    onSubmit,
    showSubmit = false
}: WizardNavProps) {
    const isLastStep = currentStep === totalSteps;
    const isFirstStep = currentStep === 1;

    return (
        <div className="flex justify-between items-center">
            <button
                type="button"
                onClick={onPrevious}
                disabled={!canGoPrevious || isSubmitting}
                className={clsx(
                    'bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300',
                    (!canGoPrevious || isSubmitting) && 'opacity-50 cursor-not-allowed',
                    isFirstStep && 'invisible' // Hide on first step
                )}
            >
                ← Previous
            </button>

            <div className="flex-1"></div>

            {isLastStep && showSubmit && onSubmit ? (
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!canGoNext || isSubmitting}
                    className={clsx(
                        'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-12 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-xl',
                        (!canGoNext || isSubmitting) && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    {isSubmitting ? 'Creating Mission...' : '🚀 Create Mission'}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!canGoNext || isSubmitting}
                    className={clsx(
                        'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg',
                        (!canGoNext || isSubmitting) && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    {isLastStep ? 'Review Mission →' : 'Continue →'}
                </button>
            )}
        </div>
    );
}
