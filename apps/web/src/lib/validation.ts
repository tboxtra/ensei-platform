/**
 * Unified Validation System
 * Industry Standard: Single source of truth for all validation logic
 * Consistent validation across the entire application
 */

import type { XAccount } from '../types/verification';

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    data?: any;
}

export interface LinkValidationOptions {
    platform: 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'discord' | 'facebook' | 'whatsapp' | 'snapchat' | 'telegram';
    requireUsernameMatch?: boolean;
    expectedUsername?: string;
    allowSubdomains?: boolean;
}

/**
 * Unified URL validation function
 */
export function validateUrl(url: string): ValidationResult {
    if (!url || typeof url !== 'string') {
        return {
            isValid: false,
            error: 'URL is required'
        };
    }

    try {
        const urlObj = new URL(url.trim());

        // Check if protocol is valid
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return {
                isValid: false,
                error: 'URL must use HTTP or HTTPS protocol'
            };
        }

        return {
            isValid: true,
            data: {
                url: urlObj.href,
                protocol: urlObj.protocol,
                hostname: urlObj.hostname,
                pathname: urlObj.pathname
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: 'Invalid URL format'
        };
    }
}

/**
 * Unified platform-specific link validation
 */
export function validatePlatformLink(url: string, options: LinkValidationOptions): ValidationResult {
    // First validate basic URL format
    const urlValidation = validateUrl(url);
    if (!urlValidation.isValid) {
        return urlValidation;
    }

    const urlObj = new URL(urlValidation.data.url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // Platform-specific validation
    switch (options.platform) {
        case 'twitter':
            return validateTwitterLink(urlObj, options);
        case 'instagram':
            return validateInstagramLink(urlObj, options);
        case 'youtube':
            return validateYouTubeLink(urlObj, options);
        case 'tiktok':
            return validateTikTokLink(urlObj, options);
        case 'linkedin':
            return validateLinkedInLink(urlObj, options);
        case 'discord':
            return validateDiscordLink(urlObj, options);
        case 'facebook':
            return validateFacebookLink(urlObj, options);
        case 'whatsapp':
            return validateWhatsAppLink(urlObj, options);
        case 'snapchat':
            return validateSnapchatLink(urlObj, options);
        case 'telegram':
            return validateTelegramLink(urlObj, options);
        default:
            return {
                isValid: false,
                error: `Unsupported platform: ${options.platform}`
            };
    }
}

/**
 * Twitter/X link validation
 */
function validateTwitterLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // Check if it's a valid Twitter/X domain
    if (!hostname.includes('twitter.com') && !hostname.includes('x.com')) {
        return {
            isValid: false,
            error: 'URL must be from Twitter/X'
        };
    }

    // Extract username from path
    const pathParts = pathname.split('/').filter(part => part);
    if (pathParts.length === 0) {
        return {
            isValid: false,
            error: 'Invalid Twitter/X URL format'
        };
    }

    const username = pathParts[0];

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return {
            isValid: false,
            error: 'Invalid Twitter/X username format'
        };
    }

    // Check username match if required
    if (options.requireUsernameMatch && options.expectedUsername) {
        if (username.toLowerCase() !== options.expectedUsername.toLowerCase()) {
            return {
                isValid: false,
                error: `Username mismatch. Expected @${options.expectedUsername}, got @${username}`
            };
        }
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            username,
            platform: 'twitter',
            pathname
        }
    };
}

/**
 * Instagram link validation
 */
function validateInstagramLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    if (!hostname.includes('instagram.com')) {
        return {
            isValid: false,
            error: 'URL must be from Instagram'
        };
    }

    const pathParts = pathname.split('/').filter(part => part);
    if (pathParts.length === 0) {
        return {
            isValid: false,
            error: 'Invalid Instagram URL format'
        };
    }

    const username = pathParts[0];

    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return {
            isValid: false,
            error: 'Invalid Instagram username format'
        };
    }

    if (options.requireUsernameMatch && options.expectedUsername) {
        if (username.toLowerCase() !== options.expectedUsername.toLowerCase()) {
            return {
                isValid: false,
                error: `Username mismatch. Expected @${options.expectedUsername}, got @${username}`
            };
        }
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            username,
            platform: 'instagram',
            pathname
        }
    };
}

