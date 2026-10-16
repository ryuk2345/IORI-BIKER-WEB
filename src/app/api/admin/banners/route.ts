import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { verifyAdminOnly } from '@/lib/security/auth-check';

/**
 * GET: Obtener lista completa de banners para el panel de administración
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'No autorizado' }, { status: 403 });
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('banners')
      .select('*')
      .order('orden', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('Error GET /api/admin/banners:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST: Crear o actualizar un banner (upsert)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.imagen_desktop) {
      return NextResponse.json({ error: 'La imagen desktop (21:9) es obligatoria.' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const bannerPayload: any = {
      titulo: body.titulo || '',
      subtitulo: body.subtitulo || '',
      imagen_desktop: body.imagen_desktop,
      imagen_mobile: body.imagen_mobile || body.imagen_desktop, // Fallback si falta versión móvil
      texto_boton: body.texto_boton || '',
      enlace: body.enlace || '/productos',
      badge: body.badge || '',
      ubicacion: body.ubicacion || 'hero',
      fecha_inicio: body.fecha_inicio || null,
      fecha_fin: body.fecha_fin || null,
      activo: body.activo !== undefined ? Boolean(body.activo) : true,
      orden: typeof body.orden === 'number' ? body.orden : 0,
    };

    if (body.id) {
      bannerPayload.id = body.id;
    }

    const { data, error } = await adminSupabase
      .from('banners')
      .upsert(bannerPayload)
      .select()
      .single();

    if (error) throw error;

    // Revalidación inmediata de la Home y rutas públicas
    try {
      revalidatePath('/', 'page');
      revalidatePath('/admin/banners', 'page');
    } catch (e) {
      console.warn('Revalidate error:', e);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error POST /api/admin/banners:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH: Reordenar banners o actualizar estado activo
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const adminSupabase = createAdminClient();

    // 1. Caso reordenamiento por lote [{ id, orden }]
    if (Array.isArray(body.reorder)) {
      for (const item of body.reorder) {
        if (item.id && typeof item.orden === 'number') {
          await adminSupabase.from('banners').update({ orden: item.orden }).eq('id', item.id);
        }
      }
      try {
        revalidatePath('/', 'page');
      } catch {}
      return NextResponse.json({ success: true, message: 'Orden actualizado' });
    }

    // 2. Caso toggle activo o actualización individual
    if (body.id && body.updates) {
      const { data, error } = await adminSupabase
        .from('banners')
        .update(body.updates)
        .eq('id', body.id)
        .select()
        .single();

      if (error) throw error;
      try {
        revalidatePath('/', 'page');
      } catch {}
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
  } catch (err: any) {
    console.error('Error PATCH /api/admin/banners:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE: Eliminar un banner por ID
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminOnly(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de banner no proporcionado' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from('banners').delete().eq('id', id);

    if (error) throw error;

    try {
      revalidatePath('/', 'page');
      revalidatePath('/admin/banners', 'page');
    } catch {}

    return NextResponse.json({ success: true, message: 'Banner eliminado correctamente' });
  } catch (err: any) {
    console.error('Error DELETE /api/admin/banners:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
