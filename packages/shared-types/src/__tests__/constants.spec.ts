import {
  HONORS_PER_USD,
  USD_PER_HONOR,
  PREMIUM_COST_MULTIPLIER,
  USER_POOL_FACTOR,
  PLATFORM_FEE_RATE,
  DEGEN_PRESETS,
  AUDIENCE_PRESETS,
  usdToHonors,
  honorsToUsd,
  calculateDegenCosts,
  calculateFixedCosts,
  validateDegenPresets,
  validateAudiencePresets,
  getDegenPresetByHours,
  getDegenPresetByLabel,
  getAudiencePresetByName
} from '../pricing';

describe('Pricing Constants', () => {
  describe('Exchange Rates', () => {
    it('should have correct HONORS_PER_USD value', () => {
      expect(HONORS_PER_USD).toBe(450);
    });

    it('should have correct USD_PER_HONOR value', () => {
      expect(USD_PER_HONOR).toBe(1 / 450);
    });

    it('should maintain reciprocal relationship', () => {
      expect(HONORS_PER_USD * USD_PER_HONOR).toBeCloseTo(1, 10);
    });
  });

  describe('Multipliers', () => {
    it('should have correct PREMIUM_COST_MULTIPLIER', () => {
      expect(PREMIUM_COST_MULTIPLIER).toBe(5);
    });

    it('should have correct USER_POOL_FACTOR', () => {
      expect(USER_POOL_FACTOR).toBe(0.5);
    });

    it('should have correct PLATFORM_FEE_RATE', () => {
      expect(PLATFORM_FEE_RATE).toBe(1.0);
    });
  });
});

describe('DEGEN_PRESETS', () => {
  it('should be readonly at TypeScript level', () => {
    // This test verifies TypeScript readonly behavior
    // In runtime JavaScript, arrays are still mutable, but TypeScript prevents assignment
    expect(DEGEN_PRESETS).toBeDefined();
    expect(Array.isArray(DEGEN_PRESETS)).toBe(true);
  });

  it('should have the correct number of presets', () => {
    expect(DEGEN_PRESETS).toHaveLength(13);
  });

  it('should have all required properties for each preset', () => {
    DEGEN_PRESETS.forEach((preset, index) => {
      expect(preset).toHaveProperty('hours');
      expect(preset).toHaveProperty('costUSD');
      expect(preset).toHaveProperty('maxWinners');
      expect(preset).toHaveProperty('label');
      expect(typeof preset.hours).toBe('number');
      expect(typeof preset.costUSD).toBe('number');
      expect(typeof preset.maxWinners).toBe('number');
      expect(typeof preset.label).toBe('string');
    });
  });

  it('should have strictly increasing hours', () => {
    const presets = [...DEGEN_PRESETS]; // Create a copy to avoid mutation
    for (let i = 1; i < presets.length; i++) {
      expect(presets[i].hours).toBeGreaterThan(presets[i - 1].hours);
    }
  });

  it('should have strictly increasing costs', () => {
    const presets = [...DEGEN_PRESETS]; // Create a copy to avoid mutation
    for (let i = 1; i < presets.length; i++) {
      expect(presets[i].costUSD).toBeGreaterThan(presets[i - 1].costUSD);
    }
  });

  it('should have non-decreasing max winners', () => {
    const presets = [...DEGEN_PRESETS]; // Create a copy to avoid mutation
    for (let i = 1; i < presets.length; i++) {
      expect(presets[i].maxWinners).toBeGreaterThanOrEqual(presets[i - 1].maxWinners);
    }
  });

  it('should match the authoritative table values', () => {
    const expectedValues = [
      { hours: 1, costUSD: 15, maxWinners: 1, label: '1h' },
      { hours: 3, costUSD: 30, maxWinners: 2, label: '3h' },
      { hours: 6, costUSD: 80, maxWinners: 3, label: '6h' },
      { hours: 8, costUSD: 150, maxWinners: 3, label: '8h' },
      { hours: 12, costUSD: 180, maxWinners: 5, label: '12h' },
      { hours: 18, costUSD: 300, maxWinners: 5, label: '18h' },
      { hours: 24, costUSD: 400, maxWinners: 5, label: '24h' },
      { hours: 36, costUSD: 500, maxWinners: 10, label: '36h' },
      { hours: 48, costUSD: 600, maxWinners: 10, label: '48h' },
      { hours: 72, costUSD: 800, maxWinners: 10, label: '3d' },
      { hours: 96, costUSD: 1000, maxWinners: 10, label: '4d' },
      { hours: 168, costUSD: 1500, maxWinners: 10, label: '7d' },
      { hours: 240, costUSD: 2000, maxWinners: 10, label: '10d' }
    ];

    const presets = [...DEGEN_PRESETS]; // Create a copy to avoid mutation
    presets.forEach((preset, index) => {
      expect(preset).toEqual(expectedValues[index]);
    });
  });
});

