import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { verifyAdminOnly } from '@/lib/security/auth-check';
import { slugify, buildUniqueSlug } from '@/utils/slug';

/** Traduce errores de Supabase a mensajes accionables para el panel */
function toErrorMessage(err: any): string {
  const msg = err?.message || '';
  if (err?.code === '42501' || /row-level security/i.test(msg)) {
    return 'Supabase rechazó la escritura por reglas RLS: el servidor no está usando la clave secreta. ' +
      'Revisa SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY en Netlify y vuelve a desplegar.';
  }
  if (err?.code === '23505') {
    if (/slug/i.test(msg)) return 'Ese enlace ya lo usa otro producto. Cámbialo o déjalo vacío para generarlo automáticamente.';
    if (/sku/i.test(msg)) return 'Uno de los SKU ya existe en otro producto. Revisa los códigos SKU.';
    return 'Ya existe un registro con esos datos.';
  }
  if (err?.code === '23502') return 'Falta un dato obligatorio del producto.';
  return msg || 'Error desconocido al guardar el producto.';
}

/** Campo del formulario al que pertenece un error de la base de datos */
function errorField(err: any): string | undefined {
  if (err?.code === '23505' && /slug/i.test(err?.message || '')) return 'slug';
  return undefined;
}

/** Error de columna inexistente (migración aún no aplicada) */
function isMissingColumn(err: any, column: string): boolean {
  const msg = `${err?.message || ''} ${err?.details || ''}`;
  return (err?.code === 'PGRST204' || err?.code === '42703') && msg.includes(column);
}

/** Error con campo asociado para mostrarlo junto al input correcto */
function fieldError(field: string, error: string) {
  return NextResponse.json({ error, field }, { status: 400 });
}

