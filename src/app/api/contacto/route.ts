import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateAntiSpam } from '@/lib/security/antispam';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, celular, email, motivo, mensaje, acepta_privacidad, _hp } = body;

    // 1. Antispam & Honeypot
    const spamCheck = await validateAntiSpam(req, _hp);
    if (!spamCheck.allowed) {
      return NextResponse.json({ error: spamCheck.reason || 'Envío bloqueado por seguridad' }, { status: 400 });
    }

    // 2. Validación de campos obligatorios
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
      return NextResponse.json({ error: 'Ingresa tu nombre completo válido.' }, { status: 400 });
    }

    if (!celular || typeof celular !== 'string' || celular.trim().length < 8) {
      return NextResponse.json({ error: 'Ingresa un número de celular o WhatsApp válido.' }, { status: 400 });
    }

    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length < 5) {
      return NextResponse.json({ error: 'Escribe un mensaje de al menos 5 caracteres.' }, { status: 400 });
    }

    if (!acepta_privacidad) {
      return NextResponse.json({ error: 'Debes aceptar las políticas de privacidad para enviar tu mensaje.' }, { status: 400 });
    }

    // 3. Guardar en Supabase tabla mensajes_contacto
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('mensajes_contacto')
      .insert({
        nombre: nombre.trim(),
        celular: celular.trim(),
        email: email ? String(email).trim() : null,
        motivo: motivo ? String(motivo).trim() : 'Consulta general',
        mensaje: mensaje.trim(),
        leido: false,
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Error al guardar mensaje_contacto en Supabase:', error);
      return NextResponse.json(
        { error: 'No se pudo guardar tu mensaje. Por favor contáctanos directamente por WhatsApp.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '¡Mensaje recibido con éxito! Un asesor de Iori Biker Shop te contactará a la brevedad.',
      id: data.id,
    });
  } catch (err: any) {
    console.error('Excepción en /api/contacto:', err);
    return NextResponse.json({ error: 'Ocurrió un error inesperado al procesar tu solicitud.' }, { status: 500 });
  }
}
