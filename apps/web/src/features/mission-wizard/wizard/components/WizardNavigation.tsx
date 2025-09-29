'use client';

import React from 'react';
import { ModernButton } from '../../../../components/ui/ModernButton';

interface WizardNavigationProps {
    onPrevious: () => void;
    onNext: () => void;
    onReset?: () => void;
    canGoPrevious: boolean;
    canGoNext: boolean;
    isLastStep: boolean;
    isFirstStep: boolean;
    isLoading?: boolean;
    nextButtonText?: string;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
    onPrevious,
    onNext,
    onReset,
    canGoPrevious,
    canGoNext,
    isLastStep,
    isFirstStep,
    isLoading = false,
    nextButtonText,
}) => {
    const getNextButtonText = () => {
        if (nextButtonText) return nextButtonText;
        if (isLastStep) return 'Create Mission';
        return 'Continue →';
    };

    return (
        <div className="flex justify-between items-center mt-8">
            <div className="flex gap-3">
                {!isFirstStep && (
                    <ModernButton
                        onClick={onPrevious}
                        variant="secondary"
                        disabled={!canGoPrevious || isLoading}
                        className="px-6 py-3"
                    >
                        ← Previous
                    </ModernButton>
                )}
                {onReset && !isFirstStep && (
                    <ModernButton
                        onClick={onReset}
                        variant="secondary"
                        disabled={isLoading}
                        className="px-4 py-3 text-sm"
                    >
                        🔄 Start Over
                    </ModernButton>
                )}
            </div>

            <div>
                <ModernButton
                    onClick={onNext}
                    variant="primary"
                    disabled={!canGoNext || isLoading}
                    loading={isLoading}
                    className="px-8 py-3"
                >
                    {getNextButtonText()}
                </ModernButton>
            </div>
        </div>
    );
};
