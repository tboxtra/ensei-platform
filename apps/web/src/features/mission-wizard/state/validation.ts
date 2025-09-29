import { z } from 'zod';
import { Platform, Model, Type, Task, Audience } from '../types/wizard.types';

// Step 1: Platform validation
export const platformSchema = z.object({
    platform: z.enum(['twitter', 'telegram', 'instagram', 'tiktok', 'facebook', 'snapchat', 'whatsapp', 'custom'])
});

// Step 2: Model validation
export const modelSchema = z.object({
    model: z.enum(['fixed', 'degen'])
});

// Step 3: Type validation
export const typeSchema = z.object({
    type: z.enum(['engage', 'content', 'ambassador'])
});

// Step 4: Tasks validation
export const tasksSchema = z.object({
    tasks: z.array(z.string()).min(1, 'At least one task must be selected')
});

// Step 5: Settings validation
export const settingsSchema = z.object({
    cap: z.number().min(1, 'Participant cap must be at least 1'),
    audience: z.enum(['all', 'premium'])
});

// Step 6: Details validation
export const detailsSchema = z.object({
    details: z.object({
        tweetLink: z.string().url().optional().or(z.literal('')),
        instructions: z.string().min(10, 'Instructions must be at least 10 characters long')
    })
});

// Final validation schema for submission
export const finalValidationSchema = z.object({
    platform: z.enum(['twitter', 'telegram', 'instagram', 'tiktok', 'facebook', 'snapchat', 'whatsapp', 'custom']),
    model: z.enum(['fixed', 'degen']),
    type: z.enum(['engage', 'content', 'ambassador']),
    tasks: z.array(z.string()).min(1, 'At least one task must be selected'),
    cap: z.number().min(1, 'Participant cap must be at least 1'),
    audience: z.enum(['all', 'premium']),
    details: z.object({
        tweetLink: z.string().url().optional().or(z.literal('')),
        instructions: z.string().min(10, 'Instructions must be at least 10 characters long')
    })
});

// Validation functions for each step
export const validateStep = (step: number, data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    try {
        switch (step) {
            case 1:
                platformSchema.parse(data);
                break;
            case 2:
                modelSchema.parse(data);
                break;
            case 3:
                typeSchema.parse(data);
                break;
            case 4:
                tasksSchema.parse(data);
                break;
            case 5:
                settingsSchema.parse(data);
                break;
            case 6:
                detailsSchema.parse(data);
                break;
            case 7:
                finalValidationSchema.parse(data);
                break;
            default:
                errors.push('Invalid step number');
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            errors.push(...error.errors.map(e => e.message));
        } else {
            errors.push('Validation error');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Cross-step validation rules
export const validateCrossStep = (state: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate that selected tasks are available for the platform/type combination
    if (state.platform && state.type && state.tasks.length > 0) {
        // This would check against the TASK_PRICES constant
        // For now, we'll assume all combinations are valid
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
