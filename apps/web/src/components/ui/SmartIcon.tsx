/**
 * SmartIcon Component - Completely independent of local storage
 * Implements fallback chain: Custom SVG -> Library Icon -> Emoji
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  WalletIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  CrownIcon,
  TargetIcon,
  PencilIcon,
  UsersIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  EnvelopeIcon,
  HeartIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  ChatBubbleOvalLeftIcon,
  UserPlusIcon,
  FaceSmileIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentIcon,
  VideoCameraIcon,
  PhotoIcon,
  TagIcon,
  MapPinIcon,
  ChartBarIcon,
  MicrophoneIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightningBoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import { 
  Home,
  Search,
  Rocket,
  FileText,
  DollarSign,
  Wallet,
  User,
  Settings,
  LogOut,
  Globe,
  Crown,
  Target,
  Edit,
  Users,
  Check,
  X,
  Star,
  Mail,
  Heart,
  Repeat,
  MessageCircle,
  MessageSquare,
  UserPlus,
  Smile,
  MessageSquareText,
  File,
  Video,
  Image,
  Tag,
  Pin,
  BarChart,
  Mic,
  Shield,
  Clock,
  AlertTriangle,
  Zap,
  Sparkles
} from 'lucide-react';

import { SmartIconProps } from '@/types/icons';
import { getIconConfig, getEmojiFallback } from '@/lib/icons/registry';

// Heroicons mapping
const heroiconsMap: Record<string, React.ComponentType<any>> = {
  HomeIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  WalletIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  CrownIcon,
  TargetIcon,
  PencilIcon,
  UsersIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  EnvelopeIcon,
  HeartIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  ChatBubbleOvalLeftIcon,
  UserPlusIcon,
  FaceSmileIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentIcon,
  VideoCameraIcon,
  PhotoIcon,
  TagIcon,
  MapPinIcon,
  ChartBarIcon,
  MicrophoneIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightningBoltIcon,
  SparklesIcon
};

// Lucide icons mapping
const lucideIconsMap: Record<string, React.ComponentType<any>> = {
  Home,
  Search,
  Rocket,
  FileText,
  DollarSign,
  Wallet,
  User,
  Settings,
  LogOut,
  Globe,
  Crown,
  Target,
  Edit,
  Users,
  Check,
  X,
  Star,
  Mail,
  Heart,
  Repeat,
  MessageCircle,
  MessageSquare,
  UserPlus,
  Smile,
  MessageSquareText,
  File,
  Video,
  Image,
  Tag,
  Pin,
  BarChart,
  Mic,
  Shield,
  Clock,
  AlertTriangle,
  Zap,
  Sparkles
};

// Custom SVG Icon Component
const CustomSVGIcon: React.FC<{
  src: string;
  alt: string;
  size: number;
  className?: string;
  color?: string;
}> = ({ src, alt, size, className = '', color }) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return null; // Will trigger fallback
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ color }}
      onError={() => setHasError(true)}
      priority={false}
    />
  );
};

// Library Icon Component
const LibraryIcon: React.FC<{
  iconName: string;
  size: number;
  className?: string;
  color?: string;
}> = ({ iconName, size, className = '', color }) => {
  // Try Heroicons first
  const HeroIcon = heroiconsMap[iconName];
  if (HeroIcon) {
    return (
      <HeroIcon
        width={size}
        height={size}
        className={`inline-block ${className}`}
        style={{ color }}
      />
    );
  }

  // Try Lucide icons
  const LucideIcon = lucideIconsMap[iconName];
  if (LucideIcon) {
    return (
      <LucideIcon
        size={size}
        className={`inline-block ${className}`}
        style={{ color }}
      />
    );
  }

  return null; // Will trigger fallback
};

// Emoji Fallback Component
const EmojiFallback: React.FC<{
  emoji: string;
  size: number;
  className?: string;
}> = ({ emoji, size, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: size }}
      role="img"
      aria-label="icon"
    >
      {emoji}
    </span>
  );
};

// Main SmartIcon Component
export const SmartIcon: React.FC<SmartIconProps> = ({
  name,
  size = 24,
  className = '',
  color,
  fallback
}) => {
  const config = getIconConfig(name);
  
  if (!config) {
    // No config found, use emoji fallback
    const emoji = fallback ? getEmojiFallback(fallback) : getEmojiFallback(name);
    return <EmojiFallback emoji={emoji} size={size} className={className} />;
  }

  // Try custom SVG first
  if (config.type === 'custom') {
    const customIcon = (
      <CustomSVGIcon
        src={config.source}
        alt={name}
        size={size}
        className={className}
        color={color}
      />
    );
    
    // If custom icon fails to load, it will return null and trigger fallback
    if (customIcon) {
      return customIcon;
    }
  }

  // Try library icon
  if (config.type === 'library') {
    const libraryIcon = (
      <LibraryIcon
        iconName={config.source}
        size={size}
        className={className}
        color={color}
      />
    );
    
    // If library icon doesn't exist, it will return null and trigger fallback
    if (libraryIcon) {
      return libraryIcon;
    }
  }

  // Final fallback to emoji
  const emoji = config.emoji || getEmojiFallback(name);
  return <EmojiFallback emoji={emoji} size={size} className={className} />;
};

// Convenience components for common use cases
export const PlatformIcon: React.FC<{
  platform: string;
  size?: number;
  className?: string;
  color?: string;
}> = ({ platform, size = 24, className = '', color }) => {
  return (
    <SmartIcon 
      name={platform.toLowerCase() as any} 
      size={size} 
      className={className} 
      color={color} 
    />
  );
};

export const TaskIcon: React.FC<{
  taskType: string;
  size?: number;
  className?: string;
  color?: string;
}> = ({ taskType, size = 24, className = '', color }) => {
  return (
    <SmartIcon 
      name={taskType.toLowerCase() as any} 
      size={size} 
      className={className} 
      color={color} 
    />
  );
};

export const NavigationIcon: React.FC<{
  page: string;
  size?: number;
  className?: string;
  color?: string;
}> = ({ page, size = 24, className = '', color }) => {
  return (
    <SmartIcon 
      name={page.toLowerCase() as any} 
      size={size} 
      className={className} 
      color={color} 
    />
  );
};

export const StatusIcon: React.FC<{
  status: string;
  size?: number;
  className?: string;
  color?: string;
}> = ({ status, size = 24, className = '', color }) => {
  return (
    <SmartIcon 
      name={status.toLowerCase() as any} 
      size={size} 
      className={className} 
      color={color} 
    />
  );
};
