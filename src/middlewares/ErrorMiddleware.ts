/**
 * Middleware de manejo de errores
 * Centraliza el manejo de errores y logging
 */

export class ErrorMiddleware {
  private static errorLog: Array<{ timestamp: number; error: Error; context: string }> = [];

  /**
   * Maneja errores de manera centralizada
   */
  static handleError(error: Error, context: string = 'Unknown'): void {
    const errorEntry = {
      timestamp: Date.now(),
      error,
      context,
    };

    this.errorLog.push(errorEntry);

    // Limitar el log a los últimos 100 errores
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // Log en consola para debugging (descomentar si es necesario)
    // console.error(`[${context}] Error:`, error);
  }

  /**
   * Maneja errores de SDK de datos
   */
  static handleDataSDKError(error: unknown, operation: string): string {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    this.handleError(
      new Error(`Error en operación de datos: ${operation} - ${errorMessage}`),
      'DataSDK',
    );
    return errorMessage;
  }

  /**
   * Maneja errores de validación
   */
  static handleValidationError(errors: string[], context: string): void {
    const errorMessage = `Errores de validación: ${errors.join(', ')}`;
    this.handleError(new Error(errorMessage), context);
  }

  /**
   * Maneja errores de configuración
   */
  static handleConfigError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Error de configuración';
    this.handleError(new Error(errorMessage), 'ConfigService');
  }

  /**
   * Maneja errores del sorteo
   */
  static handleLotteryError(error: unknown, phase: string): string {
    const errorMessage = error instanceof Error ? error.message : 'Error en el sorteo';
    this.handleError(new Error(`Error en fase ${phase}: ${errorMessage}`), 'LotteryService');
    return `Error durante ${phase}`;
  }

  /**
   * Obtiene el log de errores
   */
  static getErrorLog(): Array<{ timestamp: number; error: Error; context: string }> {
    return [...this.errorLog];
  }

  /**
   * Limpia el log de errores
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Crea mensaje de error amigable para el usuario
   */
  static createUserFriendlyMessage(error: unknown): string {
    if (error instanceof Error) {
      // Mapear errores técnicos a mensajes amigables
      if (error.message.includes('network')) {
        return 'Error de conexión. Por favor verifica tu conexión a internet.';
      }
      if (error.message.includes('timeout')) {
        return 'La operación tardó demasiado. Por favor intenta nuevamente.';
      }
      if (error.message.includes('validation')) {
        return 'Los datos ingresados no son válidos. Por favor verifica.';
      }
      return 'Ha ocurrido un error. Por favor intenta nuevamente.';
    }
    return 'Error desconocido. Por favor contacta al soporte.';
  }

  /**
   * Wrapper para operaciones asíncronas con manejo de errores
   */
  static async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    onError?: (error: Error) => void,
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.handleError(err, context);
      if (onError) {
        onError(err);
      }
      return null;
    }
  }
}
