import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { verifyAdminOnly } from '@/lib/security/auth-check';

/** Guardar o crear producto (POST) */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'No autorizado. Se requiere rol de Administrador.' }, { status: 403 });
    }

    const body = await req.json();
    const adminSupabase = createAdminClient();

    const productPayload: any = {
      nombre: body.nombre,
      slug: body.slug,
      categoria_slug: body.categoria_slug,
      subcategoria_slug: body.subcategoria_slug || '',
      categoria_nombre: body.categoria_nombre,
      subcategoria_nombre: body.subcategoria_nombre || '',
      marca_id: body.marca_id || 'ls2',
      marca_nombre: body.marca_nombre || 'LS2',
      precio: body.precio,
      precio_original: body.precio_original || null,
      precio_oferta: body.precio_oferta || null,
      descuento_porcentaje: body.descuento_porcentaje || null,
      es_oferta: Boolean(body.es_oferta || (body.precio_oferta && body.precio_oferta < body.precio)),
      es_nuevo: Boolean(body.es_nuevo),
      es_combo: Boolean(body.es_combo),
      modo_venta: body.modo_venta || 'online',
      descripcion_corta: body.descripcion_corta || '',
      descripcion_larga: body.descripcion_larga || '',
      sku: body.sku,
      certificacion: body.certificacion || null,
      stock: body.stock || 0,
      financiamiento_disponible: Boolean(body.financiamiento_disponible),
      ficha_tecnica: body.ficha_tecnica || {},
      activo: body.activo !== undefined ? body.activo : true,
      updated_at: new Date().toISOString(),
    };

    let savedProductId = body.id;

    if (body.id) {
      const { error } = await adminSupabase
        .from('productos')
        .update(productPayload)
        .eq('id', body.id);
      if (error) throw error;
    } else {
      const { data, error } = await adminSupabase
        .from('productos')
        .insert(productPayload)
        .select('id')
        .single();
      if (error) throw error;
      savedProductId = data.id;
    }

    // Guardar variantes si se envían
    if (body.variantes && body.variantes.length > 0) {
      await adminSupabase.from('producto_variantes').delete().eq('producto_id', savedProductId);
      const varRows = body.variantes.map((v: any) => ({
        producto_id: savedProductId,
        sku: v.sku || `${body.sku}-${v.talla || 'STD'}-${v.color || 'STD'}`,
        talla: v.talla,
        color: v.color,
        color_hex: v.color_hex,
        stock: v.stock || 0,
        precio_ajuste: v.precio_ajuste || 0,
      }));
      await adminSupabase.from('producto_variantes').insert(varRows);
    }

    // Revalidar caché de Next.js
    revalidatePath('/');
    revalidatePath('/productos');
    revalidatePath(`/producto/${body.slug}`);

    return NextResponse.json({ success: true, id: savedProductId });
  } catch (err: any) {
    console.error('Error en POST /api/admin/products:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Actualización rápida inline de precio, oferta y stock (PATCH) */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'No autorizado' }, { status: 403 });
    }

    const { id, updates } = await req.json();
    const adminSupabase = createAdminClient();

    const payload: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.precio_oferta !== undefined) {
      if (updates.precio_oferta && updates.precio && updates.precio_oferta < updates.precio) {
        payload.es_oferta = true;
        payload.descuento_porcentaje = Math.round(((updates.precio - updates.precio_oferta) / updates.precio) * 100);
      } else {
        payload.es_oferta = false;
      }
    }

    const { data, error } = await adminSupabase
      .from('productos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/productos');

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Eliminar producto (DELETE) */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from('productos').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/productos');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
