export const briefQuota = (q: { likes: number; retweets: number; comments: number }) =>
    `❤️ ${q.likes} • 🔁 ${q.retweets} • 💬 ${q.comments}`;

export const briefSub = (meta?: { maxPerHour?: number; durationDays?: number }) =>
    meta ? `${meta.maxPerHour ?? 1}/hr • ${meta.durationDays ?? 7}d` : "";
