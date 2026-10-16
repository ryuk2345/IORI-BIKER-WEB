/**
 * Módulo de estimación visual de cuotas para aCuotaz.
 * Regla: Solo visual, sin integración, sin API ni preevaluación externa.
 */

export interface AcuotazConfig {
  activo: boolean;
  numeroCuotas: number; // n (ej. 9 DEMO)
  factor: number; // factor (ej. 1.23 DEMO)
  montoMinimo: number; // defecto 100
  montoMaximo: number; // defecto 2000
  textoFranja: string; // "Divide tu pago en hasta {n} cuotas"
  textoRecuadro: string; // "Llévatelo en {n} cuotas quincenales de {cuota}"
  avisoLegal: string; // "Monto referencial, sujeto a evaluación y condiciones de aCuotaz."
  esDemo?: boolean;
}

export const DEFAULT_ACUOTAZ_CONFIG: AcuotazConfig = {
  activo: true,
  numeroCuotas: 9, // n = 9 marcado como DEMO
  factor: 1.23, // factor = 1.23 marcado como DEMO
  montoMinimo: 100,
  montoMaximo: 2000,
  textoFranja: 'Divide tu pago en hasta {n} cuotas',
  textoRecuadro: 'Llévatelo en {n} cuotas quincenales de {cuota}',
  avisoLegal: 'Monto referencial, sujeto a evaluación y condiciones de aCuotaz.',
  esDemo: true,
};

let currentConfig: AcuotazConfig = { ...DEFAULT_ACUOTAZ_CONFIG };

/**
 * Permite actualizar la configuración en memoria (ej. al cargar de ajustes_generales de Supabase)
 */
export function setAcuotazConfig(nuevaConfig: Partial<AcuotazConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...nuevaConfig,
  };
}

/**
 * Obtiene la configuración actual de aCuotaz
 */
export function getAcuotazConfig(): AcuotazConfig {
  return currentConfig;
}

/**
 * Calcula la cuota quincenal estimada para aCuotaz.
 * 
 * Reglas:
 * - Devuelve null si aCuotaz está inactivo.
 * - Devuelve null si falta el factor (<= 0 o no numérico).
 * - Devuelve null si falta o es inválido el número de cuotas (<= 0).
 * - Devuelve null si el precio está fuera del rango [montoMinimo, montoMaximo].
 * - Redondea la cuota hacia arriba al céntimo: Math.ceil(raw * 100) / 100.
 * 
 * @param precio Precio del producto o subtotal del pedido
 * @param configOverride Opcional para pruebas o parametrización dinámica
 * @returns Monto de la cuota en soles redondeado al céntimo superior o null
 */
export function calcularCuotaEstimada(
  precio: number,
  configOverride?: Partial<AcuotazConfig>
): number | null {
  const config = configOverride ? { ...currentConfig, ...configOverride } : currentConfig;

  // 1. Validar precio positivo
  if (typeof precio !== 'number' || isNaN(precio) || precio <= 0) {
    return null;
  }

  // 2. Validar activo
  if (!config.activo) {
    return null;
  }

  // 3. Validar factor presente y válido
  if (typeof config.factor !== 'number' || isNaN(config.factor) || config.factor <= 0) {
    return null;
  }

  // 4. Validar número de cuotas n
  if (typeof config.numeroCuotas !== 'number' || isNaN(config.numeroCuotas) || config.numeroCuotas <= 0) {
    return null;
  }

  // 5. Validar límites de monto mínimo y máximo
  const min = typeof config.montoMinimo === 'number' ? config.montoMinimo : DEFAULT_ACUOTAZ_CONFIG.montoMinimo;
  const max = typeof config.montoMaximo === 'number' ? config.montoMaximo : DEFAULT_ACUOTAZ_CONFIG.montoMaximo;

  if (precio < min || precio > max) {
    return null;
  }

  // 6. Cálculo exacto: cuota = precio * factor / n
  const rawCuota = (precio * config.factor) / config.numeroCuotas;

  // Redondear hacia arriba al céntimo más próximo
  const cuotaRedondeada = Math.ceil(Math.round(rawCuota * 10000) / 100) / 100;

  return cuotaRedondeada;
}

/**
 * Helper para formatear el texto del recuadro
 */
export function generarTextoRecuadro(
  precio: number,
  configOverride?: Partial<AcuotazConfig>
): {
  visible: boolean;
  tieneCuota: boolean;
  texto: string;
  cuota: number | null;
  numeroCuotas: number;
  avisoLegal: string;
} {
  const config = configOverride ? { ...currentConfig, ...configOverride } : currentConfig;

  // Si está inactivo, no debe mostrarse
  if (!config.activo) {
    return {
      visible: false,
      tieneCuota: false,
      texto: '',
      cuota: null,
      numeroCuotas: config.numeroCuotas,
      avisoLegal: config.avisoLegal,
    };
  }

  // Si el precio está fuera del rango mínimo y máximo, el recuadro no aparece
  const min = typeof config.montoMinimo === 'number' ? config.montoMinimo : DEFAULT_ACUOTAZ_CONFIG.montoMinimo;
  const max = typeof config.montoMaximo === 'number' ? config.montoMaximo : DEFAULT_ACUOTAZ_CONFIG.montoMaximo;

  if (precio < min || precio > max) {
    return {
      visible: false,
      tieneCuota: false,
      texto: '',
      cuota: null,
      numeroCuotas: config.numeroCuotas,
      avisoLegal: config.avisoLegal,
    };
  }

  // Si falta el factor, el recuadro muestra solo "Paga en cuotas sin tarjeta, solo con tu DNI", sin montos
  if (typeof config.factor !== 'number' || isNaN(config.factor) || config.factor <= 0) {
    return {
      visible: true,
      tieneCuota: false,
      texto: 'Paga en cuotas sin tarjeta, solo con tu DNI',
      cuota: null,
      numeroCuotas: config.numeroCuotas,
      avisoLegal: config.avisoLegal,
    };
  }

  const cuota = calcularCuotaEstimada(precio, config);
  if (cuota === null) {
    return {
      visible: false,
      tieneCuota: false,
      texto: '',
      cuota: null,
      numeroCuotas: config.numeroCuotas,
      avisoLegal: config.avisoLegal,
    };
  }

  const cuotaStr = `S/ ${cuota.toFixed(2)}`;
  const template = config.textoRecuadro || DEFAULT_ACUOTAZ_CONFIG.textoRecuadro;
  const texto = template
    .replace('{n}', String(config.numeroCuotas))
    .replace('{cuota}', cuotaStr);

  return {
    visible: true,
    tieneCuota: true,
    texto,
    cuota,
    numeroCuotas: config.numeroCuotas,
    avisoLegal: config.avisoLegal,
  };
}
