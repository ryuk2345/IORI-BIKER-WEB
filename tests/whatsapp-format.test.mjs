import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMensajePedido,
  formatMensajeCotizar,
  formatMensajeFinanciamiento,
  buildWhatsAppUrl,
  WHATSAPP_NUMERO_OFICIAL,
} from '../src/utils/whatsappTemplates.ts';

test('WhatsApp - Mensaje de pedido con tildes, emojis y caracteres especiales', () => {
  const payload = {
    codigo: 'IORI-001234',
    items: [
      {
        cantidad: 2,
        producto: 'Casco Shaft Pro Serie Élite Edición Dragón',
        variante: 'Talla L, Color Negro Mate / Neón',
        sku: 'SH-PRO-L-NEON',
        precio: 580.0,
      },
      {
        cantidad: 1,
        producto: 'Guantes Térmicos Impermeables 100% Cuero',
        variante: 'Talla XL',
        sku: 'GT-XL-100',
        precio: 140.5,
      },
    ],
    subtotal: 720.5,
    descuento: 50.0,
    envio: 15.0,
    total: 685.5,
    nombre: 'Ñandú Peña & Cía (Atención: José María González)',
    celular: '912345678',
    comprobante: 'Factura (RUC: 20601234567 - Peña & Cía)',
    entrega: 'Envío a domicilio: Av. Los Álamos 450, Urb. Piñonate (Ref: Portón azul & timbre)',
    notas: '¿Pueden envolver para regalo? Llevar cambio de S/ 100 por favor.',
  };

  const mensaje = formatMensajePedido(payload);

  // Verificación de tildes y caracteres peruanos/españoles
  assert.match(mensaje, /Élite/);
  assert.match(mensaje, /Dragón/);
  assert.match(mensaje, /Térmicos/);
  assert.match(mensaje, /Ñandú/);
  assert.match(mensaje, /Peña/);
  assert.match(mensaje, /José/);
  assert.match(mensaje, /María/);
  assert.match(mensaje, /González/);
  assert.match(mensaje, /Álamos/);
  assert.match(mensaje, /Piñonate/);
  assert.match(mensaje, /Portón/);

  // Verificación de emojis
  assert.match(mensaje, /👋/);
  assert.match(mensaje, /🙌/);

  // Verificación de caracteres especiales
  assert.match(mensaje, /&/);
  assert.match(mensaje, /•/);
  assert.match(mensaje, /·/);
  assert.match(mensaje, /100%/);
  assert.match(mensaje, /\*Pedido IORI-001234\*/);
  assert.match(mensaje, /\*Total: S\/\s*685\.50\*/);
  assert.match(mensaje, /¿Me confirman stock y cómo pagar\?/);

  // Verificación de URL de wa.me
  const url = buildWhatsAppUrl(mensaje);
  assert.ok(url.startsWith(`https://wa.me/${WHATSAPP_NUMERO_OFICIAL}?text=`));

  // Verificar que la URL es decodificable sin pérdida de datos
  const encodedText = url.split('?text=')[1];
  const decodedText = decodeURIComponent(encodedText);
  assert.equal(decodedText, mensaje);
});

test('WhatsApp - Mensajes muy largos no se truncan', () => {
  const items = [];
  for (let i = 1; i <= 25; i++) {
    items.push({
      cantidad: i,
      producto: `Accesorio Especial de Motociclismo Biker Edición Extrema Número ${i}`,
      variante: `Talla XXL, Versión Especializada Reforzada con Kevlar ${i}`,
      sku: `SKU-PRO-EXT-0000${i}`,
      precio: 100 + i * 10,
    });
  }

  const payload = {
    codigo: 'IORI-999999',
    items,
    subtotal: 5000,
    total: 5000,
    nombre: 'Juan Francisco de la Santísima Trinidad Valdivieso y Mendoza',
    celular: '999888777',
    comprobante: 'Boleta (DNI: 71234567)',
    entrega: 'Recojo en tienda: Sede Independencia',
    notas: 'Mensaje de notas con descripción muy detallada sobre el envío y preferencias de entrega de los 25 productos solicitados.',
  };

  const mensaje = formatMensajePedido(payload);
  assert.ok(mensaje.length > 2000, 'El mensaje con 25 items debe superar 2000 caracteres');

  const url = buildWhatsAppUrl(mensaje);
  const param = url.split('?text=')[1];
  assert.equal(decodeURIComponent(param), mensaje);
  assert.ok(param.includes(encodeURIComponent('Kevlar 25')));
});

test('WhatsApp - Formato de cotización y financiamiento', () => {
  const cotizarMsg = formatMensajeCotizar({
    producto: 'Chaqueta Alpinestars Andes v3 Drystar',
    variante: 'Negro / Camo, Talla XL',
    sku: 'ALP-ANDES-XL',
    url: 'https://ioribikershop.pe/producto/chaqueta-alpinestars',
  });

  assert.match(cotizarMsg, /👋 Quiero cotizar: \*Chaqueta Alpinestars/);
  assert.match(cotizarMsg, /SKU ALP-ANDES-XL/);
  assert.match(cotizarMsg, /https:\/\/ioribikershop\.pe\/producto\/chaqueta-alpinestars/);

  const financiamientoMsg = formatMensajeFinanciamiento({
    codigo: 'FIN-004321',
    producto: 'Casco MT Thunder 4 SV',
  });

  assert.match(financiamientoMsg, /\*FIN-004321\*/);
  assert.match(financiamientoMsg, /Casco MT Thunder 4 SV/);
  assert.match(financiamientoMsg, /Quedo a la espera de los requisitos/);
});
