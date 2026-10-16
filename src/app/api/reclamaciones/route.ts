import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendReclamacionEmail } from '@/lib/services/email-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tipoDocumento,
      numeroDocumento,
      nombres,
      apellidos,
      domicilio,
      telefono,
      email,
      padreTutor,
      tipoBien,
      montoReclamado,
      descripcionBien,
      tipoReclamacion,
      detalle,
      pedido,
      declaroVerdad,
    } = body;

    // 1. Validaciones obligatorias
    if (!declaroVerdad) {
      return NextResponse.json(
        { error: 'Debe confirmar la declaración de veracidad de la información.' },
        { status: 400 }
      );
    }

    if (!nombres || !apellidos || !numeroDocumento || !telefono || !email || !detalle || !pedido || !descripcionBien) {
      return NextResponse.json(
        { error: 'Todos los campos marcados con asterisco (*) son obligatorios.' },
        { status: 400 }
      );
    }

    // Datos oficiales del proveedor (conforme a la regla y datos de negocio)
    const datosProveedor = {
      razon_social: 'IORI SAC',
      nombre_comercial: 'IORI BIKER SHOP',
      ruc: '20610816089',
      direccion: 'Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima',
    };

    const supabase = createAdminClient();

    // 2. Determinar correlativo REC-YYYY-000001 si la tabla está vacía o correlativo consecutivo
    const anioActual = new Date().getFullYear();
    const { data: ultimasReclamaciones } = await supabase
      .from('libro_reclamaciones')
      .select('codigo')
      .order('created_at', { ascending: false })
      .limit(1);

    let siguienteCodigoReclamacion: string | undefined = undefined;
    if (!ultimasReclamaciones || ultimasReclamaciones.length === 0) {
      siguienteCodigoReclamacion = `REC-${anioActual}-000001`;
    } else if (ultimasReclamaciones[0]?.codigo) {
      const regex = new RegExp(`REC-${anioActual}-(\\d+)`);
      const match = ultimasReclamaciones[0].codigo.match(regex);
      if (match) {
        const num = parseInt(match[1], 10) + 1;
        siguienteCodigoReclamacion = `REC-${anioActual}-${String(num).padStart(6, '0')}`;
      } else {
        siguienteCodigoReclamacion = `REC-${anioActual}-000001`;
      }
    }

    // 3. Insertar en libro_reclamaciones
    const { data: reclamacion, error: insertError } = await supabase
      .from('libro_reclamaciones')
      .insert({
        ...(siguienteCodigoReclamacion ? { codigo: siguienteCodigoReclamacion } : {}),
        datos_consumidor: {
          tipo_documento: tipoDocumento,
          numero_documento: numeroDocumento,
          nombres,
          apellidos,
          domicilio,
          telefono,
          email,
          padre_tutor: padreTutor || null,
        },
        bien_contratado: {
          tipo_bien: tipoBien || 'producto',
          monto: montoReclamado || null,
          descripcion: descripcionBien,
        },
        detalle_reclamacion: {
          tipo: tipoReclamacion || 'reclamo',
          detalle,
          pedido,
        },
        datos_proveedor: datosProveedor,
        estado: 'pendiente',
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error insertando en libro_reclamaciones:', insertError);
      return NextResponse.json(
        { error: 'No se pudo registrar la hoja de reclamación en el servidor: ' + insertError.message },
        { status: 500 }
      );
    }

    // 3. Enviar copia por correo al consumidor vía Resend (modo prueba)
    const fechaStr = new Date(reclamacion.created_at).toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const emailResult = await sendReclamacionEmail({
      codigo: reclamacion.codigo,
      fecha: fechaStr,
      consumidor: {
        nombres,
        apellidos,
        tipoDocumento,
        numeroDocumento,
        telefono,
        email,
        domicilio,
        padreTutor,
      },
      bien: {
        tipoBien,
        montoReclamado,
        descripcionBien,
      },
      detalle: {
        tipoReclamacion,
        detalle,
        pedido,
      },
      proveedor: {
        razonSocial: datosProveedor.razon_social,
        ruc: datosProveedor.ruc,
        direccion: datosProveedor.direccion,
        nombreComercial: datosProveedor.nombre_comercial,
      },
    });

    return NextResponse.json({
      success: true,
      codigo: reclamacion.codigo,
      fecha: reclamacion.created_at,
      datos_proveedor: datosProveedor,
      emailSent: emailResult.success,
    });
  } catch (err: any) {
    console.error('Error en API /api/reclamaciones:', err);
    return NextResponse.json(
      { error: 'Error interno al procesar la reclamación: ' + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
