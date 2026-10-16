import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateAntiSpam } from '@/lib/security/antispam';
import { formatPEN } from '@/utils/currency';
import { validarDNI, validarRUC, validarCelular } from '@/utils/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      codigo_cupon,
      tipo_comprobante,
      nombre,
      celular,
      email,
      dni,
      ruc,
      razon_social,
      metodo_entrega,
      distrito,
      direccion,
      referencia,
      departamento,
      ciudad,
      agencia,
      sede_recojo,
      notas,
      acepta_privacidad,
      user_id,
      metodo_pago,
      _hp,
    } = body;

    // 1. Antispam & Honeypot
    const spamCheck = await validateAntiSpam(req, _hp);
    if (!spamCheck.allowed) {
      return NextResponse.json({ error: spamCheck.reason || 'Envío bloqueado por seguridad' }, { status: 400 });
    }

    // 2. Validación de carrito y productos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
    }

    // 3. Validación de datos de cliente
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
      return NextResponse.json({ error: 'Ingresa tu nombre completo válido.' }, { status: 400 });
    }

    // Validar celular peruano de 9 dígitos comenzando en 9
    const valCelular = validarCelular(celular);
    if (!valCelular.valido) {
      return NextResponse.json({ error: valCelular.error || 'Ingresa un número de celular peruano válido (9 dígitos que empiece con 9).' }, { status: 400 });
    }
    const cleanCelular = valCelular.limpio;

    if (!acepta_privacidad) {
      return NextResponse.json({ error: 'Debes aceptar las políticas de privacidad para registrar tu pedido.' }, { status: 400 });
    }

    // Validar comprobante
    let dniRuc = '';
    let razonSocialFinal = null;
    let comprobanteTexto = '';

    if (tipo_comprobante === 'factura') {
      const valRuc = validarRUC(ruc);
      if (!valRuc.valido) {
        return NextResponse.json({ error: valRuc.error || 'Ingresa un RUC válido de 11 dígitos que empiece con 10 o 20.' }, { status: 400 });
      }
      if (!razon_social || razon_social.trim().length < 3) {
        return NextResponse.json({ error: 'Ingresa la Razón Social completa de la empresa para la factura.' }, { status: 400 });
      }
      dniRuc = valRuc.limpio;
      razonSocialFinal = razon_social.trim();
      comprobanteTexto = `Factura (RUC: ${valRuc.limpio} - ${razonSocialFinal})`;
    } else {
      const valDni = validarDNI(dni);
      if (!valDni.valido) {
        return NextResponse.json({ error: valDni.error || 'Ingresa un DNI válido de 8 dígitos para la boleta de venta.' }, { status: 400 });
      }
      dniRuc = valDni.limpio;
      comprobanteTexto = `Boleta (DNI: ${valDni.limpio})`;
    }

    // Validar método de entrega
    let entregaTexto = '';
    let metodoEntregaDB = '';
    let direccionEntregaFinal = '';
    let agenciaEnvioFinal = null;

    if (metodo_entrega === 'recojo') {
      if (sede_recojo === 'la-victoria') {
        metodoEntregaDB = 'recojo_la_victoria';
        entregaTexto = 'Recojo gratuito en Sede La Victoria (Av. Nicolás Arriola 901)';
      } else {
        metodoEntregaDB = 'recojo_independencia';
        entregaTexto = 'Recojo gratuito en Sede Independencia (Av. Contisuyo 418, Tahuantinsuyo)';
      }
    } else if (metodo_entrega === 'lima_delivery') {
      if (!distrito || !direccion) {
        return NextResponse.json({ error: 'Ingresa el distrito y dirección exacta para el delivery en Lima.' }, { status: 400 });
      }
      metodoEntregaDB = 'lima_domicilio';
      direccionEntregaFinal = `${direccion.trim()} - Distrito: ${distrito.trim()}${referencia ? ` (Ref: ${referencia.trim()})` : ''}`;
      entregaTexto = `Delivery Lima: ${direccionEntregaFinal}`;
    } else if (metodo_entrega === 'provincia') {
      if (!departamento || !ciudad || !agencia) {
        return NextResponse.json({ error: 'Ingresa departamento, ciudad y agencia (Shalom o Mavisur) para el despacho a provincia.' }, { status: 400 });
      }
      metodoEntregaDB = 'provincia_agencia';
      agenciaEnvioFinal = agencia;
      direccionEntregaFinal = `Agencia ${agencia} - ${ciudad.trim()}, ${departamento.trim()}${direccion ? ` (${direccion.trim()})` : ''}`;
      entregaTexto = `Envío Provincia: ${direccionEntregaFinal}`;
    } else {
      return NextResponse.json({ error: 'Selecciona un método de entrega válido.' }, { status: 400 });
    }

    // 4. VALIDACIÓN DE PRECIOS Y STOCK REAL EN BASE DE DATOS (NUNCA CONFIAR EN EL NAVEGADOR)
    const supabase = createAdminClient();

    let serverSubtotal = 0;
    const validatedItems: any[] = [];
    const itemsParaMensaje: string[] = [];

    for (const item of items) {
      const prodId = item.producto?.id || item.producto_id;
      if (!prodId) continue;

      const { data: dbProd, error: prodErr } = await supabase
        .from('productos')
        .select('id, nombre, sku, precio, precio_oferta, modo_venta, activo')
        .eq('id', prodId)
        .single();

      if (prodErr || !dbProd || !dbProd.activo) {
        return NextResponse.json({ error: `El producto "${item.producto?.nombre || prodId}" ya no está disponible.` }, { status: 400 });
      }

      // Regla: Los productos "solo cotizar" no entran al carrito
      if (dbProd.modo_venta === 'cotizar' || dbProd.modo_venta === 'solo_cotizar') {
        return NextResponse.json({
          error: `El producto "${dbProd.nombre}" es de venta exclusiva por cotización y no puede ser procesado por el carrito.`,
        }, { status: 400 });
      }

      const cantidad = Math.max(1, Number(item.cantidad) || 1);
      const precioUnitario = Number(dbProd.precio_oferta || dbProd.precio);
      const subtotalItem = Math.round(precioUnitario * cantidad * 100) / 100;
      serverSubtotal += subtotalItem;

      const varianteTexto = [item.tallaSeleccionada ? `Talla: ${item.tallaSeleccionada}` : '', item.colorSeleccionado ? `Color: ${item.colorSeleccionado}` : '']
        .filter(Boolean)
        .join(', ');

      validatedItems.push({
        producto_id: dbProd.id,
        producto_nombre: dbProd.nombre,
        variante_id: item.variante_id || null,
        variante_nombre: varianteTexto || null,
        sku: dbProd.sku || 'IORI-SKU',
        precio_unitario: precioUnitario,
        cantidad,
        subtotal: subtotalItem,
        imagen_url: item.producto?.imagenes?.[0] || null,
      });

      const lineaItem = `• ${cantidad} x ${dbProd.nombre} ${varianteTexto ? `(${varianteTexto})` : ''} · SKU ${dbProd.sku || 'N/A'} · ${formatPEN(subtotalItem)}`;
      itemsParaMensaje.push(lineaItem);
    }

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: 'No se encontraron productos válidos para procesar.' }, { status: 400 });
    }

    serverSubtotal = Math.round(serverSubtotal * 100) / 100;

    // 5. VALIDACIÓN DEL CUPÓN (SI SE APLICÓ)
    let serverDescuento = 0;
    if (codigo_cupon) {
      const { data: cup } = await supabase
        .from('cupones')
        .select('*')
        .ilike('codigo', codigo_cupon.trim())
        .eq('activo', true)
        .single();

      if (cup) {
        const ahora = new Date().toISOString();
        const validoFecha = !cup.fecha_fin || cup.fecha_fin >= ahora;
        const cumpleMinimo = !cup.minimo_compra || serverSubtotal >= Number(cup.minimo_compra);

        if (validoFecha && cumpleMinimo) {
          if (cup.tipo === 'porcentaje') {
            serverDescuento = Math.round(((serverSubtotal * Number(cup.valor)) / 100) * 100) / 100;
          } else {
            serverDescuento = Math.min(serverSubtotal, Number(cup.valor));
          }
        }
      }
    }

    // 6. VALIDACIÓN DEL COSTO DE ENVÍO
    let serverEnvio = 0;
    let envioPorCoordinar = false;

    if (metodoEntregaDB === 'lima_domicilio') {
      const { data: tarifaLima } = await supabase
        .from('envios_tarifas')
        .select('tarifa')
        .eq('zona', 'Lima')
        .eq('activo', true)
        .limit(1)
        .single();
      if (tarifaLima && Number(tarifaLima.tarifa) > 0) {
        serverEnvio = Number(tarifaLima.tarifa);
      } else {
        serverEnvio = 0;
        envioPorCoordinar = true;
      }
    } else if (metodoEntregaDB === 'provincia_agencia') {
      const { data: tarifaProv } = await supabase
        .from('envios_tarifas')
        .select('tarifa')
        .eq('zona', 'Provincias')
        .eq('activo', true)
        .limit(1)
        .single();
      if (tarifaProv && Number(tarifaProv.tarifa) > 0) {
        serverEnvio = Number(tarifaProv.tarifa);
      } else {
        serverEnvio = 0;
        envioPorCoordinar = true;
      }
    }

    const serverTotal = Math.max(0, Math.round((serverSubtotal - serverDescuento + serverEnvio) * 100) / 100);

    // 7. GENERACIÓN DEL TOKEN ALEATORIO (NUNCA EL CORRELATIVO EN LA URL)
    const publicToken = crypto.randomUUID();

    // 8. DETERMINAR ESTADO Y MÉTODO DE PAGO
    const esAcuotaz = metodo_pago === 'acuotaz';
    const estadoInicial = 'nuevo';

    // 9. INSERTAR PEDIDO EN BASE DE DATOS
    // Si la tabla no tiene pedidos previos, garantizar IORI-000001
    const { data: ultimosPedidos } = await supabase
      .from('pedidos')
      .select('codigo')
      .order('created_at', { ascending: false })
      .limit(1);

    let siguienteCodigo: string | undefined = undefined;
    if (!ultimosPedidos || ultimosPedidos.length === 0) {
      siguienteCodigo = 'IORI-000001';
    } else if (ultimosPedidos[0]?.codigo) {
      const match = ultimosPedidos[0].codigo.match(/IORI-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10) + 1;
        siguienteCodigo = `IORI-${String(num).padStart(6, '0')}`;
      }
    }

    const { data: pedidoCreado, error: pedError } = await supabase
      .from('pedidos')
      .insert({
        ...(siguienteCodigo ? { codigo: siguienteCodigo } : {}),
        estado: estadoInicial,
        metodo_pago: esAcuotaz ? 'acuotaz' : 'yape_plin_transferencia',
        items: validatedItems,
        subtotal: serverSubtotal,
        descuento: serverDescuento,
        envio: serverEnvio,
        total: serverTotal,
        cliente_nombre: nombre.trim(),
        cliente_celular: cleanCelular,
        cliente_email: email ? String(email).trim() : null,
        tipo_comprobante: tipo_comprobante === 'factura' ? 'factura' : 'boleta',
        dni_ruc: dniRuc,
        razon_social: razonSocialFinal,
        metodo_entrega: metodoEntregaDB,
        direccion_entrega: direccionEntregaFinal,
        agencia_envio: agenciaEnvioFinal,
        notas: notas ? String(notas).trim() : null,
        token: publicToken,
        user_id: user_id || null,
      })
      .select('id, codigo, token, total, created_at')
      .single();

    if (pedError || !pedidoCreado) {
      console.error('Error insertando pedido en Supabase:', pedError);
      return NextResponse.json({ error: 'No se pudo registrar el pedido en la base de datos.' }, { status: 500 });
    }

    // 10. INSERTAR ITEMS EN pedido_items
    const itemsToInsert = validatedItems.map((it) => ({
      pedido_id: pedidoCreado.id,
      producto_id: it.producto_id,
      variante_id: it.variante_id,
      producto_nombre: it.producto_nombre,
      variante_nombre: it.variante_nombre,
      sku: it.sku,
      precio_unitario: it.precio_unitario,
      cantidad: it.cantidad,
      subtotal: it.subtotal,
      imagen_url: it.imagen_url,
    }));

    await supabase.from('pedido_items').insert(itemsToInsert);

    // 11. GESTIÓN DE STOCK:
    // Regla: "se descuenta al marcar 'Pagado'."
    // Por ende, al crear el pedido (sea Yape o aCuotaz) no se descuenta aquí.

    // 12. INSERTAR HISTORIAL INICIAL
    await supabase.from('pedido_historial').insert({
      pedido_id: pedidoCreado.id,
      estado_anterior: null,
      estado_nuevo: estadoInicial,
      nota: esAcuotaz
        ? 'Pedido registrado para financiamiento en cuotas aCuotaz. Coordinación por WhatsApp.'
        : 'Pedido generado desde el carrito web por el cliente para pago por Yape/Plin/Transferencia.',
    });

    // 13. GENERACIÓN DE MENSAJE DE WHATSAPP OFICIAL
    let itemsTexto = itemsParaMensaje.join('\n');
    const notasTexto = notas ? notas.trim() : 'Ninguna';
    const linkPedido = `https://ioribikershop.pe/pedido/${pedidoCreado.token}`;

    // Calcular cuota referencial si es aCuotaz
    let pagoTexto = 'Pago: Yape, Plin o Transferencia';
    if (esAcuotaz) {
      const cuota = Math.ceil((serverTotal * 1.23 / 9) * 100) / 100;
      pagoTexto = `Pago: en cuotas con aCuotaz (estimado: 9 cuotas quincenales de S/ ${cuota.toFixed(2)})`;
    }

    let wspMensaje = `Hola, Iori Biker Shop 👋 Quiero hacer este pedido:

*Pedido ${pedidoCreado.codigo}*
${itemsTexto}

Subtotal: ${formatPEN(serverSubtotal)}
Descuento: ${serverDescuento > 0 ? formatPEN(serverDescuento) : 'S/ 0.00'}
Envío: ${serverEnvio === 0 ? (metodoEntregaDB.startsWith('recojo') ? 'Gratis (Recojo)' : 'Por coordinar (WhatsApp)') : formatPEN(serverEnvio)}
*Total: ${formatPEN(serverTotal)}*
*${pagoTexto}*

*Mis datos*
${nombre.trim()} · ${cleanCelular}
Comprobante: ${comprobanteTexto}
Entrega: ${entregaTexto}
Notas: ${notasTexto}

${esAcuotaz ? 'Quiero financiar mi pedido con aCuotaz. ¿Me envían el enlace para la evaluación con mi DNI? 🙌' : '¿Me confirman stock y cómo pagar? 🙌'}`;

    if (wspMensaje.length > 1500) {
      const itemsResumidos = itemsParaMensaje.slice(0, 3).join('\n') + `\n• ... y ${itemsParaMensaje.length - 3} producto(s) más. Ver detalle completo en: ${linkPedido}`;
      wspMensaje = `Hola, Iori Biker Shop 👋 Quiero hacer este pedido:

*Pedido ${pedidoCreado.codigo}*
${itemsResumidos}

Subtotal: ${formatPEN(serverSubtotal)}
Descuento: ${serverDescuento > 0 ? formatPEN(serverDescuento) : 'S/ 0.00'}
Envío: ${serverEnvio === 0 ? (metodoEntregaDB.startsWith('recojo') ? 'Gratis' : 'Por coordinar (WhatsApp)') : formatPEN(serverEnvio)}
*Total: ${formatPEN(serverTotal)}*
*${pagoTexto}*

*Mis datos*
${nombre.trim()} · ${cleanCelular}
Comprobante: ${comprobanteTexto}
Entrega: ${entregaTexto}
Notas: ${notasTexto}

Ver pedido completo: ${linkPedido}
${esAcuotaz ? 'Quiero financiar mi pedido con aCuotaz. ¿Me envían el enlace para la evaluación con mi DNI? 🙌' : '¿Me confirman stock y cómo pagar? 🙌'}`;
    }

    const wspUrl = `https://wa.me/51905445698?text=${encodeURIComponent(wspMensaje)}`;

    // aCuotaz es visual y se coordina por WhatsApp: sin redirect externo
    const acuotazRedirectUrl = null;

    return NextResponse.json({
      success: true,
      pedido_id: pedidoCreado.id,
      codigo: pedidoCreado.codigo,
      token: pedidoCreado.token,
      total: pedidoCreado.total,
      metodo_pago: esAcuotaz ? 'acuotaz' : 'yape_plin_transferencia',
      wspUrl,
      wspMensaje,
      linkPedido,
      redirect_to: acuotazRedirectUrl,
    });
  } catch (err: any) {
    console.error('Excepción en POST /api/pedidos:', err);
    return NextResponse.json({ error: 'Ocurrió un error inesperado al procesar el pedido.', details: err?.message, stack: err?.stack }, { status: 500 });
  }
}
