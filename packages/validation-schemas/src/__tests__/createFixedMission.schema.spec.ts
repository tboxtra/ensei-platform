import { CreateFixedMissionSchema, getValidTasks, validateTasks } from '../mission/createFixedMission.schema';
import type { Platform, MissionType } from '@ensei/shared-types';

describe('CreateFixedMissionSchema', () => {
    describe('Valid Fixed Mission Creation', () => {
        it('should validate a complete fixed mission request', () => {
            const validMission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like', 'retweet'],
                title: 'Test Mission',
                premium: false
            };

            const result = CreateFixedMissionSchema.safeParse(validMission);
            expect(result.success).toBe(true);
        });

        it('should validate with optional fields', () => {
            const validMission = {
                platform: 'instagram' as Platform,
                type: 'content' as MissionType,
                target: 'premium' as const,
                cap: 60,
                tasks: ['feed_post'],
                title: 'Premium Content Mission',
                description: 'Create engaging content',
                premium: true,
                rewardsPerUserHonors: 500,
                brief: 'Create a compelling post',
                instructions: 'Follow the guidelines carefully'
            };

            const result = CreateFixedMissionSchema.safeParse(validMission);
            expect(result.success).toBe(true);
        });
    });

    describe('Platform Validation', () => {
        it('should accept all valid platforms', () => {
            const platforms: Platform[] = ['twitter', 'instagram', 'tiktok', 'facebook', 'whatsapp', 'snapchat', 'telegram'];

            platforms.forEach(platform => {
                const mission = {
                    platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    cap: 100,
                    tasks: ['like'],
                    title: 'Test Mission'
                };

                const result = CreateFixedMissionSchema.safeParse(mission);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid platform', () => {
            const mission = {
                platform: 'invalid' as any,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like'],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['platform']);
            }
        });
    });

    describe('Mission Type Validation', () => {
        it('should accept all valid mission types', () => {
            const types: MissionType[] = ['engage', 'content', 'ambassador'];

            types.forEach(type => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type,
                    target: 'all' as const,
                    cap: 100,
                    tasks: ['like'],
                    title: 'Test Mission'
                };

                const result = CreateFixedMissionSchema.safeParse(mission);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid mission type', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'invalid' as any,
                target: 'all' as const,
                cap: 100,
                tasks: ['like'],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['type']);
            }
        });
    });

    describe('Target Profile Validation', () => {
        it('should accept valid target profiles', () => {
            const targets = ['all', 'premium'] as const;

            targets.forEach(target => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target,
                    cap: 100,
                    tasks: ['like'],
                    title: 'Test Mission'
                };

                const result = CreateFixedMissionSchema.safeParse(mission);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid target profile', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'invalid' as any,
                cap: 100,
                tasks: ['like'],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['target']);
            }
        });
    });

    describe('Cap Validation', () => {
        it('should accept cap >= 60', () => {
            const validCaps = [60, 100, 500, 1000, 10000];

            validCaps.forEach(cap => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    cap,
                    tasks: ['like'],
                    title: 'Test Mission'
                };

                const result = CreateFixedMissionSchema.safeParse(mission);
                expect(result.success).toBe(true);
            });
        });

        it('should reject cap < 60', () => {
            const invalidCaps = [0, 10, 50, 59];

            invalidCaps.forEach(cap => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    cap,
                    tasks: ['like'],
                    title: 'Test Mission'
                };

                const result = CreateFixedMissionSchema.safeParse(mission);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues[0].path).toEqual(['cap']);
                    expect(result.error.issues[0].message).toContain('at least 60');
                }
            });
        });

        it('should reject cap > 10000', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 10001,
                tasks: ['like'],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['cap']);
                expect(result.error.issues[0].message).toContain('cannot exceed 10,000');
            }
        });

        it('should reject non-integer cap', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100.5,
                tasks: ['like'],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['cap']);
            }
        });
    });

    describe('Tasks Validation', () => {
        it('should require at least one task', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: [],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['tasks']);
                expect(result.error.issues[0].message).toContain('At least one task is required');
            }
        });

        it('should validate tasks for Twitter engage', () => {
            const validTasks = ['like', 'retweet', 'comment', 'quote'];

            validTasks.forEach(task => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    cap: 100,
                    tasks: [task],
                    title: 'Test Mission'
                };

                const result = CreateFixedMissionSchema.safeParse(mission);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid tasks for platform/type combination', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['invalid_task'],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['tasks']);
                expect(result.error.issues[0].message).toContain('Invalid tasks for selected platform and mission type');
            }
        });

        it('should validate multiple tasks', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like', 'retweet', 'comment'],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(true);
        });
    });

    describe('Title Validation', () => {
        it('should require title', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like']
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['title']);
                expect(result.error.issues[0].message).toContain('Title is required');
            }
        });

        it('should reject empty title', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like'],
                title: ''
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['title']);
            }
        });

        it('should reject title > 200 characters', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like'],
                title: 'a'.repeat(201)
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['title']);
                expect(result.error.issues[0].message).toContain('cannot exceed 200 characters');
            }
        });
    });

    describe('Optional Fields Validation', () => {
        it('should accept valid rewardsPerUserHonors', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like'],
                title: 'Test Mission',
                rewardsPerUserHonors: 500
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(true);
        });

        it('should reject negative rewardsPerUserHonors', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like'],
                title: 'Test Mission',
                rewardsPerUserHonors: -100
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['rewardsPerUserHonors']);
                expect(result.error.issues[0].message).toContain('positive');
            }
        });

        it('should accept valid URL for tweetUrl', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like'],
                title: 'Test Mission',
                tweetUrl: 'https://twitter.com/user/status/123456789'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(true);
        });

        it('should reject invalid URL for tweetUrl', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['like'],
                title: 'Test Mission',
                tweetUrl: 'invalid-url'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toEqual(['tweetUrl']);
                expect(result.error.issues[0].message).toContain('Invalid URL format');
            }
        });
    });

    describe('Helper Functions', () => {
        describe('getValidTasks', () => {
            it('should return valid tasks for Twitter engage', () => {
                const tasks = getValidTasks('twitter', 'engage');
                expect(tasks).toEqual(['like', 'retweet', 'comment', 'quote']);
            });

            it('should return valid tasks for Instagram content', () => {
                const tasks = getValidTasks('instagram', 'content');
                expect(tasks).toEqual(['feed_post', 'reel', 'carousel', 'meme']);
            });

            it('should return valid tasks for TikTok ambassador', () => {
                const tasks = getValidTasks('tiktok', 'ambassador');
                expect(tasks).toEqual(['pfp', 'hashtag_in_bio', 'pinned_branded_video']);
            });
        });

        describe('validateTasks', () => {
            it('should validate correct tasks for platform/type', () => {
                const isValid = validateTasks('twitter', 'engage', ['like', 'retweet']);
                expect(isValid).toBe(true);
            });

            it('should reject invalid tasks for platform/type', () => {
                const isValid = validateTasks('twitter', 'engage', ['invalid_task']);
                expect(isValid).toBe(false);
            });

            it('should validate mixed valid/invalid tasks', () => {
                const isValid = validateTasks('twitter', 'engage', ['like', 'invalid_task']);
                expect(isValid).toBe(false);
            });
        });
    });

    describe('Error Messages', () => {
        it('should provide helpful error messages for cap validation', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 50,
                tasks: ['like'],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const capError = result.error.issues.find(issue => issue.path.includes('cap'));
                expect(capError?.message).toContain('at least 60');
            }
        });

        it('should provide helpful error messages for tasks validation', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                cap: 100,
                tasks: ['invalid_task'],
                title: 'Test Mission'
            };

            const result = CreateFixedMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const tasksError = result.error.issues.find(issue => issue.path.includes('tasks'));
                expect(tasksError?.message).toContain('Invalid tasks for selected platform and mission type');
            }
        });
    });
});
