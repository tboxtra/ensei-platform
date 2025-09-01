Twitter (X)

Mission Type	Task (UI label)	Task Key (code)	Suggested Proof	Notes
Engage	Like	like	Post link or screenshot	
Engage	Retweet/Repost	retweet	Post link (user RT)	
Engage	Comment/Reply	comment	Post link (with user reply)	
Engage	Quote Tweet	quote	Quote link	
Content	Meme/Graphic	meme	Tweet URL	Image required
Content	Thread	thread	Thread URL	5+ tweets recommended
Content	Long Article Thread	article	Thread URL	Longform
Content	Video Review	videoreview	Tweet/Video URL	30–60s
Ambassador	PFP change (24h)	pfp	Profile screenshot	24h exposure
Ambassador	Keywords in name/bio (24h)	name_bio_keywords	Profile screenshot	24h
Ambassador	Pin project tweet (24h)	pinned_tweet	Profile screenshot	24h
Other	Poll	poll	Poll URL	
Other	Spaces host	spaces	Spaces link	
Other	Community raid	community_raid	Summary + links	Coordinated


⸻

Instagram

Mission Type	Task	Key	Proof	Notes
Engage	Like post	like	Post link	
Engage	Comment	comment	Post link (with comment)	
Engage	Follow	follow	Profile screenshot	
Engage	Repost Story	story_repost	Story screenshot	Tag required
Content	Feed Post	feed_post	Post link	Static/carousel
Content	Reel	reel	Reel link	15–60s
Content	Carousel	carousel	Post link	3–10 slides
Content	Meme/Graphic	meme	Post link	
Ambassador	PFP change (24h)	pfp	Profile screenshot	24h
Ambassador	Hashtag in bio (24h)	hashtag_in_bio	Profile screenshot	24h
Ambassador	Story Highlight (24h)	story_highlight	Highlight screenshot	24h


⸻

TikTok

Mission Type	Task	Key	Proof	Notes
Engage	Like	like	Video link	
Engage	Comment	comment	Video link (with comment)	
Engage	Repost/Duet	repost_duet	Video/duet link	
Engage	Follow	follow	Profile screenshot	
Content	Skit	skit	Video link	15–60s
Content	Hashtag Challenge	challenge	Video link	Use hashtag
Content	Product Review	product_review	Video link	30–60s
Content	Status-style (image→video)	status_style	Video link	
Ambassador	PFP change (24h)	pfp	Profile screenshot	24h
Ambassador	Hashtag in bio (24h)	hashtag_in_bio	Profile screenshot	24h
Ambassador	Pin branded video (24h)	pinned_branded_video	Profile screenshot	24h


⸻

Facebook

Mission Type	Task	Key	Proof	Notes
Engage	Like	like	Post link	
Engage	Comment	comment	Post link (with comment)	
Engage	Follow page	follow	Page screenshot	
Engage	Share post	share_post	Share link	
Content	Group Post	group_post	Post link	Public if possible
Content	Video	video	Video link	30–60s
Content	Meme/Flyer	meme_flyer	Post link	
Ambassador	PFP change (24h)	pfp	Profile screenshot	24h
Ambassador	Bio keyword (24h)	bio_keyword	Profile screenshot	24h
Ambassador	Pin post (24h)	pinned_post	Profile screenshot	24h


⸻

WhatsApp

Mission Type	Task	Key	Proof	Notes
Engage	Status (≥50 views)	status_50_views	Status screenshot (views)	
Content	Flyer/Clip Status	flyer_clip_status	Status screenshot	
Content	Broadcast Message	broadcast_message	Screenshot of message/recipients	Respect privacy
Ambassador	PFP change (24h)	pfp	Profile screenshot	24h
Ambassador	Keyword in “About” (24h)	keyword_in_about	Profile screenshot	24h


⸻

Snapchat

Mission Type	Task	Key	Proof	Notes
Engage	Story (≥100 views)	story_100_views	Story screenshot (views)	
Engage	Snap repost	snap_repost	Story screenshot	
Content	Meme/Flyer Snap	meme_flyer_snap	Story screenshot	
Content	Branded Snap Video	branded_snap_video	Story screenshot	
Ambassador	PFP/Avatar change (24h)	pfp_avatar	Profile screenshot	24h
Ambassador	Hashtag in profile (24h)	hashtag_in_profile	Profile screenshot	24h
Ambassador	Branded lens/filter	branded_lens	Story video	If provided


⸻

Telegram ✅

Mission Type	Task	Key	Proof	Notes
Engage	Join channel	join_channel	Joined screenshot or bot-verified	Invite link optional
Engage	React to post	react_to_post	Post link + reaction	
Engage	Reply in group	reply_in_group	Message link/screenshot	
Engage	Share invite	share_invite	Invite link + screenshot	
Content	Channel post	channel_post	Post link	
Content	Short video in channel	short_video_in_channel	Post link	15–60s
Content	Guide / thread (pinned)	guide_thread	Post link	Thread-style
Ambassador	PFP change (24h)	pfp	Profile screenshot	24h
Ambassador	Mention brand in bio (24h)	mention_in_bio	Profile screenshot	24h
Ambassador	Pin invite link (24h)	pin_invite_link	Channel screenshot	24h

Default Ambassador exposure is 24h unless a mission specifies longer.

⸻

2) Code view (paste into packages/shared-types/src/platformTasks.ts)

// packages/shared-types/src/platformTasks.ts
// Canonical Platform → MissionType → Task catalog for Ensei (2025 Sept spec)

