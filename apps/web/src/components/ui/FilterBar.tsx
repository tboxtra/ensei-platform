import React from 'react';

interface FilterBarProps {
    filters: {
        type: string;
        model: string;
        platform: string;
        status: string;
        sortBy: string;
    };
    onFilterChange: (filter: string, value: string) => void;
    showPlatform?: boolean;
    showStatus?: boolean;
    showType?: boolean;
    showModel?: boolean;
    showSort?: boolean;
    className?: string;
}

export function FilterBar({
    filters,
    onFilterChange,
    showPlatform = true,
    showStatus = false,
    showType = true,
    showModel = true,
    showSort = true,
    className = ''
}: FilterBarProps) {
    const types = [
        { value: 'all', label: 'All Types' },
        { value: 'engage', label: 'Engagement' },
        { value: 'content', label: 'Content Creation' },
        { value: 'ambassador', label: 'Ambassador' }
    ];

    const models = [
        { value: 'all', label: 'All Models' },
        { value: 'fixed', label: 'Fixed Reward' },
        { value: 'degen', label: 'Degen Model' },
        { value: 'premium', label: 'Premium' },
        { value: 'custom', label: 'Custom' }
    ];

    const platforms = [
        { value: 'all', label: 'All Platforms' },
        { value: 'twitter', label: 'Twitter' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'discord', label: 'Discord' },
        { value: 'custom', label: 'Custom' }
    ];

    const statuses = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'paused', label: 'Paused' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const sortOptions = [
        { value: 'reward', label: 'Highest Reward' },
        { value: 'deadline', label: 'Deadline' },
        { value: 'participants', label: 'Most Popular' },
        { value: 'created', label: 'Newest' }
    ];

    const SelectField = ({
        value,
        onChange,
        options,
        placeholder
    }: {
        value: string;
        onChange: (value: string) => void;
        options: Array<{ value: string; label: string }>;
        placeholder: string;
    }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-black/40 backdrop-blur-lg border border-gray-800/50 rounded-lg px-2 py-1 text-white text-xs focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-900">
                    {option.label}
                </option>
            ))}
        </select>
    );

    return (
        <div className={`bg-gray-800/20 backdrop-blur-lg rounded-lg p-2 border border-gray-700/20 ${className}`}>
            <div className="flex flex-wrap gap-2 items-center">
                {showType && (
                    <SelectField
                        value={filters.type}
                        onChange={(value) => onFilterChange('type', value)}
                        options={types}
                        placeholder="Select Type"
                    />
                )}

                {showModel && (
                    <SelectField
                        value={filters.model}
                        onChange={(value) => onFilterChange('model', value)}
                        options={models}
                        placeholder="Select Model"
                    />
                )}

                {showPlatform && (
                    <SelectField
                        value={filters.platform}
                        onChange={(value) => onFilterChange('platform', value)}
                        options={platforms}
                        placeholder="Select Platform"
                    />
                )}

                {showStatus && (
                    <SelectField
                        value={filters.status}
                        onChange={(value) => onFilterChange('status', value)}
                        options={statuses}
                        placeholder="Select Status"
                    />
                )}

                {showSort && (
                    <SelectField
                        value={filters.sortBy}
                        onChange={(value) => onFilterChange('sortBy', value)}
                        options={sortOptions}
                        placeholder="Sort By"
                    />
                )}

                <button
                    onClick={() => {
                        onFilterChange('type', 'all');
                        onFilterChange('model', 'all');
                        onFilterChange('platform', 'all');
                        onFilterChange('status', 'all');
                        onFilterChange('sortBy', 'reward');
                    }}
                    className="px-2 py-1 text-gray-400 hover:text-white transition-colors duration-300 text-lg"
                    title="Clear Filters"
                >
                    🔄
                </button>
            </div>
        </div>
    );
}
