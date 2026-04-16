/**
 * Controlador del historial
 * Maneja la visualización y renderizado del historial de sorteos
 */

import { LotteryRecord } from '../models/types';
import { DOMUtils } from '../utils/DOMUtils';
import { DateUtils } from '../utils/DateUtils';
import { ConfigService } from '../services/ConfigService';

export class HistoryController {
  private container: HTMLElement | null = null;
  private clearButton: HTMLButtonElement | null = null;

  constructor(
    private configService: ConfigService,
    private containerId: string = 'history-container',
  ) {
    this.initializeElements();
    this.attachEventListeners();
  }

  /**
   * Inicializa los elementos del DOM
   */
  private initializeElements(): void {
    this.container = DOMUtils.getElementById(this.containerId);
    this.clearButton = DOMUtils.getElementById<HTMLButtonElement>('clear-history-btn');
  }

  /**
   * Adjunta los event listeners
   */
  private attachEventListeners(): void {
    this.clearButton?.addEventListener('click', () => this.handleClearHistory());
  }

  /**
   * Renderiza el historial de sorteos
   */
  render(records: LotteryRecord[]): void {
    if (!this.container) {
      return;
    }

    if (records.length === 0) {
      this.renderEmptyState();
      return;
    }

    const sortedRecords = this.sortRecordsByTimestamp(records);
    const html = sortedRecords.map((record) => this.createRecordHTML(record)).join('');

    DOMUtils.setInnerHTML(this.container, html);
  }

  /**
   * Renderiza el estado vacío
   */
  private renderEmptyState(): void {
    const html = '<p class="text-center opacity-50" id="empty-message">No hay sorteos registrados</p>';
    DOMUtils.setInnerHTML(this.container, html);
  }

  /**
   * Ordena los registros por timestamp (más reciente primero)
   */
  private sortRecordsByTimestamp(records: LotteryRecord[]): LotteryRecord[] {
    return [...records].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Crea el HTML para un registro individual
   */
  private createRecordHTML(record: LotteryRecord): string {
    const date = new Date(record.fecha);
    const formattedDate = DateUtils.formatToSpanish(date);

    const config = this.configService.getConfig();
    const statusClass = record.es_ganador ? 'winner-item' : 'no-winner-item';
    const statusColor = record.es_ganador ? config.winner_color : config.no_winner_color;
    const statusText = record.es_ganador ? 'Ganador' : 'No Ganador';
    const nombreGanador = record.nombre_ganador ? `<div class="text-sm font-medium mt-1" style="color: rgba(255,255,255,0.85);">${record.nombre_ganador.toUpperCase()}</div>` : '';

    return `
      <div class="history-item ${statusClass}">
        <div class="flex justify-between items-start mb-1">
          <span class="text-2xl font-bold tracking-wide" style="color: rgba(255,255,255,0.95);">${this.formatNumber(record.numero_sorteo)}</span>
          <span class="text-xs opacity-60" style="font-size: 0.7rem;">${formattedDate}</span>
        </div>
        <div class="text-xs font-semibold" style="color: ${statusColor};">
          ${statusText}
        </div>
        ${nombreGanador}
      </div>
    `;
  }

  /**
   * Formatea el número de sorteo para mejor visualización
   */
  private formatNumber(number: string): string {
    return number;
  }

  /**
   * Actualiza un registro específico en el historial
   */
  updateRecord(_recordId: string, _updatedRecord: LotteryRecord): void {
    // Implementación futura si se necesita actualización individual
  }

  /**
   * Limpia el historial
   */
  clear(): void {
    this.renderEmptyState();
  }

  /**
   * Maneja la limpieza del historial
   */
  private handleClearHistory(): void {
    const confirmClear = confirm('¿Estás seguro de que quieres eliminar todos los registros del historial?');
    
    if (confirmClear) {
      // Limpiar localStorage
      localStorage.removeItem('sorteo_jardines_records');
      
      // Limpiar la vista
      this.clear();
      
      // Mostrar mensaje de confirmación temporal
      setTimeout(() => {
        alert('Historial limpiado correctamente');
      }, 100);
    }
  }

  /**
   * Agrega un nuevo registro al inicio del historial
   */
  prependRecord(record: LotteryRecord): void {
    if (!this.container) {
      return;
    }

    const recordHTML = this.createRecordHTML(record);
    const tempDiv = DOMUtils.createElement('div', { innerHTML: recordHTML });
    const firstChild = tempDiv.firstElementChild;

    if (firstChild && this.container.firstChild) {
      this.container.insertBefore(firstChild, this.container.firstChild);
    } else if (firstChild) {
      this.container.appendChild(firstChild);
    }

    // Remover mensaje vacío si existe
    const emptyMsg = this.container.querySelector('#empty-message');
    if (emptyMsg) {
      emptyMsg.remove();
    }
  }
}
