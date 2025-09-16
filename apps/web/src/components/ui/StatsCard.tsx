import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon,
    trend,
    description,
    className = ''
}: StatsCardProps) {
    return (
        <div className={`bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 transition-all duration-300 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.4),inset_2px_2px_6px_rgba(255,255,255,0.05)] hover:shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.08)] ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                    {description && (
                        <p className="text-gray-500 text-xs mt-1">{description}</p>
                    )}
                </div>
                {icon && (
                    <div className="text-2xl opacity-60">{icon}</div>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-white">{value}</div>
                {trend && (
                    <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                        <span className="mr-1">
                            {trend.isPositive ? '↗' : '↘'}
                        </span>
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
        </div>
    );
}
