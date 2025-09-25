/**
 * Shared X/Twitter link parsing utilities
 * Used by both client and server for consistent validation
 */

export const X_LINK_RX =
    /^(?:https?:\/\/)?(?:www\.)?(?:mobile\.)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/i;

export function parseTweetUrl(url: string) {
    const m = (url ?? '').trim().match(X_LINK_RX);
    if (!m) return null;
    return { handle: m[1].toLowerCase(), tweetId: m[2] };
}

export function parseHandle(url?: string | null) {
    const m = (url ?? '').match(X_LINK_RX);
    return m ? m[1].toLowerCase() : null;
}

export function parseTweetId(url?: string | null) {
    const m = (url ?? '').match(X_LINK_RX);
    return m ? m[2] : null;
}
