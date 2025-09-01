import { computeDegen, getPresetByHours } from '../../pricing/degen';
import type { DegenPricingInput } from '../../pricing/degen';
import { DEGEN_PRESETS } from '../../pricing/constants';

describe('Degen Pricing', () => {
    describe('getPresetByHours', () => {
        it('should return correct preset for valid hours', () => {
            const preset = getPresetByHours(24);
            expect(preset).toBeDefined();
            expect(preset?.hours).toBe(24);
            expect(preset?.costUSD).toBe(400);
            expect(preset?.maxWinners).toBe(5);
        });

        it('should return undefined for invalid hours', () => {
            const preset = getPresetByHours(999);
            expect(preset).toBeUndefined();
        });

        it('should return correct preset for all valid durations', () => {
            DEGEN_PRESETS.forEach(preset => {
                const found = getPresetByHours(preset.hours);
                expect(found).toEqual(preset);
            });
        });
    });

    describe('computeDegen', () => {
        it('should calculate basic degen mission pricing', () => {
            const input: DegenPricingInput = {
                hours: 24,
                winnersCap: 3,
                target: 'all',
                taskCount: 1
            };

            const result = computeDegen(input);

            expect(result.totalCostUsd).toBe(400); // 24h preset cost
            expect(result.userPoolHonors).toBe(90000); // 400 * 450 * 0.5
            expect(result.perWinnerHonors).toBe(30000); // 90000 / 3
        });

        it('should apply premium multiplier for premium target', () => {
            const input: DegenPricingInput = {
                hours: 24,
                winnersCap: 3,
                target: 'premium',
                taskCount: 1
            };

            const result = computeDegen(input);

            expect(result.totalCostUsd).toBe(2000); // 400 * 5
            expect(result.userPoolHonors).toBe(450000); // 2000 * 450 * 0.5
            expect(result.perWinnerHonors).toBe(150000); // 450000 / 3
        });

        it('should apply task count multiplier', () => {
            const input: DegenPricingInput = {
                hours: 24,
                winnersCap: 3,
                target: 'all',
                taskCount: 3
            };

            const result = computeDegen(input);

            expect(result.totalCostUsd).toBe(1200); // 400 * 3
            expect(result.userPoolHonors).toBe(270000); // 1200 * 450 * 0.5
            expect(result.perWinnerHonors).toBe(90000); // 270000 / 3
        });

        it('should handle task count of 0 as 1', () => {
            const input: DegenPricingInput = {
                hours: 24,
                winnersCap: 3,
                target: 'all',
                taskCount: 0
            };

            const result = computeDegen(input);

            expect(result.totalCostUsd).toBe(400); // 400 * 1 (minimum)
            expect(result.userPoolHonors).toBe(90000); // 400 * 450 * 0.5
            expect(result.perWinnerHonors).toBe(30000); // 90000 / 3
        });

        it('should calculate per-winner math across different durations', () => {
            const testCases = [
                { hours: 1, costUSD: 15, winnersCap: 1 },
                { hours: 3, costUSD: 30, winnersCap: 2 },
                { hours: 6, costUSD: 80, winnersCap: 3 },
                { hours: 12, costUSD: 180, winnersCap: 5 },
                { hours: 24, costUSD: 400, winnersCap: 5 },
                { hours: 48, costUSD: 600, winnersCap: 10 },
                { hours: 168, costUSD: 1500, winnersCap: 10 }
            ];

            testCases.forEach(({ hours, costUSD, winnersCap }) => {
                const input: DegenPricingInput = {
                    hours,
                    winnersCap,
                    target: 'all',
                    taskCount: 1
                };

                const result = computeDegen(input);

                expect(result.totalCostUsd).toBe(costUSD);
                expect(result.userPoolHonors).toBe(Math.round(costUSD * 450 * 0.5));
                expect(result.perWinnerHonors).toBe(Math.floor(result.userPoolHonors / winnersCap));
            });
        });

        it('should throw error for invalid duration', () => {
            const input: DegenPricingInput = {
                hours: 999,
                winnersCap: 1,
                target: 'all',
                taskCount: 1
            };

            expect(() => computeDegen(input)).toThrow('Invalid duration: 999 hours');
        });

        it('should handle premium + task count combination', () => {
            const input: DegenPricingInput = {
                hours: 24,
                winnersCap: 5,
                target: 'premium',
                taskCount: 2
            };

            const result = computeDegen(input);

            expect(result.totalCostUsd).toBe(4000); // 400 * 5 * 2
            expect(result.userPoolHonors).toBe(900000); // 4000 * 450 * 0.5
            expect(result.perWinnerHonors).toBe(180000); // 900000 / 5
        });
    });
});
