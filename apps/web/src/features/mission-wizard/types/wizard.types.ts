export type Platform = 'twitter' | 'telegram' | 'instagram' | 'tiktok' | 'facebook' | 'snapchat' | 'whatsapp' | 'custom';

export type Model = 'fixed' | 'degen';

export type Type = 'engage' | 'content' | 'ambassador';

export type Task = 'like' | 'retweet' | 'comment' | 'quote' | 'follow' | 'share' | 'meme' | 'thread' | 'article' | 'videoreview' | 'pfp' | 'name_bio_keywords' | 'pinned_tweet' | 'poll' | 'spaces' | 'community_raid' | 'story_repost' | 'feed_post' | 'reel' | 'carousel' | 'hashtag_in_bio' | 'story_highlight' | 'repost_duet' | 'skit' | 'challenge' | 'product_review' | 'status_style' | 'pinned_branded_video' | 'share_post' | 'group_post' | 'video' | 'meme_flyer' | 'bio_keyword' | 'pinned_post' | 'status_50_views';

export type Audience = 'all' | 'premium';

export interface WizardState {
    // Step 1: Platform
    platform: Platform | null;

    // Step 2: Model
    model: Model | null;

    // Step 3: Type
    type: Type | null;

    // Step 4: Tasks
    tasks: Task[];

    // Step 5: Settings
    cap: number | null;
    audience: Audience;
    rewardPerUserHonors: number;

    // Step 6: Details
    details: {
        tweetLink?: string;
        instructions: string;
    };

    // Computed values
    totals: {
        honors: number;
        usd: number;
    };

    // Wizard state
    currentStep: number;
    stepValidation: Record<number, boolean>;
    isSubmitting: boolean;
    lastSavedAt: number;
}

export interface WizardActions {
    setPlatform: (platform: Platform) => void;
    setModel: (model: Model) => void;
    setType: (type: Type) => void;
    setTasks: (tasks: Task[]) => void;
    toggleTask: (task: Task) => void;
    setCap: (cap: number) => void;
    setAudience: (audience: Audience) => void;
    setDetails: (details: Partial<WizardState['details']>) => void;
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    previousStep: () => void;
    validateStep: (step: number) => boolean;
    setIsSubmitting: (isSubmitting: boolean) => void;
    reset: () => void;
    saveToStorage: () => void;
    loadFromStorage: () => void;
}

export interface StepProps {
    onNext: () => void;
    onPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
}

export interface PlatformConfig {
    id: Platform;
    name: string;
    icon: string;
    available: boolean;
}

export interface ModelConfig {
    id: Model;
    name: string;
    description: string;
    icon: string;
    features: string[];
}

export interface TypeConfig {
    id: Type;
    name: string;
    description: string;
    icon: string;
}

export interface TaskConfig {
    id: Task;
    name: string;
    price: number;
    description?: string;
    icon?: string;
}
