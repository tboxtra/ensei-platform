'use client';

import React, { useState, useEffect } from 'react';
import { useWizardState } from './wizard/hooks/useWizardState';
import { StepIndicator } from './wizard/components/StepIndicator';
import { WizardNavigation } from './wizard/components/WizardNavigation';
// REMOVE these when V1: PlatformStep, TypeStep
// import { PlatformStep } from './wizard/steps/PlatformStep';
// import { TypeStep } from './wizard/steps/TypeStep';
import { ModelStep } from './wizard/steps/ModelStep';
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

// V1 flag in case you want to re-enable later
const V1_TWITTER_ENGAGE_ONLY = true;

// Shrunk flow (5 steps) to remove Platform + Type
const WIZARD_STEPS = [
    { id: 1, title: 'Model', description: 'Mission structure' },
    { id: 2, title: 'Tasks', description: 'Select activities' },
    { id: 3, title: 'Settings', description: 'Configure' },
    { id: 4, title: 'Details', description: 'Content' },
    { id: 5, title: 'Review', description: 'Create' },
];

export const MissionWizard: React.FC<MissionWizardProps> = ({
    onSubmit,
    isLoading = false,
    error,
}) => {
    const wizard = useWizardState(WIZARD_STEPS.length);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

    // 🔒 Lock to Twitter + Engage for V1
    useEffect(() => {
        if (!V1_TWITTER_ENGAGE_ONLY) return;
        wizard.updateState({
            platform: 'twitter',
            type: 'engage',
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStepNext = () => {
        // Validate current step before proceeding
        const validation = wizard.validateCurrentStep();
        if (validation.isValid && wizard.canGoNext) {
            setValidationErrors([]);
            wizard.nextStep();
        } else {
            // Show validation errors
            setValidationErrors(validation.errors);
        }
    };

    const handleStepPrevious = () => {
        if (wizard.canGoPrevious) {
            wizard.previousStep();
        }
    };

    const handleMissionSubmit = () => {
        const missionData = {
            platform: 'twitter',
            model: wizard.state.model,
            type: 'engage',
            tasks: wizard.state.tasks,
            isPremium: wizard.state.isPremium,
            contentLink: wizard.state.contentLink,
            instructions: wizard.state.instructions,
            ...(wizard.state.model === 'fixed' && {
                cap: wizard.state.cap,
                rewardPerUser: wizard.state.rewardPerUser,
            }),
            ...(wizard.state.model === 'degen' && {
                selectedDegenPreset: wizard.state.selectedDegenPreset,
                winnersPerMission: wizard.state.winnersPerMission ?? wizard.state.winnersCap,
                duration: wizard.state.duration,
            }),
        };

        // Debug logging to help troubleshoot
        console.log('=== MISSION SUBMISSION DEBUG ===');
        console.log('Wizard state:', wizard.state);
        console.log('Transformed mission data:', missionData);
        console.log('===============================');

        onSubmit(missionData);
    };

    const renderCurrentStep = () => {
        const stepProps = {
            state: wizard.state,
            updateState: wizard.updateState,
            onNext: handleStepNext,
        };
        switch (wizard.currentStep) {
            case 1: return <ModelStep {...stepProps} />;
            case 2: return <TasksStep {...stepProps} />;
            case 3: return <SettingsStep {...stepProps} />;
            case 4: return <DetailsStep {...stepProps} />;
            case 5:
                return (
                    <ReviewStep
                        state={wizard.state}
                        onSubmit={handleMissionSubmit}
                        onReset={wizard.resetWizard}
                        isLoading={isLoading}
                    />
                );
            default: return <ModelStep {...stepProps} />;
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
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold text-white">Create New Mission</h1>
                <p className="text-xs text-gray-400 mt-1">V1: Twitter · Engage missions only</p>
            </div>

            <StepIndicator
                currentStep={wizard.currentStep}
                totalSteps={WIZARD_STEPS.length}
                steps={WIZARD_STEPS}
            />

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 my-6">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* No inner scroll: keep content compact */}
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 mb-6 inset-shadow">
                {renderCurrentStep()}
            </div>

            {wizard.currentStep < 5 && (
                <WizardNavigation
                    onPrevious={handleStepPrevious}
                    onNext={handleStepNext}
                    onReset={wizard.resetWizard}
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
