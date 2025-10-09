import type { Pack } from '../../types/packs';

const Q = {
    small: { likes: 100, retweets: 60, comments: 40 },
    medium: { likes: 200, retweets: 120, comments: 80 },
    large: { likes: 500, retweets: 300, comments: 200 },
};

export const PACKS_FALLBACK: Pack[] = [
    // Single-use
    { id: 'single_1_small', kind: 'single', label: '1 Tweet — Small', group: 'Single-use Packs', tweets: 1, priceUsd: 10, size: 'small', quotas: Q.small },
    { id: 'single_1_medium', kind: 'single', label: '1 Tweet — Medium', group: 'Single-use Packs', tweets: 1, priceUsd: 15, size: 'medium', quotas: Q.medium },
    { id: 'single_1_large', kind: 'single', label: '1 Tweet — Large', group: 'Single-use Packs', tweets: 1, priceUsd: 25, size: 'large', quotas: Q.large },

    { id: 'single_3_small', kind: 'single', label: '3 Tweets — Small', group: 'Single-use Packs', tweets: 3, priceUsd: 25, size: 'small', quotas: Q.small },
    { id: 'single_3_medium', kind: 'single', label: '3 Tweets — Medium', group: 'Single-use Packs', tweets: 3, priceUsd: 40, size: 'medium', quotas: Q.medium },
    { id: 'single_3_large', kind: 'single', label: '3 Tweets — Large', group: 'Single-use Packs', tweets: 3, priceUsd: 60, size: 'large', quotas: Q.large },

    { id: 'single_10_small', kind: 'single', label: '10 Tweets — Small', group: 'Single-use Packs', tweets: 10, priceUsd: 75, size: 'small', quotas: Q.small },
    { id: 'single_10_medium', kind: 'single', label: '10 Tweets — Medium', group: 'Single-use Packs', tweets: 10, priceUsd: 120, size: 'medium', quotas: Q.medium },
    { id: 'single_10_large', kind: 'single', label: '10 Tweets — Large', group: 'Single-use Packs', tweets: 10, priceUsd: 180, size: 'large', quotas: Q.large },

    // Subscriptions (use meta for per-hour & duration)
    { id: 'sub_week_small', kind: 'subscription', label: 'Weekly — Small', group: 'Subscription Packs', tweets: 1, priceUsd: 500, size: 'small', quotas: Q.small, meta: { maxPerHour: 1, durationDays: 7 } },
    { id: 'sub_week_medium', kind: 'subscription', label: 'Weekly — Medium', group: 'Subscription Packs', tweets: 1, priceUsd: 750, size: 'medium', quotas: Q.medium, meta: { maxPerHour: 1, durationDays: 7 } },
    { id: 'sub_week_large', kind: 'subscription', label: 'Weekly — Large', group: 'Subscription Packs', tweets: 1, priceUsd: 1250, size: 'large', quotas: Q.large, meta: { maxPerHour: 1, durationDays: 7 } },

    { id: 'sub_month_small', kind: 'subscription', label: 'Monthly — Small', group: 'Subscription Packs', tweets: 1, priceUsd: 2000, size: 'small', quotas: Q.small, meta: { maxPerHour: 1, durationDays: 30 } },
    { id: 'sub_month_medium', kind: 'subscription', label: 'Monthly — Medium', group: 'Subscription Packs', tweets: 1, priceUsd: 3000, size: 'medium', quotas: Q.medium, meta: { maxPerHour: 1, durationDays: 30 } },
    { id: 'sub_month_large', kind: 'subscription', label: 'Monthly — Large', group: 'Subscription Packs', tweets: 1, priceUsd: 5000, size: 'large', quotas: Q.large, meta: { maxPerHour: 1, durationDays: 30 } },

    { id: 'sub_3m_small', kind: 'subscription', label: '3 Months — Small', group: 'Subscription Packs', tweets: 1, priceUsd: 4800, size: 'small', quotas: Q.small, meta: { maxPerHour: 1, durationDays: 90 } },
    { id: 'sub_3m_medium', kind: 'subscription', label: '3 Months — Medium', group: 'Subscription Packs', tweets: 1, priceUsd: 7200, size: 'medium', quotas: Q.medium, meta: { maxPerHour: 1, durationDays: 90 } },
    { id: 'sub_3m_large', kind: 'subscription', label: '3 Months — Large', group: 'Subscription Packs', tweets: 1, priceUsd: 12000, size: 'large', quotas: Q.large, meta: { maxPerHour: 1, durationDays: 90 } },

    { id: 'sub_6m_small', kind: 'subscription', label: '6 Months — Small', group: 'Subscription Packs', tweets: 1, priceUsd: 8400, size: 'small', quotas: Q.small, meta: { maxPerHour: 1, durationDays: 180 } },
    { id: 'sub_6m_medium', kind: 'subscription', label: '6 Months — Medium', group: 'Subscription Packs', tweets: 1, priceUsd: 12600, size: 'medium', quotas: Q.medium, meta: { maxPerHour: 1, durationDays: 180 } },
    { id: 'sub_6m_large', kind: 'subscription', label: '6 Months — Large', group: 'Subscription Packs', tweets: 1, priceUsd: 21000, size: 'large', quotas: Q.large, meta: { maxPerHour: 1, durationDays: 180 } },

    { id: 'sub_12m_small', kind: 'subscription', label: '1 Year — Small', group: 'Subscription Packs', tweets: 1, priceUsd: 15600, size: 'small', quotas: Q.small, meta: { maxPerHour: 1, durationDays: 365 } },
    { id: 'sub_12m_medium', kind: 'subscription', label: '1 Year — Medium', group: 'Subscription Packs', tweets: 1, priceUsd: 23400, size: 'medium', quotas: Q.medium, meta: { maxPerHour: 1, durationDays: 365 } },
    { id: 'sub_12m_large', kind: 'subscription', label: '1 Year — Large', group: 'Subscription Packs', tweets: 1, priceUsd: 39000, size: 'large', quotas: Q.large, meta: { maxPerHour: 1, durationDays: 365 } },
];
