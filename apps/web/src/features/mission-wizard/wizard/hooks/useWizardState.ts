import { useState, useCallback, useEffect } from 'react';
import { WizardState, WizardContextType, INITIAL_WIZARD_STATE, validateStep } from '../types/wizard.types';

// Wizard state version for compatibility
const WIZARD_STATE_VERSION = 1;
const WIZARD_STORAGE_KEY = 'mission-wizard-state';
const WIZARD_STEP_KEY = 'mission-wizard-step';

// Generate a unique tab token for multi-tab safety
const generateTabToken = () => Math.random().toString(36).substring(2, 15);

export const useWizardState = (totalSteps: number): WizardContextType => {
    const [state, setState] = useState<WizardState>(() => {
        // Try to restore from sessionStorage with versioning and multi-tab safety
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem(WIZARD_STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    
                    // Check version compatibility
                    if (parsed.v !== WIZARD_STATE_VERSION) {
                        console.log('Wizard state version mismatch, resetting');
                        sessionStorage.removeItem(WIZARD_STORAGE_KEY);
                        sessionStorage.removeItem(WIZARD_STEP_KEY);
                        return INITIAL_WIZARD_STATE;
                    }
                    
                    // Check tab token for multi-tab safety
                    const currentTabToken = sessionStorage.getItem('mission-wizard-tab-token');
                    if (parsed.tabToken && currentTabToken && parsed.tabToken !== currentTabToken) {
                        console.log('Different tab detected, resetting wizard state');
                        sessionStorage.removeItem(WIZARD_STORAGE_KEY);
                        sessionStorage.removeItem(WIZARD_STEP_KEY);
                        return INITIAL_WIZARD_STATE;
                    }
                    
                    // Set tab token if not exists
                    if (!currentTabToken) {
                        const newTabToken = generateTabToken();
                        sessionStorage.setItem('mission-wizard-tab-token', newTabToken);
                    }
                    
                    return { ...INITIAL_WIZARD_STATE, ...parsed.state };
                } catch (e) {
                    console.warn('Failed to parse saved wizard state:', e);
                    sessionStorage.removeItem(WIZARD_STORAGE_KEY);
                    sessionStorage.removeItem(WIZARD_STEP_KEY);
                }
            } else {
                // Set initial tab token
                sessionStorage.setItem('mission-wizard-tab-token', generateTabToken());
            }
        }
        return INITIAL_WIZARD_STATE;
    });

    const [currentStep, setCurrentStep] = useState<number>(() => {
        // Try to restore from sessionStorage
        if (typeof window !== 'undefined') {
            const saved = Number(sessionStorage.getItem(WIZARD_STEP_KEY));
            if (!Number.isNaN(saved) && saved >= 1 && saved <= totalSteps) return saved;
        }
        return 1;
    });

    // Save state to sessionStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const tabToken = sessionStorage.getItem('mission-wizard-tab-token');
            const stateToSave = {
                v: WIZARD_STATE_VERSION,
                tabToken,
                state
            };
            sessionStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [state]);

    // Save current step to sessionStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(WIZARD_STEP_KEY, currentStep.toString());
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

    const resetWizard = useCallback((reason: string = 'manual') => {
        setState(INITIAL_WIZARD_STATE);
        setCurrentStep(1);
        
        // Clear sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(WIZARD_STORAGE_KEY);
            sessionStorage.removeItem(WIZARD_STEP_KEY);
            sessionStorage.removeItem('mission-wizard-tab-token');
            
            // Telemetry: Log wizard reset
            console.log('=== WIZARD RESET TELEMETRY ===');
            console.log('Event: create_wizard_reset');
            console.log('Reason:', reason);
            console.log('Timestamp:', new Date().toISOString());
            console.log('=============================');
        }
    }, []);

    const validateCurrentStep = useCallback(() => {
        return validateStep(currentStep, state);
    }, [currentStep, state]);

    // ✅ FIX: Keep canGoNext consistent with validation for the active step
    const { isValid } = validateCurrentStep();
    const canGoNext = isValid && currentStep < totalSteps;

    // Debug logging to help troubleshoot validation sync issues
    console.log('=== WIZARD STATE DEBUG ===');
    console.log('currentStep:', currentStep);
    console.log('isValid:', isValid);
    console.log('canGoNext:', canGoNext);
    console.log('totalSteps:', totalSteps);
    console.log('==========================');

    return {
        state,
        updateState,
        currentStep,
        goToStep,
        nextStep,
        previousStep,
        resetWizard,
        canGoNext,
        canGoPrevious: currentStep > 1,
        isLastStep: currentStep === totalSteps,
        isFirstStep: currentStep === 1,
        totalSteps,
        validateCurrentStep,
    } as WizardContextType;
};
