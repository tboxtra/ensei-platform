import React from 'react';

export function ProgressBadge({ done, total }: { done: number; total: number }) {
  if (!total || total <= 0) return null;
  return (
    <span
      className="
        ml-2 inline-flex items-center rounded-full
        bg-emerald-600/15 text-emerald-400
        px-2 py-0.5 text-xs font-semibold
      "
      aria-label={`Progress ${done} of ${total}`}
      title={`${done}/${total}`}
    >
      {done}/{total}
    </span>
  );
}