/** Guardar o crear producto (POST) */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const adminSupabase = createAdminClient();

    // 1. Validaciones de Categoría y Marca obligatorias
    if (!body.categoria_slug || !String(body.categoria_slug).trim()) {
      return fieldError('categoria', 'La categoría del producto es obligatoria.');
    }
    if (!body.marca_id || !String(body.marca_id).trim()) {
      return fieldError('marca', 'La marca oficial del producto es obligatoria.');
    }
    if (!body.nombre || !String(body.nombre).trim()) {
      return fieldError('nombre', 'El nombre del producto es obligatorio.');
    }

    const hasVariants = Boolean(body.variantes && body.variantes.length > 0);
    const cleanGeneralSku = body.sku ? String(body.sku).trim().toUpperCase() : '';
    const currentId: string = body.id || 'none';

    // 2. Validación de SKU General: Con variantes se guarda NULL; sin variantes es obligatorio
    let finalGeneralSku: string | null = null;
    if (!hasVariants) {
      if (!cleanGeneralSku) {
        return fieldError('sku', 'El código SKU es obligatorio para productos sin variantes.');
      }
      finalGeneralSku = cleanGeneralSku;

      const [{ data: prodDupe }, { data: varDupe }] = await Promise.all([
        adminSupabase.from('productos').select('id, nombre').eq('sku', cleanGeneralSku).neq('id', currentId).maybeSingle(),
        adminSupabase.from('producto_variantes').select('id, producto_id').eq('sku', cleanGeneralSku).neq('producto_id', currentId).maybeSingle(),
      ]);
      if (prodDupe) {
        return fieldError('sku', `El SKU "${cleanGeneralSku}" ya pertenece a "${prodDupe.nombre}".`);
      }
      if (varDupe) {
        return fieldError('sku', `El SKU "${cleanGeneralSku}" ya está registrado en una variante de otro producto.`);
      }
    }

    // 3. Validación de Variantes: SKU no vacío, no duplicado internamente ni contra otros productos
    if (hasVariants) {
      const seenSkus = new Set<string>();
      for (let idx = 0; idx < body.variantes.length; idx++) {
        const v = body.variantes[idx];
        const vSku = v.sku ? String(v.sku).trim().toUpperCase() : '';
        const field = `variante_${idx}_sku`;
        if (!vSku) {
          return fieldError(field, `La variante ${v.talla || 'STD'} / ${v.color || 'STD'} no tiene código SKU.`);
        }
        if (seenSkus.has(vSku)) {
          return fieldError(field, `El SKU "${vSku}" está repetido en las variantes de este producto.`);
        }
        seenSkus.add(vSku);

        const [{ data: pMatch }, { data: vMatch }] = await Promise.all([
          adminSupabase.from('productos').select('id, nombre').eq('sku', vSku).neq('id', currentId).maybeSingle(),
          adminSupabase.from('producto_variantes').select('id, producto_id').eq('sku', vSku).neq('producto_id', currentId).maybeSingle(),
        ]);
        if (pMatch) {
          return fieldError(field, `El SKU "${vSku}" ya pertenece al producto "${pMatch.nombre}".`);
        }
        if (vMatch) {
          return fieldError(field, `El SKU "${vSku}" ya está registrado en una variante de otro producto.`);
        }
      }
    }

    // 4. Enlace (slug): el nombre puede repetirse, el enlace no.
    //    - Si el usuario escribió un enlace y ya lo usa otro producto → error en el campo.
    //    - Si lo dejó vacío → se genera uno libre (nombre, nombre + color, -2, -3…).
    const requestedSlug = slugify(body.slug || '');
    let finalSlug: string;
    if (requestedSlug) {
      const { data: slugOwner } = await adminSupabase
        .from('productos')
        .select('id, nombre')
        .eq('slug', requestedSlug)
        .neq('id', currentId)
        .maybeSingle();
      if (slugOwner) {
        return fieldError(
          'slug',
          `Ese enlace ya lo usa el producto "${slugOwner.nombre}". Cámbialo o déjalo vacío para generarlo automáticamente.`
        );
      }
      finalSlug = requestedSlug;
    } else {
      const base = slugify(body.nombre) || 'producto';
      const { data: similares, error: slugErr } = await adminSupabase
        .from('productos')
        .select('slug')
        .like('slug', `${base}%`)
        .neq('id', currentId);
      if (slugErr) throw slugErr;
      const colores = hasVariants
        ? Array.from(new Set(body.variantes.map((v: any) => v.color).filter(Boolean)))
        : [];
      finalSlug = buildUniqueSlug(
        body.nombre,
        (similares || []).map((r: any) => r.slug),
        colores.length === 1 ? String(colores[0]) : null
      );
    }

    const productPayload: any = {
      nombre: String(body.nombre).trim(),
      slug: finalSlug,
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

    // 5. Copia de seguridad del estado anterior (solo al editar) para deshacer si algo falla.
    let snapshot: { product: any; variantes: any[]; imagenes: any[] } | null = null;
    if (body.id) {
      const [{ data: prevProduct }, { data: prevVars }, { data: prevImgs }] = await Promise.all([
        adminSupabase.from('productos').select('*').eq('id', body.id).maybeSingle(),
        adminSupabase.from('producto_variantes').select('*').eq('producto_id', body.id),
        adminSupabase.from('producto_imagenes').select('*').eq('producto_id', body.id),
      ]);
      if (!prevProduct) {
        return NextResponse.json(
          { error: 'Este producto ya no existe (puede que lo hayan eliminado). Vuelve a la lista y recarga.' },
          { status: 404 }
        );
      }
      snapshot = { product: prevProduct, variantes: prevVars || [], imagenes: prevImgs || [] };
    }

    let savedProductId: string = body.id;
    let createdNew = false;
    const warnings: string[] = [];

    try {
      if (body.id) {
        const { error } = await adminSupabase.from('productos').update(productPayload).eq('id', body.id);
        if (error) throw error;
      } else {
        const { data, error } = await adminSupabase.from('productos').insert(productPayload).select('id').single();
        if (error) throw error;
        savedProductId = data.id;
        createdNew = true;
      }

      // Variantes
      const { error: delVarError } = await adminSupabase
        .from('producto_variantes')
        .delete()
        .eq('producto_id', savedProductId);
      if (delVarError) throw delVarError;

      if (hasVariants) {
        const varRows = body.variantes.map((v: any) => ({
          producto_id: savedProductId,
          sku: String(v.sku).trim().toUpperCase(),
          talla: v.talla,
          color: v.color,
          color_hex: v.color_hex,
          stock: v.stock || 0,
          precio_ajuste: v.precio_ajuste || 0,
        }));
        const { error: insVarError } = await adminSupabase.from('producto_variantes').insert(varRows);
        if (insVarError) throw insVarError;
      }

      // Fotos (la tienda las lee de producto_imagenes). Cada foto puede pertenecer a un color.
      if (Array.isArray(body.imagenes)) {
        const { error: delImgError } = await adminSupabase
          .from('producto_imagenes')
          .delete()
          .eq('producto_id', savedProductId);
        if (delImgError) throw delImgError;

        const coloresValidos = new Set(
          hasVariants ? body.variantes.map((v: any) => v.color).filter(Boolean) : []
        );
        const imgRows = body.imagenes
          .filter((img: any) => img && typeof img.url === 'string' && img.url.trim())
          .map((img: any, idx: number) => ({
            producto_id: savedProductId,
            url: img.url.trim(),
            orden: idx + 1,
            alt: productPayload.nombre,
            color: img.color && coloresValidos.has(img.color) ? img.color : null,
          }));

        if (imgRows.length > 0) {
          let { error: insImgError } = await adminSupabase.from('producto_imagenes').insert(imgRows);
          if (insImgError && isMissingColumn(insImgError, 'color')) {
            // La migración de fotos por color aún no se aplicó: guardar sin color.
            const sinColor = imgRows.map(({ color: _c, ...rest }: any) => rest);
            ({ error: insImgError } = await adminSupabase.from('producto_imagenes').insert(sinColor));
            if (imgRows.some((r: any) => r.color)) {
              warnings.push('Las fotos se guardaron sin asignar color: falta aplicar la migración de fotos por color en Supabase.');
            }
          }
          if (insImgError) throw insImgError;
        }
      }
    } catch (saveErr) {
      // Deshacer para no dejar productos a medias
      try {
        if (createdNew && savedProductId) {
          await adminSupabase.from('productos').delete().eq('id', savedProductId);
        } else if (snapshot) {
          const { id: _id, ...prevFields } = snapshot.product;
          await adminSupabase.from('productos').update(prevFields).eq('id', body.id);
          await adminSupabase.from('producto_variantes').delete().eq('producto_id', body.id);
          if (snapshot.variantes.length) await adminSupabase.from('producto_variantes').insert(snapshot.variantes);
          await adminSupabase.from('producto_imagenes').delete().eq('producto_id', body.id);
          if (snapshot.imagenes.length) await adminSupabase.from('producto_imagenes').insert(snapshot.imagenes);
        }
      } catch (rollbackErr) {
        console.error('No se pudo deshacer el guardado parcial del producto:', rollbackErr);
      }
      throw saveErr;
    }

    // Revalidar caché de Next.js
    revalidatePath('/');
    revalidatePath('/productos');
    revalidatePath(`/producto/${finalSlug}`);
    if (snapshot?.product?.slug && snapshot.product.slug !== finalSlug) {
      revalidatePath(`/producto/${snapshot.product.slug}`);
    }

    return NextResponse.json({ success: true, id: savedProductId, slug: finalSlug, warnings });
  } catch (err: any) {
    console.error('Error en POST /api/admin/products:', err);
    return NextResponse.json({ error: toErrorMessage(err), field: errorField(err) }, { status: 500 });
  }
}

/** Actualización rápida inline de precio, oferta y stock (PATCH) */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
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
    return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
  }
}

/** Eliminar producto (DELETE) */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
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
    return NextResponse.json({ error: toErrorMessage(err) }, { status: 500 });
  }
}
