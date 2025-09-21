'use client';

import React from 'react';

interface SpinnerProps {
    label?: string;
    className?: string;
}

export function Spinner({ label = 'Loading…', className = '' }: SpinnerProps) {
    return (
        <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-400">{label}</p>
            </div>
        </div>
    );
}

interface ErrorBoxProps {
    title: string;
    details?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function ErrorBox({
    title,
    details,
    actionLabel = 'Retry',
    onAction,
    className = ''
}: ErrorBoxProps) {
    return (
        <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
            <div className="text-center max-w-md">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                {details && (
                    <p className="text-gray-400 text-sm mb-4 font-mono break-all">{details}</p>
                )}
                {onAction && (
                    <button
                        onClick={onAction}
                        className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
