/**
 * Twitter/X Intent URL utilities for seamless social media engagement
 * These URLs allow users to perform actions on Twitter without API integration
 */

export interface TwitterIntentParams {
    tweetId?: string;
    tweetUrl?: string;
    username?: string;
    text?: string;
    hashtags?: string[];
    via?: string;
    related?: string[];
}

/**
 * Generate Twitter intent URLs for various actions
 */
export class TwitterIntents {
    private static readonly BASE_URL = 'https://twitter.com/intent';

    /**
     * Generate like intent URL
     * Opens Twitter with the like action ready for the specified tweet
     */
    static like(tweetId: string): string {
        return `${this.BASE_URL}/like?tweet_id=${encodeURIComponent(tweetId)}`;
    }

    /**
     * Generate retweet intent URL
     * Opens Twitter with the retweet action ready for the specified tweet
     */
    static retweet(tweetId: string): string {
        return `${this.BASE_URL}/retweet?tweet_id=${encodeURIComponent(tweetId)}`;
    }

    /**
     * Generate reply/comment intent URL
     * Opens Twitter with the reply interface ready for the specified tweet
     */
    static reply(tweetId: string, text?: string): string {
        let url = `${this.BASE_URL}/tweet?in_reply_to=${encodeURIComponent(tweetId)}`;

        if (text) {
            url += `&text=${encodeURIComponent(text)}`;
        }

        return url;
    }

    /**
     * Generate quote tweet intent URL
     * Opens Twitter with the quote tweet interface ready for the specified tweet
     */
    static quote(tweetUrl: string, text?: string, hashtags?: string[], via?: string): string {
        let url = `${this.BASE_URL}/tweet?url=${encodeURIComponent(tweetUrl)}`;

        if (text) {
            url += `&text=${encodeURIComponent(text)}`;
        }

        if (hashtags && hashtags.length > 0) {
            url += `&hashtags=${encodeURIComponent(hashtags.join(','))}`;
        }

        if (via) {
            url += `&via=${encodeURIComponent(via)}`;
        }

        return url;
    }

    /**
     * Generate follow intent URL
     * Opens Twitter with the follow action ready for the specified user
     */
    static follow(username: string): string {
        // Remove @ symbol if present
        const cleanUsername = username.replace('@', '');
        return `${this.BASE_URL}/follow?screen_name=${encodeURIComponent(cleanUsername)}`;
    }

