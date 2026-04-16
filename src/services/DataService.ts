/**
 * Servicio de manejo de datos
 * Conecta con el SDK de datos y maneja operaciones CRUD
 */

import { DataSDK, DataHandler, LotteryRecord, DataResult, GlobalWindow } from '../models/types';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { ErrorMiddleware } from '../middlewares/ErrorMiddleware';

export class DataService {
  private dataSdk: DataSDK | null = null;
  private dataHandler: DataHandler | null = null;
  private readonly STORAGE_KEY = 'sorteo_jardines_records';

  constructor() {
    this.initializeSDK();
  }

  /**
   * Inicializa el SDK de datos
   */
  private initializeSDK(): void {
    const globalWindow = window as unknown as GlobalWindow;
    if (globalWindow.dataSdk) {
      this.dataSdk = globalWindow.dataSdk;
    } else {
      ErrorMiddleware.handleError(new Error('DataSDK no disponible'), 'DataService');
    }
  }

  /**
   * Inicializa el servicio con un manejador de datos
   */
  async init(onDataChanged: (data: LotteryRecord[]) => void): Promise<boolean> {
    this.dataHandler = { onDataChanged };

    if (!this.dataSdk) {
      // Usar localStorage como fallback
      const records = this.getRecordsFromLocalStorage();
      onDataChanged(records);
      return true;
    }

    const result = await ErrorMiddleware.executeWithErrorHandling(
      () => this.dataSdk!.init(this.dataHandler!),
      'DataService.init',
    );

    return result?.isOk ?? false;
  }

  /**
   * Crea un nuevo registro de sorteo
   */
  async createRecord(record: Omit<LotteryRecord, 'id'>): Promise<DataResult<LotteryRecord>> {
    // Validar el registro antes de crear
    const validation = ValidationMiddleware.validateLotteryRecord(record);
    if (!validation.isValid) {
      ErrorMiddleware.handleValidationError(validation.errors, 'DataService.createRecord');
      return {
        isOk: false,
        error: validation.errors.join(', '),
      };
    }

    // Si DataSDK no está disponible, usar localStorage
    if (!this.dataSdk) {
      return this.createRecordWithLocalStorage(record);
    }

    try {
      const result = await this.dataSdk.create(record);
      if (!result.isOk) {
        ErrorMiddleware.handleDataSDKError(result.error || 'Error al crear registro', 'create');
      }
      return result;
    } catch (error) {
      const errorMessage = ErrorMiddleware.handleDataSDKError(error, 'create');
      return {
        isOk: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Lee todos los registros
   */
  async readRecords(): Promise<DataResult<LotteryRecord[]>> {
    if (!this.dataSdk) {
      // Usar localStorage como fallback
      return {
        isOk: true,
        data: this.getRecordsFromLocalStorage(),
      };
    }

    try {
      return await this.dataSdk.read();
    } catch (error) {
      const errorMessage = ErrorMiddleware.handleDataSDKError(error, 'read');
      return {
        isOk: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Actualiza un registro existente
   */
  async updateRecord(
    id: string,
    updates: Partial<LotteryRecord>,
  ): Promise<DataResult<LotteryRecord>> {
    if (!this.dataSdk) {
      return {
        isOk: false,
        error: 'DataSDK no disponible',
      };
    }

    try {
      return await this.dataSdk.update(id, updates);
    } catch (error) {
      const errorMessage = ErrorMiddleware.handleDataSDKError(error, 'update');
      return {
        isOk: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Crea un registro usando localStorage como fallback
   */
  private createRecordWithLocalStorage(record: Omit<LotteryRecord, 'id'>): DataResult<LotteryRecord> {
    try {
      const records = this.getRecordsFromLocalStorage();
      const newRecord: LotteryRecord = {
        ...record,
        id: Date.now().toString(),
      };
      records.unshift(newRecord); // Agregar al inicio
      
      // Limitar a solo 5 registros más recientes
      const limitedRecords = records.slice(0, 5);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedRecords));
      
      // Notificar cambios si hay un handler
      if (this.dataHandler) {
        this.dataHandler.onDataChanged(limitedRecords);
      }
      
      return {
        isOk: true,
        data: newRecord,
      };
    } catch (error) {
      return {
        isOk: false,
        error: 'Error al guardar en localStorage',
      };
    }
  }

  /**
   * Obtiene registros desde localStorage
   */
  private getRecordsFromLocalStorage(): LotteryRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const records = stored ? JSON.parse(stored) : [];
      // Limitar a solo 5 registros más recientes
      return records.slice(0, 5);
    } catch (error) {
      return [];
    }
  }

  /**
   * Elimina un registro
   */
  async deleteRecord(id: string): Promise<DataResult> {
    if (!this.dataSdk) {
      return {
        isOk: false,
        error: 'DataSDK no disponible',
      };
    }

    try {
      return await this.dataSdk.delete(id);
    } catch (error) {
      const errorMessage = ErrorMiddleware.handleDataSDKError(error, 'delete');
      return {
        isOk: false,
        error: errorMessage,
      };
    }
  }
}
