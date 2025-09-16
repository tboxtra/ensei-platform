/**
 * Icon System Type Definitions
 * Completely independent of local storage - all data is statically defined
 */

export type IconSize = 16 | 20 | 24 | 32 | 48 | 64;

export type IconCategory = 'navigation' | 'platform' | 'task' | 'status' | 'action' | 'brand';

export type IconType = 'custom' | 'library' | 'emoji';

export type LibraryIconName = 
  // Heroicons
  | 'HomeIcon'
  | 'MagnifyingGlassIcon'
  | 'RocketLaunchIcon'
  | 'DocumentTextIcon'
  | 'CurrencyDollarIcon'
  | 'WalletIcon'
  | 'UserIcon'
  | 'Cog6ToothIcon'
  | 'ArrowRightOnRectangleIcon'
  | 'GlobeAltIcon'
  | 'CrownIcon'
  | 'TargetIcon'
  | 'PencilIcon'
  | 'UsersIcon'
  | 'CheckIcon'
  | 'XMarkIcon'
  | 'StarIcon'
  | 'EnvelopeIcon'
  | 'HeartIcon'
  | 'ArrowPathIcon'
  | 'ChatBubbleLeftIcon'
  | 'ChatBubbleOvalLeftIcon'
  | 'UserPlusIcon'
  | 'FaceSmileIcon'
  | 'ChatBubbleBottomCenterTextIcon'
  | 'DocumentIcon'
  | 'VideoCameraIcon'
  | 'PhotoIcon'
  | 'TagIcon'
  | 'MapPinIcon'
  | 'ChartBarIcon'
  | 'MicrophoneIcon'
  | 'ShieldCheckIcon'
  | 'ClockIcon'
  | 'ExclamationTriangleIcon'
  | 'LightningBoltIcon'
  | 'SparklesIcon'
  // Lucide Icons
  | 'Home'
  | 'Search'
  | 'Rocket'
  | 'FileText'
  | 'DollarSign'
  | 'Wallet'
  | 'User'
  | 'Settings'
  | 'LogOut'
  | 'Globe'
  | 'Crown'
  | 'Target'
  | 'Edit'
  | 'Users'
  | 'Check'
  | 'X'
  | 'Star'
  | 'Mail'
  | 'Heart'
  | 'Repeat'
  | 'MessageCircle'
  | 'MessageSquare'
  | 'UserPlus'
  | 'Smile'
  | 'MessageSquareText'
  | 'File'
  | 'Video'
  | 'Image'
  | 'Tag'
  | 'Pin'
  | 'BarChart'
  | 'Mic'
  | 'Shield'
  | 'Clock'
  | 'AlertTriangle'
  | 'Zap'
  | 'Sparkles';

export type CustomIconName = 
  | 'ensei-logo'
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'whatsapp'
  | 'snapchat'
  | 'telegram'
  | 'youtube'
  | 'linkedin'
  | 'discord'
  | 'like'
  | 'retweet'
  | 'comment'
  | 'quote'
  | 'follow'
  | 'meme'
  | 'thread'
  | 'article'
  | 'videoreview'
  | 'pfp'
  | 'name-bio-keywords'
  | 'pinned-tweet'
  | 'poll'
  | 'spaces'
  | 'community-raid'
  | 'engage'
  | 'content'
  | 'ambassador'
  | 'custom'
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'success'
  | 'error'
  | 'warning'
  | 'profile'
  | 'settings'
  | 'logout'
  | 'email'
  | 'globe'
  | 'crown'
  | 'target'
  | 'write'
  | 'money'
  | 'users'
  | 'gear'
  | 'check'
  | 'cross'
  | 'star';

export type EmojiIconName = 
  | 'dashboard'
  | 'discover'
  | 'missions'
  | 'review'
  | 'claims'
  | 'wallet'
  | 'profile'
  | 'logout'
  | 'settings'
  | 'globe'
  | 'crown'
  | 'target'
  | 'write'
  | 'money'
  | 'users'
  | 'gear'
  | 'check'
  | 'cross'
  | 'star'
  | 'email';

export type IconName = CustomIconName | LibraryIconName | EmojiIconName;

export interface IconConfig {
  name: IconName;
  type: IconType;
  source: string;
  fallback?: IconName;
  category: IconCategory;
  emoji?: string;
}

export interface SmartIconProps {
  name: IconName;
  size?: IconSize;
  className?: string;
  color?: string;
  fallback?: IconName;
}

export interface PlatformIconProps {
  platform: string;
  size?: IconSize;
  className?: string;
  color?: string;
}

export interface TaskIconProps {
  taskType: string;
  size?: IconSize;
  className?: string;
  color?: string;
}

export interface NavigationIconProps {
  page: string;
  size?: IconSize;
  className?: string;
  color?: string;
}
