import { describe, expect, it } from 'vitest';
import { RandomUtils } from './RandomUtils';

describe('RandomUtils', () => {
  it('should parse a numeric string into an array of numbers', () => {
    expect(RandomUtils.parseNumberString('123456')).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should validate numbers within range', () => {
    expect(RandomUtils.validateNumbersInRange([1, 2, 3], [2, 2, 3])).toBe(true);
    expect(RandomUtils.validateNumbersInRange([1, 4, 3], [2, 2, 3])).toBe(false);
  });

  it('should generate a random number within the provided maximum', () => {
    const value = RandomUtils.getRandomNumber(5);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(5);
  });
});
