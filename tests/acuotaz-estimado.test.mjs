import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularCuotaEstimada, generarTextoRecuadro, DEFAULT_ACUOTAZ_CONFIG } from '../src/lib/acuotaz-estimado.ts';

test('aCuotaz Estimado - Cálculo con valores por defecto (n=9, factor=1.23)', () => {
  // Precio 449: 449 * 1.23 / 9 = 552.27 / 9 = 61.363333... -> redondeo hacia arriba: 61.37
  const cuota = calcularCuotaEstimada(449);
  assert.equal(cuota, 61.37);
});

test('aCuotaz Estimado - Redondeo estricto hacia arriba al céntimo', () => {
  // Si da 100.001 -> 100.01
  // Precio 100, factor 1.0001, n 1 -> 100.01
  const cuota1 = calcularCuotaEstimada(100, { factor: 1.0001, numeroCuotas: 1, montoMinimo: 50, montoMaximo: 500 });
  assert.equal(cuota1, 100.01);

  // Exacto 100.00 -> 100.00
  const cuotaExacta = calcularCuotaEstimada(100, { factor: 1.0, numeroCuotas: 1, montoMinimo: 50, montoMaximo: 500 });
  assert.equal(cuotaExacta, 100.0);
});

test('aCuotaz Estimado - Límites mínimo y máximo de precio', () => {
  // Límite mínimo por defecto: 100
  assert.equal(calcularCuotaEstimada(99.99), null, 'Menor al mínimo debe retornar null');
  assert.notEqual(calcularCuotaEstimada(100.00), null, 'Igual al mínimo debe calcular');

  // Límite máximo por defecto: 2000
  assert.notEqual(calcularCuotaEstimada(2000.00), null, 'Igual al máximo debe calcular');
  assert.equal(calcularCuotaEstimada(2000.01), null, 'Mayor al máximo debe retornar null');
});

test('aCuotaz Estimado - Casos con aCuotaz inactivo', () => {
  const cuota = calcularCuotaEstimada(500, { activo: false });
  assert.equal(cuota, null);

  const res = generarTextoRecuadro(500, { activo: false });
  assert.equal(res.visible, false);
});

test('aCuotaz Estimado - Caso con factor faltante (<= 0 o undefined)', () => {
  const cuotaSinFactor = calcularCuotaEstimada(500, { factor: 0 });
  assert.equal(cuotaSinFactor, null);

  const resSinFactor = generarTextoRecuadro(500, { factor: 0 });
  assert.equal(resSinFactor.visible, true);
  assert.equal(resSinFactor.tieneCuota, false);
  assert.equal(resSinFactor.texto, 'Paga en cuotas sin tarjeta, solo con tu DNI');
});

test('aCuotaz Estimado - Casos con número de cuotas inválido', () => {
  assert.equal(calcularCuotaEstimada(500, { numeroCuotas: 0 }), null);
  assert.equal(calcularCuotaEstimada(500, { numeroCuotas: -3 }), null);
});

test('aCuotaz Estimado - Precios inválidos (0, negativos, NaN)', () => {
  assert.equal(calcularCuotaEstimada(0), null);
  assert.equal(calcularCuotaEstimada(-50), null);
  assert.equal(calcularCuotaEstimada(NaN), null);
});

test('aCuotaz Estimado - Formateo de texto en recuadro', () => {
  const res = generarTextoRecuadro(449);
  assert.equal(res.visible, true);
  assert.equal(res.tieneCuota, true);
  assert.equal(res.cuota, 61.37);
  assert.equal(res.texto, 'Llévatelo en 9 cuotas quincenales de S/ 61.37');
  assert.equal(res.avisoLegal, 'Monto referencial, sujeto a evaluación y condiciones de aCuotaz.');
});


