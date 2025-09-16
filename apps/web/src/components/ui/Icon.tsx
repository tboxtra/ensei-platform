import React from 'react';
import Image from 'next/image';

export type IconName = 
  // Platform icons
  | 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'snapchat' | 'telegram' | 'youtube' | 'linkedin' | 'discord'
  // Task type icons
  | 'like' | 'retweet' | 'comment' | 'quote' | 'follow' | 'meme' | 'thread' | 'article' | 'videoreview' | 'pfp' | 'name_bio_keywords' | 'pinned_tweet' | 'poll' | 'spaces' | 'community_raid'
  // Navigation icons
  | 'dashboard' | 'discover' | 'missions' | 'review' | 'wallet' | 'claims' | 'demo'
  // Action icons
  | 'engage' | 'content' | 'ambassador' | 'custom'
  // Status icons
  | 'approved' | 'pending' | 'rejected' | 'success' | 'error' | 'warning'
  // General icons
  | 'profile' | 'settings' | 'logout' | 'email' | 'globe' | 'crown' | 'target' | 'write' | 'money' | 'users' | 'gear' | 'check' | 'cross' | 'star';

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  color?: string;
  fallback?: string; // Fallback emoji if icon not found
}

const iconMappings: Record<IconName, string> = {
  // Platform icons
  twitter: '/icons/Twitter_logo.svg',
  instagram: '/icons/Instagram_logo.svg',
  tiktok: '/icons/tiktok_for_business_japan_icon.jpeg.svg',
  facebook: '/icons/facebook.svg', // We'll need to add this
  whatsapp: '/icons/whatsapp_icon.png.svg',
  snapchat: '/icons/Snapchat.svg',
  telegram: '/icons/telegram.svg', // We'll need to add this
  youtube: '/icons/youtube.svg', // We'll need to add this
  linkedin: '/icons/linkedin.svg', // We'll need to add this
  discord: '/icons/discord.svg', // We'll need to add this
  
  // Task type icons - using platform icons as placeholders for now
  like: '/icons/like.svg', // We'll need to add this
  retweet: '/icons/retweet.svg', // We'll need to add this
  comment: '/icons/comment.svg', // We'll need to add this
  quote: '/icons/quote.svg', // We'll need to add this
  follow: '/icons/follow.svg', // We'll need to add this
  meme: '/icons/meme.svg', // We'll need to add this
  thread: '/icons/thread.svg', // We'll need to add this
  article: '/icons/article.svg', // We'll need to add this
  videoreview: '/icons/videoreview.svg', // We'll need to add this
  pfp: '/icons/pfp.svg', // We'll need to add this
  name_bio_keywords: '/icons/name_bio_keywords.svg', // We'll need to add this
  pinned_tweet: '/icons/pinned_tweet.svg', // We'll need to add this
  poll: '/icons/poll.svg', // We'll need to add this
  spaces: '/icons/spaces.svg', // We'll need to add this
  community_raid: '/icons/community_raid.svg', // We'll need to add this
  
  // Navigation icons
  dashboard: '/icons/Dashboard_icon.svg',
  discover: '/icons/Discover_and_earn.svg',
  missions: '/icons/Missions.svg',
  review: '/icons/Review.svg',
  wallet: '/icons/Wallet.svg',
  claims: '/icons/Claims.svg',
  demo: '/icons/Demo.svg',
  
  // Action icons
  engage: '/icons/engage.svg', // We'll need to add this
  content: '/icons/content.svg', // We'll need to add this
  ambassador: '/icons/ambassador.svg', // We'll need to add this
  custom: '/icons/custom.svg', // We'll need to add this
  
  // Status icons
  approved: '/icons/approved.svg', // We'll need to add this
  pending: '/icons/pending.svg', // We'll need to add this
  rejected: '/icons/rejected.svg', // We'll need to add this
  success: '/icons/success.svg', // We'll need to add this
  error: '/icons/error.svg', // We'll need to add this
  warning: '/icons/warning.svg', // We'll need to add this
  
  // General icons
  profile: '/icons/profile.svg', // We'll need to add this
  settings: '/icons/settings.svg', // We'll need to add this
  logout: '/icons/logout.svg', // We'll need to add this
  email: '/icons/email.svg', // We'll need to add this
  globe: '/icons/globe.svg', // We'll need to add this
  crown: '/icons/crown.svg', // We'll need to add this
  target: '/icons/target.svg', // We'll need to add this
  write: '/icons/write.svg', // We'll need to add this
  money: '/icons/money.svg', // We'll need to add this
  users: '/icons/users.svg', // We'll need to add this
  gear: '/icons/gear.svg', // We'll need to add this
  check: '/icons/check.svg', // We'll need to add this
  cross: '/icons/cross.svg', // We'll need to add this
  star: '/icons/star.svg', // We'll need to add this
};

