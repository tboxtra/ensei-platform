'use client';

import { useState, useMemo, useCallback } from 'react';
import { ModernButton } from './ModernButton';
import { useApi } from '@/hooks/useApi';
import clsx from 'clsx';

export function MissionListItem({
  mission,
  dense = false,
  onViewDetails,
  onRefetch,
}: {
  mission: any;            // typed loosely to accept computed fields
  dense?: boolean;
  onViewDetails?: (id: string) => void;
  onRefetch?: () => void;
}) {
  const api = useApi();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const displayStatus: string = mission.__displayStatus ?? mission.status ?? 'draft';
  const clicks: number = mission.__verifiedClicks ?? 0;

  const fmt = useMemo(
    () => new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    []
  );

  const created = mission.created_at ? new Date(mission.created_at) : null;
  const cost = mission.total_cost_honors ?? 0;

  const onVerify = useCallback(
    async (submissionId: string) => {
      try {
        setBusyId(submissionId);
        await api.verifySubmission(submissionId);
      } finally {
        setBusyId(null);
        onRefetch?.();
      }
    },
    [api, onRefetch]
  );

  const onFlag = useCallback(
    async (submissionId: string) => {
      try {
        setBusyId(submissionId);
        await api.flagSubmission(submissionId);
      } finally {
        setBusyId(null);
        onRefetch?.();
      }
    },
    [api, onRefetch]
  );

  return (
    <div className={clsx(
      'rounded-md bg-gray-800/40 hover:bg-gray-800/60 border border-white/5',
      dense ? 'px-3 py-2' : 'px-4 py-3'
    )}>
      {/* Row (compact height) */}
      <div className="grid grid-cols-12 items-center gap-2 text-[12px]">
        {/* Mission */}
        <div className="col-span-4 overflow-hidden">
          <div className="truncate text-white font-medium">{mission.title || 'Untitled Mission'}</div>
          <div className="truncate text-[11px] text-gray-400">
            {[mission.platform, mission.type].filter(Boolean).join(' • ') || '—'}
          </div>
        </div>

        {/* Date */}
        <div className="col-span-2 text-gray-200">
          {created && !isNaN(created.getTime()) ? fmt.format(created) : '—'}
        </div>

        {/* Cost */}
        <div className="col-span-2 text-white">{cost}</div>

        {/* Clicks (verified tasks sum) */}
        <div className="col-span-2 text-white">{clicks}</div>

        {/* Status + toggle submissions */}
        <div className="col-span-2 flex items-center justify-end gap-2">
          <span
            className={clsx(
              'px-2 py-0.5 rounded-full border text-[11px]',
              displayStatus === 'active' && 'bg-green-500/15 text-green-300 border-green-500/30',
              displayStatus === 'completed' && 'bg-blue-500/15 text-blue-300 border-blue-500/30',
              displayStatus === 'draft' && 'bg-gray-500/15 text-gray-300 border-gray-500/30',
              displayStatus === 'paused' && 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
            )}
          >
            {displayStatus}
          </span>

          <ModernButton
            size="sm"
            variant="secondary"
            onClick={() => setOpen((v) => !v)}
            className="ml-1"
          >
            {open ? 'Hide' : 'Submissions'}
          </ModernButton>
        </div>
      </div>

      {/* Submissions dropdown */}
      {open && (
        <div className="mt-2 rounded-md border border-white/5 bg-gray-900/60">
          {/* header */}
          <div className="px-3 py-2 border-b border-white/5 text-[11px] text-gray-400 flex items-center">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 mr-2" />
            Submissions
          </div>

          <div className="max-h-64 overflow-auto divide-y divide-white/5">
            {(mission.submissions ?? []).length === 0 && (
              <div className="px-3 py-3 text-[12px] text-gray-400">No submissions yet.</div>
            )}

            {(mission.submissions ?? []).map((s: any) => {
              const created = s?.created_at ? new Date(s.created_at) : null;
              const status = s?.status ?? 'pending';
              const isVerified = status === 'verified';
              return (
                <div key={s.id} className="px-3 py-2 text-[12px] flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-white">
                      {s?.user_handle ? `@${s.user_handle}` : s?.user_id ?? 'unknown'}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {created && !isNaN(created.getTime()) ? `Submitted ${created.toLocaleString()}` : '—'}
                      {s?.tasks_count ? ` • tasks: ${s.tasks_count}` : ''}
                      {s?.verified_tasks ? ` • verified: ${s.verified_tasks}` : ''}
                    </div>
                  </div>

                  <span
                    className={clsx(
                      'px-1.5 py-0.5 rounded-full border text-[10px] mr-1',
                      isVerified
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-gray-600/15 text-gray-300 border-gray-500/30'
                    )}
                  >
                    {status}
                  </span>

                  <ModernButton
                    size="sm"
                    variant="danger"
                    onClick={() => onFlag(s.id)}
                    disabled={busyId === s.id}
                    className="border border-white/10 hover:border-red-400/40 hover:bg-red-500/10"
                  >
                    Flag
                  </ModernButton>

                  <ModernButton
                    size="sm"
                    variant="success"
                    onClick={() => onVerify(s.id)}
                    disabled={busyId === s.id || isVerified}
                    className={clsx('min-w-[72px]', isVerified && 'opacity-60 cursor-not-allowed')}
                  >
                    {isVerified ? 'Verified' : busyId === s.id ? 'Verifying…' : 'Verify'}
                  </ModernButton>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}