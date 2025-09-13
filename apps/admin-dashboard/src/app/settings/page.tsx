'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { SystemConfig } from '../../components/settings/SystemConfig';
import { FeatureFlags } from '../../components/settings/FeatureFlags';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { apiClient } from '../../lib/api';

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
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'limits' | 'security' | 'features'>('general');

  // No mock data - using real API

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getSystemConfig();
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setSettings(null);
        setError(response.message || 'Failed to load settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (updatedSettings: Partial<SystemSettings>) => {
    try {
      const response = await apiClient.updateSystemConfig(updatedSettings);
      
      if (response.success) {
        setSettings(prev => prev ? { ...prev, ...updatedSettings } : null);
      } else {
        setError(response.message || 'Failed to save settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'limits', label: 'Limits', icon: '📊' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'features', label: 'Features', icon: '🚀' }
  ];

  if (loading) {
    return (
      <ProtectedRoute requiredPermission="settings:read">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredPermission="settings:read">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!settings) {
    return (
      <ProtectedRoute requiredPermission="settings:read">
        <div className="text-center py-12">
          <p className="text-gray-500">No settings data available</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="settings:read">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <div className="text-sm text-gray-500">
            Platform Version {settings.platform.version}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
          <SystemConfig
            settings={settings}
            onSave={handleSaveSettings}
          />
        )}
        
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Configuration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Honors per USD
                  </label>
                  <input
                    type="number"
                    value={settings.pricing.honorsPerUsd}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      pricing: { ...prev.pricing, honorsPerUsd: parseInt(e.target.value) }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Premium Multiplier
                  </label>
                  <input
                    type="number"
                    value={settings.pricing.premiumMultiplier}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      pricing: { ...prev.pricing, premiumMultiplier: parseInt(e.target.value) }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'limits' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Limits</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Missions per User
                  </label>
                  <input
                    type="number"
                    value={settings.limits.maxMissionsPerUser}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      limits: { ...prev.limits, maxMissionsPerUser: parseInt(e.target.value) }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Submissions per Mission
                  </label>
                  <input
                    type="number"
                    value={settings.limits.maxSubmissionsPerMission}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      limits: { ...prev.limits, maxSubmissionsPerMission: parseInt(e.target.value) }
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'security' && (
          <SecuritySettings
            settings={settings}
            onSave={handleSaveSettings}
          />
        )}
        
        {activeTab === 'features' && (
          <FeatureFlags
            settings={settings}
            onSave={handleSaveSettings}
          />
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={() => handleSaveSettings(settings)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
