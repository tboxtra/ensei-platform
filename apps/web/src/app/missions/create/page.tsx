'use client';

import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';
import { ModernInput } from '../../../components/ui/ModernInput';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import CustomMissionForm from '../../../components/missions/CustomMissionForm';

// Constants
const TASK_PRICES = {
  twitter: {
    engage: {
      like: 50,
      retweet: 100,
      comment: 150,
      quote: 200,
      follow: 250
    },
    content: {
      meme: 300,
      thread: 500,
      article: 400,
      videoreview: 600
    },
    ambassador: {
      pfp: 250,
      name_bio_keywords: 200,
      pinned_tweet: 300,
      poll: 150,
      spaces: 800,
      community_raid: 400
    }
  },
  instagram: {
    engage: {
      like: 50,
      comment: 150,
      follow: 250,
      story_repost: 200
    },
    content: {
      feed_post: 300,
      reel: 500,
      carousel: 400,
      meme: 250
    },
    ambassador: {
      pfp: 250,
      hashtag_in_bio: 200,
      story_highlight: 300
    }
  },
  tiktok: {
    engage: {
      like: 50,
      comment: 150,
      repost_duet: 300,
      follow: 250
    },
    content: {
      skit: 400,
      challenge: 500,
      product_review: 600,
      status_style: 350
    },
    ambassador: {
      pfp: 250,
      hashtag_in_bio: 200,
      pinned_branded_video: 400
    }
  },
  facebook: {
    engage: {
      like: 50,
      comment: 150,
      follow: 250,
      share_post: 200
    },
    content: {
      group_post: 300,
      video: 400,
      meme_flyer: 250
    },
    ambassador: {
      pfp: 250,
      bio_keyword: 200,
      pinned_post: 300
    }
  },
  whatsapp: {
    engage: {
      status_50_views: 300
    },
    content: {
      flyer_clip_status: 400,
      broadcast_message: 500
    },
    ambassador: {
      pfp: 250,
      keyword_in_about: 200
    }
  },
  snapchat: {
    engage: {
      story_100_views: 400,
      snap_repost: 300
    },
    content: {
      meme_flyer_snap: 350,
      branded_snap_video: 500
    },
    ambassador: {
      pfp_avatar: 250,
      hashtag_in_profile: 200,
      branded_lens: 400
    }
  },
  telegram: {
    engage: {
      join_channel: 100,
      react_to_post: 50,
      reply_in_group: 150,
      share_invite: 200
    },
    content: {
      channel_post: 300,
      short_video_in_channel: 400,
      guide_thread: 500
    },
    ambassador: {
      pfp: 250,
      mention_in_bio: 200,
      pin_invite_link: 300
    }
  }
};

const HONORS_PER_USD = 450;
const PREMIUM_COST_MULTIPLIER = 5;
const USER_POOL_FACTOR = 0.5;
const PLATFORM_FEE_RATE = 1.0; // 100% platform fee

// Helper function to get task price safely
const getTaskPrice = (platform: string, type: string, task: string): number => {
  const platformTasks = TASK_PRICES[platform as keyof typeof TASK_PRICES];
  if (!platformTasks) return 0;

  const typeTasks = platformTasks[type as keyof typeof platformTasks];
  if (!typeTasks) return 0;

  return (typeTasks as any)[task] || 0;
};



