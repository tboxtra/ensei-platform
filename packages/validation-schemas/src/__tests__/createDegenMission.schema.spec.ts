import { CreateDegenMissionSchema, getMaxWinnersForDuration, validateWinnersCap } from '../mission/createDegenMission.schema';
import { DEGEN_PRESETS } from '@ensei/shared-types';
import type { Platform, MissionType } from '@ensei/shared-types';

describe('CreateDegenMissionSchema', () => {
    describe('Valid Degen Mission Creation', () => {
        it('should validate a complete degen mission request', () => {
            const validMission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 24,
                winnersCap: 5,
                title: 'Test Degen Mission',
                premium: false
            };

            const result = CreateDegenMissionSchema.safeParse(validMission);
            expect(result.success).toBe(true);
        });

        it('should validate with empty tasks (allowed for degen)', () => {
            const validMission = {
                platform: 'instagram' as Platform,
                type: 'content' as MissionType,
                target: 'premium' as const,
                durationHours: 36,
                winnersCap: 10,
                title: 'Premium Degen Mission',
                tasks: [],
                description: 'Create engaging content',
                premium: true
            };

            const result = CreateDegenMissionSchema.safeParse(validMission);
            expect(result.success).toBe(true);
        });

        it('should validate with optional fields', () => {
            const validMission = {
                platform: 'tiktok' as Platform,
                type: 'ambassador' as MissionType,
                target: 'all' as const,
                durationHours: 48,
                winnersCap: 10,
                title: 'TikTok Ambassador Mission',
                tasks: ['pfp', 'hashtag_in_bio'],
                description: 'Become a brand ambassador',
                premium: false,
                brief: 'Update your profile to represent our brand',
                instructions: 'Follow the brand guidelines carefully'
            };

            const result = CreateDegenMissionSchema.safeParse(validMission);
            expect(result.success).toBe(true);
        });
    });

    describe('Duration Hours Validation', () => {
        it('should accept valid preset durations', () => {
            const validDurations = DEGEN_PRESETS.map(preset => preset.hours);

            validDurations.forEach(duration => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    durationHours: duration,
                    winnersCap: 1,
                    title: 'Test Mission'
                };

                const result = CreateDegenMissionSchema.safeParse(mission);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid durations', () => {
            const invalidDurations = [2, 4, 5, 7, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 97, 98, 99, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300];

            invalidDurations.forEach(duration => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    durationHours: duration,
                    winnersCap: 1,
                    title: 'Test Mission'
                };

                const result = CreateDegenMissionSchema.safeParse(mission);
                expect(result.success).toBe(false);
                if (!result.success) {
                    const durationError = result.error.issues.find(issue => issue.path.includes('durationHours'));
                    expect(durationError?.message).toContain('valid preset durations');
                }
            });
        });

        it('should reject non-integer durations', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 24.5,
                winnersCap: 5,
                title: 'Test Mission'
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const durationError = result.error.issues.find(issue => issue.path.includes('durationHours'));
                expect(durationError).toBeDefined();
            }
        });
    });

    describe('Winners Cap Validation', () => {
        it('should accept valid winners cap for 1h duration', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 1,
                winnersCap: 1,
                title: 'Test Mission'
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(true);
        });

        it('should accept valid winners cap for 24h duration', () => {
            const validCaps = [1, 2, 3, 4, 5];

            validCaps.forEach(cap => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    durationHours: 24,
                    winnersCap: cap,
                    title: 'Test Mission'
                };

                const result = CreateDegenMissionSchema.safeParse(mission);
                expect(result.success).toBe(true);
            });
        });

        it('should accept valid winners cap for 36h duration', () => {
            const validCaps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            validCaps.forEach(cap => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    durationHours: 36,
                    winnersCap: cap,
                    title: 'Test Mission'
                };

                const result = CreateDegenMissionSchema.safeParse(mission);
                expect(result.success).toBe(true);
            });
        });

        it('should reject winners cap > max for duration', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 1,
                winnersCap: 2, // Max is 1 for 1h
                title: 'Test Mission'
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const capError = result.error.issues.find(issue => issue.path.includes('winnersCap'));
                expect(capError?.message).toContain('exceeds maximum for selected duration');
            }
        });

        it('should reject winners cap < 1', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 24,
                winnersCap: 0,
                title: 'Test Mission'
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const capError = result.error.issues.find(issue => issue.path.includes('winnersCap'));
                expect(capError?.message).toContain('at least 1');
            }
        });

        it('should reject non-integer winners cap', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 24,
                winnersCap: 5.5,
                title: 'Test Mission'
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const capError = result.error.issues.find(issue => issue.path.includes('winnersCap'));
                expect(capError).toBeDefined();
            }
        });
    });

    describe('Tasks Validation', () => {
        it('should allow empty tasks for degen missions', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 24,
                winnersCap: 5,
                title: 'Test Mission',
                tasks: []
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(true);
        });

        it('should validate tasks when provided', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 24,
                winnersCap: 5,
                title: 'Test Mission',
                tasks: ['like', 'retweet']
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(true);
        });

        it('should reject invalid tasks for platform/type combination', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 24,
                winnersCap: 5,
                title: 'Test Mission',
                tasks: ['invalid_task']
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const tasksError = result.error.issues.find(issue => issue.path.includes('tasks'));
                expect(tasksError?.message).toContain('Invalid tasks for selected platform and mission type');
            }
        });
    });

    describe('Helper Functions', () => {
        describe('getMaxWinnersForDuration', () => {
            it('should return correct max winners for 1h duration', () => {
                const maxWinners = getMaxWinnersForDuration(1);
                expect(maxWinners).toBe(1);
            });

            it('should return correct max winners for 24h duration', () => {
                const maxWinners = getMaxWinnersForDuration(24);
                expect(maxWinners).toBe(5);
            });

            it('should return correct max winners for 36h duration', () => {
                const maxWinners = getMaxWinnersForDuration(36);
                expect(maxWinners).toBe(10);
            });

            it('should return 1 for invalid duration', () => {
                const maxWinners = getMaxWinnersForDuration(999);
                expect(maxWinners).toBe(1);
            });
        });

        describe('validateWinnersCap', () => {
            it('should validate correct winners cap for 1h duration', () => {
                const isValid = validateWinnersCap(1, 1);
                expect(isValid).toBe(true);
            });

            it('should validate correct winners cap for 24h duration', () => {
                const isValid = validateWinnersCap(24, 5);
                expect(isValid).toBe(true);
            });

            it('should reject winners cap > max for duration', () => {
                const isValid = validateWinnersCap(1, 2);
                expect(isValid).toBe(false);
            });

            it('should reject winners cap < 1', () => {
                const isValid = validateWinnersCap(24, 0);
                expect(isValid).toBe(false);
            });

            it('should reject winners cap > max for 36h duration', () => {
                const isValid = validateWinnersCap(36, 11);
                expect(isValid).toBe(false);
            });
        });
    });

    describe('Error Messages', () => {
        it('should provide helpful error messages for duration validation', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 25,
                winnersCap: 5,
                title: 'Test Mission'
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const durationError = result.error.issues.find(issue => issue.path.includes('durationHours'));
                expect(durationError?.message).toContain('valid preset durations');
            }
        });

        it('should provide helpful error messages for winners cap validation', () => {
            const mission = {
                platform: 'twitter' as Platform,
                type: 'engage' as MissionType,
                target: 'all' as const,
                durationHours: 1,
                winnersCap: 2,
                title: 'Test Mission'
            };

            const result = CreateDegenMissionSchema.safeParse(mission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const capError = result.error.issues.find(issue => issue.path.includes('winnersCap'));
                expect(capError?.message).toContain('exceeds maximum for selected duration');
            }
        });
    });

    describe('Integration with Degen Presets', () => {
        it('should validate all preset durations correctly', () => {
            DEGEN_PRESETS.forEach(preset => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    durationHours: preset.hours,
                    winnersCap: preset.maxWinners,
                    title: 'Test Mission'
                };

                const result = CreateDegenMissionSchema.safeParse(mission);
                expect(result.success).toBe(true);
            });
        });

        it('should reject winners cap > preset max for each duration', () => {
            DEGEN_PRESETS.forEach(preset => {
                const mission = {
                    platform: 'twitter' as Platform,
                    type: 'engage' as MissionType,
                    target: 'all' as const,
                    durationHours: preset.hours,
                    winnersCap: preset.maxWinners + 1,
                    title: 'Test Mission'
                };

                const result = CreateDegenMissionSchema.safeParse(mission);
                expect(result.success).toBe(false);
                if (!result.success) {
                    const capError = result.error.issues.find(issue => issue.path.includes('winnersCap'));
                    expect(capError?.message).toContain('exceeds maximum for selected duration');
                }
            });
        });
    });
});
