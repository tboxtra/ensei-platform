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
    winnersPerMission: number;
    maxWinners: number;
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
    winnersPerMission: 3,
    maxWinners: 3,
};

// URL validation helpers to match backend
const normalizeUrl = (url: string) =>
    (url || '')
        .replace(/x\.com/gi, 'twitter.com')
        .split(/[?#]/)[0]
        .trim();

const isValidTweet = (url: string) =>
    /^(https?:\/\/)?(www\.|mobile\.)?(twitter\.com)\/[^/]+\/status\/\d+$/i.test(normalizeUrl(url));

const hasTasks = (platform: string, tasks: string[] | undefined) =>
    platform === 'custom' ? true : Array.isArray(tasks) && tasks.length > 0;

// Main validation function that matches backend requirements
export const canContinueToReview = (m: WizardState) => {
    const baseOk =
        !!m.platform &&
        !!m.type &&
        !!m.instructions?.trim() &&
        !!m.contentLink &&
        isValidTweet(m.contentLink) &&
        hasTasks(m.platform, m.tasks);

    if (!baseOk) return false;

    if (m.model === 'fixed') {
        return Number.isFinite(m.cap) && m.cap > 0 &&
            Number.isFinite(m.rewardPerUser) && m.rewardPerUser > 0;
    }

    if (m.model === 'degen') {
        // allow either preset with costUSD or explicit winners
        const winners = m.winnersPerMission ?? m.winnersCap ?? m.maxWinners;
        const hasPresetCost = Number.isFinite(m?.selectedDegenPreset?.costUSD) && m.selectedDegenPreset.costUSD > 0;
        return (Number.isFinite(winners) && winners! > 0) && hasPresetCost;
    }

    return false;
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
            if (!hasTasks(state.platform, state.tasks)) {
                errors.push('Please select at least one task');
            }
            if (state.model === 'degen' && state.tasks.length > 3) {
                errors.push('Degen missions can have at most 3 tasks');
            }
            break;

        case 5: // Settings
            if (state.model === 'fixed') {
                if (!Number.isFinite(state.cap) || state.cap <= 0) {
                    errors.push('Please set a valid participant cap');
                }
                if (state.cap > 1000) {
                    errors.push('Participant cap cannot exceed 1000');
                }
                if (!Number.isFinite(state.rewardPerUser) || state.rewardPerUser <= 0) {
                    errors.push('Please set a valid reward per user');
                }
            } else if (state.model === 'degen') {
                if (!state.selectedDegenPreset) {
                    errors.push('Please select a duration preset');
                }
                const winners = state.winnersPerMission ?? state.winnersCap ?? state.maxWinners;
                if (!Number.isFinite(winners) || winners! <= 0) {
                    errors.push('Please set a valid winners cap');
                }
                const hasPresetCost = Number.isFinite(state?.selectedDegenPreset?.costUSD) && state.selectedDegenPreset.costUSD > 0;
                if (!hasPresetCost) {
                    errors.push('Please select a valid duration preset with cost');
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
            // Validate URL format using backend-compatible validation
            if (state.contentLink && !isValidTweet(state.contentLink)) {
                errors.push('Please provide a valid Twitter/X URL (e.g., https://twitter.com/user/status/1234567890)');
            }
            break;

        case 7: // Review
            // Use the main validation function
            if (!canContinueToReview(state)) {
                errors.push('Please complete all required fields to review your mission');
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
