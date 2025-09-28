'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ModernButton } from './ModernButton';
import { useApi } from '@/hooks/useApi';
import clsx from 'clsx';

// --- helpers ---
const fmtDate = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const fmtUSD = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const HONOR_TO_USD = 0.0015;

function getUsd(m: any): number {
    return Number(
        m?.rewards?.usd ??
        m?.total_cost_usd ??
        m?.totalCost ??
        m?.reward ??
        (m?.total_cost_honors != null ? m.total_cost_honors * HONOR_TO_USD : 0)
    ) || 0;
}

function sumVerifiedClicks(subs: any[]): number {
    return subs.reduce((sum, s) => {
        const st = (s?.status ?? '').toLowerCase();
        if (st !== 'verified' && st !== 'approved') return sum;
        const vt = s?.verified_tasks ?? s?.verifiedTasks ?? s?.tasks_count ?? 1;
        return sum + (Number(vt) || 0);
    }, 0);
}

export function MissionListItem({
    mission,
    dense = false,
    onRefetch,
}: {
    mission: any;
    dense?: boolean;
    onRefetch?: () => void;
}) {
    const api = useApi();
    const [open, setOpen] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);

    // Helper functions for normalization
    const toTaskLabel = (s: any) => {
        const id =
            String((s?.task_id ??
                s?._raw?.taskId ??
                s?._raw?.actionId ??
                s?._raw?.type ??
                s?._raw?.action ??
                s?._raw?.activity ??
                s?._raw?.eventType ??
                s?._raw?.task?.type ??
                s?._raw?.task?.action ??
                s?._raw?.metadata?.taskId ??
                s?._raw?.metadata?.actionId ??
                s?._raw?.metadata?.task ??
                s?._raw?.metadata?.action ??
                s?._raw?.metadata?.taskName) ||
                ''
            ).toLowerCase().replace(/^auto_/, '');
        const LABELS: Record<string, string> = {
            like: 'like', like_tweet: 'like', favorite: 'like',
            retweet: 'retweet', repost: 'retweet', rt: 'retweet',
            comment: 'comment', reply: 'comment',
            quote: 'quote', quote_tweet: 'quote',
            follow: 'follow', follow_user: 'follow'
        };
        return LABELS[id] || id || 'task';
    };

    const normalizeSub = (s: any) => {
        const toUiStatus = (raw?: string) => {
            const v = String(raw || 'verified').toLowerCase();
            if (['flagged', 'rejected'].includes(v)) return 'flagged';
            if (['verified', 'approved', 'success', 'completed', 'done', 'ok'].includes(v)) return 'verified';
            return 'verified';
        };
        const status = toUiStatus(s?.status);

        const user_handle =
            s?.user_handle ??
            s?._raw?.metadata?.twitterHandle ??
            s?._raw?.twitterHandle ??
            s?._raw?.twitter?.username ??
            s?._raw?.twitterUsername ??
            s?._raw?.metadata?.twitter?.username ??
            s?._raw?.metadata?.twitter_username ??
            s?._raw?.screen_name ??
            s?._raw?.user?.twitterHandle ??
            s?._raw?.user?.twitter?.handle ??
            s?._raw?.profile?.twitterHandle ??
            s?._raw?.profile?.twitter?.handle ??
            null;

        const firstFrom = (name?: string) => (name || '').trim().split(/\s+/)[0] || null;

        const user_name =
            s?.user_name ??
            s?._raw?.firstName ??
            s?._raw?.first_name ??
            s?._raw?.userFirstName ??
            s?._raw?.user_first_name ??
            firstFrom(s?._raw?.userName) ??
            firstFrom(s?._raw?.user_name) ??
            firstFrom(s?._raw?.displayName) ??
            firstFrom(s?._raw?.display_name) ??
            firstFrom(s?._raw?.name) ??
            firstFrom(s?._raw?.profile?.name) ??
            s?._raw?.profile?.firstName ??
            s?._raw?.user?.firstName ??
            null;

        const task_label = s?.task_label ?? toTaskLabel(s);

        return { ...s, status, user_handle, user_name, task_label };
    };

    // 1) Start from payload submissions (ONLY if there are items) - normalize them
    const payloadSubs: any[] | null =
        Array.isArray(mission?.__submissions ?? mission?.submissions) &&
            (mission.__submissions ?? mission.submissions).length > 0
            ? (mission.__submissions ?? mission.submissions).map(normalizeSub) // <-- normalize payload data
            : null;
    
    console.log('🔍 Payload submissions check:', {
        hasSubmissions: Array.isArray(mission?.submissions),
        submissionsLength: mission?.submissions?.length,
        hasSubmissionsList: Array.isArray(mission?.submissions_list),
        submissionsListLength: mission?.submissions_list?.length,
        payloadSubs: payloadSubs?.length
    });

    // 2) Seed local state with normalized payload items (so UI is instant)
    const [subs, setSubs] = useState<any[] | null>(payloadSubs);

    // 3) Auto-fetch submissions on mount to show clicks immediately
    useEffect(() => {
        if (subs !== null) return; // we already have data
        (async () => {
            try {
                setSubsLoading(true);
                setSubsError(null);
                const data = await api.getMissionSubmissions(mission.id);
                console.log('🔍 Raw submissions data from API:', data);
                console.log('🔍 Sample submission structure:', data?.[0]);
                setSubs(Array.isArray(data) && data.length > 0 ? data : []); // Data is already normalized by useApi
            } catch (e: any) {
                const details =
                    e?.body?.error ?? e?.body?.message ?? e?.message ?? 'Failed to load submissions';
                setSubsError(String(details));
                setSubs([]); // show "No submissions yet."
            } finally {
                setSubsLoading(false);
            }
        })();
    }, [api, mission?.id]); // Auto-fetch on mount
    const [subsLoading, setSubsLoading] = useState(false);
    const [subsError, setSubsError] = useState<string | null>(null);

    const created = mission.created_at ? new Date(mission.created_at) : null;
    const displayStatus: string = mission.__displayStatus ?? mission.status ?? 'draft';
    const usdCost = getUsd(mission);

    // 3) Clicks = number of rows shown (not verified sum)
    const clicks = useMemo(() => {
        if (Array.isArray(subs)) return subs.length; // ✅ match list size
        if (mission?.__verifiedClicks != null) return Number(mission.__verifiedClicks) || 0;
        return Number(
            mission?.verified_clicks ??
            mission?.verifiedCount ??
            mission?.verifications_count ??
            mission?.stats?.verified_tasks_total ??
            mission?.submissions_verified_tasks ??
            mission?.tasks_done ??
            mission?.clicks ?? 0
        ) || 0;
    }, [subs, mission]);

    // 4) Lazy fetch ONLY if we don't already have submissions
    useEffect(() => {
        if (!open) return;
        if (subs !== null) return;            // we either have payload items or already fetched
        (async () => {
            try {
                setSubsLoading(true);
                setSubsError(null);
                const data = await api.getMissionSubmissions(mission.id);
                setSubs(Array.isArray(data) && data.length > 0 ? data.map(normalizeSub) : []);
            } catch (e: any) {
                const details =
                    e?.body?.error ?? e?.body?.message ?? e?.message ?? 'Failed to load submissions';
                setSubsError(String(details));
                setSubs([]); // show "No submissions yet."
            } finally {
                setSubsLoading(false);
            }
        })();
    }, [open, subs, api, mission?.id]);

    const onVerify = useCallback(async (submissionId: string) => {
        try {
            setBusyId(submissionId);
            await api.verifySubmission(submissionId);
            setSubs(prev => Array.isArray(prev)
                ? prev.map(s => s.id === submissionId ? { ...s, status: 'verified' } : s)
                : prev);
        } finally {
            setBusyId(null);
            onRefetch?.();
        }
    }, [api, onRefetch]);

    const onFlag = useCallback(async (submissionId: string) => {
        try {
            setBusyId(submissionId);
            await api.flagSubmission(submissionId);
            setSubs(prev => Array.isArray(prev)
                ? prev.map(s => s.id === submissionId ? { ...s, status: 'flagged' } : s)
                : prev);
        } finally {
            setBusyId(null);
            onRefetch?.();
        }
    }, [api, onRefetch]);

    return (
        <div className={clsx(
            'rounded-md bg-gray-800/40 hover:bg-gray-800/60 border border-white/5',
            dense ? 'px-3 py-2' : 'px-4 py-3'
        )}>
            {/* Row */}
            <div className="grid grid-cols-12 items-center gap-2 text-[12px]">
                <div className="col-span-4 overflow-hidden">
                    <div className="truncate text-white font-medium">{mission.title || 'Untitled Mission'}</div>
                    <div className="truncate text-[11px] text-gray-400">
                        {[mission.platform, mission.type].filter(Boolean).join(' • ') || '—'}
                    </div>
                    {Array.isArray(mission.tasks) && mission.tasks.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {mission.tasks.slice(0, 6).map((t: any, i: number) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                    {typeof t === 'string' ? t : (t?.label ?? t?.title ?? 'task')}
                                </span>
                            ))}
                            {mission.tasks.length > 6 && (
                                <span className="text-[10px] px-1 py-0.5 text-gray-400">+{mission.tasks.length - 6} more</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="col-span-2 text-gray-200">
                    {created && !isNaN(created.getTime()) ? fmtDate.format(created) : '—'}
                </div>

                <div className="col-span-2 text-white">{fmtUSD.format(usdCost)}</div>
                <div className="col-span-2 text-white">{clicks}</div>

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

                    <ModernButton size="sm" variant="secondary" onClick={() => setOpen(v => !v)} className="ml-1">
                        {open ? 'Hide' : 'Submissions'}
                    </ModernButton>
                </div>
            </div>

            {/* Submissions dropdown */}
            {open && (
                <div className="mt-2 rounded-md border border-white/5 bg-gray-900/60">
                    <div className="px-3 py-2 border-b border-white/5 text-[11px] text-gray-400 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20" />
                        <span>Submissions</span>
                        {Array.isArray(subs) && subs.length > 0 && (() => {
                            const flagged = subs.filter(s => String(s.status).toLowerCase() === 'flagged').length;
                            const verified = subs.length - flagged; // everything else is verified
                            return (
                                <span className="text-[10px] text-gray-500">
                                    ({verified} verified, {flagged} flagged)
                                </span>
                            );
                        })()}
                        <button
                            onClick={async () => {
                                try {
                                    setSubsLoading(true);
                                    setSubsError(null);
                                    const data = await api.getMissionSubmissions(mission.id);
                                    console.log('🔍 Retry - Raw submissions data from API:', data);
                                    console.log('🔍 Retry - Sample submission structure:', data?.[0]);
                                    setSubs(Array.isArray(data) && data.length > 0 ? data : []); // Data is already normalized by useApi
                                } catch (e: any) {
                                    const details =
                                        e?.body?.error ?? e?.body?.message ?? e?.message ?? 'Failed to load submissions';
                                    setSubsError(String(details));
                                } finally {
                                    setSubsLoading(false);
                                }
                            }}
                            className="ml-auto text-xs px-2 py-1 rounded border border-white/10 hover:border-white/20"
                        >
                            Retry
                        </button>
                    </div>

                    {subsLoading && <div className="px-3 py-3 text-[12px] text-gray-400">Loading…</div>}
                    {subsError && <div className="px-3 py-3 text-[12px] text-red-400">{subsError}</div>}

                    {!subsLoading && !subsError && (
                        <div className="max-h-64 overflow-auto divide-y divide-white/5">
                            {(subs ?? []).length === 0 && (
                                <div className="px-3 py-3 text-[12px] text-gray-400">No submissions yet.</div>
                            )}

                            {(subs ?? []).map((s: any) => {
                                console.log('🔍 Rendering submission:', s);
                                const createdAt = s?.created_at ? new Date(s.created_at) : null;
                                // Map backend statuses to UI statuses
                                const rawStatus = String(s?.status ?? 'verified').toLowerCase();
                                const status = ['completed', 'success', 'done', 'ok', 'pending'].includes(rawStatus) ? 'verified' : rawStatus;
                                const isVerified = status === 'verified' || status === 'approved';
                                const isFlagged = status === 'flagged';

                                // tiny badge + pill styles (same visual rhythm as Discover & Earn)
                                const pill = 'text-[10px] px-2 py-0.5 rounded-full border';

                                return (
                                    <div key={s.id} className="px-3 py-2 text-[12px] flex items-center gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate text-white">
                                                {s?.user_handle
                                                    ? `@${s.user_handle}`
                                                    : (s?.user_name ?? (s?.user_id ?? 'unknown'))}
                                            </div>

                                            <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                                                {createdAt && !isNaN(createdAt.getTime())
                                                    ? <span>Submitted {createdAt.toLocaleString()}</span>
                                                    : <span>—</span>}

                                                {/* task pill (like, retweet, …) */}
                                                {s?.task_label && (
                                                    <span className={`${pill} bg-white/5 border-white/15 text-gray-300`}>
                                                        {s.task_label}
                                                    </span>
                                                )}

                                                {/* status chip */}
                                                <span
                                                    className={`${pill} ${isFlagged
                                                        ? 'bg-red-500/10 text-red-300 border-red-400/30'
                                                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                                        }`}
                                                >
                                                    {status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ONE action only:
                                            - if verified  -> show tiny Flag
                                            - if flagged   -> show tiny Verify */}
                                        {isVerified && !isFlagged && (
                                            <button
                                                onClick={() => onFlag(s.id)}
                                                disabled={busyId === s.id}
                                                className={`${pill} bg-white/5 border-white/15 text-red-300 hover:border-red-400/40 hover:bg-red-500/10`}
                                                title="Flag submission"
                                            >
                                                {busyId === s.id ? '…' : 'Flag'}
                                            </button>
                                        )}

                                        {isFlagged && (
                                            <button
                                                onClick={() => onVerify(s.id)}
                                                disabled={busyId === s.id}
                                                className={`${pill} bg-white/5 border-white/15 text-emerald-300 hover:border-emerald-400/40 hover:bg-emerald-500/10`}
                                                title="Unflag (verify again)"
                                            >
                                                {busyId === s.id ? '…' : 'Verify'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}