    /**
     * Generate compose tweet intent URL
     * Opens Twitter with the compose interface ready
     */
    static compose(params: {
        text?: string;
        hashtags?: string[];
        via?: string;
        related?: string[];
    }): string {
        let url = `${this.BASE_URL}/tweet`;
        const queryParams: string[] = [];

        if (params.text) {
            queryParams.push(`text=${encodeURIComponent(params.text)}`);
        }

        if (params.hashtags && params.hashtags.length > 0) {
            queryParams.push(`hashtags=${encodeURIComponent(params.hashtags.join(','))}`);
        }

        if (params.via) {
            queryParams.push(`via=${encodeURIComponent(params.via)}`);
        }

        if (params.related && params.related.length > 0) {
            queryParams.push(`related=${encodeURIComponent(params.related.join(','))}`);
        }

        if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`;
        }

        return url;
    }

    /**
     * Extract tweet ID from various Twitter URL formats
     */
    static extractTweetId(url: string): string | null {
        const patterns = [
            /twitter\.com\/\w+\/status\/(\d+)/,
            /x\.com\/\w+\/status\/(\d+)/,
            /t\.co\/\w+/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    /**
     * Extract username from Twitter URL or handle
     */
    static extractUsername(handle: string): string {
        if (!handle) return '';

        // Remove @ symbol if present
        let username = handle.replace(/^@/, '');

        // If it's a Twitter URL, extract the username from the path
        if (TwitterIntents.isTwitterUrl(username)) {
            // Extract username from various Twitter URL patterns
            const patterns = [
                /(?:twitter\.com|x\.com)\/([^\/\?]+)/,  // twitter.com/username or x.com/username
                /(?:twitter\.com|x\.com)\/([^\/\?]+)\/status/,  // twitter.com/username/status/...
                /(?:twitter\.com|x\.com)\/([^\/\?]+)\/with_replies/,  // twitter.com/username/with_replies
                /(?:twitter\.com|x\.com)\/([^\/\?]+)\/media/,  // twitter.com/username/media
                /(?:twitter\.com|x\.com)\/([^\/\?]+)\/likes/,  // twitter.com/username/likes
            ];

            for (const pattern of patterns) {
                const match = username.match(pattern);
                if (match && match[1] && match[1] !== 'intent' && match[1] !== 'search' && match[1] !== 'home') {
                    return match[1];
                }
            }
        }

        // If it's just a handle without URL, return as is
        return username;
    }

    /**
     * Validate if a string looks like a Twitter URL
     */
    static isTwitterUrl(url: string): boolean {
        return /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\//.test(url);
    }

    /**
     * Open intent URL in a new window with optimal dimensions
     */
    static openIntent(url: string, action: string): void {
        const width = 550;
        const height = 420;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const windowFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;

        const popup = window.open(url, `twitter_${action}`, windowFeatures);

        if (popup) {
            popup.focus();

            // Optional: Listen for popup close to trigger callback
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    // You can add a callback here if needed
                }
            }, 1000);
        }
    }
}

/**
 * Mission-specific intent URL generator
 * Handles mission data and generates appropriate intent URLs
 */
export class MissionTwitterIntents {
    /**
     * Generate intent URL for a specific task action
     */
    static generateIntentUrl(
        taskId: string,
        mission: {
            tweet_url?: string;
            tweetLink?: string;
            contentLink?: string;
            tweet_link?: string;
            content_link?: string;
            user_handle?: string;
            username?: string;
            tweet_id?: string;
            platform_data?: any;
            [key: string]: any;
        },
        actionParams?: {
            text?: string;
            hashtags?: string[];
            via?: string;
        }
    ): string | null {
        // Handle multiple field names for tweet URL
        const tweetUrl = mission.tweet_url || mission.tweetLink || mission.contentLink ||
            mission.tweet_link || mission.content_link ||
            mission.platform_data?.tweet_url;

        const tweetId = mission.tweet_id || TwitterIntents.extractTweetId(tweetUrl || '');

        // Extract username from tweet URL if not explicitly provided
        let username = mission.user_handle || mission.username || mission.platform_data?.username;
        if (!username && tweetUrl) {
            username = TwitterIntents.extractUsername(tweetUrl);
        }

        switch (taskId) {
            case 'like':
                if (!tweetId) return null;
                return TwitterIntents.like(tweetId);

            case 'retweet':
                if (!tweetId) return null;
                return TwitterIntents.retweet(tweetId);

            case 'comment':
                if (!tweetId) return null;
                return TwitterIntents.reply(tweetId, actionParams?.text);

            case 'quote':
                if (!tweetUrl) return null;
                return TwitterIntents.quote(
                    tweetUrl,
                    actionParams?.text,
                    actionParams?.hashtags,
                    actionParams?.via
                );

            case 'follow':
                if (!username) return null;
                return TwitterIntents.follow(username);

            default:
                return null;
        }
    }

    /**
     * Check if a mission has the required data for a specific task
     */
    static canPerformTask(
        taskId: string,
        mission: {
            tweet_url?: string;
            tweetLink?: string;
            contentLink?: string;
            tweet_link?: string;
            content_link?: string;
            user_handle?: string;
            username?: string;
            tweet_id?: string;
            platform_data?: any;
            [key: string]: any;
        }
    ): boolean {
        // Handle multiple field names for tweet URL
        const tweetUrl = mission.tweet_url || mission.tweetLink || mission.contentLink ||
            mission.tweet_link || mission.content_link ||
            mission.platform_data?.tweet_url;

        const tweetId = mission.tweet_id || TwitterIntents.extractTweetId(tweetUrl || '');

        // Extract username from tweet URL if not explicitly provided
        let username = mission.user_handle || mission.username || mission.platform_data?.username;
        if (!username && tweetUrl) {
            username = TwitterIntents.extractUsername(tweetUrl);
        }

        switch (taskId) {
            case 'like':
            case 'retweet':
            case 'comment':
                return !!tweetId;

            case 'quote':
                return !!mission.tweet_url;

            case 'follow':
                return !!username;

            default:
                return false;
        }
    }

    /**
     * Get user-friendly error message for missing data
     */
    static getErrorMessage(
        taskId: string,
        mission: {
            tweet_url?: string;
            tweetLink?: string;
            contentLink?: string;
            tweet_link?: string;
            content_link?: string;
            user_handle?: string;
            username?: string;
            tweet_id?: string;
            platform_data?: any;
            [key: string]: any;
        }
    ): string | null {
        // Handle multiple field names for tweet URL
        const tweetUrl = mission.tweet_url || mission.tweetLink || mission.contentLink ||
            mission.tweet_link || mission.content_link ||
            mission.platform_data?.tweet_url;

        const tweetId = mission.tweet_id || TwitterIntents.extractTweetId(tweetUrl || '');

        // Extract username from tweet URL if not explicitly provided
        let username = mission.user_handle || mission.username || mission.platform_data?.username;
        if (!username && tweetUrl) {
            username = TwitterIntents.extractUsername(tweetUrl);
        }

        switch (taskId) {
            case 'like':
            case 'retweet':
            case 'comment':
                if (!tweetId) {
                    return 'Tweet ID or URL is required for this action';
                }
                break;

            case 'quote':
                if (!tweetUrl) {
                    return 'Tweet URL is required for quote tweet';
                }
                break;

            case 'follow':
                if (!username) {
                    return 'User handle is required for follow action';
                }
                break;
        }

        return null;
    }
}
