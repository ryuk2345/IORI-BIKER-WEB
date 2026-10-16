import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('apurata-auth') || req.headers.get('authorization');
    const secretToken = process.env.ACUOTAZ_SECRET_TOKEN;

    // Validación de seguridad opcional si el token está configurado
    if (secretToken && authHeader) {
      const providedToken = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (providedToken !== secretToken.trim()) {
        console.warn('Webhook aCuotaz: Token no autorizado');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const { order_id, event } = body;

    if (!order_id || !event) {
      return NextResponse.json(
        { error: 'Parámetros order_id y event requeridos' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Buscar el pedido en Supabase por ID o por Código IORI
    let query = supabase.from('pedidos').select('*, items:pedido_items(*)');
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order_id)) {
      query = query.eq('id', order_id);
    } else {
      query = query.eq('codigo', order_id);
    }

    const { data: pedido, error: pedErr } = await query.maybeSingle();

    if (pedErr || !pedido) {
      console.warn(`Webhook aCuotaz: Pedido ${order_id} no encontrado en base de datos`);
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const estadoAnterior = pedido.estado;
    let nuevoEstado = estadoAnterior;
    let notaHistorial = `Evento de aCuotaz recibido: ${event}`;

    // 2. Procesamiento según el evento oficial de aCuotaz
    switch (event) {
      case 'approved':
      case 'funded':
        nuevoEstado = 'pagado';
        notaHistorial = `Financiamiento aCuotaz ${event === 'funded' ? 'desembolsado' : 'aprobado'}. Pago confirmado.`;
        break;

      case 'canceled':
      case 'rejected':
        nuevoEstado = 'cancelado';
        notaHistorial = `Solicitud aCuotaz ${event}. Pedido cancelado y stock liberado.`;

        // Regla: Con aCuotaz se reserva al crear la orden y se libera si aCuotaz la cancela o rechaza.
        if (pedido.items && Array.isArray(pedido.items)) {
          for (const item of pedido.items) {
            if (item.variante_id) {
              const { data: v } = await supabase
                .from('producto_variantes')
                .select('stock')
                .eq('id', item.variante_id)
                .single();
              if (v) {
                await supabase
                  .from('producto_variantes')
                  .update({ stock: v.stock + item.cantidad })
                  .eq('id', item.variante_id);
              }
            } else if (item.producto_id) {
              const { data: p } = await supabase
                .from('productos')
                .select('stock')
                .eq('id', item.producto_id)
                .single();
              if (p) {
                await supabase
                  .from('productos')
                  .update({ stock: p.stock + item.cantidad })
                  .eq('id', item.producto_id);
              }
            }
          }
        }
        break;

      case 'created':
      case 'onhold':
      case 'validated':
        nuevoEstado = 'en_evaluacion_acuotaz';
        notaHistorial = `Cliente en proceso con aCuotaz (${event}).`;
        break;

      default:
        notaHistorial = `Evento adicional aCuotaz: ${event}`;
        break;
    }

    // 3. Actualizar estado del pedido si cambió
    if (nuevoEstado !== estadoAnterior) {
      await supabase
        .from('pedidos')
        .update({
          estado: nuevoEstado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pedido.id);
    }

    // 4. Registrar en historial para auditoría
    await supabase.from('pedido_historial').insert({
      pedido_id: pedido.id,
      estado_anterior: estadoAnterior,
      estado_nuevo: nuevoEstado,
      nota: notaHistorial,
    });

    return NextResponse.json({
      success: true,
      order_id,
      event,
      nuevoEstado,
    });
  } catch (error: any) {
    console.error('Error procesando webhook de aCuotaz:', error);
    return NextResponse.json(
      { error: 'Error interno en webhook aCuotaz' },
      { status: 500 }
    );
  }
}
