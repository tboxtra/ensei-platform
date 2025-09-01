import React from 'react';

interface ModernInputProps {
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'number' | 'url' | 'email';
    label?: string;
    disabled?: boolean;
    className?: string;
    min?: number;
    max?: number;
}

export function ModernInput({
    value,
    onChange,
    placeholder,
    type = 'text',
    label,
    disabled = false,
    className = '',
    min,
    max
}: ModernInputProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium mb-3 text-gray-300">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
}
