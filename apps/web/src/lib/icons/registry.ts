/**
 * Icon Registry - Completely independent of local storage
 * All icon configurations are statically defined
 */

import { IconConfig, IconName } from '@/types/icons';

// Emoji fallbacks for all icons
const emojiFallbacks: Record<string, string> = {
    // Navigation Icons
    dashboard: '🏠',
    discover: '🔍',
    missions: '🚀',
    review: '📄',
    claims: '💰',
    wallet: '👛',
    profile: '👤',
    logout: '🚪',
    settings: '⚙️',
    globe: '🌐',
    crown: '👑',
    target: '🎯',
    write: '📝',
    money: '💰',
    users: '👥',
    gear: '⚙️',
    check: '✅',
    cross: '❌',
    star: '⭐',
    email: '📧',

    // Platform Icons
    twitter: '𝕏',
    instagram: '📸',
    tiktok: '🎵',
    facebook: '📘',
    whatsapp: '💬',
    snapchat: '👻',
    telegram: '📱',
    youtube: '📺',
    linkedin: '💼',
    discord: '💬',
    custom: '⚡',

    // Task Icons
    like: '👍',
    retweet: '🔄',
    comment: '💬',
    quote: '💭',
    follow: '👤',
    meme: '😂',
    thread: '🧵',
    article: '📝',
    videoreview: '🎥',
    pfp: '🖼️',
    'name-bio-keywords': '📋',
    'pinned-tweet': '📌',
    poll: '📊',
    spaces: '🎙️',
    'community-raid': '⚔️',
    engage: '🎯',
    content: '✍️',
    ambassador: '👑',

    // Status Icons
    approved: '✅',
    pending: '⏳',
    rejected: '❌',
    success: '✅',
    error: '❌',
    warning: '⚠️',
};

