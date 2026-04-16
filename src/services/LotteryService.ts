/**
 * Servicio del sorteo
 * Maneja la lógica principal del sorteo de balotas
 */

import { LotteryRecord, LotteryState, CONSTANTS } from '../models/types';
import { DataService } from './DataService';
import { ConfigService } from './ConfigService';
import { RandomUtils } from '../utils/RandomUtils';
import { DateUtils } from '../utils/DateUtils';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { ErrorMiddleware } from '../middlewares/ErrorMiddleware';

export class LotteryService {
  private state: LotteryState = {
    isRunning: false,
    currentRecordCount: 0,
    allRecords: [],
  };

  private intervals: NodeJS.Timeout[] = [];

  constructor(
    private dataService: DataService,
    private configService: ConfigService,
  ) {}

  /**
   * Obtiene el estado actual del sorteo
   */
  getState(): LotteryState {
    return { ...this.state };
  }

  /**
   * Actualiza el conteo de registros
   */
  updateRecordCount(records: LotteryRecord[]): void {
    this.state.currentRecordCount = records.length;
    this.state.allRecords = records;
  }

  /**
   * Verifica si se puede iniciar un sorteo
   */
  canStartLottery(): { canStart: boolean; reason?: string } {
    if (this.state.isRunning) {
      return { canStart: false, reason: 'Ya hay un sorteo en curso' };
    }

    if (!ValidationMiddleware.validateRecordLimit(this.state.currentRecordCount, CONSTANTS.MAX_RECORDS)) {
      return {
        canStart: false,
        reason: 'Límite de 999 sorteos alcanzado. Por favor elimina algunos registros.',
      };
    }

    return { canStart: true };
  }

  /**
   * Genera números para el sorteo
   */
  generateLotteryNumbers(): number[] {
    const config = this.configService.getConfig();
    const forceNumber = config.force_number?.trim();

    // Verificar si hay un número forzado válido
    if (forceNumber && ValidationMiddleware.validateLotteryNumber(forceNumber)) {
      return RandomUtils.parseNumberString(forceNumber);
    }

    // Generar números aleatorios
    return RandomUtils.generateRandomNumbers(CONSTANTS.BALL_RANGES);
  }

  /**
   * Inicia el sorteo
   */
  async startLottery(
    onNumbersGenerated: (numbers: number[]) => void,
    onComplete: (drawnNumber: string) => void,
  ): Promise<void> {
    const canStartCheck = this.canStartLottery();
    if (!canStartCheck.canStart) {
      throw new Error(canStartCheck.reason);
    }

    this.state.isRunning = true;

    try {
      // Generar números finales
      const finalNumbers = this.generateLotteryNumbers();
      onNumbersGenerated(finalNumbers);

      // El controlador manejará la animación y luego llamará a onComplete
      const drawnNumber = finalNumbers.join('');
      
      // Programar la finalización después de las animaciones
      setTimeout(() => {
        onComplete(drawnNumber);
      }, CONSTANTS.STOP_TIMES[CONSTANTS.STOP_TIMES.length - 1] + 3000);
    } catch (error) {
      this.state.isRunning = false;
      ErrorMiddleware.handleLotteryError(error, 'startLottery');
      throw error;
    }
  }

  /**
   * Guarda el resultado del sorteo
   */
  async saveResult(drawnNumber: string, isWinner: boolean, nombreGanador?: string): Promise<boolean> {
    try {
      const record: Omit<LotteryRecord, 'id'> = {
        numero_sorteo: drawnNumber,
        fecha: new Date().toISOString(),
        es_ganador: isWinner,
        nombre_ganador: nombreGanador,
        timestamp: DateUtils.getCurrentTimestamp(),
      };

      const result = await this.dataService.createRecord(record);

      if (!result.isOk) {
        ErrorMiddleware.handleError(
          new Error(result.error || 'Error al guardar resultado'),
          'LotteryService.saveResult',
        );
        return false;
      }

      return true;
    } catch (error) {
      ErrorMiddleware.handleLotteryError(error, 'saveResult');
      return false;
    }
  }

  /**
   * Finaliza el sorteo
   */
  finalizeLottery(): void {
    this.clearIntervals();
    this.state.isRunning = false;
  }

  /**
   * Limpia todos los intervalos activos
   */
  private clearIntervals(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
  }

  /**
   * Agrega un intervalo al seguimiento
   */
  addInterval(interval: NodeJS.Timeout): void {
    this.intervals.push(interval);
  }

  /**
   * Valida números generados
   */
  validateGeneratedNumbers(numbers: number[]): boolean {
    return RandomUtils.validateNumbersInRange(numbers, CONSTANTS.BALL_RANGES);
  }
}
