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
