import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyStaffAuth } from '@/lib/security/auth-check';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyStaffAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const body = await req.json();
    const { 
      pedido_id, 
      nuevo_estado, 
      metodo_pago, 
      numero_operacion, 
      codigo_seguimiento,
      notas_internas,
      forzar_sin_stock 
    } = body;

    if (!pedido_id || !nuevo_estado) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Obtener pedido actual y sus ítems
    const { data: pedido, error: pedErr } = await supabase
      .from('pedidos')
      .select('*, pedido_items(*)')
      .eq('id', pedido_id)
      .single();

    if (pedErr || !pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const estadoAnterior = pedido.estado;
    const items = pedido.pedido_items || [];

    // 2. Si se va a marcar como 'pagado'
    if (nuevo_estado === 'pagado' && estadoAnterior !== 'pagado') {
      if (!metodo_pago) {
        return NextResponse.json({ error: 'Debes indicar el método de pago (Yape, Plin, BCP, etc.)' }, { status: 400 });
      }

      // Validar stock antes de descontar
      const stockFaltante: string[] = [];

      for (const it of items) {
        if (it.variante_id) {
          const { data: v } = await supabase
            .from('producto_variantes')
            .select('stock, sku')
            .eq('id', it.variante_id)
            .single();

          if (v && v.stock < it.cantidad && !forzar_sin_stock) {
            stockFaltante.push(`${it.producto_nombre} (${it.variante_nombre || v.sku}): disponible ${v.stock}, pedido ${it.cantidad}`);
          }
        } else if (it.producto_id) {
          const { data: p } = await supabase
            .from('productos')
            .select('stock, nombre')
            .eq('id', it.producto_id)
            .single();

          if (p && p.stock < it.cantidad && !forzar_sin_stock) {
            stockFaltante.push(`${p.nombre}: disponible ${p.stock}, pedido ${it.cantidad}`);
          }
        }
      }

      if (stockFaltante.length > 0) {
        return NextResponse.json({
          warning_stock: true,
          error: `Stock insuficiente para confirmar pago:\n${stockFaltante.join('\n')}`,
        }, { status: 409 });
      }

      // Descontar stock
      for (const it of items) {
        if (it.variante_id) {
          const { data: v } = await supabase
            .from('producto_variantes')
            .select('stock')
            .eq('id', it.variante_id)
            .single();
          if (v) {
            const nuevoStock = Math.max(0, v.stock - it.cantidad);
            await supabase
              .from('producto_variantes')
              .update({ stock: nuevoStock })
              .eq('id', it.variante_id);
          }
        } else if (it.producto_id) {
          const { data: p } = await supabase
            .from('productos')
            .select('stock')
            .eq('id', it.producto_id)
            .single();
          if (p) {
            const nuevoStock = Math.max(0, p.stock - it.cantidad);
            await supabase
              .from('productos')
              .update({ stock: nuevoStock })
              .eq('id', it.producto_id);
          }
        }
      }
    }

    // 3. Si se cancela un pedido cuyo stock ya había sido descontado, devolver el stock
    const estadosConStockDescontado = ['pagado', 'en_preparacion', 'listo_recojo', 'en_camino'];
    if (nuevo_estado === 'cancelado' && estadosConStockDescontado.includes(estadoAnterior)) {
      for (const it of items) {
        if (it.variante_id) {
          const { data: v } = await supabase
            .from('producto_variantes')
            .select('stock')
            .eq('id', it.variante_id)
            .single();
          if (v) {
            await supabase
              .from('producto_variantes')
              .update({ stock: v.stock + it.cantidad })
              .eq('id', it.variante_id);
          }
        } else if (it.producto_id) {
          const { data: p } = await supabase
            .from('productos')
            .select('stock')
            .eq('id', it.producto_id)
            .single();
          if (p) {
            await supabase
              .from('productos')
              .update({ stock: p.stock + it.cantidad })
              .eq('id', it.producto_id);
          }
        }
      }
    }

    // 4. Actualizar pedido en la BD
    const updatePayload: any = {
      estado: nuevo_estado,
      updated_at: new Date().toISOString(),
    };

    if (metodo_pago) updatePayload.metodo_pago = metodo_pago;
    if (numero_operacion) updatePayload.numero_operacion = numero_operacion;
    if (codigo_seguimiento !== undefined) updatePayload.codigo_seguimiento = codigo_seguimiento;
    if (notas_internas !== undefined) updatePayload.notas_internas = notas_internas;

    const { error: updErr } = await supabase
      .from('pedidos')
      .update(updatePayload)
      .eq('id', pedido_id);

    if (updErr) {
      console.error('Error actualizando pedido:', updErr);
      return NextResponse.json({ error: 'No se pudo actualizar el estado del pedido' }, { status: 500 });
    }

    // 5. Registrar en historial
    let notaHistorial = `Estado cambiado de "${estadoAnterior}" a "${nuevo_estado}".`;
    if (nuevo_estado === 'pagado') {
      notaHistorial += ` Pago confirmado con ${metodo_pago}. N° Operación: ${numero_operacion || 'Sin número'}. Stock descontado.`;
    } else if (nuevo_estado === 'cancelado' && estadoAnterior === 'pagado') {
      notaHistorial += ` Pedido cancelado. Stock de productos devuelto al inventario.`;
    }

    await supabase.from('pedido_historial').insert({
      pedido_id,
      estado_anterior: estadoAnterior,
      estado_nuevo: nuevo_estado,
      nota: notaHistorial,
    });

    return NextResponse.json({
      success: true,
      message: `Pedido ${pedido.codigo} actualizado a "${nuevo_estado}" correctamente.`,
    });
  } catch (err: any) {
    console.error('Excepción en /api/admin/pedidos/estado:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
