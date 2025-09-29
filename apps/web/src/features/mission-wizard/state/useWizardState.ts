import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WizardState, WizardActions, Platform, Model, Type, Task, Audience } from '../types/wizard.types';

// Import existing task prices from the current implementation
const TASK_PRICES = {
    twitter: {
        engage: {
            like: 50,
            retweet: 100,
            comment: 150,
            quote: 200,
            follow: 250
        },
        content: {
            meme: 300,
            thread: 500,
            article: 400,
            videoreview: 600
        },
        ambassador: {
            pfp: 250,
            name_bio_keywords: 200,
            pinned_tweet: 300,
            poll: 150,
            spaces: 800,
            community_raid: 400
        }
    },
    instagram: {
        engage: {
            like: 50,
            comment: 150,
            follow: 250,
            story_repost: 200
        },
        content: {
            feed_post: 300,
            reel: 500,
            carousel: 400,
            meme: 250
        },
        ambassador: {
            pfp: 250,
            hashtag_in_bio: 200,
            story_highlight: 300
        }
    },
    tiktok: {
        engage: {
            like: 50,
            comment: 150,
            repost_duet: 300,
            follow: 250
        },
        content: {
            skit: 400,
            challenge: 500,
            product_review: 600,
            status_style: 350
        },
        ambassador: {
            pfp: 250,
            hashtag_in_bio: 200,
            pinned_branded_video: 400
        }
    },
    facebook: {
        engage: {
            like: 50,
            comment: 150,
            follow: 250,
            share_post: 200
        },
        content: {
            group_post: 300,
            video: 400,
            meme_flyer: 250
        },
        ambassador: {
            pfp: 250,
            bio_keyword: 200,
            pinned_post: 300
        }
    },
    whatsapp: {
        engage: {
            status_50_views: 300
        }
    }
};

const initialState: WizardState = {
    platform: null,
    model: null,
    type: null,
    tasks: [],
    cap: null,
    audience: 'all',
    rewardPerUserHonors: 0,
    details: {
        instructions: ''
    },
    totals: {
        honors: 0,
        usd: 0
    },
    currentStep: 1,
    stepValidation: {},
    isSubmitting: false,
    lastSavedAt: Date.now()
};

// Calculate pricing based on current state
const calculatePricing = (state: WizardState) => {
    if (!state.platform || !state.type || !state.tasks.length || !state.cap) {
        return { rewardPerUserHonors: 0, totals: { honors: 0, usd: 0 } };
    }

    const platformPrices = TASK_PRICES[state.platform as keyof typeof TASK_PRICES]?.[state.type as keyof typeof TASK_PRICES[keyof typeof TASK_PRICES]] || {};
    const taskCosts = state.tasks.map(task => platformPrices[task as keyof typeof platformPrices] || 0);
    const baseCost = taskCosts.reduce((sum, cost) => sum + cost, 0);
    const multiplier = state.audience === 'premium' ? 5 : 1;

    const rewardPerUserHonors = baseCost * multiplier;
    const totalHonors = rewardPerUserHonors * state.cap;
    const totalUsd = totalHonors * 0.0015; // Approximate USD conversion

    return {
        rewardPerUserHonors,
        totals: {
            honors: totalHonors,
            usd: Math.round(totalUsd * 100) / 100
        }
    };
};

// Step validation functions
const stepValidators: Record<number, (state: WizardState) => boolean> = {
    1: (state: WizardState) => !!state.platform,
    2: (state: WizardState) => !!state.model,
    3: (state: WizardState) => !!state.type,
    4: (state: WizardState) => state.tasks.length > 0,
    5: (state: WizardState) => !!state.cap && state.cap > 0,
    6: (state: WizardState) => state.details.instructions.length >= 10,
    7: (state: WizardState) => {
        // Final validation - all previous steps must be valid
        return Object.values(stepValidators).slice(0, 6).every(validator => validator(state));
    }
};

