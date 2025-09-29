'use client';

import React, { useState, useEffect } from 'react';
import { useWizardState } from './wizard/hooks/useWizardState';
import { StepIndicator } from './wizard/components/StepIndicator';
import { WizardNavigation } from './wizard/components/WizardNavigation';
import { PlatformStep } from './wizard/steps/PlatformStep';
import { ModelStep } from './wizard/steps/ModelStep';
import { TypeStep } from './wizard/steps/TypeStep';
import { TasksStep } from './wizard/steps/TasksStep';
import { SettingsStep } from './wizard/steps/SettingsStep';
import { DetailsStep } from './wizard/steps/DetailsStep';
import { ReviewStep } from './wizard/steps/ReviewStep';
import { WizardState } from './wizard/types/wizard.types';

interface MissionWizardProps {
    onSubmit: (missionData: any) => void;
    isLoading?: boolean;
    error?: string | null;
}

const WIZARD_STEPS = [
    { id: 1, title: 'Platform', description: 'Choose platform' },
    { id: 2, title: 'Model', description: 'Mission structure' },
    { id: 3, title: 'Type', description: 'Mission category' },
    { id: 4, title: 'Tasks', description: 'Select activities' },
    { id: 5, title: 'Settings', description: 'Configure' },
    { id: 6, title: 'Details', description: 'Content' },
    { id: 7, title: 'Review', description: 'Create' },
];

export const MissionWizard: React.FC<MissionWizardProps> = ({
    onSubmit,
    isLoading = false,
    error,
}) => {
    const wizard = useWizardState(WIZARD_STEPS.length);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Check authentication
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('firebaseToken');
            const user = localStorage.getItem('user');
            setIsAuthenticated(!!(token && user));
            setAuthLoading(false);
        };

        checkAuth();
    }, []);

    const handleStepNext = () => {
        if (wizard.canGoNext) {
            wizard.nextStep();
        }
    };

    const handleStepPrevious = () => {
        if (wizard.canGoPrevious) {
            wizard.previousStep();
        }
    };

    const handleMissionSubmit = () => {
        // Transform wizard state to match API expectations
        const missionData = {
            platform: wizard.state.platform,
            model: wizard.state.model,
            type: wizard.state.type,
            tasks: wizard.state.tasks,
            cap: wizard.state.cap,
            isPremium: wizard.state.isPremium,
            duration: wizard.state.duration,
            rewardPerUser: wizard.state.rewardPerUser,
            contentLink: wizard.state.contentLink,
            instructions: wizard.state.instructions,
            // Custom platform fields
            customTitle: wizard.state.customTitle,
            customDescription: wizard.state.customDescription,
            customTimeMinutes: wizard.state.customTimeMinutes,
            customProofMode: wizard.state.customProofMode,
            customApiVerifier: wizard.state.customApiVerifier,
            // Degen specific fields
            selectedDegenPreset: wizard.state.selectedDegenPreset,
            winnersCap: wizard.state.winnersCap,
        };

        onSubmit(missionData);
    };

    const renderCurrentStep = () => {
        const stepProps = {
            state: wizard.state,
            updateState: wizard.updateState,
            onNext: handleStepNext,
        };

        switch (wizard.currentStep) {
            case 1:
                return <PlatformStep {...stepProps} />;
            case 2:
                return <ModelStep {...stepProps} />;
            case 3:
                return <TypeStep {...stepProps} />;
            case 4:
                return <TasksStep {...stepProps} />;
            case 5:
                return <SettingsStep {...stepProps} />;
            case 6:
                return <DetailsStep {...stepProps} />;
            case 7:
                return (
                    <ReviewStep
                        state={wizard.state}
                        onSubmit={handleMissionSubmit}
                        isLoading={isLoading}
                    />
                );
            default:
                return <PlatformStep {...stepProps} />;
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
                <p className="text-gray-400 mb-6">Please log in to create a mission.</p>
                <button
                    onClick={() => window.location.href = '/auth/login'}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold gradient-text mb-2">
                    Create New Mission
                </h1>
            </div>

            {/* Progress Steps */}
            <StepIndicator
                currentStep={wizard.currentStep}
                totalSteps={WIZARD_STEPS.length}
                steps={WIZARD_STEPS}
            />

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Step Content */}
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-8 mb-8 inset-shadow min-h-[500px]">
                {renderCurrentStep()}
            </div>

            {/* Navigation */}
            {wizard.currentStep < 7 && (
                <WizardNavigation
                    onPrevious={handleStepPrevious}
                    onNext={handleStepNext}
                    canGoPrevious={wizard.canGoPrevious}
                    canGoNext={wizard.canGoNext}
                    isLastStep={wizard.isLastStep}
                    isFirstStep={wizard.isFirstStep}
                    isLoading={isLoading}
                />
            )}

        </div>
    );
};
