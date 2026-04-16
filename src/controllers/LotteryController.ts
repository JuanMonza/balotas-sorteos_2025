/**
 * Controlador del sorteo
 * Maneja la interfaz y animaciones del sorteo
 */

import { CONSTANTS } from '../models/types';
import { LotteryService } from '../services/LotteryService';
import { ConfigService } from '../services/ConfigService';
import { ExcelService, ExcelRecord } from '../services/ExcelService';
import { DOMUtils } from '../utils/DOMUtils';
import { RandomUtils } from '../utils/RandomUtils';
import { ErrorMiddleware } from '../middlewares/ErrorMiddleware';

export class LotteryController {
  private balls: NodeListOf<HTMLElement> | null = null;
  private startButton: HTMLButtonElement | null = null;
  private buttonText: HTMLElement | null = null;
  private resultMessage: HTMLElement | null = null;
  private winnerInfo: HTMLElement | null = null;
  private winnerName: HTMLElement | null = null;
  private winnerDetails: HTMLElement | null = null;
  private ballIntervals: Map<number, NodeJS.Timeout> = new Map();

  constructor(
    private lotteryService: LotteryService,
    private configService: ConfigService,
    private excelService: ExcelService,
  ) {
    this.initializeElements();
    this.attachEventListeners();
  }

  /**
   * Inicializa los elementos del DOM
   */
  private initializeElements(): void {
    this.balls = DOMUtils.querySelectorAll('.ball');
    this.startButton = DOMUtils.getElementById<HTMLButtonElement>('start-button');
    this.buttonText = DOMUtils.getElementById('button-text');
    this.resultMessage = DOMUtils.getElementById('result-message');
    this.winnerInfo = DOMUtils.getElementById('winner-info');
    this.winnerName = DOMUtils.getElementById('winner-name');
    this.winnerDetails = DOMUtils.getElementById('winner-details');
  }

  /**
   * Adjunta los event listeners
   */
  private attachEventListeners(): void {
    this.startButton?.addEventListener('click', () => this.handleStartClick());
  }

  /**
   * Maneja el click en el botón de inicio
   */
  private async handleStartClick(): Promise<void> {
    try {
      // Verificar que hay datos del Excel
      if (!this.excelService.isDataLoaded()) {
        this.showResultMessage('Esperando base de datos...', '#e67e22');
        return;
      }

      const canStartCheck = this.lotteryService.canStartLottery();
      if (!canStartCheck.canStart) {
        this.showResultMessage(canStartCheck.reason!, '#e74c3c');
        return;
      }

      // Obtener ganador aleatorio del Excel
      const winner = this.excelService.getRandomWinner();
      if (!winner) {
        this.showResultMessage('No hay participantes en la base de datos', '#e74c3c');
        return;
      }

      this.disableButton();
      this.clearResultMessage();
      this.hideWinnerInfo();

      // Convertir número del ganador a array de dígitos
      const winnerDigits = this.convertNumberToDigits(winner.numero);

      await this.lotteryService.startLottery(
        () => this.handleNumbersGenerated(winnerDigits),
        () => this.handleLotteryComplete(winner.numero, winner.record),
      );
    } catch (error) {
      const message = ErrorMiddleware.createUserFriendlyMessage(error);
      this.showResultMessage(message, '#e74c3c');
      this.enableButton();
    }
  }

  /**
   * Convierte un número/ID string a array de caracteres (letras y números)
   * Soporta IDs alfanuméricos como "A123", "BC456", etc.
   */
  private convertNumberToDigits(numero: string): (number | string)[] {
    // Limpiar el ID (remover espacios)
    const cleanId = numero.trim().toUpperCase();
    
    // Separar en caracteres individuales
    const chars = cleanId.split('');
    
    // Si tiene menos de 10 caracteres, rellenar con ceros a la izquierda
    while (chars.length < 10) {
      chars.unshift('0');
    }
    
    // Si tiene más de 10 caracteres, tomar los últimos 10
    if (chars.length > 10) {
      return chars.slice(-10);
    }
    
    // Convertir números string a números, mantener letras como string
    return chars.map(char => {
      const num = parseInt(char, 10);
      return isNaN(num) ? char : num;
    });
  }

  /**
   * Maneja los valores generados (números y/o letras)
   */
  private handleNumbersGenerated(values: (number | string)[]): void {
    this.startBallAnimations(values);
  }

  /**
   * Inicia las animaciones de las balotas
   */
  private startBallAnimations(finalValues: (number | string)[]): void {
    if (!this.balls) return;

    // Limpiar intervalos previos
    this.clearBallIntervals();

    // Iniciar el giro de todas las balotas
    this.balls.forEach((ball, index) => {
      const interval = this.spinBall(ball, index);
      this.ballIntervals.set(index, interval);
    });

    // Programar la detención de cada balota
    CONSTANTS.STOP_TIMES.forEach((time, index) => {
      setTimeout(() => {
        const ballIndex = 9 - index; // Detener de derecha a izquierda (índice 9 a 0)
        if (this.balls && this.balls[ballIndex]) {
          this.stopBall(this.balls[ballIndex], finalValues[ballIndex], ballIndex);
        }
      }, time);
    });
  }