/**
 * YouTube link validation
 */
function validateYouTubeLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
        return {
            isValid: false,
            error: 'URL must be from YouTube'
        };
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            platform: 'youtube',
            pathname
        }
    };
}

/**
 * TikTok link validation
 */
function validateTikTokLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();

    if (!hostname.includes('tiktok.com')) {
        return {
            isValid: false,
            error: 'URL must be from TikTok'
        };
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            platform: 'tiktok',
            pathname: urlObj.pathname
        }
    };
}

/**
 * LinkedIn link validation
 */
function validateLinkedInLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();

    if (!hostname.includes('linkedin.com')) {
        return {
            isValid: false,
            error: 'URL must be from LinkedIn'
        };
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            platform: 'linkedin',
            pathname: urlObj.pathname
        }
    };
}

/**
 * Discord link validation
 */
function validateDiscordLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();

    if (!hostname.includes('discord.com') && !hostname.includes('discord.gg')) {
        return {
            isValid: false,
            error: 'URL must be from Discord'
        };
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            platform: 'discord',
            pathname: urlObj.pathname
        }
    };
}

/**
 * Facebook link validation
 */
function validateFacebookLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();

    if (!hostname.includes('facebook.com') && !hostname.includes('fb.com')) {
        return {
            isValid: false,
            error: 'URL must be from Facebook'
        };
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            platform: 'facebook',
            pathname: urlObj.pathname
        }
    };
}

/**
 * WhatsApp link validation
 */
function validateWhatsAppLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();

    if (!hostname.includes('whatsapp.com') && !hostname.includes('wa.me')) {
        return {
            isValid: false,
            error: 'URL must be from WhatsApp'
        };
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            platform: 'whatsapp',
            pathname: urlObj.pathname
        }
    };
}

/**
 * Snapchat link validation
 */
function validateSnapchatLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();

    if (!hostname.includes('snapchat.com')) {
        return {
            isValid: false,
            error: 'URL must be from Snapchat'
        };
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            platform: 'snapchat',
            pathname: urlObj.pathname
        }
    };
}

/**
 * Telegram link validation
 */
function validateTelegramLink(urlObj: URL, options: LinkValidationOptions): ValidationResult {
    const hostname = urlObj.hostname.toLowerCase();

    if (!hostname.includes('t.me') && !hostname.includes('telegram.me')) {
        return {
            isValid: false,
            error: 'URL must be from Telegram'
        };
    }

    return {
        isValid: true,
        data: {
            url: urlObj.href,
            platform: 'telegram',
            pathname: urlObj.pathname
        }
    };
}

/**
 * Task submission link validation
 */
export function validateTaskSubmissionLink(
    link: string,
    taskType: string,
    userXAccount?: XAccount
): ValidationResult {
    if (!link || !link.trim()) {
        return {
            isValid: false,
            error: 'Please enter your submission link'
        };
    }

    // Determine platform based on task type or URL
    let platform: LinkValidationOptions['platform'] = 'twitter'; // Default to Twitter

    if (link.includes('instagram.com')) {
        platform = 'instagram';
    } else if (link.includes('youtube.com') || link.includes('youtu.be')) {
        platform = 'youtube';
    } else if (link.includes('tiktok.com')) {
        platform = 'tiktok';
    } else if (link.includes('linkedin.com')) {
        platform = 'linkedin';
    } else if (link.includes('discord.com')) {
        platform = 'discord';
    } else if (link.includes('facebook.com')) {
        platform = 'facebook';
    } else if (link.includes('whatsapp.com')) {
        platform = 'whatsapp';
    } else if (link.includes('snapchat.com')) {
        platform = 'snapchat';
    } else if (link.includes('t.me')) {
        platform = 'telegram';
    }

    const options: LinkValidationOptions = {
        platform,
        requireUsernameMatch: !!userXAccount,
        expectedUsername: userXAccount?.username
    };

    return validatePlatformLink(link, options);
}

/**
 * Reviewer comment link validation
 */
