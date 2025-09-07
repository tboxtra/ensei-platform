'use client';

import React from 'react';

interface MissionFilters {
  status: string;
  platform: string;
  type: string;
  model: string;
  search: string;
}

interface MissionFiltersProps {
  filters: MissionFilters;
  onFilterChange: (filters: Partial<MissionFilters>) => void;
}

export const MissionFilters: React.FC<MissionFiltersProps> = ({ filters, onFilterChange }) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const platformOptions = [
    { value: '', label: 'All Platforms' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'snapchat', label: 'Snapchat' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'custom', label: 'Custom' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'engage', label: 'Engage' },
    { value: 'content', label: 'Content' },
    { value: 'ambassador', label: 'Ambassador' }
  ];

  const modelOptions = [
    { value: '', label: 'All Models' },
    { value: 'fixed', label: 'Fixed' },
    { value: 'degen', label: 'Degen' }
  ];

  const handleChange = (field: keyof MissionFilters, value: string) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      status: '',
      platform: '',
      type: '',
      model: '',
      search: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search missions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform
          </label>
          <select
            value={filters.platform}
            onChange={(e) => handleChange('platform', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {platformOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            value={filters.model}
            onChange={(e) => handleChange('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
