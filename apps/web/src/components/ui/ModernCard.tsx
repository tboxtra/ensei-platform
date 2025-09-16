import React from 'react';

interface ModernCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: string;
}

export function ModernCard({ children, className = '', title, icon }: ModernCardProps) {
    return (
        <div className={`bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.4),inset_2px_2px_6px_rgba(255,255,255,0.05)] ${className}`}>
            {title && (
                <h3 className="text-xl font-bold mb-6 flex items-center">
                    {icon && <span className="mr-3 text-2xl">{icon}</span>}
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
}