  /**
   * Gira una balota mostrando números o letras aleatorias
   */
  private spinBall(ballElement: HTMLElement, ballIndex: number): NodeJS.Timeout {
    const numberElement = ballElement.querySelector('.ball-number');
    const maxNumber = CONSTANTS.BALL_RANGES[ballIndex];

    // Letras posibles (A-Z)
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const interval = setInterval(() => {
      if (numberElement) {
        // Alternar entre números y letras aleatoriamente durante el giro
        if (Math.random() > 0.5) {
          numberElement.textContent = RandomUtils.getRandomNumber(maxNumber).toString();
        } else {
          const randomLetter = letters[Math.floor(Math.random() * letters.length)];
          numberElement.textContent = randomLetter;
        }
      }
    }, CONSTANTS.SPIN_INTERVAL);

    DOMUtils.addClass(ballElement, 'spinning');
    return interval;
  }

  /**
   * Detiene una balota en un número o letra específica
   */
  private stopBall(ballElement: HTMLElement, finalValue: number | string, ballIndex: number): void {
    // Limpiar el intervalo de esta balota
    const interval = this.ballIntervals.get(ballIndex);
    if (interval) {
      clearInterval(interval);
      this.ballIntervals.delete(ballIndex);
    }

    DOMUtils.removeClass(ballElement, 'spinning');
    DOMUtils.addClass(ballElement, 'stopped');

    const numberElement = ballElement.querySelector('.ball-number');
    if (numberElement) {
      // Mostrar número o letra
      numberElement.textContent = finalValue.toString();
    }

    setTimeout(() => {
      DOMUtils.removeClass(ballElement, 'stopped');
    }, CONSTANTS.ANIMATION_DURATION);
  }

  /**
   * Maneja la finalización del sorteo
   */
  private async handleLotteryComplete(drawnNumber: string, winnerRecord: ExcelRecord): Promise<void> {
    const config = this.configService.getConfig();

    // Mostrar información del ganador
    this.showWinnerInfo(winnerRecord);

    // El número ya viene del Excel, siempre es ganador
    DOMUtils.setInnerHTML(this.resultMessage, 
      `<div class="text-4xl font-bold mb-4">${drawnNumber}</div>
       <div class="text-2xl mb-4" style="color: ${config.winner_color};">🎉 ¡GANADOR!</div>
       <p class="text-lg">Seleccionado de la base de datos</p>`
    );
    DOMUtils.setStyles(this.resultMessage, { opacity: '1' });
    
    // Lanzar fuegos artificiales
    this.launchFireworks();
    
    // Aplicar animación de ganador
    this.applyResultAnimation(true);
    
    // Guardar automáticamente como ganador
    setTimeout(async () => {
      const nombreParaGuardar = this.invertirNombre(winnerRecord.nombre);
      const saved = await this.lotteryService.saveResult(drawnNumber, true, nombreParaGuardar);
      if (saved) {
        this.showSuccessMessage(true);
      } else {
        this.showResultMessage('Error al guardar el sorteo', '#e74c3c');
      }
      
      setTimeout(() => {
        this.resetLottery();
      }, CONSTANTS.RESULT_DISPLAY_DURATION);
    }, 1000);
  }

  /**
   * Aplica la animación de resultado a las balotas
   */
  private applyResultAnimation(isWinner: boolean): void {
    const className = isWinner ? 'winner' : 'no-winner';
    this.balls?.forEach((ball) => {
      DOMUtils.addClass(ball, className);
    });
  }

  /**
   * Muestra mensaje de éxito
   */
  private showSuccessMessage(isWinner: boolean): void {
    const config = this.configService.getConfig();
    const message = isWinner ? `🎉 ${config.winner_label} 🎉` : config.no_winner_label;
    const color = isWinner ? config.winner_color : config.no_winner_color;
    this.showResultMessage(message, color);
    
    // Mostrar fuegos artificiales si es ganador
    if (isWinner) {
      this.launchFireworks();
    }
  }

  /**
   * Muestra un mensaje de resultado
   */
  showResultMessage(message: string, color: string): void {
    DOMUtils.setTextContent(this.resultMessage, message);
    DOMUtils.setStyles(this.resultMessage, {
      color,
      opacity: '1',
      transform: 'scale(1.1)',
    });

    setTimeout(() => {
      DOMUtils.setStyles(this.resultMessage, { transform: 'scale(1)' });
    }, 300);
  }

  /**
   * Limpia el mensaje de resultado
   */
  private clearResultMessage(): void {
    DOMUtils.setStyles(this.resultMessage, { opacity: '0' });
  }

  /**
   * Invierte el orden de apellidos y nombres
   * Convierte "APELLIDO, NOMBRE" en "NOMBRE APELLIDO"
   */
  private invertirNombre(nombreCompleto: string): string {
    // Si contiene coma, separar apellidos de nombres
    if (nombreCompleto.includes(',')) {
      const partes = nombreCompleto.split(',').map(parte => parte.trim());
      // partes[0] = apellidos, partes[1] = nombres
      return `${partes[1]} ${partes[0]}`;
    }
    // Si no tiene coma, devolver tal cual
    return nombreCompleto;
  }