const DEGEN_PRESETS = [
  { hours: 1, costUSD: 15, maxWinners: 1, label: '1h - $15' },
  { hours: 2, costUSD: 30, maxWinners: 1, label: '2h - $30' },
  { hours: 4, costUSD: 60, maxWinners: 1, label: '4h - $60' },
  { hours: 8, costUSD: 150, maxWinners: 3, label: '8h - $150' },
  { hours: 12, costUSD: 300, maxWinners: 5, label: '12h - $300' },
  { hours: 24, costUSD: 600, maxWinners: 10, label: '24h - $600' },
  { hours: 36, costUSD: 900, maxWinners: 10, label: '36h - $900' },
  { hours: 48, costUSD: 1200, maxWinners: 10, label: '48h - $1200' },
  { hours: 72, costUSD: 1800, maxWinners: 10, label: '72h - $1800' },
  { hours: 96, costUSD: 2400, maxWinners: 10, label: '96h - $2400' },
  { hours: 120, costUSD: 3000, maxWinners: 10, label: '120h - $3000' },
  { hours: 168, costUSD: 4200, maxWinners: 10, label: '168h - $4200' },
  { hours: 240, costUSD: 6000, maxWinners: 10, label: '240h - $6000' }
];

const AUDIENCE_PRESETS = [
  { hours: 1, label: 'Micro (1h)', description: 'Quick engagement' },
  { hours: 12, label: 'Small (12h)', description: 'Community focused' },
  { hours: 36, label: 'Medium (36h)', description: 'Balanced reach' },
  { hours: 96, label: 'Large (96h)', description: 'Wide audience' },
  { hours: 240, label: 'Massive (240h)', description: 'Maximum exposure' }
];

// Platform-specific content placeholders
const PLATFORM_CONTENT_PLACEHOLDERS = {
  twitter: {
    contentLink: 'https://x.com/username/status/123',
    instructions: 'Be constructive, relevant and supportive. Engage meaningfully with the content.'
  },
  instagram: {
    contentLink: 'https://instagram.com/p/post_id',
    instructions: 'Create engaging content that resonates with the community. Use relevant hashtags.'
  },
  tiktok: {
    contentLink: 'https://tiktok.com/@username/video/video_id',
    instructions: 'Create trending content that fits the platform style. Use popular sounds and effects.'
  },
  facebook: {
    contentLink: 'https://facebook.com/groups/group_id/permalink/post_id',
    instructions: 'Share valuable content that adds to the group discussion. Be community-focused.'
  },
  whatsapp: {
    contentLink: 'https://wa.me/phone_number',
    instructions: 'Share the message with your contacts. Be authentic and personal in your approach.'
  },
  snapchat: {
    contentLink: 'https://snapchat.com/add/username',
    instructions: 'Create engaging snaps that capture attention. Use creative filters and effects.'
  },
  telegram: {
    contentLink: 'https://t.me/channel_name',
    instructions: 'Join the channel and participate actively. Share valuable insights and engage with others.'
  }
};

