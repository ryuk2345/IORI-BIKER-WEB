const penFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPEN(amount: number): string {
  return penFormatter.format(amount);
}

export const WHATSAPP_NUMERO_OFICIAL = '51905445698';
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMERO_OFICIAL}`;

// ==========================================
// 1. MENSAJES QUE GENERA LA WEB
// ==========================================

export interface ItemPedidoWhatsApp {
  cantidad: number;
  producto: string;
  variante?: string;
  sku?: string;
  precio: number;
}

export interface PedidoWhatsAppPayload {
  codigo: string;
  items: ItemPedidoWhatsApp[];
  subtotal: number;
  descuento?: number;
  envio?: number | string;
  total: number;
  nombre: string;
  celular: string;
  comprobante: string; // 'Boleta' | 'Factura'
  entrega: string; // 'Envío a domicilio' | 'Recojo en tienda'
  notas?: string;
}

/**
 * Plantilla oficial para enviar el pedido desde /carrito por WhatsApp
 */
export function formatMensajePedido(p: PedidoWhatsAppPayload): string {
  const itemsText = p.items
    .map((it) => {
      const varianteText = it.variante ? ` (${it.variante})` : '';
      const skuText = it.sku ? ` · SKU ${it.sku}` : '';
      return `• ${it.cantidad} x ${it.producto}${varianteText}${skuText} · ${formatPEN(it.precio)}`;
    })
    .join('\n');

  const descuentoText = p.descuento && p.descuento > 0 ? formatPEN(p.descuento) : 'S/ 0.00';
  const envioText =
    typeof p.envio === 'number'
      ? formatPEN(p.envio)
      : p.envio || 'Se coordina por WhatsApp';

  const notasText = p.notas && p.notas.trim() ? p.notas.trim() : 'Ninguna';

  return `Hola, Iori Biker Shop 👋 Quiero hacer este pedido:

*Pedido ${p.codigo}*
${itemsText}

Subtotal: ${formatPEN(p.subtotal)}
Descuento: ${descuentoText}
Envío: ${envioText}
*Total: ${formatPEN(p.total)}*

*Mis datos*
${p.nombre} · ${p.celular}
Comprobante: ${p.comprobante}
Entrega: ${p.entrega}
Notas: ${notasText}

¿Me confirman stock y cómo pagar? 🙌`;
}

export interface CotizarWhatsAppPayload {
  producto: string;
  variante?: string;
  sku?: string;
  url?: string;
}

/**
 * Plantilla oficial para cotizar producto por WhatsApp
 */
export function formatMensajeCotizar(p: CotizarWhatsAppPayload): string {
  const varianteText = p.variante ? ` (${p.variante})` : '';
  const skuText = p.sku ? `, SKU ${p.sku}` : '';
  const urlText = p.url ? ` ${p.url}` : '';
  return `Hola, Iori Biker Shop 👋 Quiero cotizar: *${p.producto}*${varianteText}${skuText}.${urlText}`;
}

/**
 * Mensaje oficial del botón flotante de WhatsApp
 */
export const MENSAJE_BOTON_FLOTANTE =
  'Hola, Iori Biker Shop 👋 Quiero información sobre sus productos.';

export interface FinanciamientoWhatsAppPayload {
  codigo: string;
  producto: string;
}

/**
 * Plantilla oficial para solicitud de financiamiento
 */
export function formatMensajeFinanciamiento(p: FinanciamientoWhatsAppPayload): string {
  return `Hola, Iori Biker Shop 👋 Envié la solicitud de financiamiento *${p.codigo}* para ${p.producto}. Quedo a la espera de los requisitos.`;
}

// ==========================================
// 2. PLANTILLAS DE ATENCIÓN AL CLIENTE (ADMIN)
// ==========================================

export interface DatosPagoAdmin {
  numeroYapePlin?: string;
  titular?: string;
  banco?: string;
  cuenta?: string;
  cci?: string;
}

export const DATOS_PAGO_DEFECTO: DatosPagoAdmin = {
  numeroYapePlin: '905 445 698',
  titular: 'IORI SAC',
  banco: 'BCP',
  cuenta: '193-98765432-0-12',
  cci: '002-193-009876543201-15',
};

export const PLANTILLAS_RAW = {
  pedido: `Hola, Iori Biker Shop 👋 Quiero hacer este pedido:

*Pedido {codigo}*
{items}

Subtotal: {subtotal}
Descuento: {descuento}
Envío: {envio}
*Total: {total}*

*Mis datos*
{nombre} · {celular}
Comprobante: {comprobante}
Entrega: {entrega}
Notas: {notas}

¿Me confirman stock y cómo pagar? 🙌`,

  cotizar: `Hola, Iori Biker Shop 👋 Quiero cotizar: *{producto}* ({variante}), SKU {sku}. {url}`,

  botonFlotante: `Hola, Iori Biker Shop 👋 Quiero información sobre sus productos.`,

  financiamiento: `Hola, Iori Biker Shop 👋 Envié la solicitud de financiamiento *{codigo}* para {producto}. Quedo a la espera de los requisitos.`,

  instruccionesPago: `¡Hola, {nombre}! Gracias por tu pedido *{codigo}* 🙌 Confirmamos stock de todo. Total a pagar: *{total}*.

Puedes pagar con:
- Yape o Plin: {numero_yape_plin} (a nombre de {titular})
- Transferencia {banco}: cuenta {cuenta} / CCI {cci}

Te enviamos el QR en el siguiente mensaje. Cuando pagues, mándanos la captura por aquí y preparamos tu pedido.`,

  pagoConfirmado: `¡Pago recibido, {nombre}! ✅ Tu pedido *{codigo}* está confirmado y ya lo estamos preparando. Te avisamos por aquí en cuanto salga o esté listo para recoger.`,

  enCaminoLima: `¡Tu pedido *{codigo}* ya salió, {nombre}! 🏍️ Lo entregamos en {direccion} {fecha_entrega}. Te llamaremos antes de llegar.`,

  enCaminoProvincia: `¡Tu pedido *{codigo}* ya va en camino, {nombre}! 🏍️
Agencia: {agencia}
Código de seguimiento: {codigo_seguimiento}
Destino: {ciudad}
Para recogerlo en la agencia, lleva tu DNI.`,

  listoRecojo: `¡Tu pedido *{codigo}* ya está listo, {nombre}! 🙌 Recógelo en nuestra tienda de {tienda} ({direccion_tienda}), {horario_tienda}. Menciona tu número de pedido al llegar.`,

  productoAgotado: `Hola, {nombre}. Revisando tu pedido *{codigo}*, el producto {producto} ({variante}) se nos agotó 😕 Te podemos ofrecer {alternativa} o seguir con el resto del pedido por {nuevo_total}. ¿Cómo prefieres continuar?`,

  pedidoSinMensaje: `Hola, {nombre} 👋 Te escribimos de Iori Biker Shop. Registraste el pedido *{codigo}* en nuestra web, pero no nos llegó tu mensaje. ¿Te ayudamos a completarlo?`,
};

// Generador de URLs de WhatsApp con mensaje codificado
// Acepta números guardados sin código de país (celular peruano de 9 dígitos) y les antepone 51.
export function buildWhatsAppUrl(texto: string, numero: string = WHATSAPP_NUMERO_OFICIAL): string {
  const digits = numero.replace(/\D/g, '').replace(/^(9\d{8})$/, '51$1');
  return `https://wa.me/${digits}?text=${encodeURIComponent(texto)}`;
}
