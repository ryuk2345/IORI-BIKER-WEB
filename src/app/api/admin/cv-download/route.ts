import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyStaffAuth } from '@/lib/security/auth-check';

export async function GET(req: NextRequest) {
  try {
    // Seguridad: Un visitante no puede descargar ni leer CVs
    const auth = await verifyStaffAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    const redirect = searchParams.get('redirect') === 'true';

    if (!path) {
      return NextResponse.json({ error: 'Ruta de archivo no especificada' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from('cvs')
      .createSignedUrl(path, 3600); // 1 hora de validez

    if (error || !data?.signedUrl) {
      console.error('Error al generar signedUrl de CV:', error);
      return NextResponse.json({ error: 'No se pudo generar el enlace seguro de descarga' }, { status: 500 });
    }

    if (redirect) {
      return NextResponse.redirect(data.signedUrl);
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    console.error('Excepción en /api/admin/cv-download:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
