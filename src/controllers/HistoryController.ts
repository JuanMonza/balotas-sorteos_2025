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
    this.clearButton?.addEventListener('click', () => void this.handleClearHistory());
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
  private async handleClearHistory(): Promise<void> {
    const confirmClear = await this.showClearConfirmation();

    if (!confirmClear) {
      return;
    }

    localStorage.removeItem('sorteo_jardines_records');
    this.clear();
    this.showHistoryToast('Historial limpiado correctamente');
  }

  /**
   * Muestra confirmación estilizada antes de borrar el historial
   */
  private showClearConfirmation(): Promise<boolean> {
    return new Promise((resolve) => {
      document.querySelector('.history-dialog-backdrop')?.remove();

      const backdrop = DOMUtils.createElement('div', {
        className: 'history-dialog-backdrop',
        innerHTML: `
          <div class="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-dialog-title">
            <div class="history-dialog-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </div>
            <h3 id="history-dialog-title">Limpiar historial</h3>
            <p>Esta acción eliminará todos los registros guardados del historial.</p>
            <div class="history-dialog-actions">
              <button type="button" class="history-dialog-btn secondary" data-action="cancel">Cancelar</button>
              <button type="button" class="history-dialog-btn danger" data-action="confirm">Sí, limpiar</button>
            </div>
          </div>
        `,
      });

      document.body.appendChild(backdrop);

      const cancelButton = backdrop.querySelector<HTMLButtonElement>('[data-action="cancel"]');
      const confirmButton = backdrop.querySelector<HTMLButtonElement>('[data-action="confirm"]');

      const close = (result: boolean) => {
        document.removeEventListener('keydown', handleEscape);
        backdrop.classList.add('closing');
        setTimeout(() => {
          backdrop.remove();
          resolve(result);
        }, 160);
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          close(false);
        }
      };

      cancelButton?.addEventListener('click', () => close(false));
      confirmButton?.addEventListener('click', () => close(true));
      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) {
          close(false);
        }
      });
      document.addEventListener('keydown', handleEscape);
      confirmButton?.focus();
    });
  }

  /**
   * Muestra aviso temporal estilizado
   */
  private showHistoryToast(message: string): void {
    document.querySelector('.history-toast')?.remove();

    const toast = DOMUtils.createElement('div', {
      className: 'history-toast',
      innerHTML: `
        <span class="history-toast-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
        </span>
        <span>${message}</span>
      `,
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 220);
    }, 2600);
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
