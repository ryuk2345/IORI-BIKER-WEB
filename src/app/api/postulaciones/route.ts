import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateAntiSpam } from '@/lib/security/antispam';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const _hp = formData.get('_hp') as string | null;
    const spamCheck = await validateAntiSpam(req, _hp || undefined);
    if (!spamCheck.allowed) {
      return NextResponse.json({ error: spamCheck.reason || 'Envío bloqueado por seguridad' }, { status: 400 });
    }

    const puesto = (formData.get('puesto') as string | null)?.trim();
    const nombre = (formData.get('nombre') as string | null)?.trim();
    const celular = (formData.get('celular') as string | null)?.trim();
    const email = (formData.get('email') as string | null)?.trim();
    const mensaje = (formData.get('mensaje') as string | null)?.trim() || '';
    const acepta_privacidad = formData.get('acepta_privacidad') === 'true' || formData.get('acepta_privacidad') === 'on';

    if (!puesto) {
      return NextResponse.json({ error: 'Selecciona el puesto de tu interés.' }, { status: 400 });
    }
    if (!nombre || nombre.length < 2) {
      return NextResponse.json({ error: 'Ingresa tu nombre completo válido.' }, { status: 400 });
    }
    if (!celular || celular.length < 8) {
      return NextResponse.json({ error: 'Ingresa un número de celular o WhatsApp válido.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ingresa un correo electrónico válido.' }, { status: 400 });
    }
    if (!acepta_privacidad) {
      return NextResponse.json({ error: 'Debes aceptar la política de privacidad para enviar tu CV.' }, { status: 400 });
    }

    // Validar archivo CV
    const file = formData.get('cv') as File | null;
    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Debes adjuntar tu CV en formato PDF.' }, { status: 400 });
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'El archivo excede el tamaño máximo permitido de 5 MB.' }, { status: 400 });
    }

    const fileNameLower = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || fileNameLower.endsWith('.pdf');
    if (!isPdf) {
      return NextResponse.json({ error: 'Formato inválido. El CV debe ser obligatoriamente un archivo PDF (.pdf).' }, { status: 400 });
    }

    // Subir al bucket privado 'cvs'
    const supabase = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = puesto.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    const storagePath = `${folder}/${Date.now()}_${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir CV al bucket privado cvs:', uploadError);
      return NextResponse.json(
        { error: 'No se pudo subir tu archivo CV. Por favor intenta con un archivo más ligero o contáctanos por WhatsApp.' },
        { status: 500 }
      );
    }

    // Insertar en la tabla postulaciones
    const { data: postu, error: dbError } = await supabase
      .from('postulaciones')
      .insert({
        puesto,
        nombre,
        celular,
        email,
        cv_url: storagePath, // Ruta interna en el bucket privado
        mensaje,
        estado: 'nuevo',
      })
      .select('id, created_at')
      .single();

    if (dbError) {
      console.error('Error al registrar postulación en base de datos:', dbError);
      return NextResponse.json(
        { error: 'No se pudo registrar tu postulación en el sistema.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '¡Tu postulación ha sido enviada con éxito a Iori Biker Shop! Nuestro equipo de Recursos Humanos revisará tu perfil.',
      id: postu.id,
    });
  } catch (err: any) {
    console.error('Excepción en /api/postulaciones:', err);
    return NextResponse.json({ error: 'Ocurrió un error inesperado al procesar tu postulación.' }, { status: 500 });
  }
}
