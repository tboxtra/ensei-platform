'use client';

import React from 'react';

interface SystemSettings {
  platform: {
    name: string;
    version: string;
    environment: string;
    maintenanceMode: boolean;
  };
  pricing: {
    honorsPerUsd: number;
    premiumMultiplier: number;
    platformFeeRate: number;
    userPoolFactor: number;
  };
  limits: {
    maxMissionsPerUser: number;
    maxSubmissionsPerMission: number;
    maxReviewersPerSubmission: number;
    reviewTimeoutHours: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
  featureFlags?: {
    [key: string]: boolean;
  };
}

interface FeatureFlagsProps {
  settings: SystemSettings;
  onSave: (settings: Partial<SystemSettings>) => void;
}

export const FeatureFlags: React.FC<FeatureFlagsProps> = ({ settings, onSave }) => {
  const [featureFlags, setFeatureFlags] = React.useState({});

  // Load feature flags from API
  React.useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        // TODO: Load from real API when available
        // const response = await apiClient.getFeatureFlags();
        // if (response.success) {
        //   setFeatureFlags(response.data);
        // }

        // For now, start with empty state
        setFeatureFlags({});
      } catch (error) {
        console.error('Failed to load feature flags:', error);
      }
    };

    loadFeatureFlags();
  }, []);

  const handleChange = (flag: string, value: boolean) => {
    setFeatureFlags(prev => ({
      ...prev,
      [flag]: value
    }));
  };

  const getFlagDescription = (flag: string) => {
    const descriptions: Record<string, string> = {
      customPlatform: 'Allow creators to create custom platform missions',
      decentralizedReviews: 'Enable peer review system with 5 reviewers per submission',
      premiumTargeting: 'Allow targeting premium users with 5x multiplier',
      degenMissions: 'Enable time-boxed missions with unlimited applicants',
      socialProofRequired: 'Require social media post as proof for submissions',
      apiVerification: 'Enable API-based proof verification',
      telegramBot: 'Enable Telegram bot integration',
      mobileApp: 'Enable mobile app features',
      aiContentModeration: 'Use AI for automatic content moderation',
      fraudDetection: 'Enable fraud detection algorithms',
      analyticsDashboard: 'Show analytics dashboard to users',
      webhookSupport: 'Enable webhook notifications for events',
      nftRewards: 'Allow NFT rewards for mission completion',
      stakingRewards: 'Enable staking rewards for platform tokens',
      governanceVoting: 'Allow users to vote on platform decisions',
      crossChainSupport: 'Support multiple blockchain networks',
      darkMode: 'Enable dark mode theme option',
      realTimeUpdates: 'Enable real-time updates via WebSocket',
      advancedFilters: 'Show advanced filtering options',
      bulkOperations: 'Enable bulk operations for admins'
    };
    return descriptions[flag] || '';
  };

  const getFlagCategory = (flag: string) => {
    if (['customPlatform', 'decentralizedReviews', 'premiumTargeting', 'degenMissions'].includes(flag)) {
      return 'Core Features';
    }
    if (['socialProofRequired', 'apiVerification', 'telegramBot', 'mobileApp'].includes(flag)) {
      return 'Social Features';
    }
    if (['aiContentModeration', 'fraudDetection', 'analyticsDashboard', 'webhookSupport'].includes(flag)) {
      return 'Advanced Features';
    }
    if (['nftRewards', 'stakingRewards', 'governanceVoting', 'crossChainSupport'].includes(flag)) {
      return 'Experimental Features';
    }
    if (['darkMode', 'realTimeUpdates', 'advancedFilters', 'bulkOperations'].includes(flag)) {
      return 'UI Features';
    }
    return 'Other';
  };

  const categories = [
    'Core Features',
    'Social Features',
    'Advanced Features',
    'Experimental Features',
    'UI Features'
  ];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Core Features': '🎯',
      'Social Features': '🌐',
      'Advanced Features': '🚀',
      'Experimental Features': '🧪',
      'UI Features': '🎨'
    };
    return icons[category] || '⚙️';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Core Features': 'bg-blue-50 border-blue-200',
      'Social Features': 'bg-green-50 border-green-200',
      'Advanced Features': 'bg-purple-50 border-purple-200',
      'Experimental Features': 'bg-yellow-50 border-yellow-200',
      'UI Features': 'bg-pink-50 border-pink-200'
    };
    return colors[category] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryFlags = Object.entries(featureFlags).filter(([flag]) =>
          getFlagCategory(flag) === category
        );

        if (categoryFlags.length === 0) return null;

        return (
          <div key={category} className={`rounded-lg border p-6 ${getCategoryColor(category)}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">{getCategoryIcon(category)}</span>
              {category}
            </h3>

            <div className="space-y-4">
              {categoryFlags.map(([flag, enabled]) => (
                <div key={flag} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900 capitalize">
                        {flag.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {getFlagDescription(flag)}
                    </p>
                  </div>

                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleChange(flag, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Feature Flag Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(featureFlags).filter(Boolean).length}
            </div>
            <div className="text-sm text-gray-600">Enabled Features</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {Object.values(featureFlags).filter(flag => !flag).length}
            </div>
            <div className="text-sm text-gray-600">Disabled Features</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(featureFlags).length}
            </div>
            <div className="text-sm text-gray-600">Total Features</div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onSave({ featureFlags })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Save Feature Flags
        </button>
      </div>
    </div>
  );
};
