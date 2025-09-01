export type Platform = 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'snapchat' | 'telegram';

export type MissionType = 'engage' | 'content' | 'ambassador';

export type MissionModel = 'fixed' | 'degen';

export type TargetProfile = 'all' | 'premium';

export type TaskType =
  // Twitter tasks
  | 'like' | 'retweet' | 'comment' | 'quote'
  | 'meme' | 'thread' | 'article' | 'videoreview'
  | 'pfp' | 'name_bio_keywords' | 'pinned_tweet' | 'poll' | 'spaces' | 'community_raid'

  // Instagram tasks
  | 'follow' | 'story_repost'
  | 'feed_post' | 'reel' | 'carousel'
  | 'hashtag_in_bio' | 'story_highlight'

  // TikTok tasks
  | 'repost_duet'
  | 'skit' | 'challenge' | 'product_review' | 'status_style'
  | 'hashtag_in_bio' | 'pinned_branded_video'

  // Facebook tasks
  | 'share_post'
  | 'group_post' | 'video' | 'meme_flyer'
  | 'bio_keyword' | 'pinned_post'

  // WhatsApp tasks
  | 'status_50_views'
  | 'flyer_clip_status' | 'broadcast_message'
  | 'keyword_in_about'

  // Snapchat tasks
  | 'story_100_views' | 'snap_repost'
  | 'story_highlight'

  // Telegram tasks
  | 'channel_post' | 'group_message'
  | 'channel_join' | 'group_join';

// Import types from pricing module
import type { DegenDurationPreset, AudiencePreset } from './pricing';

// Re-export for backward compatibility
export type DegenDuration = DegenDurationPreset;

export interface MissionPricing {
  platformFeeRate: number;
  premiumRate: number;
  honorToUsd: number;
  degenDurations: DegenDuration[];
  audiencePresets: AudiencePreset[];
  basePricing: Record<Platform, Record<MissionType, Record<TaskType, number>>>;
}

export interface CreateMissionRequest {
  platform: Platform;
  type: MissionType;
  model: MissionModel;
  title: string;
  tasks: TaskType[];
  premium: boolean;
  cap: number;
  rewards_per_user: number;
  duration_hours: number;

  // Degen-specific fields
  total_cost_usd?: number;
  user_pool_honors?: number;
  per_winner_honors?: number;
  winners_cap?: number;

  // Optional platform-specific fields
  tweet_url?: string;
  tg_invite?: string;
  brief?: string;
  instructions?: string;
}

export interface Mission {
  id: string;
  creator_id: string;
  platform: Platform;
  type: MissionType;
  model: MissionModel;
  title: string;
  tasks: TaskType[];
  premium: boolean;
  cap: number;
  rewards_per_user: number;
  duration_hours: number;
  total_cost_usd?: number;
  user_pool_honors?: number;
  per_winner_honors?: number;
  winners_cap?: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: Date;
  expires_at: Date;
  submissions_count: number;
  approved_count: number;
}

export interface MissionSubmission {
  id: string;
  mission_id: string;
  user_id: string;
  proofs: Proof[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: Date;
  reviewed_at?: Date;
  reviewer_id?: string;
  rejection_reason?: string;
}

export interface Proof {
  type: 'image' | 'video' | 'text' | 'url';
  content: string;
  metadata?: Record<string, any>;
  verified_at?: Date;
  verification_score?: number;
}
