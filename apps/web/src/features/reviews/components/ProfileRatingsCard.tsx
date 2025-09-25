'use client';

import React from 'react';

function StarRow({ value }: { value: number }) {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    return (
        <div className="flex items-center gap-1 text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} aria-hidden>
                    {i < full ? '★' : (i === full && half ? '☆' : '☆')}
                </span>
            ))}
        </div>
    );
}

export function ProfileRatingsCard({ user }: { user: any }) {
    const count = user?.submissionRatings?.count ?? 0;
    const sum = user?.submissionRatings?.sum ?? 0;
    const avg = count ? sum / count : 0;

    return (
        <div className="rounded-lg border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white/90">Ratings</div>
                <div className="text-xs text-white/60">{count ? `${count} submissions` : '—'}</div>
            </div>

            <div className="mt-2 flex items-center gap-3">
                <StarRow value={avg} />
                <div className="text-white/90 text-sm font-medium">{avg.toFixed(1)}</div>
            </div>
        </div>
    );
}
