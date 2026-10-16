import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ETIQUETAS_ESTADO_PEDIDO,
  ETIQUETAS_METODO_ENTREGA,
  ETIQUETAS_METODO_PAGO,
  ETIQUETAS_TIPO_COMPROBANTE,
  ETIQUETAS_MODO_VENTA,
  obtenerEtiquetaEstado,
  obtenerEtiquetaEntrega,
  obtenerEtiquetaPago,
  obtenerEtiquetaComprobante,
  obtenerEtiquetaModoVenta,
  obtenerEtiquetaBadge,
} from '../src/utils/labels.ts';

test('Diccionario de Etiquetas - Estados de Pedido legibles', () => {
  assert.equal(obtenerEtiquetaEstado('nuevo'), 'Nuevo');
  assert.equal(obtenerEtiquetaEstado('contactado'), 'Contactado');
  assert.equal(obtenerEtiquetaEstado('pagado'), 'Pagado');
  assert.equal(obtenerEtiquetaEstado('en_preparacion'), 'En preparación');
  assert.equal(obtenerEtiquetaEstado('en_camino'), 'En camino');
  assert.equal(obtenerEtiquetaEstado('listo_recojo'), 'Listo para recojo');
  assert.equal(obtenerEtiquetaEstado('entregado'), 'Entregado');
  assert.equal(obtenerEtiquetaEstado('cancelado'), 'Cancelado');

  // Caso insensible a mayúsculas
  assert.equal(obtenerEtiquetaEstado('EN_PREPARACION'), 'En preparación');

  // Caso nulo o no definido
  assert.equal(obtenerEtiquetaEstado(null), 'Desconocido');
  assert.equal(obtenerEtiquetaEstado(undefined), 'Desconocido');
});

test('Diccionario de Etiquetas - Métodos de Entrega legibles', () => {
  assert.equal(obtenerEtiquetaEntrega('recojo_independencia'), 'Recojo en Sede Independencia');
  assert.equal(obtenerEtiquetaEntrega('recojo_la_victoria'), 'Recojo en Sede La Victoria');
  assert.equal(obtenerEtiquetaEntrega('lima_domicilio'), 'Delivery Lima a Domicilio');
  assert.equal(obtenerEtiquetaEntrega('provincia_agencia'), 'Envío a Provincia (Agencia)');

  // No debe devolver claves internas crudas
  const entrega = obtenerEtiquetaEntrega('recojo_independencia');
  assert.ok(!entrega.includes('_'), 'No debe contener guiones bajos');

  // Fallback seguro
  assert.equal(obtenerEtiquetaEntrega(null), 'No especificado');
});

test('Diccionario de Etiquetas - Métodos de Pago', () => {
  assert.equal(obtenerEtiquetaPago('yape'), 'Yape');
  assert.equal(obtenerEtiquetaPago('plin'), 'Plin');
  assert.equal(obtenerEtiquetaPago('bcp'), 'Transferencia BCP');
  assert.equal(obtenerEtiquetaPago('efectivo'), 'Efectivo');
  assert.equal(obtenerEtiquetaPago(null), 'Por coordinar');
});

test('Diccionario de Etiquetas - Tipos de Comprobante y Modos de Venta', () => {
  assert.equal(obtenerEtiquetaComprobante('boleta'), 'Boleta de Venta');
  assert.equal(obtenerEtiquetaComprobante('factura'), 'Factura Electrónica');

  assert.equal(obtenerEtiquetaModoVenta('regular'), 'Venta regular');
  assert.equal(obtenerEtiquetaModoVenta('cotizar'), 'Solo cotizar');
  assert.equal(obtenerEtiquetaModoVenta('solo_cotizar'), 'Solo cotizar');
});

test('Diccionario de Etiquetas - Badges de Producto', () => {
  assert.equal(obtenerEtiquetaBadge('nuevo'), 'Nuevo');
  assert.equal(obtenerEtiquetaBadge('mas_vendido'), 'Más vendido');
  assert.equal(obtenerEtiquetaBadge('liquidacion'), 'Liquidación');
  assert.equal(obtenerEtiquetaBadge('oferta'), 'Oferta');
});
