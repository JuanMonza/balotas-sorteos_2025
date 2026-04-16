import { describe, expect, it } from 'vitest';
import { ValidationMiddleware } from './ValidationMiddleware';

describe('ValidationMiddleware', () => {
  it('should validate lottery numbers correctly', () => {
    expect(ValidationMiddleware.validateLotteryNumber('A123')).toBe(true);
    expect(ValidationMiddleware.validateLotteryNumber('')).toBe(false);
    expect(ValidationMiddleware.validateLotteryNumber('A-123')).toBe(false);
  });

  it('should validate a correct lottery record', () => {
    const result = ValidationMiddleware.validateLotteryRecord({
      numero_sorteo: '123ABC',
      es_ganador: true,
      fecha: '2026-04-16',
      timestamp: Date.now(),
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect invalid config values', () => {
    const result = ValidationMiddleware.validateConfig({
      background_color: 'not-a-color',
      font_size: 100,
      force_number: '12345678901',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('background_color'),
        expect.stringContaining('tamaño de fuente'),
        expect.stringContaining('número forzado'),
      ]),
    );
  });

  it('should sanitize text by removing HTML tags', () => {
    expect(ValidationMiddleware.sanitizeText('<b>Hola</b>')).toBe('Hola');
  });

  it('should validate image URLs correctly', () => {
    expect(ValidationMiddleware.validateImageUrl('https://example.com/image.jpg')).toBe(true);
    expect(ValidationMiddleware.validateImageUrl('not-a-url')).toBe(false);
  });
});
