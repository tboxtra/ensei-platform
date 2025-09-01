import { honorsToUsd, usdToHonors, formatHonorsAsUsd, formatUsdAsHonors } from '../services/honor-conversion';
import { HONORS_PER_USD, USD_PER_HONOR } from '@ensei/shared-types';

describe('Honor Conversion Service', () => {
    describe('honorsToUsd', () => {
        it('should convert honors to USD correctly', () => {
            const honors = 450;
            const usd = honorsToUsd(honors);
            expect(usd).toBe(1); // 450 honors = 1 USD
        });

        it('should handle zero honors', () => {
            const usd = honorsToUsd(0);
            expect(usd).toBe(0);
        });

        it('should handle large amounts', () => {
            const honors = 45000;
            const usd = honorsToUsd(honors);
            expect(usd).toBe(100); // 45000 honors = 100 USD
        });

        it('should use the correct conversion rate', () => {
            const honors = 2250;
            const usd = honorsToUsd(honors);
            expect(usd).toBe(5); // 2250 honors = 5 USD
        });
    });

    describe('usdToHonors', () => {
        it('should convert USD to honors correctly', () => {
            const usd = 1;
            const honors = usdToHonors(usd);
            expect(honors).toBe(450); // 1 USD = 450 honors
        });

        it('should handle zero USD', () => {
            const honors = usdToHonors(0);
            expect(honors).toBe(0);
        });

        it('should round to nearest honor', () => {
            const usd = 0.5;
            const honors = usdToHonors(usd);
            expect(honors).toBe(225); // 0.5 USD = 225 honors
        });

        it('should handle large amounts', () => {
            const usd = 100;
            const honors = usdToHonors(usd);
            expect(honors).toBe(45000); // 100 USD = 45000 honors
        });
    });

    describe('formatHonorsAsUsd', () => {
        it('should format honors as USD string', () => {
            const honors = 450;
            const formatted = formatHonorsAsUsd(honors);
            expect(formatted).toBe('$1.00');
        });

        it('should handle decimal amounts', () => {
            const honors = 225;
            const formatted = formatHonorsAsUsd(honors);
            expect(formatted).toBe('$0.50');
        });
    });

    describe('formatUsdAsHonors', () => {
        it('should format USD as honors string', () => {
            const usd = 1;
            const formatted = formatUsdAsHonors(usd);
            expect(formatted).toBe('450 Honors');
        });

        it('should handle large amounts with commas', () => {
            const usd = 100;
            const formatted = formatUsdAsHonors(usd);
            expect(formatted).toBe('45,000 Honors');
        });
    });

    describe('Conversion consistency', () => {
        it('should maintain consistency between honors and USD conversion', () => {
            const originalUsd = 10;
            const honors = usdToHonors(originalUsd);
            const convertedUsd = honorsToUsd(honors);

            // Allow for small rounding differences
            expect(Math.abs(convertedUsd - originalUsd)).toBeLessThan(0.01);
        });

        it('should use the correct constants from shared-types', () => {
            expect(HONORS_PER_USD).toBe(450);
            expect(USD_PER_HONOR).toBe(1 / 450);
        });
    });
});
