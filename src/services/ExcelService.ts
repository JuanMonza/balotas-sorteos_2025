/**
 * Servicio para manejar archivos Excel
 */

interface XLSXWorkbook {
  SheetNames: string[];
  Sheets: Record<string, unknown>;
}

interface XLSXUtils {
  sheet_to_json: (sheet: unknown, options?: Record<string, unknown>) => Record<string, unknown>[];
}

interface XLSXLibrary {
  read: (data: Uint8Array, options: { type: string }) => XLSXWorkbook;
  utils: XLSXUtils;
}

declare global {
  interface Window {
    XLSX?: XLSXLibrary;
  }
}

export interface ExcelRecord {
  numero: string;
  nombre: string;
  regional?: string;
  [key: string]: string | number | boolean | undefined;
}

export class ExcelService {
  private records: ExcelRecord[] = [];
  private isLoaded: boolean = false;
  private readonly DATABASE_PATH = './public/BASE_PARA_SORTEO_MOTO_y_bonos.xlsx';

  /**
   * Carga automáticamente la base de datos al iniciar
   */
  async autoLoadDatabase(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      // eslint-disable-next-line no-console
      console.log('Intentando cargar Excel desde:', this.DATABASE_PATH);
      
      const response = await fetch(this.DATABASE_PATH);
      
      // eslint-disable-next-line no-console
      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error('Error al cargar archivo:', response.status);
        return {
          success: false,
          message: `No se encontró el archivo Excel (${response.status})`,
          count: 0,
        };
      }

      // eslint-disable-next-line no-console
      console.log('Archivo encontrado, convirtiendo a ArrayBuffer...');
      
      const arrayBuffer = await response.arrayBuffer();
      
      // eslint-disable-next-line no-console
      console.log('ArrayBuffer creado, tamaño:', arrayBuffer.byteLength, 'bytes');
      
      // eslint-disable-next-line no-console
      console.log('Parseando Excel...');
      
      const workbook = this.parseExcel(arrayBuffer);
      
      // eslint-disable-next-line no-console
      console.log('Workbook cargado, hojas:', workbook.SheetNames);
      
      const records = this.extractRecords(workbook);

      this.records = records;
      this.isLoaded = true;

      // eslint-disable-next-line no-console
      console.log('Base de datos cargada con éxito!');

