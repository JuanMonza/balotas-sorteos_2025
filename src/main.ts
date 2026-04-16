/**
 * Punto de entrada principal de la aplicación
 * Inicializa todos los servicios y controladores
 */

import { DataService } from './services/DataService';
import { ConfigService } from './services/ConfigService';
import { LotteryService } from './services/LotteryService';
import { ExcelService } from './services/ExcelService';
import { LotteryController } from './controllers/LotteryController';
import { HistoryController } from './controllers/HistoryController';
import { ExcelController } from './controllers/ExcelController';
import { LotteryRecord, LotteryConfig } from './models/types';
import { DOMUtils } from './utils/DOMUtils';
import { ColorUtils } from './utils/ColorUtils';
import { ErrorMiddleware } from './middlewares/ErrorMiddleware';

/**
 * Clase principal de la aplicación
 */
class App {
  private dataService: DataService;
  private configService: ConfigService;
  private lotteryService: LotteryService;
  private excelService: ExcelService;
  private historyController: HistoryController;
  private backgroundFileInput: HTMLInputElement | null = null;
  private backgroundStatusText: HTMLElement | null = null;

  constructor() {
    // Inicializar servicios
    this.dataService = new DataService();
    this.configService = new ConfigService();
    this.excelService = new ExcelService();
    this.lotteryService = new LotteryService(this.dataService, this.configService);

    // Inicializar controladores
    new LotteryController(this.lotteryService, this.configService, this.excelService);
    this.historyController = new HistoryController(this.configService);
    new ExcelController(this.excelService);

    this.initializeBackgroundUploader();
  }

  /**
   * Inicializa la aplicación
   */
  async init(): Promise<void> {
    try {
      // Inicializar Data SDK
      const dataInitialized = await this.dataService.init((data: LotteryRecord[]) => {
        this.handleDataChanged(data);
      });

      if (!dataInitialized) {
        // Data SDK no disponible
      }

      // Inicializar Element SDK con callback de configuración
      this.configService.initializeElementSDK((config: LotteryConfig) =>
        this.handleConfigChange(config),
      );

      // Aplicar configuración inicial
      await this.handleConfigChange(this.configService.getConfig());

      // Aplicación inicializada correctamente
    } catch (error) {
      ErrorMiddleware.handleError(
        error instanceof Error ? error : new Error('Error en inicialización'),
        'App.init',
      );
    }
  }

  /**
   * Maneja cambios en los datos
   */
  private handleDataChanged(data: LotteryRecord[]): void {
    this.lotteryService.updateRecordCount(data);
    this.historyController.render(data);
  }

  /**
   * Inicializa el manejador de carga de imagen de fondo
   */
  private initializeBackgroundUploader(): void {
    this.backgroundFileInput = DOMUtils.getElementById<HTMLInputElement>('background-file-input');
    this.backgroundStatusText = DOMUtils.getElementById('background-status-fixed');

    this.backgroundFileInput?.addEventListener('change', async (event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) {
        this.setBackgroundStatus('No se seleccionó ninguna imagen.', '#e74c3c');
        return;
      }

      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.setBackgroundStatus('Selecciona un archivo de imagen válido (jpg, png, webp).', '#e74c3c');
        return;
      }

      await this.applyUploadedBackground(file);
      this.setBackgroundStatus(`Fondo cargado: ${file.name}`, '#2ecc71');
      this.scrollToLotterySection();
    });
  }

  /**
   * Aplica la imagen de fondo cargada por el usuario
   */
  private async applyUploadedBackground(file: File): Promise<void> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('No se pudo leer la imagen'));        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    this.configService.setConfig({ background_image_url: dataUrl });
    await this.handleConfigChange(this.configService.getConfig());
  }

  /**
   * Desplaza la vista hacia la sección principal del sorteo
   */
  private scrollToLotterySection(): void {
    const drawSection = DOMUtils.getElementById('app-container');
    drawSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private setBackgroundStatus(message: string, color: string): void {
    if (!this.backgroundStatusText) return;
    DOMUtils.setTextContent(this.backgroundStatusText, message);
    DOMUtils.setStyles(this.backgroundStatusText, {
      color,
      opacity: '0.9',
    });
  }

  /**
   * Maneja cambios en la configuración
   */
  private async handleConfigChange(config: LotteryConfig): Promise<void> {
    try {
      this.updateUIStyles(config);
    } catch (error) {
      ErrorMiddleware.handleConfigError(error);
    }
  }

  /**
   * Actualiza los estilos de la interfaz
   */
  private updateUIStyles(config: LotteryConfig): void {
    const appContainer = DOMUtils.getElementById('app-container');
    const title = DOMUtils.getElementById('title');
    const startButton = DOMUtils.getElementById('start-button');
    const buttonTextSpan = DOMUtils.getElementById('button-text');
    const historyTitle = DOMUtils.getElementById('history-title');
    const instructionText = DOMUtils.getElementById('instruction-text');

    // Aplicar fondo
    this.applyBackground(appContainer, config);

    // Aplicar estilos de texto
    this.applyTextStyles(title, config, 3);
    this.applyTextStyles(historyTitle, config, 1.875);
    this.applyTextStyles(instructionText, config, 1.125);

    // Aplicar estilos de botón
    this.applyButtonStyles(startButton, buttonTextSpan, config);

    // Re-renderizar historial con nueva configuración
    const state = this.lotteryService.getState();
    this.historyController.render(state.allRecords);
  }

  /**
   * Aplica el fondo del contenedor
   */
  private applyBackground(element: HTMLElement | null, config: LotteryConfig): void {
    if (!element) return;

    if (config.background_image_url && config.background_image_url.trim() !== '') {
      DOMUtils.setStyles(element, {
        backgroundImage: `url('${config.background_image_url}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundColor: 'transparent',
      });
    } else {
      const backgroundColor = config.background_color;
      const darkerColor = ColorUtils.adjustColor(backgroundColor, -30);
      DOMUtils.setStyles(element, {
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${darkerColor} 100%)`,
        backgroundSize: 'auto',
        backgroundBlendMode: 'normal',
      });
    }
  }

  /**
   * Aplica estilos de texto
   */
  private applyTextStyles(
    element: HTMLElement | null,
    config: LotteryConfig,
    fontSizeMultiplier: number,
  ): void {
    if (!element) return;

    DOMUtils.setStyles(element, {
      color: config.text_color,
      fontFamily: `${config.font_family}, sans-serif`,
      fontSize: `${config.font_size * fontSizeMultiplier}px`,
    });

    // Actualizar texto si es el título
    if (element.id === 'title') {
      DOMUtils.setTextContent(element, config.title_text);
    }
  }

  /**
   * Aplica estilos del botón
   */
  private applyButtonStyles(
    button: HTMLElement | null,
    buttonText: HTMLElement | null,
    config: LotteryConfig,
  ): void {
    if (!button) return;

    DOMUtils.setStyles(button, {
      backgroundColor: config.button_color,
      color: config.text_color,
      fontFamily: `${config.font_family}, sans-serif`,
      fontSize: `${config.font_size * 1.25}px`,
    });

    if (buttonText) {
      DOMUtils.setTextContent(buttonText, config.button_text);
    }
  }
}

/**
 * Inicializar la aplicación cuando el DOM esté listo
 */
function initApp() {
  const app = new App();
  app.init();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM ya está listo
  initApp();
}

// Exportar para uso global si es necesario
declare global {
  interface Window {
    App: typeof App;
  }
}
window.App = App;
