import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateAntiSpam } from '@/lib/security/antispam';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      nombre, 
      dni, 
      celular, 
      email, 
      producto_id, 
      producto_nombre, 
      monto, 
      cuotas, 
      inicial, 
      departamento,
      acepta_privacidad,
      _hp 
    } = body;

    // 1. Anti-spam honeypot
    const spamCheck = await validateAntiSpam(req, _hp);
    if (!spamCheck.allowed) {
      return NextResponse.json({ error: spamCheck.reason }, { status: 429 });
    }

    // 2. Validaciones estrictas
    if (!acepta_privacidad) {
      return NextResponse.json({ error: 'Debes aceptar las políticas de privacidad para continuar.' }, { status: 400 });
    }
    if (!nombre || nombre.trim().length < 3) {
      return NextResponse.json({ error: 'Por favor ingresa tu nombre completo.' }, { status: 400 });
    }
    if (!dni || !/^\d{8,12}$/.test(dni.trim())) {
      return NextResponse.json({ error: 'Por favor ingresa un documento de identidad válido (8 dígitos para DNI).' }, { status: 400 });
    }
    if (!celular || celular.trim().length < 9) {
      return NextResponse.json({ error: 'Por favor ingresa un número de celular de 9 dígitos.' }, { status: 400 });
    }
    if (!producto_nombre) {
      return NextResponse.json({ error: 'Por favor indica el producto o accesorio de tu interés.' }, { status: 400 });
    }
    if (!cuotas || ![3, 6, 9, 12].includes(Number(cuotas))) {
      return NextResponse.json({ error: 'Selecciona una cantidad de cuotas válida (3, 6, 9 o 12 meses).' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 3. Generar correlativo FIN-000001
    const { count } = await adminSupabase
      .from('solicitudes_financiamiento')
      .select('id', { count: 'exact', head: true });

    const correlativoNum = (count || 0) + 1;
    const codigo = `FIN-${String(correlativoNum).padStart(6, '0')}`;

    const montoFinanciar = Number(monto) || 500;
    const cuotasNum = Number(cuotas);
    const inicialNum = Number(inicial) || 0;
    const cuotaMensual = Math.round(((montoFinanciar - inicialNum) / cuotasNum) * 100) / 100;

    // 4. Guardar en Supabase
    const { error: insertError } = await adminSupabase
      .from('solicitudes_financiamiento')
      .insert({
        codigo,
        producto_id: producto_id || null,
        producto_nombre: producto_nombre.trim(),
        monto_financiar: montoFinanciar,
        cuotas: cuotasNum,
        cuota_mensual: cuotaMensual,
        inicial: inicialNum,
        cliente_nombre: nombre.trim(),
        cliente_celular: celular.trim(),
        cliente_dni: dni.trim(),
        cliente_email: email ? email.trim() : null,
        departamento: departamento || 'Lima',
        estado: 'pendiente',
      });

    if (insertError) {
      console.error('Error insertando financiamiento:', insertError);
      return NextResponse.json({ error: 'Error al registrar la solicitud: ' + insertError.message }, { status: 500 });
    }

    // 5. Preparar mensaje de WhatsApp con plantilla oficial de /docs/plantillas-whatsapp.md
    // Hola, Iori Biker Shop 👋 Envié la solicitud de financiamiento *{codigo}* para {producto}. Quedo a la espera de los requisitos.
    const wspMensaje = `Hola, Iori Biker Shop 👋 Envié la solicitud de financiamiento *${codigo}* para ${producto_nombre.trim()}. Quedo a la espera de los requisitos.`;
    const wspUrl = `https://wa.me/51905445698?text=${encodeURIComponent(wspMensaje)}`;

    return NextResponse.json({
      success: true,
      codigo,
      wspUrl,
      cuotaMensual,
      mensaje: '¡Solicitud registrada con éxito! Te estamos redirigiendo a WhatsApp para completar los requisitos.',
    });
  } catch (err: any) {
    console.error('Error en POST /api/financiamiento:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
