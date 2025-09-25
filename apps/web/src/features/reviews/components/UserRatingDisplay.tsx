'use client';

import React from 'react';
import { useUserRatings } from '../hooks/useUserRatings';

interface UserRatingDisplayProps {
    userId: string;
    className?: string;
    showCount?: boolean;
}

export const UserRatingDisplay: React.FC<UserRatingDisplayProps> = ({
    userId,
    className = "",
    showCount = true
}) => {
    const { data: ratings, isLoading } = useUserRatings(userId);

    if (isLoading) {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                <div className="animate-pulse bg-gray-600 h-4 w-16 rounded"></div>
            </div>
        );
    }

    if (!ratings || ratings.count === 0) {
        return (
            <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
                <span className="text-sm">No submissions rated</span>
            </div>
        );
    }

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
                {hasHalfStar && <span className="text-yellow-400 text-sm">☆</span>}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={i} className="text-gray-400 text-sm">★</span>
                ))}
            </div>
        );
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {renderStars(ratings.avg || 0)}
            <span className="text-sm text-gray-300">
                {ratings.avg?.toFixed(1)}/5.0
            </span>
            {showCount && (
                <span className="text-xs text-gray-400">
                    ({ratings.count} submission{ratings.count !== 1 ? 's' : ''})
                </span>
            )}
        </div>
    );
};
