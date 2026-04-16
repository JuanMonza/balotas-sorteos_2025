/**
 * Controlador para manejo de archivos Excel
 */

import { ExcelService } from '../services/ExcelService';
import { DOMUtils } from '../utils/DOMUtils';

export class ExcelController {
  private statusText: HTMLElement | null = null;
  private statusTextFixed: HTMLElement | null = null;
  private fileInput: HTMLInputElement | null = null;

  constructor(private excelService: ExcelService) {
    this.initializeElements();
    this.attachEventListeners();
    this.loadDatabase();
  }

  /**
   * Inicializa los elementos del DOM
   */
  private initializeElements(): void {
    this.statusText = DOMUtils.getElementById('excel-status');
    this.statusTextFixed = DOMUtils.getElementById('excel-status-fixed');
    this.fileInput = DOMUtils.getElementById<HTMLInputElement>('excel-file-input');
  }

  /**
   * Adjunta los event listeners
   */
  private attachEventListeners(): void {
    this.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
  }

  /**
   * Maneja la selección de archivo
   */
  private async handleFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.showStatus('Leyendo archivo Excel...', '#3498db');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await this.excelService.loadFromArrayBuffer(arrayBuffer);

      if (result.success) {
        this.showStatus(`Datos cargados`, '#2ecc71');
      } else {
        this.showStatus(`${result.message}`, '#e74c3c');
      }
    } catch (error) {
      this.showStatus(`Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`, '#e74c3c');
    }

    // Limpiar el input para permitir recargar el mismo archivo
    input.value = '';
  }

  /**
   * Carga automáticamente la base de datos
   */
  private async loadDatabase(): Promise<void> {
    this.showStatus('Cargando base de datos...', '#3498db');

    const result = await this.excelService.autoLoadDatabase();

    if (result.success) {
      this.showStatus(`Datos cargados`, '#2ecc71');
    } else {
      this.showStatus(`${result.message}`, '#e67e22');
    }
  }

  /**
   * Muestra un mensaje de estado
   */
  private showStatus(message: string, color: string): void {
    if (this.statusText) {
      DOMUtils.setTextContent(this.statusText, message);
      DOMUtils.setStyles(this.statusText, { color });
    }
    if (this.statusTextFixed) {
      DOMUtils.setTextContent(this.statusTextFixed, message);
      DOMUtils.setStyles(this.statusTextFixed, { color });
    }
  }
}
