import {
    TASK_CATALOG,
    getTaskHonors,
    getAvailableTasks,
    calculateTasksHonors,
    validateTasks
} from '../../tasks/catalog';
import type { Platform, MissionType, TaskType } from '@ensei/shared-types';

describe('Task Catalog', () => {
    describe('TASK_CATALOG', () => {
        it('should have valid structure for all platforms', () => {
            const platforms: Platform[] = ['twitter', 'instagram', 'tiktok', 'facebook', 'whatsapp', 'snapchat', 'telegram'];
            const missionTypes: MissionType[] = ['engage', 'content', 'ambassador'];

            platforms.forEach(platform => {
                expect(TASK_CATALOG[platform]).toBeDefined();
                missionTypes.forEach(type => {
                    expect(TASK_CATALOG[platform][type]).toBeDefined();
                    expect(typeof TASK_CATALOG[platform][type]).toBe('object');
                });
            });
        });

        it('should have positive honors values for all tasks', () => {
            Object.values(TASK_CATALOG).forEach(platformTasks => {
                Object.values(platformTasks).forEach(missionTasks => {
                    Object.values(missionTasks).forEach(honors => {
                        expect(honors).toBeGreaterThan(0);
                        expect(Number.isInteger(honors)).toBe(true);
                    });
                });
            });
        });
    });

    describe('getTaskHonors', () => {
        it('should return correct honors for valid task', () => {
            expect(getTaskHonors('twitter', 'engage', 'like')).toBe(20);
            expect(getTaskHonors('twitter', 'content', 'thread')).toBe(1800);
            expect(getTaskHonors('instagram', 'ambassador', 'pfp')).toBe(400);
        });

        it('should return 0 for invalid task', () => {
            expect(getTaskHonors('twitter', 'engage', 'invalid_task' as TaskType)).toBe(0);
            expect(getTaskHonors('invalid_platform' as Platform, 'engage', 'like')).toBe(0);
        });

        it('should return 0 for invalid platform/mission type combination', () => {
            expect(getTaskHonors('whatsapp', 'content', 'like')).toBe(0);
        });
    });

    describe('getAvailableTasks', () => {
        it('should return correct tasks for valid platform and mission type', () => {
            const twitterEngageTasks = getAvailableTasks('twitter', 'engage');
            expect(twitterEngageTasks).toContain('like');
            expect(twitterEngageTasks).toContain('retweet');
            expect(twitterEngageTasks).toContain('comment');
            expect(twitterEngageTasks).toContain('quote');
            expect(twitterEngageTasks).toHaveLength(4);
        });

        it('should return empty array for invalid platform', () => {
            const tasks = getAvailableTasks('invalid_platform' as Platform, 'engage');
            expect(tasks).toEqual([]);
        });

        it('should return empty array for invalid mission type', () => {
            const tasks = getAvailableTasks('twitter', 'invalid_type' as MissionType);
            expect(tasks).toEqual([]);
        });

        it('should return all platform tasks correctly', () => {
            const platforms: Platform[] = ['twitter', 'instagram', 'tiktok', 'facebook', 'whatsapp', 'snapchat', 'telegram'];
            const missionTypes: MissionType[] = ['engage', 'content', 'ambassador'];

            platforms.forEach(platform => {
                missionTypes.forEach(type => {
                    const tasks = getAvailableTasks(platform, type);
                    expect(Array.isArray(tasks)).toBe(true);
                    tasks.forEach(task => {
                        expect(getTaskHonors(platform, type, task)).toBeGreaterThan(0);
                    });
                });
            });
        });
    });

    describe('calculateTasksHonors', () => {
        it('should calculate total honors for multiple tasks', () => {
            const tasks: TaskType[] = ['like', 'retweet', 'comment'];
            const total = calculateTasksHonors('twitter', 'engage', tasks);
            expect(total).toBe(520); // 20 + 300 + 200
        });

        it('should return 0 for empty task list', () => {
            const total = calculateTasksHonors('twitter', 'engage', []);
            expect(total).toBe(0);
        });

        it('should handle single task', () => {
            const total = calculateTasksHonors('twitter', 'engage', ['like']);
            expect(total).toBe(20);
        });

        it('should ignore invalid tasks', () => {
            const tasks: TaskType[] = ['like', 'invalid_task' as TaskType, 'retweet'];
            const total = calculateTasksHonors('twitter', 'engage', tasks);
            expect(total).toBe(320); // 20 + 0 + 300
        });
    });

    describe('validateTasks', () => {
        it('should return true for valid tasks', () => {
            const tasks: TaskType[] = ['like', 'retweet'];
            const isValid = validateTasks('twitter', 'engage', tasks);
            expect(isValid).toBe(true);
        });

        it('should return false for invalid tasks', () => {
            const tasks: TaskType[] = ['like', 'invalid_task' as TaskType];
            const isValid = validateTasks('twitter', 'engage', tasks);
            expect(isValid).toBe(false);
        });

        it('should return true for empty task list', () => {
            const isValid = validateTasks('twitter', 'engage', []);
            expect(isValid).toBe(true);
        });

        it('should return false for invalid platform', () => {
            const tasks: TaskType[] = ['like'];
            const isValid = validateTasks('invalid_platform' as Platform, 'engage', tasks);
            expect(isValid).toBe(false);
        });

        it('should return false for invalid mission type', () => {
            const tasks: TaskType[] = ['like'];
            const isValid = validateTasks('twitter', 'invalid_type' as MissionType, tasks);
            expect(isValid).toBe(false);
        });
    });
});