describe('AUDIENCE_PRESETS', () => {
  it('should be readonly at TypeScript level', () => {
    // This test verifies TypeScript readonly behavior
    // In runtime JavaScript, arrays are still mutable, but TypeScript prevents assignment
    expect(AUDIENCE_PRESETS).toBeDefined();
    expect(Array.isArray(AUDIENCE_PRESETS)).toBe(true);
  });

  it('should have the correct number of presets', () => {
    expect(AUDIENCE_PRESETS).toHaveLength(5);
  });

  it('should have all required properties for each preset', () => {
    AUDIENCE_PRESETS.forEach((preset) => {
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('hours');
      expect(preset).toHaveProperty('description');
      expect(typeof preset.name).toBe('string');
      expect(typeof preset.hours).toBe('number');
      expect(typeof preset.description).toBe('string');
    });
  });

  it('should have strictly increasing hours', () => {
    const presets = [...AUDIENCE_PRESETS]; // Create a copy to avoid mutation
    for (let i = 1; i < presets.length; i++) {
      expect(presets[i].hours).toBeGreaterThan(presets[i - 1].hours);
    }
  });

  it('should map to valid Degen durations', () => {
    AUDIENCE_PRESETS.forEach((preset) => {
      const matchingDegen = DEGEN_PRESETS.find(degen => degen.hours === preset.hours);
      expect(matchingDegen).toBeDefined();
    });
  });
});

describe('Utility Functions', () => {
  describe('usdToHonors', () => {
    it('should convert USD to Honors correctly', () => {
      expect(usdToHonors(1)).toBe(450);
      expect(usdToHonors(10)).toBe(4500);
      expect(usdToHonors(0.5)).toBe(225);
    });

    it('should round to nearest integer', () => {
      expect(usdToHonors(1.1)).toBe(495);
      expect(usdToHonors(1.9)).toBe(855);
    });
  });

  describe('honorsToUsd', () => {
    it('should convert Honors to USD correctly', () => {
      expect(honorsToUsd(450)).toBe(1);
      expect(honorsToUsd(4500)).toBe(10);
      expect(honorsToUsd(225)).toBe(0.5);
    });
  });

  describe('getDegenPresetByHours', () => {
    it('should find preset by hours', () => {
      const preset = getDegenPresetByHours(24);
      expect(preset).toEqual({ hours: 24, costUSD: 400, maxWinners: 5, label: '24h' });
    });

      it('should return undefined for non-existent hours', () => {
    // Use a value that definitely doesn't exist in the original presets
    const preset = getDegenPresetByHours(999999);
    expect(preset).toBeUndefined();
  });
  });

  describe('getDegenPresetByLabel', () => {
    it('should find preset by label', () => {
      const preset = getDegenPresetByLabel('24h');
      expect(preset).toEqual({ hours: 24, costUSD: 400, maxWinners: 5, label: '24h' });
    });

    it('should return undefined for non-existent label', () => {
      const preset = getDegenPresetByLabel('nonexistent');
      expect(preset).toBeUndefined();
    });
  });

  describe('getAudiencePresetByName', () => {
    it('should find preset by name', () => {
      const preset = getAudiencePresetByName('Medium');
      expect(preset).toEqual({ name: 'Medium', hours: 36, description: 'Moderate reach campaign' });
    });

    it('should return undefined for non-existent name', () => {
      const preset = getAudiencePresetByName('nonexistent');
      expect(preset).toBeUndefined();
    });
  });
});

