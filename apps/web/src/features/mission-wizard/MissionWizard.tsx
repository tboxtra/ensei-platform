'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardState } from './state/useWizardState';
import { StepIndicator } from './components/StepIndicator';
import { WizardNav } from './components/WizardNav';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PlatformStep } from './steps/PlatformStep';
import { ModelStep } from './steps/ModelStep';
import { TypeStep } from './steps/TypeStep';
import { TasksStep } from './steps/TasksStep';
import { SettingsStep } from './steps/SettingsStep';
import { DetailsStep } from './steps/DetailsStep';
import { ReviewStep } from './steps/ReviewStep';
import { toCreateMissionRequest, validatePayload } from './adapters/payload';
import { useApi } from '../../hooks/useApi';

// Import the existing useApi hook
// This will be used to submit the mission

export function MissionWizard() {
    const router = useRouter();
    const { createMission, loading, error } = useApi();

    const {
        currentStep,
        platform,
        model,
        type,
        tasks,
        cap,
        audience,
        details,
        isSubmitting,
        nextStep,
        previousStep,
        validateStep,
        setIsSubmitting,
        reset,
        saveToStorage
    } = useWizardState();

    // Check if user is authenticated
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [authLoading, setAuthLoading] = React.useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('firebaseToken');
            const user = localStorage.getItem('user');
            setIsAuthenticated(!!(token && user));
            setAuthLoading(false);
        };

        checkAuth();
    }, []);

    // Save to storage whenever state changes
    useEffect(() => {
        saveToStorage();
    }, [platform, model, type, tasks, cap, audience, details, saveToStorage]);


    // Handle step navigation
    const handleNext = () => {
        const isValid = validateStep(currentStep);
        if (isValid) {
            nextStep();
        }
    };

    const handlePrevious = () => {
        previousStep();
    };

    // Handle mission submission
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Convert wizard state to API payload
            const payload = toCreateMissionRequest(useWizardState.getState());

            // Validate payload
            const validation = validatePayload(payload);
            if (!validation.isValid) {
                console.error('Validation errors:', validation.errors);
                // Show error toast
                return;
            }

            // Submit mission
            const result = await createMission(payload);

            if (result) {
                // Dispatch events for real-time updates
                window.dispatchEvent(new CustomEvent('missions:add', {
                    detail: { mission: result }
                }));
                window.dispatchEvent(new CustomEvent('missions:refetch', {
                    detail: { mission: result }
                }));

                // Reset wizard state
                reset();

                // Redirect to missions page
                router.push(`/missions/my?created=${encodeURIComponent(result.title || 'Mission')}`);
            }
        } catch (error) {
            console.error('Mission creation failed:', error);
            // Error handling is done by the useApi hook
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        router.push('/auth/login');
        return null;
    }

    // Determine if we can go to next step
    const canGoNext = validateStep(currentStep);
    const canGoPrevious = currentStep > 1;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't handle keyboard events if user is typing in an input
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    if (canGoPrevious) {
                        handlePrevious();
                    }
                    break;
                case 'ArrowRight':
                case 'Enter':
                    event.preventDefault();
                    if (canGoNext) {
                        handleNext();
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    // Could add a confirmation dialog here
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canGoNext, canGoPrevious, handleNext, handlePrevious]);

    // Render current step
    const renderCurrentStep = () => {
        const stepProps = {
            onNext: handleNext,
            onPrevious: handlePrevious,
            canGoNext,
            canGoPrevious
        };

        switch (currentStep) {
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
                return <ReviewStep {...stepProps} onSubmit={handleSubmit} isSubmitting={isSubmitting || loading} />;
            default:
                return <div className="text-center text-white">Invalid step</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
            <div className="max-w-4xl mx-auto px-4 py-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold gradient-text mb-2">
                        Create New Mission
                    </h1>
                    <p className="text-gray-400">Step-by-step mission creation wizard</p>
                </div>

                {/* Progress Steps */}
                <StepIndicator currentStep={currentStep} />

                {/* Step Content */}
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-8 mb-8 inset-shadow min-h-[500px] transition-all duration-300">
                    <div className="animate-fadeIn">
                        {renderCurrentStep()}
                    </div>
                </div>

                {/* Navigation */}
                <WizardNav
                    currentStep={currentStep}
                    totalSteps={7}
                    canGoNext={canGoNext}
                    canGoPrevious={canGoPrevious}
                    isSubmitting={isSubmitting || loading}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onSubmit={handleSubmit}
                    showSubmit={currentStep === 7}
                />

                {/* Error Display */}
                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Keyboard Shortcuts */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="text-sm font-bold text-blue-400 mb-2">⌨️ Keyboard Shortcuts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
                        <div>
                            <div className="font-medium text-white mb-1">Navigation:</div>
                            <ul className="space-y-1">
                                <li>• <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">←</kbd> Previous step</li>
                                <li>• <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">→</kbd> Next step</li>
                                <li>• <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Enter</kbd> Continue</li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-medium text-white mb-1">Features:</div>
                            <ul className="space-y-1">
                                <li>• Auto-advance on single selections</li>
                                <li>• Real-time validation</li>
                                <li>• State persistence</li>
                                <li>• Responsive design</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add the CSS styles that were in the demo
const styles = `
  .gradient-text {
    background: linear-gradient(to right, #4ade80, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .inset-shadow {
    box-shadow: inset -2px -2px 6px rgba(0, 0, 0, 0.4), inset 2px 2px 6px rgba(255, 255, 255, 0.05);
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