// Icon registry with fallback chain: Custom -> Library -> Emoji
export const iconRegistry: Record<string, IconConfig> = {
    // Brand Icons (Custom)
    'ensei-logo': {
        name: 'ensei-logo',
        type: 'custom',
        source: '/icons/brand/ensei-logo.svg',
        fallback: 'dashboard',
        category: 'brand',
        emoji: '🏠'
    },

    // Navigation Icons (Library with emoji fallback)
    dashboard: {
        name: 'dashboard',
        type: 'library',
        source: 'HomeIcon',
        fallback: 'dashboard',
        category: 'navigation',
        emoji: '🏠'
    },
    discover: {
        name: 'discover',
        type: 'library',
        source: 'MagnifyingGlassIcon',
        fallback: 'discover',
        category: 'navigation',
        emoji: '🔍'
    },
    missions: {
        name: 'missions',
        type: 'library',
        source: 'RocketLaunchIcon',
        fallback: 'missions',
        category: 'navigation',
        emoji: '🚀'
    },
    review: {
        name: 'review',
        type: 'library',
        source: 'DocumentTextIcon',
        fallback: 'review',
        category: 'navigation',
        emoji: '📄'
    },
    claims: {
        name: 'claims',
        type: 'library',
        source: 'CurrencyDollarIcon',
        fallback: 'claims',
        category: 'navigation',
        emoji: '💰'
    },
    wallet: {
        name: 'wallet',
        type: 'library',
        source: 'WalletIcon',
        fallback: 'wallet',
        category: 'navigation',
        emoji: '👛'
    },
    profile: {
        name: 'profile',
        type: 'library',
        source: 'UserIcon',
        fallback: 'profile',
        category: 'navigation',
        emoji: '👤'
    },
    settings: {
        name: 'settings',
        type: 'library',
        source: 'Cog6ToothIcon',
        fallback: 'settings',
        category: 'navigation',
        emoji: '⚙️'
    },
    logout: {
        name: 'logout',
        type: 'library',
        source: 'ArrowRightOnRectangleIcon',
        fallback: 'logout',
        category: 'navigation',
        emoji: '🚪'
    },

    // Platform Icons (Custom with library fallback)
    twitter: {
        name: 'twitter',
        type: 'custom',
        source: '/icons/platforms/twitter.svg',
        fallback: 'twitter',
        category: 'platform',
        emoji: '𝕏'
    },
    instagram: {
        name: 'instagram',
        type: 'custom',
        source: '/icons/platforms/instagram.svg',
        fallback: 'instagram',
        category: 'platform',
        emoji: '📸'
    },
    tiktok: {
        name: 'tiktok',
        type: 'custom',
        source: '/icons/platforms/tiktok.svg',
        fallback: 'tiktok',
        category: 'platform',
        emoji: '🎵'
    },
    facebook: {
        name: 'facebook',
        type: 'custom',
        source: '/icons/platforms/facebook.svg',
        fallback: 'facebook',
        category: 'platform',
        emoji: '📘'
    },
    whatsapp: {
        name: 'whatsapp',
        type: 'custom',
        source: '/icons/platforms/whatsapp.svg',
        fallback: 'whatsapp',
        category: 'platform',
        emoji: '💬'
    },
    snapchat: {
        name: 'snapchat',
        type: 'custom',
        source: '/icons/platforms/snapchat.svg',
        fallback: 'snapchat',
        category: 'platform',
        emoji: '👻'
    },
    telegram: {
        name: 'telegram',
        type: 'custom',
        source: '/icons/platforms/telegram.svg',
        fallback: 'telegram',
        category: 'platform',
        emoji: '📱'
    },
    youtube: {
        name: 'youtube',
        type: 'custom',
        source: '/icons/platforms/youtube.svg',
        fallback: 'youtube',
        category: 'platform',
        emoji: '📺'
    },
    linkedin: {
        name: 'linkedin',
        type: 'custom',
        source: '/icons/platforms/linkedin.svg',
        fallback: 'linkedin',
        category: 'platform',
        emoji: '💼'
    },
    discord: {
        name: 'discord',
        type: 'custom',
        source: '/icons/platforms/discord.svg',
        fallback: 'discord',
        category: 'platform',
        emoji: '💬'
    },

    // Task Icons (Library with emoji fallback)
    like: {
        name: 'like',
        type: 'library',
        source: 'HeartIcon',
        fallback: 'like',
        category: 'task',
        emoji: '👍'
    },
    retweet: {
        name: 'retweet',
        type: 'library',
        source: 'ArrowPathIcon',
        fallback: 'retweet',
        category: 'task',
        emoji: '🔄'
    },
    comment: {
        name: 'comment',
        type: 'library',
        source: 'ChatBubbleLeftIcon',
        fallback: 'comment',
        category: 'task',
        emoji: '💬'
    },
    quote: {
        name: 'quote',
        type: 'library',
        source: 'ChatBubbleOvalLeftIcon',
        fallback: 'quote',
        category: 'task',
        emoji: '💭'
    },
    follow: {
        name: 'follow',
        type: 'library',
        source: 'UserPlusIcon',
        fallback: 'follow',
        category: 'task',
        emoji: '👤'
    },
    meme: {
        name: 'meme',
        type: 'library',
        source: 'FaceSmileIcon',
        fallback: 'meme',
        category: 'task',
        emoji: '😂'
    },
    thread: {
        name: 'thread',
        type: 'library',
        source: 'ChatBubbleBottomCenterTextIcon',
        fallback: 'thread',
        category: 'task',
        emoji: '🧵'
    },
    article: {
        name: 'article',
        type: 'library',
        source: 'DocumentIcon',
        fallback: 'article',
        category: 'task',
        emoji: '📝'
    },
    videoreview: {
        name: 'videoreview',
        type: 'library',
        source: 'VideoCameraIcon',
        fallback: 'videoreview',
        category: 'task',
        emoji: '🎥'
    },
    pfp: {
        name: 'pfp',
        type: 'library',
        source: 'PhotoIcon',
        fallback: 'pfp',
        category: 'task',
        emoji: '🖼️'
    },
    'name-bio-keywords': {
        name: 'name-bio-keywords',
        type: 'library',
        source: 'TagIcon',
        fallback: 'name-bio-keywords',
        category: 'task',
        emoji: '📋'
    },
    'pinned-tweet': {
        name: 'pinned-tweet',
        type: 'library',
        source: 'MapPinIcon',
        fallback: 'pinned-tweet',
        category: 'task',
        emoji: '📌'
    },
    poll: {
        name: 'poll',
        type: 'library',
        source: 'ChartBarIcon',
        fallback: 'poll',
        category: 'task',
        emoji: '📊'
    },
    spaces: {
        name: 'spaces',
        type: 'library',
        source: 'MicrophoneIcon',
        fallback: 'spaces',
        category: 'task',
        emoji: '🎙️'
    },
    'community-raid': {
        name: 'community-raid',
        type: 'library',
        source: 'ShieldCheckIcon',
        fallback: 'community-raid',
        category: 'task',
        emoji: '⚔️'
    },

    // Action Icons (Library with emoji fallback)
    engage: {
        name: 'engage',
        type: 'library',
        source: 'TargetIcon',
        fallback: 'engage',
        category: 'action',
        emoji: '🎯'
    },
    content: {
        name: 'content',
        type: 'library',
        source: 'PencilIcon',
        fallback: 'content',
        category: 'action',
        emoji: '✍️'
    },
    ambassador: {
        name: 'ambassador',
        type: 'library',
        source: 'CrownIcon',
        fallback: 'ambassador',
        category: 'action',
        emoji: '👑'
    },
    custom: {
        name: 'custom',
        type: 'library',
        source: 'LightningBoltIcon',
        fallback: 'custom',
        category: 'action',
        emoji: '⚡'
    },

    // Status Icons (Library with emoji fallback)
    approved: {
        name: 'approved',
        type: 'library',
        source: 'CheckIcon',
        fallback: 'approved',
        category: 'status',
        emoji: '✅'
    },
    pending: {
        name: 'pending',
        type: 'library',
        source: 'ClockIcon',
        fallback: 'pending',
        category: 'status',
        emoji: '⏳'
    },
    rejected: {
        name: 'rejected',
        type: 'library',
        source: 'XMarkIcon',
        fallback: 'rejected',
        category: 'status',
        emoji: '❌'
    },
    success: {
        name: 'success',
        type: 'library',
        source: 'CheckIcon',
        fallback: 'success',
        category: 'status',
        emoji: '✅'
    },
    error: {
        name: 'error',
        type: 'library',
        source: 'XMarkIcon',
        fallback: 'error',
        category: 'status',
        emoji: '❌'
    },
    warning: {
        name: 'warning',
        type: 'library',
        source: 'ExclamationTriangleIcon',
        fallback: 'warning',
        category: 'status',
        emoji: '⚠️'
    },

    // General Icons (Library with emoji fallback)
    globe: {
        name: 'globe',
        type: 'library',
        source: 'GlobeAltIcon',
        fallback: 'globe',
        category: 'navigation',
        emoji: '🌐'
    },
    crown: {
        name: 'crown',
        type: 'library',
        source: 'CrownIcon',
        fallback: 'crown',
        category: 'navigation',
        emoji: '👑'
    },
    target: {
        name: 'target',
        type: 'library',
        source: 'TargetIcon',
        fallback: 'target',
        category: 'navigation',
        emoji: '🎯'
    },
    write: {
        name: 'write',
        type: 'library',
        source: 'PencilIcon',
        fallback: 'write',
        category: 'navigation',
        emoji: '📝'
    },
    money: {
        name: 'money',
        type: 'library',
        source: 'CurrencyDollarIcon',
        fallback: 'money',
        category: 'navigation',
        emoji: '💰'
    },
    users: {
        name: 'users',
        type: 'library',
        source: 'UsersIcon',
        fallback: 'users',
        category: 'navigation',
        emoji: '👥'
    },
    gear: {
        name: 'gear',
        type: 'library',
        source: 'Cog6ToothIcon',
        fallback: 'gear',
        category: 'navigation',
        emoji: '⚙️'
    },
    check: {
        name: 'check',
        type: 'library',
        source: 'CheckIcon',
        fallback: 'check',
        category: 'navigation',
        emoji: '✅'
    },
    cross: {
        name: 'cross',
        type: 'library',
        source: 'XMarkIcon',
        fallback: 'cross',
        category: 'navigation',
        emoji: '❌'
    },
    star: {
        name: 'star',
        type: 'library',
        source: 'StarIcon',
        fallback: 'star',
        category: 'navigation',
        emoji: '⭐'
    },
    email: {
        name: 'email',
        type: 'library',
        source: 'EnvelopeIcon',
        fallback: 'email',
        category: 'navigation',
        emoji: '📧'
    }
};

// Helper function to get icon config
export const getIconConfig = (name: string): IconConfig | null => {
    return iconRegistry[name] || null;
};

// Helper function to get emoji fallback
export const getEmojiFallback = (name: string): string => {
    const config = getIconConfig(name);
    return config?.emoji || emojiFallbacks[name] || '❓';
};

// Helper function to check if icon exists
export const iconExists = (name: string): boolean => {
    return name in iconRegistry;
};
