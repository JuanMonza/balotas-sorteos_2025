/**
 * Utilidades para generación de números aleatorios
 */

export class RandomUtils {
  /**
   * Genera un número aleatorio entre 0 y max (inclusive)
   */
  static getRandomNumber(max: number): number {
    return Math.floor(Math.random() * (max + 1));
  }

  /**
   * Genera un array de números aleatorios basado en rangos
   */
  static generateRandomNumbers(ranges: readonly number[]): number[] {
    return ranges.map((max) => this.getRandomNumber(max));
  }

  /**
   * Genera un número aleatorio con la cantidad de dígitos indicada por los rangos.
   */
  static generateSixDigitNumber(ranges: readonly number[]): string {
    const numbers = this.generateRandomNumbers(ranges);
    return numbers.join('');
  }

  /**
   * Parsea un string alfanumérico a array de valores para balotas.
   */
  static parseNumberString(numberString: string): (number | string)[] {
    return numberString.split('').map((value) => {
      const numericValue = parseInt(value, 10);
      return Number.isNaN(numericValue) ? value.toUpperCase() : numericValue;
    });
  }

  /**
   * Valida que los números estén dentro de los rangos permitidos
   */
  static validateNumbersInRange(numbers: number[], ranges: readonly number[]): boolean {
    if (numbers.length !== ranges.length) {
      return false;
    }
    return numbers.every((num, index) => num >= 0 && num <= ranges[index]);
  }
}