export type MissionTypeKey = 'engage' | 'content' | 'ambassador';
export type PlatformKey =
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'whatsapp'
  | 'snapchat'
  | 'telegram';

export interface TaskDef {
  label: string;                 // UI label
  key: string;                   // machine key (aligns with mission-engine BASE map)
  suggestedProof?: string;       // doc hint only
  defaultExposureHours?: number; // for ambassador tasks (typically 24)
}

export type PlatformTasks = Record<PlatformKey, Record<MissionTypeKey, TaskDef[]>>;

export const PLATFORM_TASKS: PlatformTasks = {
  twitter: {
    engage: [
      { label: 'Like', key: 'like' },
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
} as const;

export type PlatformTaskKey =
  | typeof PLATFORM_TASKS.twitter.engage[number]['key']
  | typeof PLATFORM_TASKS.twitter.content[number]['key']
  | typeof PLATFORM_TASKS.twitter.ambassador[number]['key']
  | typeof PLATFORM_TASKS.instagram.engage[number]['key']
  | typeof PLATFORM_TASKS.instagram.content[number]['key']
  | typeof PLATFORM_TASKS.instagram.ambassador[number]['key']
  | typeof PLATFORM_TASKS.tiktok.engage[number]['key']
  | typeof PLATFORM_TASKS.tiktok.content[number]['key']
  | typeof PLATFORM_TASKS.tiktok.ambassador[number]['key']
  | typeof PLATFORM_TASKS.facebook.engage[number]['key']
  | typeof PLATFORM_TASKS.facebook.content[number]['key']
  | typeof PLATFORM_TASKS.facebook.ambassador[number]['key']
  | typeof PLATFORM_TASKS.whatsapp.engage[number]['key']
  | typeof PLATFORM_TASKS.whatsapp.content[number]['key']
  | typeof PLATFORM_TASKS.whatsapp.ambassador[number]['key']
  | typeof PLATFORM_TASKS.snapchat.engage[number]['key']
  | typeof PLATFORM_TASKS.snapchat.content[number]['key']
  | typeof PLATFORM_TASKS.snapchat.ambassador[number]['key']
  | typeof PLATFORM_TASKS.telegram.engage[number]['key']
  | typeof PLATFORM_TASKS.telegram.content[number]['key']
  | typeof PLATFORM_TASKS.telegram.ambassador[number]['key'];

These keys match your earlier BASE honors map used in the prototype and mission-engine, so no mapping layer is needed.

⸻

How to wire this in Cursor quickly
	1.	Add the code file above to:

packages/shared-types/src/platformTasks.ts

	2.	Export it from the package index:

// packages/shared-types/src/index.ts
export * from './platformTasks';

	3.	Use it in:

	•	validation-schemas to restrict task keys by platform+type
	•	mission-engine to compute base honors (BASE) by task key
	•	apps/web to render task chips from this single source
	•	apps/admin-dashboard to label tasks cleanly

	4.	Docs: drop the Markdown section into:

docs/mission-tasks.md

If you want, I can also generate a Zod enum map (platform → mission type → task key enum) so your validators can import enums directly without string duplication.





Docs patch 

Twitter (X) — corrected

Mission Type	Task (UI label)	Task Key (code)	Suggested Proof	Notes
Engage	Like	like	Post link or screenshot	
Engage	Follow	follow	Profile screenshot	Added
Engage	Retweet/Repost	retweet	Post link (user RT)	
Engage	Comment/Reply	comment	Post link (with user reply)	
Engage	Quote Tweet	quote	Quote link	
Content	Meme/Graphic	meme	Tweet URL	Image required
Content	Thread	thread	Thread URL	5+ tweets recommended
Content	Long Article Thread	article	Thread URL	Longform
Content	Video Review	videoreview	Tweet/Video URL	30–60s
Ambassador	PFP change (24h)	pfp	Profile screenshot	24h exposure
Ambassador	Keywords in name/bio (24h)	name_bio_keywords	Profile screenshot	24h
Ambassador	Pin project tweet (24h)	pinned_tweet	Profile screenshot	24h
Other	Poll	poll	Poll URL	
Other	Spaces host	spaces	Spaces link	
Other	Community raid	community_raid	Summary + links	Coordinated


⸻

Code patch (shared-types)

Paste this updated Twitter block into packages/shared-types/src/platformTasks.ts. Everything else in the file stays the same.

// ...keep existing imports and types

export const PLATFORM_TASKS: PlatformTasks = {
  twitter: {
    engage: [
      { label: 'Like', key: 'like' },
      { label: 'Follow', key: 'follow' },            // ← ADDED
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

  // ...leave instagram/tiktok/facebook/whatsapp/snapchat/telegram blocks unchanged
} as const;

// ...keep the PlatformTaskKey union as-is (it will pick up 'follow' automatically)


⸻

Pricing engine patch (mission-engine)

To keep Fixed pricing correct, add the Twitter Follow honors to your task catalog. In services/mission-engine/src/tasks/catalo g.ts (where your honors BASE map lives), add:

// inside the twitter.engage map:
follow: 200, // align with other platforms’ follow reward baseline

If you prefer a different baseline for Twitter follow, update the value here and the UI will reflect it via the existing math.

⸻

Validation patch (optional but recommended)

If your Zod schema restricts Twitter Engage task keys explicitly, add 'follow':

packages/validation-schemas/src/mission/createFixedMission.schema.ts (where you validate tasks by platform/type):

// pseudo-snippet illustrating where to add:
const TWITTER_ENGAGE_TASKS = [
  'like', 'follow', 'retweet', 'comment', 'quote'
] as const;

No other platform needed changes — they already had Follow where applicable.