export const useWizardState = create<WizardState & WizardActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            setPlatform: (platform: Platform) => {
                set((state) => {
                    const newState = { ...state, platform };
                    const pricing = calculatePricing(newState);
                    return {
                        ...newState,
                        ...pricing,
                        stepValidation: {
                            ...state.stepValidation,
                            1: stepValidators[1](newState)
                        }
                    };
                });
            },

            setModel: (model: Model) => {
                set((state) => {
                    const newState = { ...state, model };
                    const pricing = calculatePricing(newState);
                    return {
                        ...newState,
                        ...pricing,
                        stepValidation: {
                            ...state.stepValidation,
                            2: stepValidators[2](newState)
                        }
                    };
                });
            },

            setType: (type: Type) => {
                set((state) => {
                    const newState = { ...state, type };
                    const pricing = calculatePricing(newState);
                    return {
                        ...newState,
                        ...pricing,
                        stepValidation: {
                            ...state.stepValidation,
                            3: stepValidators[3](newState)
                        }
                    };
                });
            },

            setTasks: (tasks: Task[]) => {
                set((state) => {
                    const newState = { ...state, tasks };
                    const pricing = calculatePricing(newState);
                    return {
                        ...newState,
                        ...pricing,
                        stepValidation: {
                            ...state.stepValidation,
                            4: stepValidators[4](newState)
                        }
                    };
                });
            },

            toggleTask: (task: Task) => {
                set((state) => {
                    const tasks = state.tasks.includes(task)
                        ? state.tasks.filter(t => t !== task)
                        : [...state.tasks, task];

                    const newState = { ...state, tasks };
                    const pricing = calculatePricing(newState);
                    return {
                        ...newState,
                        ...pricing,
                        stepValidation: {
                            ...state.stepValidation,
                            4: stepValidators[4](newState)
                        }
                    };
                });
            },

            setCap: (cap: number) => {
                set((state) => {
                    const newState = { ...state, cap };
                    const pricing = calculatePricing(newState);
                    return {
                        ...newState,
                        ...pricing,
                        stepValidation: {
                            ...state.stepValidation,
                            5: stepValidators[5](newState)
                        }
                    };
                });
            },

            setAudience: (audience: Audience) => {
                set((state) => {
                    const newState = { ...state, audience };
                    const pricing = calculatePricing(newState);
                    return {
                        ...newState,
                        ...pricing
                    };
                });
            },

            setDetails: (details: Partial<WizardState['details']>) => {
                set((state) => {
                    const newState = {
                        ...state,
                        details: { ...state.details, ...details }
                    };
                    return {
                        ...newState,
                        stepValidation: {
                            ...state.stepValidation,
                            6: stepValidators[6](newState)
                        }
                    };
                });
            },

            setCurrentStep: (step: number) => {
                set({ currentStep: step });
            },

            nextStep: () => {
                const state = get();
                const currentStep = state.currentStep;
                const isValid = stepValidators[currentStep as keyof typeof stepValidators](state);

                if (isValid && currentStep < 7) {
                    set({ currentStep: currentStep + 1 });
                }
            },

            previousStep: () => {
                const state = get();
                if (state.currentStep > 1) {
                    set({ currentStep: state.currentStep - 1 });
                }
            },

            validateStep: (step: number) => {
                const state = get();
                return stepValidators[step as keyof typeof stepValidators](state);
            },

            setIsSubmitting: (isSubmitting: boolean) => {
                set({ isSubmitting });
            },

            reset: () => {
                set(initialState);
            },

            saveToStorage: () => {
                set({ lastSavedAt: Date.now() });
            },

            loadFromStorage: () => {
                // This is handled by Zustand persist middleware
            }
        }),
        {
            name: 'wizard:create-mission:v1',
            partialize: (state) => ({
                platform: state.platform,
                model: state.model,
                type: state.type,
                tasks: state.tasks,
                cap: state.cap,
                audience: state.audience,
                details: state.details,
                currentStep: state.currentStep,
                lastSavedAt: state.lastSavedAt
            })
        }
    )
);
