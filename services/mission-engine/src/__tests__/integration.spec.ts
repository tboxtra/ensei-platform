import {
    calculateMissionPricing,
    validateDegenMission,
    computeFixed,
    computeDegen,
    getTaskHonors,
    calculateTasksHonors
} from '../index';
import type { MissionPricingRequest, TaskType } from '../types';

describe('Mission Engine Integration', () => {
    describe('calculateMissionPricing', () => {
        it('should calculate fixed mission pricing correctly', () => {
            const request: MissionPricingRequest = {
                platform: 'twitter',
                type: 'engage',
                model: 'fixed',
                target: 'all',
                tasks: ['like', 'retweet'],
                cap: 100
            };

            const result = calculateMissionPricing(request);

            expect(result.model).toBe('fixed');
            expect(result.totalCostUsd).toBeCloseTo(142.22, 2); // (20+300)*100*2 / 450
            expect(result.totalCostHonors).toBe(64000); // (20+300)*100*2
            expect(result.perUserHonors).toBe(320); // 20+300
            expect(result.breakdown.tasksHonors).toBe(320);
            expect(result.breakdown.platformFee).toBe(32000); // 64000 - 32000
        });

        it('should calculate fixed mission pricing with premium target', () => {
            const request: MissionPricingRequest = {
                platform: 'twitter',
                type: 'engage',
                model: 'fixed',
                target: 'premium',
                tasks: ['like'],
                cap: 100
            };

            const result = calculateMissionPricing(request);

            expect(result.model).toBe('fixed');
            expect(result.totalCostUsd).toBeCloseTo(44.44, 2); // 20*100*2*5 / 450
            expect(result.totalCostHonors).toBe(20000); // 20*100*2*5
            expect(result.perUserHonors).toBe(20);
            expect(result.breakdown.premiumMultiplier).toBe(5);
        });

        it('should calculate degen mission pricing correctly', () => {
            const request: MissionPricingRequest = {
                platform: 'twitter',
                type: 'engage',
                model: 'degen',
                target: 'all',
                tasks: ['like', 'retweet'],
                durationHours: 24,
                winnersCap: 3
            };

            const result = calculateMissionPricing(request);

            expect(result.model).toBe('degen');
            expect(result.totalCostUsd).toBe(800); // 24h preset cost * 2 tasks
            expect(result.userPoolHonors).toBe(180000); // 800 * 450 * 0.5
            expect(result.perWinnerHonors).toBe(60000); // 180000 / 3
            expect(result.breakdown.tasksHonors).toBe(320); // 20+300
        });

        it('should calculate degen mission pricing with premium target', () => {
            const request: MissionPricingRequest = {
                platform: 'twitter',
                type: 'engage',
                model: 'degen',
                target: 'premium',
                tasks: ['like'],
                durationHours: 24,
                winnersCap: 5
            };

            const result = calculateMissionPricing(request);

            expect(result.model).toBe('degen');
            expect(result.totalCostUsd).toBe(2000); // 400 * 5
            expect(result.userPoolHonors).toBe(450000); // 2000 * 450 * 0.5
            expect(result.perWinnerHonors).toBe(90000); // 450000 / 5
            expect(result.breakdown.premiumMultiplier).toBe(5);
        });

        it('should throw error for invalid tasks', () => {
            const request: MissionPricingRequest = {
                platform: 'twitter',
                type: 'engage',
                model: 'fixed',
                target: 'all',
                tasks: ['invalid_task' as any],
                cap: 100
            };

            expect(() => calculateMissionPricing(request)).toThrow('Invalid tasks for platform twitter and type engage');
        });

        it('should throw error for fixed mission with cap < 60', () => {
            const request: MissionPricingRequest = {
                platform: 'twitter',
                type: 'engage',
                model: 'fixed',
                target: 'all',
                tasks: ['like'],
                cap: 50
            };

            expect(() => calculateMissionPricing(request)).toThrow('Fixed missions require a cap of at least 60');
        });

        it('should throw error for degen mission without required parameters', () => {
            const request: MissionPricingRequest = {
                platform: 'twitter',
                type: 'engage',
                model: 'degen',
                target: 'all',
                tasks: ['like']
                // Missing durationHours and winnersCap
            };

            expect(() => calculateMissionPricing(request)).toThrow('Degen missions require durationHours and winnersCap');
        });

        it('should throw error for unsupported mission model', () => {
            const request: MissionPricingRequest = {
                platform: 'twitter',
                type: 'engage',
                model: 'invalid' as any,
                target: 'all',
                tasks: ['like'],
                cap: 100
            };

            expect(() => calculateMissionPricing(request)).toThrow('Unsupported mission model: invalid');
        });
    });

    describe('validateDegenMission', () => {
        it('should validate correct degen mission parameters', () => {
            const result = validateDegenMission(24, 3);

            expect(result.isValid).toBe(true);
            expect(result.preset?.hours).toBe(24);
            expect(result.preset?.costUSD).toBe(400);
            expect(result.maxWinners).toBe(5);
        });

        it('should reject invalid duration', () => {
            const result = validateDegenMission(999, 1);

            expect(result.isValid).toBe(false);
            expect(result.maxWinners).toBe(0);
            expect(result.error).toBe('Invalid duration: 999 hours');
        });

        it('should reject winners cap exceeding maximum', () => {
            const result = validateDegenMission(24, 10);

            expect(result.isValid).toBe(false);
            expect(result.maxWinners).toBe(5);
            expect(result.error).toBe('Winners cap must be between 1 and 5');
        });

        it('should reject winners cap below minimum', () => {
            const result = validateDegenMission(24, 0);

            expect(result.isValid).toBe(false);
            expect(result.maxWinners).toBe(5);
            expect(result.error).toBe('Winners cap must be between 1 and 5');
        });
    });

    describe('Cross-module integration', () => {
        it('should integrate task catalog with pricing calculations', () => {
            const tasks: TaskType[] = ['like', 'retweet'];
            const taskHonors = calculateTasksHonors('twitter', 'engage', tasks);

            expect(taskHonors).toBe(320); // 20 + 300

            const fixedResult = computeFixed({
                tasksHonorsSum: taskHonors,
                cap: 100,
                target: 'all'
            });

            expect(fixedResult.rewardHonorsTotal).toBe(32000); // 320 * 100
            expect(fixedResult.costHonorsTotal).toBe(64000); // 32000 * 2
        });

        it('should integrate task catalog with degen calculations', () => {
            const tasks: TaskType[] = ['like', 'retweet'];
            const taskCount = tasks.length;

            const degenResult = computeDegen({
                hours: 24,
                winnersCap: 3,
                target: 'all',
                taskCount
            });

            expect(degenResult.totalCostUsd).toBe(800); // 400 * 2
            expect(degenResult.userPoolHonors).toBe(180000); // 800 * 450 * 0.5
            expect(degenResult.perWinnerHonors).toBe(60000); // 180000 / 3
        });
    });
});
