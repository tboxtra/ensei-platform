export type MissionTypeKey = 'engage' | 'content' | 'ambassador';
export type PlatformKey = 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | 'snapchat' | 'telegram';
export interface TaskDef {
    label: string;
    key: string;
    suggestedProof?: string;
    defaultExposureHours?: number;
}
export type PlatformTasks = Record<PlatformKey, Record<MissionTypeKey, TaskDef[]>>;
export declare const PLATFORM_TASKS: PlatformTasks;
export type PlatformTaskKey = typeof PLATFORM_TASKS.twitter.engage[number]['key'] | typeof PLATFORM_TASKS.twitter.content[number]['key'] | typeof PLATFORM_TASKS.twitter.ambassador[number]['key'] | typeof PLATFORM_TASKS.instagram.engage[number]['key'] | typeof PLATFORM_TASKS.instagram.content[number]['key'] | typeof PLATFORM_TASKS.instagram.ambassador[number]['key'] | typeof PLATFORM_TASKS.tiktok.engage[number]['key'] | typeof PLATFORM_TASKS.tiktok.content[number]['key'] | typeof PLATFORM_TASKS.tiktok.ambassador[number]['key'] | typeof PLATFORM_TASKS.facebook.engage[number]['key'] | typeof PLATFORM_TASKS.facebook.content[number]['key'] | typeof PLATFORM_TASKS.facebook.ambassador[number]['key'] | typeof PLATFORM_TASKS.whatsapp.engage[number]['key'] | typeof PLATFORM_TASKS.whatsapp.content[number]['key'] | typeof PLATFORM_TASKS.whatsapp.ambassador[number]['key'] | typeof PLATFORM_TASKS.snapchat.engage[number]['key'] | typeof PLATFORM_TASKS.snapchat.content[number]['key'] | typeof PLATFORM_TASKS.snapchat.ambassador[number]['key'] | typeof PLATFORM_TASKS.telegram.engage[number]['key'] | typeof PLATFORM_TASKS.telegram.content[number]['key'] | typeof PLATFORM_TASKS.telegram.ambassador[number]['key'];