export function validateReviewerCommentLink(
    link: string,
    expectedUsername: string
): ValidationResult {
    if (!link || !link.trim()) {
        return {
            isValid: false,
            error: 'Please enter your comment link'
        };
    }

    // For reviewer comments, we primarily expect Twitter/X links
    const options: LinkValidationOptions = {
        platform: 'twitter',
        requireUsernameMatch: true,
        expectedUsername
    };

    return validatePlatformLink(link, options);
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
        return {
            isValid: false,
            error: 'Email is required'
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return {
            isValid: false,
            error: 'Invalid email format'
        };
    }

    return {
        isValid: true,
        data: { email: email.trim() }
    };
}

/**
 * Username validation
 */
export function validateUsername(username: string, platform: string = 'twitter'): ValidationResult {
    if (!username || typeof username !== 'string') {
        return {
            isValid: false,
            error: 'Username is required'
        };
    }

    const trimmedUsername = username.trim().replace('@', '');

    if (trimmedUsername.length < 1) {
        return {
            isValid: false,
            error: 'Username cannot be empty'
        };
    }

    if (trimmedUsername.length > 15) {
        return {
            isValid: false,
            error: 'Username cannot exceed 15 characters'
        };
    }

    // Platform-specific username validation
    let regex: RegExp;
    switch (platform.toLowerCase()) {
        case 'twitter':
        case 'x':
            regex = /^[a-zA-Z0-9_]+$/;
            break;
        case 'instagram':
            regex = /^[a-zA-Z0-9._]+$/;
            break;
        default:
            regex = /^[a-zA-Z0-9._-]+$/;
    }

    if (!regex.test(trimmedUsername)) {
        return {
            isValid: false,
            error: `Invalid ${platform} username format`
        };
    }

    return {
        isValid: true,
        data: { username: trimmedUsername }
    };
}

/**
 * Mission ID validation
 */
export function validateMissionId(missionId: string): ValidationResult {
    if (!missionId || typeof missionId !== 'string') {
        return {
            isValid: false,
            error: 'Mission ID is required'
        };
    }

    if (missionId.trim().length === 0) {
        return {
            isValid: false,
            error: 'Mission ID cannot be empty'
        };
    }

    return {
        isValid: true,
        data: { missionId: missionId.trim() }
    };
}

/**
 * Task ID validation
 */
export function validateTaskId(taskId: string): ValidationResult {
    if (!taskId || typeof taskId !== 'string') {
        return {
            isValid: false,
            error: 'Task ID is required'
        };
    }

    if (taskId.trim().length === 0) {
        return {
            isValid: false,
            error: 'Task ID cannot be empty'
        };
    }

    // Valid task IDs
    const validTaskIds = [
        'like', 'retweet', 'comment', 'quote', 'follow', 'share',
        'meme', 'thread', 'article', 'videoreview',
        'pfp', 'name_bio_keywords', 'pinned_tweet', 'poll', 'spaces', 'community_raid',
        'story_repost', 'feed_post', 'reel', 'carousel', 'hashtag_in_bio', 'story_highlight'
    ];

    if (!validTaskIds.includes(taskId.toLowerCase())) {
        return {
            isValid: false,
            error: `Invalid task ID: ${taskId}`
        };
    }

    return {
        isValid: true,
        data: { taskId: taskId.toLowerCase() }
    };
}

/**
 * Generic text validation
 */
export function validateText(text: string, options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    allowEmpty?: boolean;
} = {}): ValidationResult {
    const { minLength = 0, maxLength = 1000, required = true, allowEmpty = false } = options;

    if (required && (!text || text.trim().length === 0)) {
        return {
            isValid: false,
            error: 'Text is required'
        };
    }

    if (!allowEmpty && text && text.trim().length === 0) {
        return {
            isValid: false,
            error: 'Text cannot be empty'
        };
    }

    if (text && text.length < minLength) {
        return {
            isValid: false,
            error: `Text must be at least ${minLength} characters long`
        };
    }

    if (text && text.length > maxLength) {
        return {
            isValid: false,
            error: `Text cannot exceed ${maxLength} characters`
        };
    }

    return {
        isValid: true,
        data: { text: text?.trim() || '' }
    };
}
