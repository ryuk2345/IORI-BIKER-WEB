/**
 * Diccionario centralizado de etiquetas legibles para el usuario y el panel de administración.
 * Evita la fuga de claves internas tipo 'recojo_independencia', 'en_preparacion', etc.
 */

export const ETIQUETAS_ESTADO_PEDIDO: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  pagado: 'Pagado',
  en_preparacion: 'En preparación',
  en_camino: 'En camino',
  listo_recojo: 'Listo para recojo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const ETIQUETAS_METODO_ENTREGA: Record<string, string> = {
  recojo: 'Recojo en tienda',
  recojo_independencia: 'Recojo en Sede Independencia',
  recojo_la_victoria: 'Recojo en Sede La Victoria',
  lima_delivery: 'Delivery Lima Metropolitana',
  lima_domicilio: 'Delivery Lima a Domicilio',
  provincia: 'Envío a Provincia (Agencia)',
  provincia_agencia: 'Envío a Provincia (Agencia)',
};

export const ETIQUETAS_METODO_PAGO: Record<string, string> = {
  yape: 'Yape',
  plin: 'Plin',
  bcp: 'Transferencia BCP',
  interbank: 'Transferencia Interbank',
  bbva: 'Transferencia BBVA',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta de Crédito / Débito',
};

export const ETIQUETAS_TIPO_COMPROBANTE: Record<string, string> = {
  boleta: 'Boleta de Venta',
  factura: 'Factura Electrónica',
};

export const ETIQUETAS_MODO_VENTA: Record<string, string> = {
  regular: 'Venta regular',
  cotizar: 'Solo cotizar',
  solo_cotizar: 'Solo cotizar',
  agotado: 'Agotado',
};

export const ETIQUETAS_BADGES: Record<string, string> = {
  nuevo: 'Nuevo',
  mas_vendido: 'Más vendido',
  liquidacion: 'Liquidación',
  oferta: 'Oferta',
  destacado: 'Destacado',
};

export function obtenerEtiquetaEstado(estado: string | null | undefined): string {
  if (!estado) return 'Desconocido';
  const key = estado.toLowerCase().trim();
  return ETIQUETAS_ESTADO_PEDIDO[key] || estado.replace(/_/g, ' ');
}

export function obtenerEtiquetaEntrega(metodo: string | null | undefined): string {
  if (!metodo) return 'No especificado';
  const key = metodo.toLowerCase().trim();
  return ETIQUETAS_METODO_ENTREGA[key] || metodo.replace(/_/g, ' ');
}

export function obtenerEtiquetaPago(metodo: string | null | undefined): string {
  if (!metodo) return 'Por coordinar';
  const key = metodo.toLowerCase().trim();
  return ETIQUETAS_METODO_PAGO[key] || metodo;
}

export function obtenerEtiquetaComprobante(tipo: string | null | undefined): string {
  if (!tipo) return 'Boleta';
  const key = tipo.toLowerCase().trim();
  return ETIQUETAS_TIPO_COMPROBANTE[key] || tipo;
}

export function obtenerEtiquetaModoVenta(modo: string | null | undefined): string {
  if (!modo) return 'Venta regular';
  const key = modo.toLowerCase().trim();
  return ETIQUETAS_MODO_VENTA[key] || modo;
}

export function obtenerEtiquetaBadge(badge: string | null | undefined): string {
  if (!badge) return '';
  const key = badge.toLowerCase().trim();
  return ETIQUETAS_BADGES[key] || badge;
}