// Fallback emoji mappings for when icons are not available
const emojiFallbacks: Record<IconName, string> = {
  // Platform icons
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
  
  // Task type icons
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
  name_bio_keywords: '📋',
  pinned_tweet: '📌',
  poll: '📊',
  spaces: '🎙️',
  community_raid: '⚔️',
  
  // Navigation icons
  dashboard: '🏠',
  discover: '🔍',
  missions: '🚀',
  review: '📄',
  wallet: '👛',
  claims: '💰',
  demo: '🎯',
  
  // Action icons
  engage: '🎯',
  content: '✍️',
  ambassador: '👑',
  custom: '⚡',
  
  // Status icons
  approved: '✅',
  pending: '⏳',
  rejected: '❌',
  success: '✅',
  error: '❌',
  warning: '⚠️',
  
  // General icons
  profile: '👤',
  settings: '⚙️',
  logout: '🚪',
  email: '📧',
  globe: '🌐',
  crown: '👑',
  target: '🎯',
  write: '✍️',
  money: '💰',
  users: '👥',
  gear: '⚙️',
  check: '✓',
  cross: '✗',
  star: '⭐',
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  className = '', 
  color,
  fallback 
}) => {
  const iconPath = iconMappings[name];
  const emojiFallback = fallback || emojiFallbacks[name];
  
  // For now, we'll use the emoji fallback since we need to download the actual icons
  // Once you replace the placeholder SVGs with the real ones, this will automatically use them
  const useEmoji = true; // Set to false once real icons are in place
  
  if (useEmoji) {
    return (
      <span 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ 
          fontSize: typeof size === 'number' ? `${size}px` : size,
          color: color 
        }}
        title={name}
      >
        {emojiFallback}
      </span>
    );
  }
  
  return (
    <Image
      src={iconPath}
      alt={name}
      width={typeof size === 'number' ? size : 24}
      height={typeof size === 'number' ? size : 24}
      className={`inline-block ${className}`}
      style={{ color }}
      onError={() => {
        // Fallback to emoji if image fails to load
        console.warn(`Failed to load icon: ${iconPath}, falling back to emoji`);
      }}
    />
  );
};

// Convenience components for common icons
export const PlatformIcon: React.FC<Omit<IconProps, 'name'> & { platform: string }> = ({ platform, ...props }) => {
  const platformMap: Record<string, IconName> = {
    twitter: 'twitter',
    instagram: 'instagram',
    tiktok: 'tiktok',
    facebook: 'facebook',
    whatsapp: 'whatsapp',
    snapchat: 'snapchat',
    telegram: 'telegram',
    youtube: 'youtube',
    linkedin: 'linkedin',
    discord: 'discord',
  };
  
  const iconName = platformMap[platform.toLowerCase()] || 'globe';
  return <Icon name={iconName} {...props} />;
};

export const TaskIcon: React.FC<Omit<IconProps, 'name'> & { taskType: string }> = ({ taskType, ...props }) => {
  const taskMap: Record<string, IconName> = {
    like: 'like',
    retweet: 'retweet',
    comment: 'comment',
    quote: 'quote',
    follow: 'follow',
    meme: 'meme',
    thread: 'thread',
    article: 'article',
    videoreview: 'videoreview',
    pfp: 'pfp',
    name_bio_keywords: 'name_bio_keywords',
    pinned_tweet: 'pinned_tweet',
    poll: 'poll',
    spaces: 'spaces',
    community_raid: 'community_raid',
  };
  
  const iconName = taskMap[taskType.toLowerCase()] || 'custom';
  return <Icon name={iconName} {...props} />;
};

export const NavigationIcon: React.FC<Omit<IconProps, 'name'> & { page: string }> = ({ page, ...props }) => {
  const pageMap: Record<string, IconName> = {
    dashboard: 'dashboard',
    missions: 'missions',
    discover: 'discover',
    review: 'review',
    claim: 'claims',
    wallet: 'wallet',
    demo: 'demo',
  };
  
  const iconName = pageMap[page.toLowerCase()] || 'dashboard';
  return <Icon name={iconName} {...props} />;
};

export default Icon;
