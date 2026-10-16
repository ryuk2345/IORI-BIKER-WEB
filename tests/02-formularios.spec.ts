import { test, expect } from '@playwright/test';
import { createAdminClient } from '../src/lib/supabase/admin';

test.describe('E2E Formularios (Contacto, Trabaja con Nosotros, Reclamaciones)', () => {

  test('1. Contacto: validación y envío exitoso con persistencia', async ({ request }) => {
    const res = await request.post('/api/contacto', {
      data: {
        nombre: 'Fernando Castro Méndez',
        celular: '988776655',
        email: 'fernando.castro@test.com',
        motivo: 'consulta_productos',
        mensaje: '¿Tienen stock disponible de visores iridium para casco MT Thunder 4 en sede La Victoria?',
        acepta_privacidad: true,
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verificar en Supabase
    const supabase = createAdminClient();
    const { data: dbMsg } = await supabase
      .from('mensajes_contacto')
      .select('*')
      .eq('email', 'fernando.castro@test.com')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(dbMsg).not.toBeNull();
    expect(dbMsg.nombre).toBe('Fernando Castro Méndez');
  });

  test('2. Trabaja con Nosotros: validación estricta de PDF y subida a bucket seguro', async ({ request }) => {
    // 2.1 Enviar con archivo no-PDF debe ser rechazado
    const invalidCvBuffer = Buffer.from('Texto simple que no es un pdf');
    const invalidForm = new FormData();
    invalidForm.append('puesto', 'Ventas');
    invalidForm.append('nombre', 'Pedro Infante');
    invalidForm.append('celular', '998877665');
    invalidForm.append('email', 'pedro.infante@test.com');
    invalidForm.append('acepta_privacidad', 'true');
    invalidForm.append('cv', new Blob([invalidCvBuffer], { type: 'text/plain' }), 'curriculum.txt');

    const failRes = await request.post('/api/postulaciones', {
      multipart: {
        puesto: 'Ventas en Tienda',
        nombre: 'Pedro Infante',
        celular: '998877665',
        email: 'pedro.infante@test.com',
        acepta_privacidad: 'true',
        cv: {
          name: 'curriculum.txt',
          mimeType: 'text/plain',
          buffer: invalidCvBuffer,
        },
      },
    });
    expect(failRes.status()).toBe(400);
    const failData = await failRes.json();
    expect(failData.error).toContain('PDF');

    // 2.2 Enviar con archivo PDF válido
    const validPdfBuffer = Buffer.from('%PDF-1.4\n%Simulated PDF Content for testing\n%%EOF');
    const successRes = await request.post('/api/postulaciones', {
      multipart: {
        puesto: 'Ventas en Tienda',
        nombre: 'Pedro Infante',
        celular: '998877665',
        email: 'pedro.infante@test.com',
        mensaje: 'Experiencia de 3 años en venta de indumentaria motociclista.',
        acepta_privacidad: 'true',
        cv: {
          name: 'cv_pedro_infante.pdf',
          mimeType: 'application/pdf',
          buffer: validPdfBuffer,
        },
      },
    });

    expect(successRes.ok()).toBeTruthy();
    const successData = await successRes.json();
    expect(successData.success).toBe(true);

    // Verificar en Supabase
    const supabase = createAdminClient();
    const { data: dbPost } = await supabase
      .from('postulaciones')
      .select('*')
      .eq('email', 'pedro.infante@test.com')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(dbPost).not.toBeNull();
    expect(dbPost.cv_url).toMatch(/\.pdf$/);
  });

  test('3. Libro de Reclamaciones: genera correlativo oficial REC-YYYY-XXXXXX y valida datos SUNAT', async ({ request }) => {
    const res = await request.post('/api/reclamaciones', {
      data: {
        tipoDocumento: 'DNI',
        numeroDocumento: '71882233',
        nombres: 'Gisella',
        apellidos: 'Ramírez Wong',
        domicilio: 'Calle Las Begonias 320, San Isidro, Lima',
        telefono: '987112233',
        email: 'gisella.rw@test.com',
        tipoBien: 'producto',
        montoReclamado: '499.00',
        descripcionBien: 'Casco Integral con Visor Solar',
        tipoReclamacion: 'queja',
        detalle: 'Demora en la entrega acordada para recojo en tienda.',
        pedido: 'Solicito agilizar la disponibilidad del producto en sede Independencia.',
        declaroVerdad: true,
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.codigo).toMatch(/^REC-\d{4}-\d{6}$/);
    expect(data.datos_proveedor.razon_social).toBe('IORI SAC');
    expect(data.datos_proveedor.ruc).toBe('20610816089');

    // Verificar registro en Supabase
    const supabase = createAdminClient();
    const { data: dbRec } = await supabase
      .from('libro_reclamaciones')
      .select('*')
      .eq('codigo', data.codigo)
      .single();

    expect(dbRec).not.toBeNull();
    expect(dbRec.datos_consumidor?.numero_documento).toBe('71882233');
    expect(dbRec.estado).toBe('pendiente');
  });

  test('4. Anti-Spam: detección y bloqueo por trampa honeypot', async ({ request }) => {
    // Si un bot completa el campo oculto _hp (honeypot), se rechaza
    const botRes = await request.post('/api/contacto', {
      data: {
        nombre: 'Spam Bot 3000',
        celular: '999999999',
        email: 'spambot@marketing-blast.com',
        motivo: 'consulta_productos',
        mensaje: 'Buy crypto now cheap discounts',
        acepta_privacidad: true,
        _hp: 'filled-by-bot', // Honeypot activado
      },
    });

    expect(botRes.status()).toBe(400);
    const botData = await botRes.json();
    expect(botData.error).toBeDefined();
  });

});
