/**
 * Tipos y modelos para el sistema de sorteo
 */

/**
 * Configuración del sorteo
 */
export interface LotteryConfig {
  background_color: string;
  ball_color: string;
  text_color: string;
  button_color: string;
  winner_color: string;
  no_winner_color: string;
  font_family: string;
  font_size: number;
  title_text: string;
  background_image_url: string;
  button_text: string;
  winner_label: string;
  no_winner_label: string;
  force_number: string;
}

/**
 * Registro de sorteo en la base de datos
 */
export interface LotteryRecord {
  id?: string;
  numero_sorteo: string;
  fecha: string;
  es_ganador: boolean;
  nombre_ganador?: string;
  timestamp: number;
}

/**
 * Resultado de operación con SDK de datos
 */
export interface DataResult<T = unknown> {
  isOk: boolean;
  data?: T;
  error?: string;
}

/**
 * Estado del sorteo
 */
export interface LotteryState {
  isRunning: boolean;
  currentRecordCount: number;
  allRecords: LotteryRecord[];
}

/**
 * Número de balota
 */
export interface BallNumber {
  index: number;
  value: number;
  maxRange: number;
}

/**
 * Resultado del sorteo
 */
export interface LotteryResult {
  number: string;
  isWinner: boolean;
  timestamp: number;
}

/**
 * Capacidades de recolor
 */
export interface Recolorable {
  get: () => string;
  set: (value: string) => void;
}

/**
 * Capacidades de fuente
 */
export interface FontEditable {
  get: () => string;
  set: (value: string) => void;
}

/**
 * Capacidades de tamaño de fuente
 */
export interface FontSizeable {
  get: () => number;
  set: (value: number) => void;
}

/**
 * Capacidades del elemento
 */
export interface Capabilities {
  recolorables: Recolorable[];
  borderables: unknown[];
  fontEditable: FontEditable;
  fontSizeable: FontSizeable;
}

/**
 * SDK de datos
 */
export interface DataSDK {
  init: (handler: DataHandler) => Promise<DataResult>;
  create: (record: Omit<LotteryRecord, 'id'>) => Promise<DataResult<LotteryRecord>>;
  read: () => Promise<DataResult<LotteryRecord[]>>;
  update: (id: string, record: Partial<LotteryRecord>) => Promise<DataResult<LotteryRecord>>;
  delete: (id: string) => Promise<DataResult>;
}

/**
 * Manejador de cambios de datos
 */
export interface DataHandler {
  onDataChanged: (data: LotteryRecord[]) => void;
}

/**
 * SDK de elemento
 */
export interface ElementSDK {
  config: LotteryConfig;
  init: (options: ElementInitOptions) => void;
  setConfig: (config: Partial<LotteryConfig>) => void;
}

/**
 * Opciones de inicialización del elemento
 */
export interface ElementInitOptions {
  defaultConfig: LotteryConfig;
  onConfigChange: (config: LotteryConfig) => Promise<void>;
  mapToCapabilities: (config: LotteryConfig) => Capabilities;
  mapToEditPanelValues: (config: LotteryConfig) => Map<string, string | number>;
}

/**
 * Ventana global extendida
 */
export interface GlobalWindow extends Window {
  dataSdk?: DataSDK;
  elementSdk?: ElementSDK;
}

/**
 * Constantes del sistema
 */
export const CONSTANTS = {
  MAX_RECORDS: 999,
  BALL_RANGES: [1, 9, 9, 9, 9, 9, 9, 9, 9, 9] as const,
  SPIN_INTERVAL: 50,
  STOP_TIMES: [5000, 8000, 11000, 14000, 17000, 20000, 23000, 26000, 29000, 32000] as const,
  ANIMATION_DURATION: 3000,
  RESULT_DISPLAY_DURATION: 5000,
} as const;
