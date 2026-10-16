/**
 * Validadores oficiales para DNI, RUC y Celular peruano.
 * Garantiza integridad de datos y formato estricto en tienda y APIs.
 */

export interface ValidationResult {
  valido: boolean;
  limpio: string;
  error?: string;
}

/**
 * Valida un DNI peruano:
 * - Exactamente 8 dígitos numéricos.
 * - No puede ser secuencia repetitiva inválida (ej. 00000000).
 */
export function validarDNI(dni: string | null | undefined): ValidationResult {
  if (!dni) {
    return { valido: false, limpio: '', error: 'El DNI es obligatorio.' };
  }

  const limpio = String(dni).replace(/\D/g, '');

  if (limpio.length !== 8) {
    return { valido: false, limpio, error: 'El DNI debe tener exactamente 8 dígitos.' };
  }

  if (/^(\d)\1{7}$/.test(limpio)) {
    return { valido: false, limpio, error: 'El DNI no puede ser una secuencia repetitiva.' };
  }

  return { valido: true, limpio };
}

/**
 * Valida un RUC peruano:
 * - Exactamente 11 dígitos numéricos.
 * - Debe iniciar con 10, 15, 17 o 20 (SUNAT).
 * - No puede ser secuencia repetitiva.
 */
export function validarRUC(ruc: string | null | undefined): ValidationResult {
  if (!ruc) {
    return { valido: false, limpio: '', error: 'El RUC es obligatorio.' };
  }

  const limpio = String(ruc).replace(/\D/g, '');

  if (limpio.length !== 11) {
    return { valido: false, limpio, error: 'El RUC debe tener exactamente 11 dígitos.' };
  }

  if (!/^(10|15|17|20)\d{9}$/.test(limpio)) {
    return { valido: false, limpio, error: 'El RUC debe iniciar con 10, 15, 17 o 20.' };
  }

  if (/^(\d)\1{10}$/.test(limpio)) {
    return { valido: false, limpio, error: 'El RUC no puede ser una secuencia repetitiva.' };
  }

  return { valido: true, limpio };
}

/**
 * Valida un número de celular peruano:
 * - Exactamente 9 dígitos numéricos.
 * - Debe iniciar con el dígito 9.
 * - Acepta prefijo internacional +51 o 51 y lo normaliza a los 9 dígitos locales.
 */
export function validarCelular(celular: string | null | undefined): ValidationResult {
  if (!celular) {
    return { valido: false, limpio: '', error: 'El número de celular es obligatorio.' };
  }

  let limpio = String(celular).replace(/\D/g, '');

  // Si incluye código de país 51 al inicio y tiene 11 dígitos
  if (limpio.length === 11 && limpio.startsWith('519')) {
    limpio = limpio.slice(2);
  }

  if (limpio.length !== 9) {
    return { valido: false, limpio, error: 'El celular debe tener 9 dígitos.' };
  }

  if (!limpio.startsWith('9')) {
    return { valido: false, limpio, error: 'El celular debe comenzar con 9.' };
  }

  if (/^9(\d)\1{7}$/.test(limpio)) {
    return { valido: false, limpio, error: 'El número de celular no puede ser una secuencia repetitiva.' };
  }

  return { valido: true, limpio };
}
