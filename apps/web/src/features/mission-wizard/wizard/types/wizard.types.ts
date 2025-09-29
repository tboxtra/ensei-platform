export interface WizardState {
    // Step 1: Platform
    platform: string;

    // Step 2: Model
    model: 'fixed' | 'degen';

    // Step 3: Type
    type: 'engage' | 'content' | 'ambassador';

    // Step 4: Tasks
    tasks: string[];

    // Step 5: Settings
    cap: number;
    isPremium: boolean;
    duration: number;
    rewardPerUser: number;

    // Step 6: Details
    contentLink: string;
    instructions: string;

    // Custom platform specific fields
    customTitle: string;
    customDescription: string;
    customTimeMinutes: number;
    customProofMode: 'social-post' | 'api';
    customApiVerifier: string;

    // Degen specific fields
    selectedDegenPreset: any;
    winnersCap: number;
}

export interface WizardStep {
    id: number;
    title: string;
    description: string;
    component: React.ComponentType<any>;
    validation?: (state: WizardState) => boolean;
}

export interface WizardContextType {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    currentStep: number;
    goToStep: (step: number) => void;
    nextStep: () => void;
    previousStep: () => void;
    resetWizard: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
    isLastStep: boolean;
    isFirstStep: boolean;
    totalSteps: number;
    validateCurrentStep: () => { isValid: boolean; errors: string[] };
}

export const INITIAL_WIZARD_STATE: WizardState = {
    platform: 'twitter',
    model: 'fixed',
    type: 'engage',
    tasks: [],
    cap: 100,
    isPremium: false,
    duration: 24,
    rewardPerUser: 0,
    contentLink: '',
    instructions: '',
    customTitle: '',
    customDescription: '',
    customTimeMinutes: 30,
    customProofMode: 'social-post',
    customApiVerifier: '',
    selectedDegenPreset: { hours: 8, costUSD: 150, maxWinners: 3, label: '8h - $150' },
    winnersCap: 3,
};

// Validation functions for each step
export const validateStep = (step: number, state: WizardState): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
        case 1: // Platform
            if (!state.platform) {
                errors.push('Please select a platform');
            }
            break;

        case 2: // Model
            if (!state.model) {
                errors.push('Please select a mission model');
            }
            break;

        case 3: // Type
            if (!state.type) {
                errors.push('Please select a mission type');
            }
            break;

        case 4: // Tasks
            if (!state.tasks || state.tasks.length === 0) {
                errors.push('Please select at least one task');
            }
            if (state.model === 'degen' && state.tasks.length > 3) {
                errors.push('Degen missions can have at most 3 tasks');
            }
            break;

        case 5: // Settings
            if (state.model === 'fixed') {
                if (!state.cap || state.cap <= 0) {
                    errors.push('Please set a valid participant cap');
                }
                if (state.cap > 1000) {
                    errors.push('Participant cap cannot exceed 1000');
                }
            } else if (state.model === 'degen') {
                if (!state.selectedDegenPreset) {
                    errors.push('Please select a duration preset');
                }
                if (!state.winnersCap || state.winnersCap <= 0) {
                    errors.push('Please set a valid winners cap');
                }
                if (state.winnersCap > (state.selectedDegenPreset?.maxWinners || 10)) {
                    errors.push(`Winners cap cannot exceed ${state.selectedDegenPreset?.maxWinners || 10}`);
                }
            }
            break;

        case 6: // Details
            if (!state.contentLink || state.contentLink.trim() === '') {
                errors.push('Please provide a content link');
            }
            if (!state.instructions || state.instructions.trim() === '') {
                errors.push('Please provide instructions');
            }
            if (state.instructions && state.instructions.trim().length < 10) {
                errors.push('Instructions must be at least 10 characters long');
            }
            // Validate URL format
            if (state.contentLink) {
                try {
                    new URL(state.contentLink);
                } catch {
                    errors.push('Please provide a valid URL for the content link');
                }
            }
            break;

        case 7: // Review
            // Final validation - all previous steps should be valid
            for (let i = 1; i <= 6; i++) {
                const stepValidation = validateStep(i, state);
                if (!stepValidation.isValid) {
                    errors.push(...stepValidation.errors);
                }
            }
            break;

        default:
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
