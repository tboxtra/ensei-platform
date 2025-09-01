import React from 'react';

interface ModernCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: string;
}

export function ModernCard({ children, className = '', title, icon }: ModernCardProps) {
    return (
        <div className={`bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-gray-800/50 ${className}`}>
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
