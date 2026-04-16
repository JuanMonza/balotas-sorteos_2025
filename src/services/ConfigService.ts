/**
 * Servicio de configuración
 * Maneja la configuración del sorteo y sus cambios
 */

import {
  LotteryConfig,
  ElementSDK,
  Capabilities,
  GlobalWindow,
  Recolorable,
  FontEditable,
  FontSizeable,
} from '../models/types';
import { DEFAULT_CONFIG } from '../config/defaultConfig';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { ErrorMiddleware } from '../middlewares/ErrorMiddleware';

export class ConfigService {
  private elementSdk: ElementSDK | null = null;
  private currentConfig: LotteryConfig = { ...DEFAULT_CONFIG };

  constructor() {
    this.initializeSDK();
  }

  /**
   * Inicializa el SDK de elemento
   */
  private initializeSDK(): void {
    const globalWindow = window as unknown as GlobalWindow;
    if (globalWindow.elementSdk) {
      this.elementSdk = globalWindow.elementSdk;
      this.currentConfig = { ...this.elementSdk.config };
    }
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): LotteryConfig {
    return this.elementSdk ? this.elementSdk.config : this.currentConfig;
  }

  /**
   * Actualiza la configuración
   */
  setConfig(updates: Partial<LotteryConfig>): void {
    // Validar la configuración
    const validation = ValidationMiddleware.validateConfig(updates);
    if (!validation.isValid) {
      ErrorMiddleware.handleValidationError(validation.errors, 'ConfigService.setConfig');
      return;
    }

    this.currentConfig = { ...this.currentConfig, ...updates };

    if (this.elementSdk) {
      this.elementSdk.setConfig(updates);
    }
  }

  /**
   * Inicializa el SDK con callbacks y capacidades
   */
  initializeElementSDK(onConfigChange: (config: LotteryConfig) => Promise<void>): void {
    if (!this.elementSdk) {
      return;
    }

    this.elementSdk.init({
      defaultConfig: DEFAULT_CONFIG,
      onConfigChange,
      mapToCapabilities: this.mapToCapabilities.bind(this),
      mapToEditPanelValues: this.mapToEditPanelValues.bind(this),
    });
  }

  /**
   * Mapea la configuración a capacidades del editor
   */
  private mapToCapabilities(config: LotteryConfig): Capabilities {
    const createRecolorable = (
      colorKey: keyof Pick<
        LotteryConfig,
        | 'background_color'
        | 'text_color'
        | 'button_color'
        | 'winner_color'
        | 'no_winner_color'
      >,
    ): Recolorable => ({
      get: () => config[colorKey] || DEFAULT_CONFIG[colorKey],
      set: (value: string) => {
        config[colorKey] = value;
        this.setConfig({ [colorKey]: value });
      },
    });

    const recolorables: Recolorable[] = [
      createRecolorable('background_color'),
      createRecolorable('text_color'),
      createRecolorable('button_color'),
      createRecolorable('winner_color'),
      createRecolorable('no_winner_color'),
    ];

    const fontEditable: FontEditable = {
      get: () => config.font_family || DEFAULT_CONFIG.font_family,
      set: (value: string) => {
        config.font_family = value;
        this.setConfig({ font_family: value });
      },
    };

    const fontSizeable: FontSizeable = {
      get: () => config.font_size || DEFAULT_CONFIG.font_size,
      set: (value: number) => {
        config.font_size = value;
        this.setConfig({ font_size: value });
      },
    };

    return {
      recolorables,
      borderables: [],
      fontEditable,
      fontSizeable,
    };
  }

  /**
   * Mapea la configuración a valores del panel de edición
   */
  private mapToEditPanelValues(config: LotteryConfig): Map<string, string | number> {
    return new Map([
      ['title_text', config.title_text || DEFAULT_CONFIG.title_text],
      ['background_image_url', config.background_image_url || DEFAULT_CONFIG.background_image_url],
      ['button_text', config.button_text || DEFAULT_CONFIG.button_text],
      ['winner_label', config.winner_label || DEFAULT_CONFIG.winner_label],
      ['no_winner_label', config.no_winner_label || DEFAULT_CONFIG.no_winner_label],
      ['force_number', config.force_number || DEFAULT_CONFIG.force_number],
    ]);
  }

  /**
   * Obtiene un valor específico de la configuración
   */
  getConfigValue<K extends keyof LotteryConfig>(key: K): LotteryConfig[K] {
    const config = this.getConfig();
    return config[key] || DEFAULT_CONFIG[key];
  }
}
