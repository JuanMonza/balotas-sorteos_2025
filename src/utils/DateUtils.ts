/**
 * Utilidades para formateo de fechas
 */

export class DateUtils {
  /**
   * Formatea una fecha a formato español
   */
  static formatToSpanish(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Obtiene timestamp actual
   */
  static getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Convierte timestamp a fecha ISO
   */
  static timestampToISO(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  /**
   * Valida si una fecha es válida
   */
  static isValidDate(date: unknown): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
}
