'use client'
export default function ValueBar({ v, max = 800 }: { v: number; max?: number }) {
    const pct = Math.min(100, Math.round((v / max) * 100));
    return (
        <div className="h-1 w-full bg-white/10 rounded">
            <div className="h-1 rounded bg-gradient-to-r from-emerald-400 to-indigo-400" style={{ width: `${pct}%` }} />
        </div>
    );
}
