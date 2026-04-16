/**
 * Configuración por defecto del sistema
 */

import { LotteryConfig } from '../models/types';

export const DEFAULT_CONFIG: LotteryConfig = {
  background_color: '#0a3d2e',
  ball_color: '#ffd700',
  text_color: '#ffffff',
  button_color: '#2ecc71',
  winner_color: '#2ecc71',
  no_winner_color: '#e74c3c',
  font_family: 'system-ui',
  font_size: 16,
  title_text: '',
  background_image_url: './public/FONDO_SORETO_FEB_2026.jpg',
  button_text: 'INICIAR SORTEO',
  winner_label: '¡GANADOR!',
  no_winner_label: 'No Ganador',
  force_number: '',
};
