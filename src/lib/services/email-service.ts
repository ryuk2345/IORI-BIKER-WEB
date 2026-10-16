// Servicio de envío de correos vía Resend (Modo prueba hasta verificar dominio)

interface SendReclamacionEmailParams {
  codigo: string;
  fecha: string;
  consumidor: {
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string;
    email: string;
    domicilio: string;
    padreTutor?: string;
  };
  bien: {
    tipoBien: string;
    montoReclamado?: string;
    descripcionBien: string;
  };
  detalle: {
    tipoReclamacion: string;
    detalle: string;
    pedido: string;
  };
  proveedor: {
    razonSocial: string;
    ruc: string;
    direccion: string;
    nombreComercial: string;
  };
}

export async function sendReclamacionEmail(params: SendReclamacionEmailParams) {
  const { codigo, fecha, consumidor, bien, detalle, proveedor } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Hoja de Reclamación ${codigo}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b; }
        .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden; }
        .header { background: #09090b; color: #ffffff; padding: 24px; text-align: left; border-bottom: 4px solid #f58220; }
        .header h1 { margin: 0 0 6px 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; color: #ffffff; }
        .header p { margin: 0; font-size: 12px; color: #a1a1aa; }
        .badge { display: inline-block; background: #f58220; color: #000000; font-weight: 800; font-size: 12px; padding: 4px 10px; border-radius: 6px; margin-top: 10px; text-transform: uppercase; }
        .content { padding: 24px; font-size: 13px; line-height: 1.6; }
        .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #09090b; border-bottom: 2px solid #f4f4f5; padding-bottom: 6px; margin-top: 20px; margin-bottom: 12px; }
        .grid { display: table; width: 100%; margin-bottom: 12px; }
        .row { display: table-row; }
        .col-label { display: table-cell; width: 35%; font-weight: 700; color: #52525b; padding: 4px 0; }
        .col-val { display: table-cell; width: 65%; color: #09090b; padding: 4px 0; }
        .box { background: #fafafa; border: 1px solid #e4e4e7; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
        .notice { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; padding: 12px; border-radius: 8px; font-size: 12px; margin-top: 20px; }
        .footer { background: #f4f4f5; padding: 16px 24px; text-align: center; font-size: 11px; color: #71717a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${proveedor.nombreComercial}</h1>
          <p>Libro de Reclamaciones Virtual • Ley N° 29571</p>
          <div class="badge">Hoja N° ${codigo}</div>
        </div>

        <div class="content">
          <p>Estimado(a) <strong>${consumidor.nombres} ${consumidor.apellidos}</strong>,</p>
          <p>Le confirmamos que su <strong>${detalle.tipoReclamacion.toUpperCase()}</strong> ha sido registrado formalmente en nuestro Libro de Reclamaciones Virtual.</p>

          <div class="section-title">1. Datos del Proveedor</div>
          <div class="grid">
            <div class="row"><div class="col-label">Razón Social:</div><div class="col-val">${proveedor.razonSocial}</div></div>
            <div class="row"><div class="col-label">RUC:</div><div class="col-val">${proveedor.ruc}</div></div>
            <div class="row"><div class="col-label">Dirección Fiscal:</div><div class="col-val">${proveedor.direccion}</div></div>
            <div class="row"><div class="col-label">Fecha de Registro:</div><div class="col-val">${fecha}</div></div>
          </div>

          <div class="section-title">2. Identificación del Consumidor Reclamante</div>
          <div class="grid">
            <div class="row"><div class="col-label">Nombre Completo:</div><div class="col-val">${consumidor.nombres} ${consumidor.apellidos}</div></div>
            <div class="row"><div class="col-label">Documento:</div><div class="col-val">${consumidor.tipoDocumento} ${consumidor.numeroDocumento}</div></div>
            <div class="row"><div class="col-label">Teléfono:</div><div class="col-val">${consumidor.telefono}</div></div>
            <div class="row"><div class="col-label">Correo Electrónico:</div><div class="col-val">${consumidor.email}</div></div>
            <div class="row"><div class="col-label">Domicilio:</div><div class="col-val">${consumidor.domicilio}</div></div>
            ${consumidor.padreTutor ? `<div class="row"><div class="col-label">Padre/Tutor:</div><div class="col-val">${consumidor.padreTutor}</div></div>` : ''}
          </div>

          <div class="section-title">3. Detalle del Bien Contratado</div>
          <div class="grid">
            <div class="row"><div class="col-label">Tipo:</div><div class="col-val">${bien.tipoBien === 'producto' ? 'Producto' : 'Servicio'}</div></div>
            <div class="row"><div class="col-label">Monto Reclamado:</div><div class="col-val">${bien.montoReclamado || 'No especificado'}</div></div>
            <div class="row"><div class="col-label">Descripción:</div><div class="col-val">${bien.descripcionBien}</div></div>
          </div>

          <div class="section-title">4. Detalle de la Reclamación</div>
          <div class="box">
            <strong>Hechos relatados:</strong><br />
            ${detalle.detalle}
          </div>
          <div class="box">
            <strong>Pedido concreto del consumidor:</strong><br />
            ${detalle.pedido}
          </div>

          <div class="notice">
            <strong>Plazo legal de respuesta:</strong> Conforme al D.S. N° 011-2011-PCM y la Ley N° 29571, Iori Biker Shop dará respuesta formal a su reclamación a este correo en un plazo no mayor a quince (15) días hábiles improrrogables.
          </div>
        </div>

        <div class="footer">
          IORI SAC • RUC 20610816089 • Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima<br />
          Esta es una copia de constancia automática requerida por la normativa de Indecopi.
        </div>
      </div>
    </body>
    </html>
  `;

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log(`[Resend Modo Prueba - Sin RESEND_API_KEY]: Se generó constancia de reclamación para ${consumidor.email} (${codigo})`);
    return {
      success: true,
      simulated: true,
      message: 'Modo prueba: constancia generada localmente sin credencial externa.',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Iori Biker Shop <onboarding@resend.dev>', // En modo prueba de Resend se envía desde onboarding@resend.dev
        to: [consumidor.email],
        subject: `Constancia de Hoja de Reclamación ${codigo} - Iori Biker Shop`,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('[Resend Warning]:', data);
      return { success: false, error: data, simulated: true };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Resend Error]:', err);
    return { success: false, error: err.message, simulated: true };
  }
}
