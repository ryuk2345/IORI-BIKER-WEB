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

    // 1. Validaciones de Categoría y Marca obligatorias
    if (!body.categoria_slug || !body.categoria_slug.trim()) {
      return NextResponse.json({ error: 'La categoría del producto es obligatoria.' }, { status: 400 });
    }
    if (!body.marca_id || !body.marca_id.trim()) {
      return NextResponse.json({ error: 'La marca oficial del producto es obligatoria.' }, { status: 400 });
    }

    const hasVariants = Boolean(body.variantes && body.variantes.length > 0);
    const cleanGeneralSku = body.sku ? body.sku.trim().toUpperCase() : '';

    // 2. Validación de SKU General: Con variantes se guarda NULL; sin variantes es obligatorio
    let finalGeneralSku: string | null = null;
    if (hasVariants) {
      finalGeneralSku = null; // No copiar SKU de variante, siempre NULL en el producto padre
    } else {
      if (!cleanGeneralSku) {
        return NextResponse.json({ error: 'El código SKU es obligatorio para productos sin variantes.' }, { status: 400 });
      }
      finalGeneralSku = cleanGeneralSku;

      // Comprobar duplicado de SKU general contra otros productos y variantes
      const { data: prodDupe } = await adminSupabase
        .from('productos')
        .select('id, nombre')
        .eq('sku', cleanGeneralSku)
        .neq('id', body.id || 'none')
        .maybeSingle();
      if (prodDupe) {
        return NextResponse.json({ error: `El SKU "${cleanGeneralSku}" ya pertenece a "${prodDupe.nombre}".` }, { status: 400 });
      }

      const { data: varDupe } = await adminSupabase
        .from('producto_variantes')
        .select('id, sku')
        .eq('sku', cleanGeneralSku)
        .neq('producto_id', body.id || 'none')
        .maybeSingle();
      if (varDupe) {
        return NextResponse.json({ error: `El SKU "${cleanGeneralSku}" ya está registrado en otra variante existente.` }, { status: 400 });
      }
    }

    // 3. Validación de Variantes: SKU no vacío, no duplicado internamente ni contra otros productos
    if (hasVariants) {
      const seenSkus = new Set<string>();
      for (const v of body.variantes) {
        const vSku = v.sku ? v.sku.trim().toUpperCase() : '';
        if (!vSku) {
          return NextResponse.json(
            { error: `La variante (${v.talla || 'STD'} / ${v.color || 'STD'}) no tiene código SKU.` },
            { status: 400 }
          );
        }
        if (seenSkus.has(vSku)) {
          return NextResponse.json(
            { error: `El SKU "${vSku}" está duplicado en las variantes de este producto.` },
            { status: 400 }
          );
        }
        seenSkus.add(vSku);

        // Duplicado contra otros productos
        const { data: pMatch } = await adminSupabase
          .from('productos')
          .select('id, nombre')
          .eq('sku', vSku)
          .neq('id', body.id || 'none')
          .maybeSingle();
        if (pMatch) {
          return NextResponse.json(
            { error: `El SKU "${vSku}" ya pertenece al producto "${pMatch.nombre}".` },
            { status: 400 }
          );
        }

        // Duplicado contra variantes de otros productos
        const { data: vMatch } = await adminSupabase
          .from('producto_variantes')
          .select('id, producto_id, sku')
          .eq('sku', vSku)
          .neq('producto_id', body.id || 'none')
          .maybeSingle();
        if (vMatch) {
          return NextResponse.json(
            { error: `El SKU "${vSku}" ya está registrado en otra variante existente en el catálogo.` },
            { status: 400 }
          );
        }
      }
    }

    const productPayload: any = {
      nombre: body.nombre,
      slug: body.slug,
      categoria_slug: body.categoria_slug,
      subcategoria_slug: body.subcategoria_slug || '',
      categoria_nombre: body.categoria_nombre,
      subcategoria_nombre: body.subcategoria_nombre || '',
      marca_id: body.marca_id,
      marca_nombre: body.marca_nombre || body.marca_id,
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
      sku: finalGeneralSku,
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
    if (hasVariants) {
      await adminSupabase.from('producto_variantes').delete().eq('producto_id', savedProductId);
      const varRows = body.variantes.map((v: any) => ({
        producto_id: savedProductId,
        sku: v.sku.trim().toUpperCase(),
        talla: v.talla,
        color: v.color,
        color_hex: v.color_hex,
        stock: v.stock || 0,
        precio_ajuste: v.precio_ajuste || 0,
      }));
      await adminSupabase.from('producto_variantes').insert(varRows);
    } else {
      // Si antes tenía variantes y ahora es simple, limpiar variantes
      await adminSupabase.from('producto_variantes').delete().eq('producto_id', savedProductId);
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
