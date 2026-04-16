# 🎰 Sistema de Sorteo Jardines del Renacer

Sistema profesional de sorteo de balotas desarrollado con **TypeScript**, arquitectura modular y mejores prácticas de desarrollo.

## 📁 Estructura del Proyecto

```
balotas sorteo/
├── src/                          # Código fuente TypeScript
│   ├── models/                   # Tipos y modelos de datos
│   │   └── types.ts              # Definiciones de tipos e interfaces
│   ├── services/                 # Servicios de negocio
│   │   ├── DataService.ts        # Servicio de manejo de datos
│   │   ├── ConfigService.ts      # Servicio de configuración
│   │   └── LotteryService.ts     # Lógica principal del sorteo
│   ├── controllers/              # Controladores de UI
│   │   ├── LotteryController.ts  # Control de sorteo y animaciones
│   │   └── HistoryController.ts  # Control del historial
│   ├── middlewares/              # Middlewares de validación y errores
│   │   ├── ValidationMiddleware.ts
│   │   └── ErrorMiddleware.ts
│   ├── utils/                    # Utilidades y helpers
│   │   ├── ColorUtils.ts         # Utilidades de color
│   │   ├── DateUtils.ts          # Utilidades de fecha
│   │   ├── RandomUtils.ts        # Generación de números aleatorios
│   │   └── DOMUtils.ts           # Utilidades del DOM
│   ├── config/                   # Configuraciones
│   │   └── defaultConfig.ts      # Configuración por defecto
│   └── main.ts                   # Punto de entrada principal
├── public/                       # Archivos públicos
│   └── styles.css                # Estilos CSS
├── dist/                         # Archivos compilados
├── index.html                    # Archivo HTML principal
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración de TypeScript
├── .eslintrc.json                # Configuración de ESLint
├── .prettierrc                   # Configuración de Prettier
└── README.md                     # Este archivo
```

## 🚀 Características

### ✨ Arquitectura Profesional
- **TypeScript** para type safety y mejor desarrollo
- **Patrón MVC** (Model-View-Controller)
- **Separación de responsabilidades** por carpetas
- **Inyección de dependencias** entre servicios

### 🔧 Componentes Principales

#### **Modelos** (`src/models/`)
- Definiciones de tipos TypeScript
- Interfaces para datos y configuración
- Constantes del sistema

#### **Servicios** (`src/services/`)
- **DataService**: Manejo de datos y SDK
- **ConfigService**: Gestión de configuración
- **LotteryService**: Lógica de sorteo

#### **Controladores** (`src/controllers/`)
- **LotteryController**: Interfaz y animaciones
- **HistoryController**: Renderizado de historial

#### **Middlewares** (`src/middlewares/`)
- **ValidationMiddleware**: Validación de datos
- **ErrorMiddleware**: Manejo centralizado de errores

#### **Utilidades** (`src/utils/`)
- **ColorUtils**: Manipulación de colores
- **DateUtils**: Formateo de fechas
- **RandomUtils**: Generación de números
- **DOMUtils**: Manipulación del DOM

## 📦 Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Compilar TypeScript**:
```bash
npm run build
```

3. **Modo desarrollo** (watch mode):
```bash
npm run dev
```

## 🛠️ Scripts Disponibles

```json
{
  "build": "Compila TypeScript y copia archivos",
  "dev": "Modo desarrollo con auto-compilación",
  "start": "Compila y ejecuta la aplicación",
  "lint": "Ejecuta ESLint",
  "format": "Formatea código con Prettier"
}
```

## 🎯 Uso

1. Compila el proyecto con `npm run build`
2. Abre `index.html` en tu navegador
3. Haz clic en "INICIAR SORTEO"
4. Las balotas girarán y se detendrán mostrando el número
5. Decide si es ganador o no
6. El resultado se guarda automáticamente

## 🔐 Validaciones

El sistema incluye validaciones robustas:
- ✅ Formato de números (6 dígitos)
- ✅ Colores hexadecimales
- ✅ Límite de registros (999)
- ✅ URLs de imágenes
- ✅ Tamaños de fuente (8-72)

## 🎨 Personalización

La configuración permite personalizar:
- Colores (fondo, texto, botones, ganador, no ganador)
- Fuentes (familia y tamaño)
- Textos (título, botones, etiquetas)
- Imagen de fondo
- Número forzado (para testing)

## 🐛 Manejo de Errores

- Sistema centralizado de errores
- Log de errores (últimos 100)
- Mensajes amigables para usuarios
- Contexto detallado para debugging

## 📊 Historial

- Ordenado por fecha (más reciente primero)
- Diferenciación visual ganador/no ganador
- Animaciones hover
- Formato de fecha localizado

## 🔄 Flujo de la Aplicación

```
1. Inicialización (main.ts)
   ↓
2. Configuración de Servicios
   ↓
3. Configuración de Controladores
   ↓
4. Inicialización de SDKs
   ↓
5. Aplicación de Configuración
   ↓
6. Listo para Sorteo
```

## 🏗️ Principios de Diseño

- **SOLID**: Principios de diseño orientado a objetos
- **DRY**: No repetir código
- **Separation of Concerns**: Cada módulo tiene una responsabilidad
- **Type Safety**: TypeScript garantiza tipos seguros
- **Error Handling**: Manejo robusto de errores

## 🔍 Testing

Para probar con número específico:
1. Configura `force_number` en la configuración
2. El sorteo usará ese número en lugar de aleatorio
3. Útil para debugging y demostración

## 📝 Notas Técnicas

- Los intervalos se limpian automáticamente
- Las animaciones están optimizadas
- El DOM se manipula de forma segura
- Los datos se validan antes de guardar
- La configuración se aplica reactivamente

## 🤝 Contribución

Este código sigue las mejores prácticas:
- Código limpio y documentado
- Nombres descriptivos
- Funciones pequeñas y enfocadas
- Comentarios JSDoc
- Formato consistente (Prettier)
- Linting (ESLint)

## 📄 Licencia

MIT

## 👨‍💻 Autor

Desarrollado para **Jardines del Renacer**

---

## 🎓 Aprendizaje

Este proyecto demuestra:
- Arquitectura escalable
- TypeScript avanzado
- Patrones de diseño
- Separación de capas
- Manejo profesional de errores
- Validaciones robustas
- Código mantenible

---

**¡Disfruta del sorteo! 🎰**
# balotas-sorteos_2025
