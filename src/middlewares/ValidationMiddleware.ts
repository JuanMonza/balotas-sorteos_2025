/**
 * Middleware de validación
 * Valida datos y parámetros antes de procesarlos
 */

import { LotteryRecord, LotteryConfig } from '../models/types';

export class ValidationMiddleware {
  /**
   * Valida que un número de sorteo tenga el formato correcto
   * Acepta números y letras (IDs alfanuméricos)
   */
  static validateLotteryNumber(number: string): boolean {
    if (!number || typeof number !== 'string') {
      return false;
    }
    // Aceptar cualquier combinación de letras y números, de 1 a 10 caracteres
    return /^[A-Za-z0-9]{1,10}$/.test(number.trim());
  }

  /**
   * Valida un registro de sorteo completo
   */
  static validateLotteryRecord(
    record: Partial<LotteryRecord>,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!record.numero_sorteo) {
      errors.push('El número de sorteo es requerido');
    } else if (!this.validateLotteryNumber(record.numero_sorteo)) {
      errors.push('El número de sorteo debe contener solo letras y números (1-10 caracteres)');
    }

    if (record.es_ganador === undefined || record.es_ganador === null) {
      errors.push('El estado de ganador es requerido');
    }

    if (!record.fecha) {
      errors.push('La fecha es requerida');
    }

    if (!record.timestamp || typeof record.timestamp !== 'number') {
      errors.push('El timestamp es requerido');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida la configuración del sorteo
   */
  static validateConfig(config: Partial<LotteryConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar colores (formato hexadecimal)
    const colorFields = [
      'background_color',
      'ball_color',
      'text_color',
      'button_color',
      'winner_color',
      'no_winner_color',
    ];

    colorFields.forEach((field) => {
      const value = config[field as keyof LotteryConfig];
      if (value && typeof value === 'string' && !this.validateHexColor(value)) {
        errors.push(`El campo ${field} debe ser un color hexadecimal válido`);
      }
    });

    // Validar tamaño de fuente
    if (config.font_size && (config.font_size < 8 || config.font_size > 72)) {
      errors.push('El tamaño de fuente debe estar entre 8 y 72');
    }

    // Validar número forzado si existe
    if (
      config.force_number &&
      config.force_number.trim() !== '' &&
      !this.validateLotteryNumber(config.force_number)
    ) {
      errors.push('El número forzado debe ser alfanumérico (1-10 caracteres) o estar vacío');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida formato de color hexadecimal
   */
  private static validateHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Valida URL de imagen
   */
  static validateImageUrl(url: string): boolean {
    if (!url || url.trim() === '') {
      return true; // URL vacía es válida
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitiza entrada de texto
   */
  static sanitizeText(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .replace(/<[^>]*>/g, '')
      .replace(/</g, '')
      .replace(/>/g, '');
  }

  /**
   * Valida límite de registros
   */
  static validateRecordLimit(currentCount: number, maxRecords: number): boolean {
    return currentCount < maxRecords;
  }
}