export default function CreateMissionPage() {
  const { createMission, loading, error } = useApi();

  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [selectedType, setSelectedType] = useState('engage');
  const [selectedModel, setSelectedModel] = useState('fixed');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [contentLink, setContentLink] = useState(PLATFORM_CONTENT_PLACEHOLDERS.twitter.contentLink);
  const [instructions, setInstructions] = useState(PLATFORM_CONTENT_PLACEHOLDERS.twitter.instructions);
  const [cap, setCap] = useState(100);
  const [capInput, setCapInput] = useState('100');
  const [rewardPerUser, setRewardPerUser] = useState(0);
  const [duration, setDuration] = useState(24);

  // Degen-specific state
  const [selectedDegenPreset, setSelectedDegenPreset] = useState(DEGEN_PRESETS[3]); // 8h default
  const [winnersCap, setWinnersCap] = useState(3);

  // Custom platform state
  const [customTitle, setCustomTitle] = useState('');
  const [customTimeMinutes, setCustomTimeMinutes] = useState(30);
  const [customProofMode, setCustomProofMode] = useState<'social-post' | 'api'>('social-post');
  const [customApiVerifier, setCustomApiVerifier] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  // Update content placeholders when platform changes
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setSelectedTasks([]);

    // Reset custom platform fields when switching away from custom
    if (platform !== 'custom') {
      setCustomTitle('');
      setCustomTimeMinutes(30);
      setCustomProofMode('social-post');
      setCustomApiVerifier('');
      setCustomDescription('');
    }

    const placeholders = PLATFORM_CONTENT_PLACEHOLDERS[platform as keyof typeof PLATFORM_CONTENT_PLACEHOLDERS];
    if (placeholders) {
      setContentLink(placeholders.contentLink);
      setInstructions(placeholders.instructions);
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (selectedPlatform === 'custom') {
      // Custom platform pricing: $8/hour rate
      const hourlyRate = 8; // USD per hour
      const timeInHours = customTimeMinutes / 60;
      const baseCost = hourlyRate * timeInHours;
      const platformFee = baseCost * PLATFORM_FEE_RATE;
      const totalWithFee = baseCost + platformFee;
      const finalUSD = isPremium ? totalWithFee * PREMIUM_COST_MULTIPLIER : totalWithFee;

      return {
        honors: finalUSD * HONORS_PER_USD,
        usd: finalUSD,
        perUserHonors: baseCost * HONORS_PER_USD,
        breakdown: {
          baseCost,
          timeInHours,
          platformFee,
          premium: isPremium
        }
      };
    } else if (selectedModel === 'fixed') {
      const taskHonors = selectedTasks.reduce((total, task) => {
        const price = getTaskPrice(selectedPlatform, selectedType, task);
        return total + price;
      }, 0);

      const totalHonors = taskHonors * cap;
      const platformFee = totalHonors * PLATFORM_FEE_RATE;
      const totalWithFee = totalHonors + platformFee;
      const finalUSD = isPremium ? totalWithFee * PREMIUM_COST_MULTIPLIER / HONORS_PER_USD : totalWithFee / HONORS_PER_USD;

      return {
        honors: totalWithFee,
        usd: finalUSD,
        perUserHonors: taskHonors,
        breakdown: {
          taskHonors,
          cap,
          platformFee,
          premium: isPremium
        }
      };
    } else {
      // Degen model calculations
      const taskHonors = selectedTasks.reduce((total, task) => {
        const price = getTaskPrice(selectedPlatform, selectedType, task);
        return total + price;
      }, 0);

      const baseCost = selectedDegenPreset.costUSD * (taskHonors > 0 ? taskHonors / 100 : 1);
      const platformFee = baseCost * PLATFORM_FEE_RATE;
      const totalWithFee = baseCost + platformFee;
      const totalUSD = isPremium ? totalWithFee * PREMIUM_COST_MULTIPLIER : totalWithFee;
      const userPoolHonors = Math.floor(totalUSD * HONORS_PER_USD * USER_POOL_FACTOR);
      const perWinnerHonors = Math.floor(userPoolHonors / winnersCap);

      return {
        honors: totalUSD * HONORS_PER_USD,
        usd: totalUSD,
        userPoolHonors,
        perWinnerHonors,
        breakdown: {
          taskHonors,
          baseCost,
          platformFee,
          premium: isPremium
        }
      };
    }
  };

  const totalPrice = calculateTotalPrice();
  const availableTasks = selectedPlatform === 'custom'
    ? ['custom_task']
    : Object.keys(TASK_PRICES[selectedPlatform as keyof typeof TASK_PRICES]?.[selectedType as keyof typeof TASK_PRICES.twitter] || {});

  return (
    <ModernLayout currentPage="/missions/create">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Create New Mission</h1>
          <p className="text-sm sm:text-base text-gray-400">Design and launch your social media mission</p>
        </div>



        {/* Platform Selection */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-800/50">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
            <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">🌐</span>
            Choose Platform
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { id: 'twitter', icon: '𝕏', name: 'Twitter/X', color: 'from-blue-500 to-blue-600' },
              { id: 'instagram', icon: '📸', name: 'Instagram', color: 'from-pink-500 to-purple-600' },
              { id: 'tiktok', icon: '🎵', name: 'TikTok', color: 'from-black to-gray-800' },
              { id: 'facebook', icon: '📘', name: 'Facebook', color: 'from-blue-600 to-blue-700' },
              { id: 'whatsapp', icon: '💬', name: 'WhatsApp', color: 'from-green-500 to-green-600' },
              { id: 'snapchat', icon: '👻', name: 'Snapchat', color: 'from-yellow-400 to-orange-500' },
              { id: 'telegram', icon: '📱', name: 'Telegram', color: 'from-blue-400 to-blue-500' },
              { id: 'custom', icon: '⚡', name: 'Custom', color: 'from-purple-500 to-indigo-600' }
            ].map((platform) => (
              <button
                key={platform.id}
                onClick={() => handlePlatformChange(platform.id)}
                className={`p-3 sm:p-4 lg:p-6 rounded-xl flex flex-col items-center transition-all duration-300 transform hover:scale-105 ${selectedPlatform === platform.id
                  ? `bg-gradient-to-br ${platform.color} text-white shadow-xl`
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                  }`}
              >
                <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">{platform.icon}</span>
                <span className="text-xs sm:text-sm font-medium text-center">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mission Type */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-800/50">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
            <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">🎯</span>
            Mission Type
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { id: 'engage', icon: '🎯', name: 'Engage', description: 'Interact with content', color: 'from-blue-500 to-purple-600' },
              { id: 'content', icon: '✍️', name: 'Content Creation', description: 'Create original content', color: 'from-green-500 to-emerald-600' },
              { id: 'ambassador', icon: '👑', name: 'Ambassador', description: 'Represent the brand', color: 'from-yellow-500 to-orange-600' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setSelectedTasks([]);
                }}
                className={`p-4 sm:p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${selectedType === type.id
                  ? `bg-gradient-to-br ${type.color} text-white shadow-xl`
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                  }`}
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{type.icon}</div>
                <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2">{type.name}</div>
                <div className="text-xs sm:text-sm opacity-90">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mission Model */}
        {selectedPlatform !== 'custom' && (
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-800/50">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">⚙️</span>
              Mission Model
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  id: 'fixed',
                  icon: '📊',
                  name: 'Fixed Mission',
                  description: 'Fixed participants, task-based pricing',
                  features: ['Predictable costs', 'Fixed timeline', 'Task-based rewards'],
                  color: 'from-purple-500 to-indigo-600'
                },
                {
                  id: 'degen',
                  icon: '⚡',
                  name: 'Degen Mission',
                  description: 'Time-boxed, unlimited applicants',
                  features: ['Unlimited applicants', 'Time-based rewards', 'Competitive pool'],
                  color: 'from-orange-500 to-red-600'
                }
              ].map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-4 sm:p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${selectedModel === model.id
                    ? `bg-gradient-to-br ${model.color} text-white shadow-xl`
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                    }`}
                >
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{model.icon}</div>
                  <div className="font-bold text-lg sm:text-xl mb-1 sm:mb-2">{model.name}</div>
                  <div className="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4">{model.description}</div>
                  <ul className="space-y-1">
                    {model.features.map((feature, index) => (
                      <li key={index} className="text-xs sm:text-sm flex items-center">
                        <span className="mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Degen-specific controls */}
        {selectedPlatform !== 'custom' && selectedModel === 'degen' && (
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-800/50">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">⚡</span>
              Degen Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 sm:mb-3">Duration & Cost</label>
                <select
                  value={selectedDegenPreset.hours}
                  onChange={(e) => {
                    const preset = DEGEN_PRESETS.find(p => p.hours === parseInt(e.target.value));
                    if (preset) {
                      setSelectedDegenPreset(preset);
                      setWinnersCap(Math.min(winnersCap, preset.maxWinners));
                    }
                  }}
                  className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  {DEGEN_PRESETS.map((preset) => (
                    <option key={preset.hours} value={preset.hours}>
                      {preset.label} - Max {preset.maxWinners} winners
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 sm:mb-3">Winners Cap</label>
                <select
                  value={winnersCap}
                  onChange={(e) => setWinnersCap(parseInt(e.target.value))}
                  className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  {Array.from({ length: selectedDegenPreset.maxWinners }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} winner{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Fixed-specific controls */}
        {selectedPlatform !== 'custom' && selectedModel === 'fixed' && (
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-800/50">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">📊</span>
              Fixed Mission Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 sm:mb-3">Participant Cap</label>
                <input
                  type="number"
                  value={capInput}
                  onChange={(e) => {
                    setCapInput(e.target.value);
                    const value = parseInt(e.target.value) || 0;
                    setCap(value);
                  }}
                  onBlur={() => {
                    if (cap < 60 && cap > 0) {
                      setCap(60);
                      setCapInput('60');
                    }
                  }}
                  min="1"
                  className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="Enter participant cap"
                />
                <p className="text-xs text-gray-400 mt-2">Minimum: 60 participants (auto-corrected to 60 if below)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 sm:mb-3">Reward per User (Honors)</label>
                <div className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white">
                  <div className="text-base sm:text-lg font-bold text-green-400">
                    {totalPrice.perUserHonors || 0} Honors
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    ≈ ${((totalPrice.perUserHonors || 0) / HONORS_PER_USD).toFixed(2)} USD
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Auto-calculated based on selected tasks</p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Platform Participant Info */}
        {selectedPlatform === 'custom' && (
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-purple-500/30">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">👥</span>
              Custom Platform Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 sm:mb-3">Participant Cap</label>
                <div className="p-3 sm:p-4 bg-black/30 rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">
                    100 Participants
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    Fixed cap for custom missions
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 sm:mb-3">Duration</label>
                <div className="p-3 sm:p-4 bg-black/30 rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">
                    {Math.ceil(customTimeMinutes / 60)} Hours
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    Based on completion time
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Platform Form */}
        {selectedPlatform === 'custom' && (
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-purple-500/30">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">⚡</span>
              Custom Platform Configuration
            </h3>
            <CustomMissionForm
              onSubmit={(data) => {
                setCustomTitle(data.customTitle);
                setCustomTimeMinutes(data.avgTimeMinutes);
                setCustomProofMode(data.proofMode);
                setCustomApiVerifier(data.apiVerifierKey || '');
                setCustomDescription(data.customDescription || '');
              }}
            />
          </div>
        )}

        {/* Task Selection */}
        {selectedPlatform !== 'custom' && (
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-800/50">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">📋</span>
              Select Tasks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {availableTasks.map((task) => {
                const price = getTaskPrice(selectedPlatform, selectedType, task);
                const isSelected = selectedTasks.includes(task);

                return (
                  <button
                    key={task}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTasks(selectedTasks.filter(t => t !== task));
                      } else {
                        setSelectedTasks([...selectedTasks, task]);
                      }
                    }}
                    className={`p-3 sm:p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${isSelected
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium capitalize text-sm sm:text-base">{task.replace(/_/g, ' ')}</div>
                        <div className="text-xs sm:text-sm opacity-75">{price} honors</div>
                      </div>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-white' : 'border-gray-500'
                        }`}>
                        {isSelected && <span className="text-white text-xs sm:text-sm">✓</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Premium Toggle */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-800/50">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
            <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">👑</span>
            Target Audience
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <button
              onClick={() => setIsPremium(false)}
              className={`p-4 sm:p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${!isPremium
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                }`}
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🌍</div>
              <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2">All Users</div>
              <div className="text-xs sm:text-sm opacity-90">Standard pricing</div>
            </button>
            <button
              onClick={() => setIsPremium(true)}
              className={`p-4 sm:p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${isPremium
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-xl'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                }`}
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">👑</div>
              <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Premium Users</div>
              <div className="text-xs sm:text-sm opacity-90">5x multiplier</div>
            </button>
          </div>
        </div>

        {/* Mission Details */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-800/50">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
            <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">📝</span>
            Mission Details
          </h3>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 sm:mb-3">Content Link</label>
              <input
                type="url"
                value={contentLink}
                onChange={(e) => setContentLink(e.target.value)}
                className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder={selectedPlatform === 'custom' ? "Enter your custom content link (e.g., website, app, document)" : PLATFORM_CONTENT_PLACEHOLDERS[selectedPlatform as keyof typeof PLATFORM_CONTENT_PLACEHOLDERS]?.contentLink || "Enter content link"}
              />
              {selectedPlatform === 'custom' && (
                <p className="text-xs text-gray-400 mt-2">
                  Link to your custom content that users need to engage with (e.g., website, app, document, video, etc.)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 sm:mb-3">Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                placeholder={PLATFORM_CONTENT_PLACEHOLDERS[selectedPlatform as keyof typeof PLATFORM_CONTENT_PLACEHOLDERS]?.instructions || "Enter mission instructions"}
              />
            </div>
          </div>
        </div>

        {/* Price Preview */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-green-500/30">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
            <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">💰</span>
            Price Preview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-black/30 rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">
                ${totalPrice.usd.toFixed(2)}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Total Cost (USD)</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1 sm:mb-2">
                {totalPrice.honors.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Total Honors</div>
            </div>
          </div>

          {selectedPlatform === 'custom' && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-black/30 rounded-xl">
              <div className="text-center">
                <div className="text-base sm:text-lg font-semibold text-white mb-2">Custom Platform Pricing</div>
                <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                  <div>• Base Rate: $8/hour</div>
                  <div>• Time: {customTimeMinutes} minutes (${(customTimeMinutes / 60 * 8).toFixed(2)})</div>
                  <div>• Platform Fee: 100% (${(customTimeMinutes / 60 * 8).toFixed(2)})</div>
                  {isPremium && <div>• Premium Multiplier: 5x</div>}
                </div>
              </div>
            </div>
          )}

        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <p className="text-red-400 text-xs sm:text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        <ModernButton
          onClick={async () => {
            try {
              // Validate custom platform fields
              if (selectedPlatform === 'custom') {
                if (!customTitle.trim()) {
                  alert('Please enter a custom mission title');
                  return;
                }
                if (customTimeMinutes < 1 || customTimeMinutes > 1440) {
                  alert('Please enter a valid completion time between 1 and 1440 minutes');
                  return;
                }
                if (customProofMode === 'api' && !customApiVerifier.trim()) {
                  alert('Please select an API verifier for API verification mode');
                  return;
                }
              }

              const missionData = {
                platform: selectedPlatform,
                type: selectedType,
                model: selectedModel as 'fixed' | 'degen',
                tasks: selectedTasks,
                cap: selectedPlatform === 'custom' ? 100 : (selectedModel === 'fixed' ? cap : undefined),
                durationHours: selectedPlatform === 'custom' ? Math.ceil(customTimeMinutes / 60) : (selectedModel === 'fixed' ? duration : undefined),
                winnersCap: selectedModel === 'degen' ? winnersCap : undefined,
                isPremium,
                tweetLink: contentLink,
                instructions,
                // Custom platform data
                ...(selectedPlatform === 'custom' && {
                  customSpec: {
                    customTitle,
                    customDescription,
                    avgTimeMinutes: customTimeMinutes,
                    proofMode: customProofMode,
                    apiVerifierKey: customProofMode === 'api' ? customApiVerifier : undefined,
                  }
                })
              };

              await createMission(missionData);
              window.location.href = '/missions';
            } catch (err) {
              console.error('Failed to create mission:', err);
            }
          }}
          disabled={loading || (selectedPlatform !== 'custom' && selectedTasks.length === 0)}
          loading={loading}
          variant="success"
          size="lg"
          className="w-full"
        >
          🚀 Create Mission
        </ModernButton>
      </div>
    </ModernLayout>
  );
}
