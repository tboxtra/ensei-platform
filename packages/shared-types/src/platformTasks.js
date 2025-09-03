"use strict";
// packages/shared-types/src/platformTasks.ts
// Canonical Platform → MissionType → Task catalog for Ensei (2025 Sept spec)
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_TASKS = void 0;
exports.PLATFORM_TASKS = {
    twitter: {
        engage: [
            { label: 'Like', key: 'like' },
            { label: 'Follow', key: 'follow' },
            { label: 'Retweet/Repost', key: 'retweet' },
            { label: 'Comment/Reply', key: 'comment' },
            { label: 'Quote Tweet', key: 'quote' },
        ],
        content: [
            { label: 'Meme / Graphic', key: 'meme' },
            { label: 'Thread', key: 'thread' },
            { label: 'Long Article Thread', key: 'article' },
            { label: 'Video Review', key: 'videoreview' },
        ],
        ambassador: [
            { label: 'PFP Change', key: 'pfp', defaultExposureHours: 24 },
            { label: 'Keywords in Name/Bio', key: 'name_bio_keywords', defaultExposureHours: 24 },
            { label: 'Pin Project Tweet', key: 'pinned_tweet', defaultExposureHours: 24 },
            { label: 'Poll', key: 'poll' },
            { label: 'Spaces Hosting', key: 'spaces' },
            { label: 'Community Raid', key: 'community_raid' },
        ],
    },
    instagram: {
        engage: [
            { label: 'Like', key: 'like' },
            { label: 'Comment', key: 'comment' },
            { label: 'Follow', key: 'follow' },
            { label: 'Repost Story', key: 'story_repost' },
        ],
        content: [
            { label: 'Feed Post', key: 'feed_post' },
            { label: 'Reel', key: 'reel' },
            { label: 'Carousel', key: 'carousel' },
            { label: 'Meme / Graphic', key: 'meme' },
        ],
        ambassador: [
            { label: 'PFP Change', key: 'pfp', defaultExposureHours: 24 },
            { label: 'Hashtag in Bio', key: 'hashtag_in_bio', defaultExposureHours: 24 },
            { label: 'Story Highlight', key: 'story_highlight', defaultExposureHours: 24 },
        ],
    },
    tiktok: {
        engage: [
            { label: 'Like', key: 'like' },
            { label: 'Comment', key: 'comment' },
            { label: 'Repost / Duet', key: 'repost_duet' },
            { label: 'Follow', key: 'follow' },
        ],
        content: [
            { label: 'Skit', key: 'skit' },
            { label: 'Hashtag Challenge', key: 'challenge' },
            { label: 'Product Review', key: 'product_review' },
            { label: 'Status-style Video', key: 'status_style' },
        ],
        ambassador: [
            { label: 'PFP Change', key: 'pfp', defaultExposureHours: 24 },
            { label: 'Hashtag in Bio', key: 'hashtag_in_bio', defaultExposureHours: 24 },
            { label: 'Pin Branded Video', key: 'pinned_branded_video', defaultExposureHours: 24 },
        ],
    },
    facebook: {
        engage: [
            { label: 'Like', key: 'like' },
            { label: 'Comment', key: 'comment' },
            { label: 'Follow Page', key: 'follow' },
            { label: 'Share Post', key: 'share_post' },
        ],
        content: [
            { label: 'Group Post', key: 'group_post' },
            { label: 'Video', key: 'video' },
            { label: 'Meme / Flyer', key: 'meme_flyer' },
        ],
        ambassador: [
            { label: 'PFP Change', key: 'pfp', defaultExposureHours: 24 },
            { label: 'Bio Keyword', key: 'bio_keyword', defaultExposureHours: 24 },
            { label: 'Pin Post', key: 'pinned_post', defaultExposureHours: 24 },
        ],
    },
    whatsapp: {
        engage: [
            { label: 'Status (50+ views)', key: 'status_50_views' },
        ],
        content: [
            { label: 'Flyer/Clip Status', key: 'flyer_clip_status' },
            { label: 'Broadcast Message', key: 'broadcast_message' },
        ],
        ambassador: [
            { label: 'PFP Change', key: 'pfp', defaultExposureHours: 24 },
            { label: 'Keyword in About', key: 'keyword_in_about', defaultExposureHours: 24 },
        ],
    },
    snapchat: {
        engage: [
            { label: 'Story (100+ views)', key: 'story_100_views' },
            { label: 'Snap Repost', key: 'snap_repost' },
        ],
        content: [
            { label: 'Meme/Flyer Snap', key: 'meme_flyer_snap' },
            { label: 'Branded Snap Video', key: 'branded_snap_video' },
        ],
        ambassador: [
            { label: 'PFP/Avatar Change', key: 'pfp_avatar', defaultExposureHours: 24 },
            { label: 'Hashtag in Profile', key: 'hashtag_in_profile', defaultExposureHours: 24 },
            { label: 'Branded Lens/Filter', key: 'branded_lens' },
        ],
    },
    telegram: {
        engage: [
            { label: 'Join Channel', key: 'join_channel' },
            { label: 'React to Post', key: 'react_to_post' },
            { label: 'Reply in Group', key: 'reply_in_group' },
            { label: 'Share Invite', key: 'share_invite' },
        ],
        content: [
            { label: 'Channel Post', key: 'channel_post' },
            { label: 'Short Video in Channel', key: 'short_video_in_channel' },
            { label: 'Guide / Thread', key: 'guide_thread' },
        ],
        ambassador: [
            { label: 'PFP Change', key: 'pfp', defaultExposureHours: 24 },
            { label: 'Mention in Bio', key: 'mention_in_bio', defaultExposureHours: 24 },
            { label: 'Pin Invite Link', key: 'pin_invite_link', defaultExposureHours: 24 },
        ],
    },
};
