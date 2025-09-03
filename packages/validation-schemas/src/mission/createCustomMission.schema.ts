import { z } from 'zod';

// Custom mission specification schema
export const customSpecSchema = z.object({
    customTitle: z.string().min(3).max(120),
    customDescription: z.string().max(1000).optional(),
    avgTimeMinutes: z.number().int().min(1).max(24 * 60),
    proofMode: z.enum(['social-post', 'api']).default('social-post'),
    apiVerifierKey: z.string().min(1).optional()
}).strict()
    .refine(s => s.proofMode === 'social-post' || !!s.apiVerifierKey, {
        path: ['apiVerifierKey'],
        message: 'apiVerifierKey required when proofMode=api'
    });

// Custom mission create request schema
export const createCustomMissionSchema = z.object({
    platform: z.literal('custom'),
    type: z.enum(['engage', 'content', 'ambassador']),
    model: z.enum(['fixed', 'degen']),
    title: z.string().min(3).max(120),
    tasks: z.array(z.string()).min(1),
    premium: z.boolean(),
    cap: z.number().int().min(60),
    rewards_per_user: z.number().positive(),
    duration_hours: z.number().int().positive(),

    // Custom platform specification
    customSpec: customSpecSchema,

    // Degen-specific fields (optional for fixed model)
    total_cost_usd: z.number().positive().optional(),
    user_pool_honors: z.number().positive().optional(),
    per_winner_honors: z.number().positive().optional(),
    winners_cap: z.number().int().positive().optional(),

    // Optional platform-specific fields
    tweet_url: z.string().url().optional(),
    tg_invite: z.string().optional(),
    brief: z.string().max(1000).optional(),
    instructions: z.string().max(2000).optional(),
}).strict();

// Type exports
export type CustomTaskSpec = z.infer<typeof customSpecSchema>;
export type CreateCustomMissionRequest = z.infer<typeof createCustomMissionSchema>;
