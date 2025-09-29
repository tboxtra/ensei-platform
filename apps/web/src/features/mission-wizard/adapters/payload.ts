import { WizardState } from '../types/wizard.types';

// Interface matching the existing API contract
export interface CreateMissionRequest {
    platform: string;
    type: string;
    model: 'fixed' | 'degen';
    tasks: string[];
    cap: number;
    isPremium: boolean;
    tweetLink: string;
    instructions: string;
    durationHours?: number;
    winnersCap?: number;
    // Additional fields that might be needed
    title?: string;
    brief?: string;
    tg_invite?: string;
}

// Convert wizard state to API payload
export function toCreateMissionRequest(state: WizardState): CreateMissionRequest {
    if (!state.platform || !state.type || !state.model || !state.cap) {
        throw new Error('Missing required fields for mission creation');
    }

    const payload: CreateMissionRequest = {
        platform: state.platform,
        type: state.type,
        model: state.model,
        tasks: state.tasks,
        cap: state.cap,
        isPremium: state.audience === 'premium',
        instructions: state.details.instructions,
        tweetLink: state.details.tweetLink || '',
    };

    // Add model-specific fields
    if (state.model === 'degen') {
        // For degen missions, we might need duration and winners cap
        payload.durationHours = 24; // Default duration
        payload.winnersCap = 3; // Default winners cap
    }

    return payload;
}

// Validate payload before sending to API
export function validatePayload(payload: CreateMissionRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!payload.platform) {
        errors.push('Platform is required');
    }

    if (!payload.type) {
        errors.push('Type is required');
    }

    if (!payload.model) {
        errors.push('Model is required');
    }

    if (!payload.tasks || payload.tasks.length === 0) {
        errors.push('At least one task is required');
    }

    if (!payload.cap || payload.cap < 1) {
        errors.push('Participant cap must be at least 1');
    }

    if (!payload.instructions || payload.instructions.length < 10) {
        errors.push('Instructions must be at least 10 characters long');
    }

    // Validate URL if provided
    if (payload.tweetLink) {
        try {
            new URL(payload.tweetLink);
        } catch {
            errors.push('Invalid URL format for tweet link');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Helper function to get task pricing for a specific platform/type combination
export function getTaskPricing(platform: string, type: string, task: string): number {
    // This would integrate with the existing TASK_PRICES constant
    // For now, return a default value
    return 100;
}

// Helper function to calculate total cost
export function calculateTotalCost(payload: CreateMissionRequest): {
    perUserHonors: number;
    totalHonors: number;
    totalUsd: number;
} {
    // This would use the existing pricing logic
    // For now, return placeholder values
    const perUserHonors = 250;
    const totalHonors = perUserHonors * payload.cap;
    const totalUsd = totalHonors * 0.0015;

    return {
        perUserHonors,
        totalHonors,
        totalUsd: Math.round(totalUsd * 100) / 100
    };
}
