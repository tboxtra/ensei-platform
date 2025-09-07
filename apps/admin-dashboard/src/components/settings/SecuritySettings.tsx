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
}

interface SecuritySettingsProps {
  settings: SystemSettings;
  onSave: (settings: Partial<SystemSettings>) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ settings, onSave }) => {
  const [securitySettings, setSecuritySettings] = React.useState({
    twoFactorAuth: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPasswords: true,
    ipWhitelist: false,
    allowedIPs: [] as string[],
    auditLogging: true,
    dataEncryption: true,
    apiRateLimit: 1000,
    webhookSigning: true
  });

  const handleChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddIP = () => {
    const ip = prompt('Enter IP address:');
    if (ip && ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
      setSecuritySettings(prev => ({
        ...prev,
        allowedIPs: [...prev.allowedIPs, ip]
      }));
    }
  };

  const handleRemoveIP = (index: number) => {
    setSecuritySettings(prev => ({
      ...prev,
      allowedIPs: prev.allowedIPs.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Authentication Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
              <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.twoFactorAuth}
              onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Password Policy */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireStrongPasswords"
                checked={securitySettings.requireStrongPasswords}
                onChange={(e) => handleChange('requireStrongPasswords', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="requireStrongPasswords" className="ml-2 block text-sm text-gray-900">
                Require Strong Passwords
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IP Whitelist</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Enable IP Whitelist</label>
              <p className="text-sm text-gray-500">Restrict admin access to specific IP addresses</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.ipWhitelist}
              onChange={(e) => handleChange('ipWhitelist', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          
          {securitySettings.ipWhitelist && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Allowed IP Addresses</label>
                <button
                  onClick={handleAddIP}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Add IP
                </button>
              </div>
              <div className="space-y-2">
                {securitySettings.allowedIPs.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-900">{ip}</span>
                    <button
                      onClick={() => handleRemoveIP(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {securitySettings.allowedIPs.length === 0 && (
                  <p className="text-sm text-gray-500">No IP addresses configured</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Features</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Audit Logging</label>
              <p className="text-sm text-gray-500">Log all admin actions for security monitoring</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.auditLogging}
              onChange={(e) => handleChange('auditLogging', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Data Encryption</label>
              <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.dataEncryption}
              onChange={(e) => handleChange('dataEncryption', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Webhook Signing</label>
              <p className="text-sm text-gray-500">Sign webhooks to verify authenticity</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.webhookSigning}
              onChange={(e) => handleChange('webhookSigning', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Rate Limit (requests per hour)
            </label>
            <input
              type="number"
              value={securitySettings.apiRateLimit}
              onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">A+</div>
            <div className="text-sm text-gray-600">Security Score</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Active Threats</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">24h</div>
            <div className="text-sm text-gray-600">Last Security Scan</div>
          </div>
        </div>
      </div>
    </div>
  );
};
