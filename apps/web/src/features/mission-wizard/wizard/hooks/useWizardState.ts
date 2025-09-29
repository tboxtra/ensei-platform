import { useState, useCallback, useEffect } from 'react';
import { WizardState, WizardContextType, INITIAL_WIZARD_STATE } from '../types/wizard.types';

export const useWizardState = (totalSteps: number): WizardContextType => {
    const [state, setState] = useState<WizardState>(() => {
        // Try to restore from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mission-wizard-state');
            if (saved) {
                try {
                    return { ...INITIAL_WIZARD_STATE, ...JSON.parse(saved) };
                } catch (e) {
                    console.warn('Failed to parse saved wizard state:', e);
                }
            }
        }
        return INITIAL_WIZARD_STATE;
    });

    const [currentStep, setCurrentStep] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mission-wizard-step');
            return saved ? parseInt(saved, 10) : 1;
        }
        return 1;
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('mission-wizard-state', JSON.stringify(state));
        }
    }, [state]);

    // Save current step to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('mission-wizard-step', currentStep.toString());
        }
    }, [currentStep]);

    const updateState = useCallback((updates: Partial<WizardState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const goToStep = useCallback((step: number) => {
        if (step >= 1 && step <= totalSteps) {
            setCurrentStep(step);
        }
    }, [totalSteps]);

    const nextStep = useCallback(() => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, totalSteps]);

    const previousStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);


    return {
        state,
        updateState,
        currentStep,
        goToStep,
        nextStep,
        previousStep,
        canGoNext: currentStep < totalSteps,
        canGoPrevious: currentStep > 1,
        isLastStep: currentStep === totalSteps,
        isFirstStep: currentStep === 1,
        totalSteps,
    } as WizardContextType;
};