      return {
        success: true,
        message: 'Base de datos cargada automáticamente',
        count: records.length,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error crítico al cargar base de datos:', error);
      return {
        success: false,
        message: `Error al cargar la base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        count: 0,
      };
    }
  }

  /**
   * Carga un archivo Excel desde ArrayBuffer (carga manual)
   */
  async loadFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<{ success: boolean; message: string; count: number }> {
    try {
      // eslint-disable-next-line no-console
      console.log('Cargando Excel manualmente, tamaño:', arrayBuffer.byteLength, 'bytes');
      
      const workbook = this.parseExcel(arrayBuffer);
      
      // eslint-disable-next-line no-console
      console.log('Workbook parseado, hojas:', workbook.SheetNames);
      
      const records = this.extractRecords(workbook);

      this.records = records;
      this.isLoaded = true;

      // eslint-disable-next-line no-console
      console.log('🎉 Base de datos cargada manualmente con éxito!');

      return {
        success: true,
        message: 'Base de datos cargada exitosamente',
        count: records.length,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('💥 Error al cargar Excel manualmente:', error);
      return {
        success: false,
        message: `Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        count: 0,
      };
    }
  }

  /**
   * Parsea un archivo Excel
   */
  async loadExcelFile(file: File): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const data = await this.readFileAsArrayBuffer(file);
      const workbook = this.parseExcel(data);
      const records = this.extractRecords(workbook);

      this.records = records;
      this.isLoaded = true;

      return {
        success: true,
        message: 'Base de datos cargada exitosamente',
        count: records.length,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al cargar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        count: 0,
      };
    }
  }

  /**
   * Lee el archivo como ArrayBuffer
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as ArrayBuffer);
        } else {
          reject(new Error('No se pudo leer el archivo'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parsea el archivo Excel usando la librería XLSX
   */
  private parseExcel(data: ArrayBuffer): XLSXWorkbook {
    if (typeof window.XLSX === 'undefined') {
      throw new Error('Librería XLSX no disponible. Por favor recarga la página.');
    }
    return window.XLSX.read(new Uint8Array(data), { type: 'array' });
  }

  /**
   * Extrae los registros del workbook
   */
  private extractRecords(workbook: XLSXWorkbook): ExcelRecord[] {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!window.XLSX) {
      throw new Error('Librería XLSX no disponible');
    }

    const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { 
      defval: '', 
      raw: false 
    }) as Record<string, unknown>[];

    // eslint-disable-next-line no-console
    console.log('Total de filas en Excel:', jsonData.length);
    if (jsonData.length > 0) {
      // eslint-disable-next-line no-console
      console.log('Columnas encontradas:', Object.keys(jsonData[0]));
      // eslint-disable-next-line no-console
      console.log('Primera fila de ejemplo:', jsonData[0]);
      // eslint-disable-next-line no-console
      console.log('Segunda fila de ejemplo:', jsonData[1]);
      // eslint-disable-next-line no-console
      console.log('Tercera fila de ejemplo:', jsonData[2]);
    }

    const records: ExcelRecord[] = jsonData.map((row, index) => {
      const numeroKey = Object.keys(row).find(key => {
        const keyLower = key.toLowerCase().trim();
        const keyNormalized = keyLower.replace(/\./g, '').replace(/\s+/g, '');
        return keyLower.includes('n. doc') ||
               keyLower.includes('n.doc') ||
               keyNormalized === 'ndoc' ||
               keyLower.includes('numero') || 
               keyLower.includes('number') ||
               keyLower.includes('cedula') ||
               keyLower.includes('documento') ||
               keyLower.includes('boleta') ||
               keyLower.includes('ticket') ||
               keyLower.includes('contrato') ||
               keyLower.includes('id') ||
               keyLower === 'n' ||
               keyLower === 'num';
      });

      const nombreKey = Object.keys(row).find(key => {
        const keyLower = key.toLowerCase().trim();
        return keyLower.includes('nombre') ||
               keyLower.includes('name') ||
               keyLower.includes('apellido') ||
               keyLower.includes('titular') ||
               keyLower.includes('cliente');
      });

      const regionalKey = Object.keys(row).find(key => {
        const keyLower = key.toLowerCase().trim();
        return keyLower.includes('descripción centrocosto') ||
               keyLower.includes('descripcion centrocosto') ||
               keyLower.includes('centrocosto') ||
               keyLower.includes('sede') ||
               keyLower.includes('regional') ||
               keyLower.includes('region') ||
               keyLower.includes('zona') ||
               keyLower.includes('area');
      });

      let numero = '';
      if (numeroKey) {
        numero = String(row[numeroKey]).trim();
        if (index === 0) {
          // eslint-disable-next-line no-console
          console.log(`✅ Columna de número encontrada: "${numeroKey}"`);
        }
      } else if (Object.keys(row).length > 0) {
        const firstKey = Object.keys(row)[0];
        numero = String(row[firstKey]).trim();
        if (index === 0) {
          // eslint-disable-next-line no-console
          console.log(`⚠️ No se encontró columna de número, usando primera columna: "${firstKey}"`);
        }
      }

      numero = numero.replace(/\s+/g, '').replace(/-/g, '');
      
      const nombre = nombreKey ? String(row[nombreKey]).trim() : '';
      const regional = regionalKey ? String(row[regionalKey]).trim() : '';

      if (index === 0) {
        // eslint-disable-next-line no-console
        console.log(`👤 Columna de nombre: "${nombreKey || 'NO ENCONTRADA'}", valor: "${nombre}"`);
        // eslint-disable-next-line no-console
        console.log(`🌎 Columna de regional: "${regionalKey || 'NO ENCONTRADA'}", valor: "${regional}"`);
      }

      return {
        numero,
        nombre,
        regional,
        ...row,
      } as ExcelRecord;
    });

    const validRecords = records.filter(r => r.numero && r.numero.length > 0);
    // eslint-disable-next-line no-console
    console.log('Registros válidos encontrados:', validRecords.length);
    if (validRecords.length > 0) {
      // eslint-disable-next-line no-console
      console.log('Ejemplos de números:', validRecords.slice(0, 5).map(r => r.numero));
    }

    return validRecords;
  }

  /**
   * Verifica si un número está en la base de datos
   */
  checkNumber(numero: string): { exists: boolean; record?: ExcelRecord } {
    if (!this.isLoaded) {
      return { exists: false };
    }

    const found = this.records.find(r => r.numero === numero);
    return {
      exists: !!found,
      record: found,
    };
  }

  /**
   * Obtiene un ganador aleatorio de la base de datos
   */
  getRandomWinner(): { numero: string; record: ExcelRecord } | null {
    if (!this.isLoaded || this.records.length === 0) {
      // eslint-disable-next-line no-console
      console.error('No hay registros cargados para seleccionar ganador');
      return null;
    }

    const randomIndex = Math.floor(Math.random() * this.records.length);
    const winner = this.records[randomIndex];
    
    // eslint-disable-next-line no-console
    console.log('Ganador seleccionado:', winner.numero, 'de', this.records.length, 'participantes');
    
    return {
      numero: winner.numero,
      record: winner,
    };
  }

  /**
   * Obtiene todos los registros
   */
  getRecords(): ExcelRecord[] {
    return [...this.records];
  }

  /**
   * Verifica si hay datos cargados
   */
  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Limpia los datos cargados
   */
  clear(): void {
    this.records = [];
    this.isLoaded = false;
  }
}
