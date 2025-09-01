import { computeFixed } from '../../pricing/fixed';
import type { FixedPricingInput } from '../../pricing/fixed';

describe('Fixed Pricing', () => {
    describe('computeFixed', () => {
        it('should calculate basic fixed mission pricing', () => {
            const input: FixedPricingInput = {
                tasksHonorsSum: 100,
                cap: 100,
                target: 'all'
            };

            const result = computeFixed(input);

            expect(result.rewardHonorsTotal).toBe(10000); // 100 * 100
            expect(result.costHonorsTotal).toBe(20000); // 10000 * 2
        });

        it('should apply premium multiplier for premium target', () => {
            const input: FixedPricingInput = {
                tasksHonorsSum: 100,
                cap: 100,
                target: 'premium'
            };

            const result = computeFixed(input);

            expect(result.rewardHonorsTotal).toBe(10000); // 100 * 100
            expect(result.costHonorsTotal).toBe(100000); // 10000 * 2 * 5
        });

        it('should handle decimal task honors', () => {
            const input: FixedPricingInput = {
                tasksHonorsSum: 50.5,
                cap: 60,
                target: 'all'
            };

            const result = computeFixed(input);

            expect(result.rewardHonorsTotal).toBe(3030); // 50.5 * 60, rounded
            expect(result.costHonorsTotal).toBe(6060); // 3030 * 2
        });

        it('should handle minimum cap of 60', () => {
            const input: FixedPricingInput = {
                tasksHonorsSum: 100,
                cap: 60,
                target: 'all'
            };

            const result = computeFixed(input);

            expect(result.rewardHonorsTotal).toBe(6000); // 100 * 60
            expect(result.costHonorsTotal).toBe(12000); // 6000 * 2
        });

        it('should round premium calculations correctly', () => {
            const input: FixedPricingInput = {
                tasksHonorsSum: 33,
                cap: 100,
                target: 'premium'
            };

            const result = computeFixed(input);

            expect(result.rewardHonorsTotal).toBe(3300); // 33 * 100
            expect(result.costHonorsTotal).toBe(33000); // 3300 * 2 * 5, rounded
        });
    });
});