  /**
   * Muestra la información del ganador
   */
  private showWinnerInfo(record: ExcelRecord): void {
    // eslint-disable-next-line no-console
    console.log('🎯 Mostrando info del ganador:', record);
    
    if (!this.winnerName || !this.winnerDetails || !this.winnerInfo) {
      // eslint-disable-next-line no-console
      console.error('❌ Elementos de winner-info no encontrados:', {
        winnerInfo: !!this.winnerInfo,
        winnerName: !!this.winnerName,
        winnerDetails: !!this.winnerDetails
      });
      return;
    }

    const nombre = String(record.nombre || 'Nombre no disponible');
    const nombreInvertido = this.invertirNombre(nombre);
    const regional = String(record.regional || '');
    // eslint-disable-next-line no-console
    console.log('📝 Nombre a mostrar:', nombreInvertido, 'Sede:', regional);
    
    DOMUtils.setTextContent(this.winnerName, nombreInvertido.toUpperCase());

    // Mostrar sede si existe
    if (regional) {
      DOMUtils.setTextContent(this.winnerDetails, `Sede: ${regional.toUpperCase()}`);
    } else {
      DOMUtils.setTextContent(this.winnerDetails, '');
    }

    // eslint-disable-next-line no-console
    console.log('👁️ Mostrando barra con opacity: 1');
    DOMUtils.setStyles(this.winnerInfo, { opacity: '1' });
  }

  /**
   * Oculta la información del ganador
   */
  private hideWinnerInfo(): void {
    DOMUtils.setStyles(this.winnerInfo, { opacity: '0' });
  }

  /**
   * Limpia todos los intervalos de las balotas
   */
  private clearBallIntervals(): void {
    this.ballIntervals.forEach((interval) => clearInterval(interval));
    this.ballIntervals.clear();
  }

  /**
   * Resetea el sorteo al estado inicial
   */
  private resetLottery(): void {
    this.clearBallIntervals();
    this.balls?.forEach((ball) => {
      DOMUtils.removeClasses(ball, ['winner', 'no-winner', 'spinning', 'stopped']);
    });

    this.clearResultMessage();
    // NO ocultar winnerInfo para que se mantenga visible hasta el próximo sorteo
    this.lotteryService.finalizeLottery();
    this.enableButton();
  }

  /**
   * Deshabilita el botón de inicio
   */
  private disableButton(): void {
    if (this.startButton) {
      this.startButton.disabled = true;
      DOMUtils.setStyles(this.startButton, {
        opacity: '0.5',
        cursor: 'not-allowed',
      });
    }
    DOMUtils.setInnerHTML(this.buttonText, '<div class="loading-spinner"></div>');
  }

  /**
   * Habilita el botón de inicio
   */
  private enableButton(): void {
    if (this.startButton) {
      this.startButton.disabled = false;
      DOMUtils.setStyles(this.startButton, {
        opacity: '1',
        cursor: 'pointer',
      });
    }
    const buttonText = this.configService.getConfigValue('button_text');
    DOMUtils.setTextContent(this.buttonText, buttonText);
  }

  /**
   * Actualiza los estilos basados en la configuración
   */
  updateStyles(): void {
    // Implementación futura para actualización dinámica de estilos
  }

  /**
   * Lanza fuegos artificiales
   */
  private launchFireworks(): void {
    const container = DOMUtils.getElementById('fireworks-container');
    if (!container) return;

    // Limpiar fuegos artificiales anteriores
    DOMUtils.setInnerHTML(container, '');

    // Crear múltiples explosiones de fuegos artificiales
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700', '#ff69b4'];
    const numberOfFireworks = 15;

    for (let i = 0; i < numberOfFireworks; i++) {
      setTimeout(() => {
        this.createFirework(container, colors);
      }, i * 200);
    }

    // Limpiar después de 5 segundos
    setTimeout(() => {
      DOMUtils.setInnerHTML(container, '');
    }, 5000);
  }

  /**
   * Crea un fuego artificial individual
   */
  private createFirework(container: HTMLElement, colors: string[]): void {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.1;
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Crear partículas de explosión
    const particles = 30;
    for (let i = 0; i < particles; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 10px ${color}`;

      const angle = (Math.PI * 2 * i) / particles;
      const velocity = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);

      container.appendChild(particle);

      // Eliminar partícula después de la animación
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1000);
    }

    // Añadir confeti
    this.createConfetti(container, x);
  }

  /**
   * Crea confeti
   */
  private createConfetti(container: HTMLElement, x: number): void {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffd700'];
    const confettiCount = 10;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${x + (Math.random() - 0.5) * 100}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      confetti.style.animationDuration = `${2 + Math.random()}s`;

      container.appendChild(confetti);

      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 3000);
    }
  }
}