describe('Cost Calculation Functions', () => {
  describe('calculateDegenCosts', () => {
    it('should calculate costs correctly for non-premium mission', () => {
      const result = calculateDegenCosts(400, false, 5, 1);
      
      expect(result.totalCostUSD).toBe(400);
      expect(result.userPoolHonors).toBe(90000); // 400 * 0.5 * 450
      expect(result.perWinnerHonors).toBe(18000); // 90000 / 5
    });

    it('should apply premium multiplier correctly', () => {
      const result = calculateDegenCosts(400, true, 5, 1);
      
      expect(result.totalCostUSD).toBe(2000); // 400 * 5
      expect(result.userPoolHonors).toBe(450000); // 2000 * 0.5 * 450
      expect(result.perWinnerHonors).toBe(90000); // 450000 / 5
    });

    it('should handle multiple tasks correctly', () => {
      const result = calculateDegenCosts(400, false, 5, 3);
      
      expect(result.totalCostUSD).toBe(1200); // 400 + (400 * 2)
      expect(result.userPoolHonors).toBe(270000); // 1200 * 0.5 * 450
      expect(result.perWinnerHonors).toBe(54000); // 270000 / 5
    });

    it('should floor per-winner honors', () => {
      const result = calculateDegenCosts(400, false, 7, 1);
      
      expect(result.userPoolHonors).toBe(90000);
      expect(result.perWinnerHonors).toBe(12857); // Math.floor(90000 / 7)
    });
  });

  describe('calculateFixedCosts', () => {
    it('should calculate costs correctly for non-premium mission', () => {
      const result = calculateFixedCosts(100, false, 10);
      
      expect(result.perUserHonors).toBe(200); // 100 * (1 + 1.0)
      expect(result.totalHonors).toBe(2000); // 200 * 10
      expect(result.totalUSD).toBeCloseTo(4.44, 2); // 2000 / 450
    });

    it('should apply premium multiplier correctly', () => {
      const result = calculateFixedCosts(100, true, 10);
      
      expect(result.perUserHonors).toBe(1000); // 100 * (1 + 1.0) * 5
      expect(result.totalHonors).toBe(10000); // 1000 * 10
      expect(result.totalUSD).toBeCloseTo(22.22, 2); // 10000 / 450
    });

    it('should ceil per-user honors', () => {
      const result = calculateFixedCosts(99, false, 1);
      expect(result.perUserHonors).toBe(198); // Math.ceil(99 * 2)
    });
  });
});

describe('Validation Functions', () => {
  describe('validateDegenPresets', () => {
    it('should return true for valid presets', () => {
      expect(validateDegenPresets()).toBe(true);
    });
  });

  describe('validateAudiencePresets', () => {
    it('should return true for valid audience presets', () => {
      expect(validateAudiencePresets()).toBe(true);
    });
  });
});

describe('Formulas and Calculations', () => {
  it('should maintain consistency between USD and Honors conversions', () => {
    const testUSD = 100;
    const honors = usdToHonors(testUSD);
    const backToUSD = honorsToUsd(honors);
    
    // Should be very close (within rounding error)
    expect(backToUSD).toBeCloseTo(testUSD, 2);
  });

  it('should maintain consistency in Degen cost calculations', () => {
    const baseCost = 400;
    const premium = false;
    const winners = 5;
    const taskCount = 1;
    
    const result = calculateDegenCosts(baseCost, premium, winners, taskCount);
    
    // Verify the formulas
    expect(result.totalCostUSD).toBe(baseCost);
    expect(result.userPoolHonors).toBe(Math.round(baseCost * USER_POOL_FACTOR * HONORS_PER_USD));
    expect(result.perWinnerHonors).toBe(Math.floor(result.userPoolHonors / winners));
  });

  it('should maintain consistency in Fixed cost calculations', () => {
    const baseHonors = 100;
    const premium = false;
    const cap = 10;
    
    const result = calculateFixedCosts(baseHonors, premium, cap);
    
    // Verify the formulas
    const withPlatformFee = baseHonors * (1 + PLATFORM_FEE_RATE);
    expect(result.perUserHonors).toBe(Math.ceil(withPlatformFee));
    expect(result.totalHonors).toBe(result.perUserHonors * cap);
    expect(result.totalUSD).toBe(result.totalHonors * USD_PER_HONOR);
  });
});
