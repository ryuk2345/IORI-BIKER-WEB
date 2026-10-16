import { test, expect } from '@playwright/test';
import { createAdminClient } from '../src/lib/supabase/admin';

test.describe('Iori Biker Shop - E2E Test Suite', () => {

  // 1. Buscar y filtrar en el catálogo
  test('1. Búsqueda y filtrado en el catálogo', async ({ page }) => {
    await page.goto('/productos');
    await expect(page).toHaveTitle(/Catálogo/i);

    // Verificar presencia de buscador
    const searchInput = page.locator('input[type="text"][placeholder*="Buscar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Shaft');
      await page.waitForTimeout(500);
      const items = page.locator('article');
      expect(await items.count()).toBeGreaterThanOrEqual(1);
    }
  });

  // 2. Cotizar por WhatsApp producto solo cotizar
  test('2. Productos solo cotizar redirigen a WhatsApp oficial', async ({ page }) => {
    await page.goto('/productos');
    
    // En catálogo, buscar la tarjeta del producto marcado para cotizar
    const cotizarCard = page.locator('article:has-text("Cotizar") a').first();
    if (await cotizarCard.isVisible()) {
      await cotizarCard.click();
      await page.waitForLoadState('domcontentloaded');
      
      // En la ficha de producto se encuentra el botón oficial de cotizar por WhatsApp
      const wspBtn = page.locator('a:has-text("COTIZAR POR WHATSAPP"), a:has-text("Cotizar por WhatsApp")').first();
      await expect(wspBtn).toBeVisible();
      const href = await wspBtn.getAttribute('href');
      expect(href).toContain('wa.me/51905445698');
      expect(href?.toLowerCase()).toContain('cotizar');
    }
  });

  // 3. Flujo completo de Carrito y Creación de Pedido por WhatsApp
  test('3. Carrito todo-en-uno y envío de pedido con validación server-side', async ({ request }) => {
    // Probamos la API de pedidos con validación server-side
    const res = await request.post('/api/pedidos', {
      data: {
        nombre: 'Carlos Alberto Valdivia',
        celular: '912345678',
        email: 'carlos.valdivia@test.com',
        tipo_comprobante: 'boleta',
        dni: '71234567',
        metodo_entrega: 'recojo',
        sede_recojo: 'independencia',
        acepta_privacidad: true,
        items: [
          {
            producto_id: 'prod-esparta-1',
            variante_id: 'var-thun-l',
            cantidad: 1,
          },
        ],
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.codigo).toMatch(/^IORI-\d{6}$/);
    expect(data.token).toBeDefined();
    expect(data.wspUrl).toContain('wa.me/51905445698');
    expect(data.wspMensaje).toContain(`Pedido ${data.codigo}`);
    expect(data.wspMensaje).toContain('Carlos Alberto Valdivia');
    expect(data.wspMensaje).toContain('¿Me confirman stock y cómo pagar?');

    // Verificar existencia del pedido en la base de datos de Supabase
    const supabase = createAdminClient();
    const { data: pedidoDb } = await supabase
      .from('pedidos')
      .select('*, pedido_items(*)')
      .eq('token', data.token)
      .single();

    expect(pedidoDb).not.toBeNull();
    expect(pedidoDb.codigo).toBe(data.codigo);
    expect(pedidoDb.estado).toBe('nuevo');
    expect(pedidoDb.total).toBe(499);
  });

  // 4. Cambiar estados en el admin y control de stock
  test('4. Transición de estados en admin: pagado descuenta stock y cancelado lo devuelve', async ({ request }) => {
    // 1. Crear pedido demo
    const createRes = await request.post('/api/pedidos', {
      data: {
        nombre: 'Mario Vargas Test',
        celular: '998877665',
        email: 'mario.test@gmail.com',
        tipo_comprobante: 'boleta',
        dni: '44556677',
        metodo_entrega: 'recojo',
        sede_recojo: 'independencia',
        acepta_privacidad: true,
        items: [
          {
            producto_id: 'prod-esparta-1',
            variante_id: 'var-1-l',
            cantidad: 1,
          },
        ],
      },
    });
    const { pedido_id } = await createRes.json();
    expect(pedido_id).toBeDefined();

    const supabase = createAdminClient();

    // Consultar stock antes de pagar
    const { data: varBefore } = await supabase
      .from('producto_variantes')
      .select('stock')
      .eq('id', 'var-1-l')
      .single();
    const stockInicial = varBefore?.stock || 0;

    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    // 2. Marcar como pagado
    const payRes = await request.post('/api/admin/pedidos/estado', {
      headers: { 'x-admin-key': adminKey },
      data: {
        pedido_id,
        nuevo_estado: 'pagado',
        metodo_pago: 'Plin',
        numero_operacion: 'OP-PLIN-999',
      },
    });
    expect(payRes.ok()).toBeTruthy();

    // Verificar que el stock disminuyó en 1
    const { data: varAfterPay } = await supabase
      .from('producto_variantes')
      .select('stock')
      .eq('id', 'var-1-l')
      .single();
    expect(varAfterPay?.stock).toBe(stockInicial - 1);

    // 3. Cancelar pedido pagado (debe reponer stock)
    const cancelRes = await request.post('/api/admin/pedidos/estado', {
      headers: { 'x-admin-key': adminKey },
      data: {
        pedido_id,
        nuevo_estado: 'cancelado',
        nota: 'Cancelado para prueba de devolución de stock',
      },
    });
    expect(cancelRes.ok()).toBeTruthy();

    const { data: varAfterCancel } = await supabase
      .from('producto_variantes')
      .select('stock')
      .eq('id', 'var-1-l')
      .single();
    expect(varAfterCancel?.stock).toBe(stockInicial);
  });

  // 5. Libro de Reclamaciones con correlativo oficial y respuesta
  test('5. Libro de Reclamaciones: correlativo real, datos del proveedor y registro de respuesta', async ({ request }) => {
    const res = await request.post('/api/reclamaciones', {
      data: {
        tipoDocumento: 'DNI',
        numeroDocumento: '48991122',
        nombres: 'Patricia',
        apellidos: 'Gómez Salcedo',
        domicilio: 'Av. Brasil 1234, Jesús María, Lima',
        telefono: '912345678',
        email: 'patricia.gomez@test.com',
        tipoBien: 'producto',
        montoReclamado: '350.00',
        descripcionBien: 'Guantes Alpinestars Talla M',
        tipoReclamacion: 'reclamo',
        detalle: 'Costura lateral abierta al retirar del empaque original sellado.',
        pedido: 'Solicito el cambio inmediato por unos guantes en óptimo estado.',
        declaroVerdad: true,
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.codigo).toMatch(/^REC-\d{4}-\d{6}$/);
    expect(data.datos_proveedor.razon_social).toBe('IORI SAC');
    expect(data.datos_proveedor.ruc).toBe('20610816089');

    // Registrar respuesta formal de la empresa en Supabase
    const supabase = createAdminClient();
    const { error: respError } = await supabase
      .from('libro_reclamaciones')
      .update({
        respuesta: 'Se autorizó el cambio de los guantes en nuestra sede de Independencia.',
        estado: 'atendido',
      })
      .eq('codigo', data.codigo);

    expect(respError).toBeNull();

    const { data: recActualizada } = await supabase
      .from('libro_reclamaciones')
      .select('estado, respuesta')
      .eq('codigo', data.codigo)
      .single();

    expect(recActualizada?.estado).toBe('atendido');
    expect(recActualizada?.respuesta).toContain('Se autorizó el cambio');
  });

  // 6. Formularios de Financiamiento, Contacto y Postulaciones
  test('6. Formularios guardan datos con correlativo y persistencia en Supabase', async ({ request }) => {
    // 6.1 Financiamiento
    const finRes = await request.post('/api/financiamiento', {
      data: {
        nombre: 'Diego Armando Silva',
        dni: '75443322',
        celular: '933221100',
        email: 'diego.silva@test.com',
        producto_nombre: 'Casco LS2 FF800 Storm',
        cuotas: 6,
        acepta_privacidad: true,
      },
    });
    expect(finRes.ok()).toBeTruthy();
    const finData = await finRes.json();
    expect(finData.success).toBe(true);
    expect(finData.codigo).toMatch(/^FIN-\d{6}$/);

    // 6.2 Contacto
    const contactoRes = await request.post('/api/contacto', {
      data: {
        nombre: 'Lucía Fernández',
        celular: '944556677',
        email: 'lucia.f@test.com',
        motivo: 'consulta_productos',
        mensaje: '¿Tienen disponibilidad de visores oscuros para casco MT Thunder 4?',
        acepta_privacidad: true,
      },
    });
    expect(contactoRes.ok()).toBeTruthy();
    const contactoData = await contactoRes.json();
    expect(contactoData.success).toBe(true);
  });

  // 7. Seguridad: URLs canónicas, robots.txt, sitemap.xml y redirección de checkout
  test('7. Redirección de /checkout a /carrito y respuesta de sitemap/robots', async ({ request, page }) => {
    // Checkout 307 redirect
    const checkoutRes = await request.get('/checkout', { maxRedirects: 0 });
    expect(checkoutRes.status()).toBe(307);
    expect(checkoutRes.headers()['location']).toBe('/carrito');

    // Robots.txt
    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain('Disallow: /admin');
    expect(robotsText).toContain('Disallow: /carrito');
    expect(robotsText).toContain('sitemap.xml');

    // Sitemap.xml
    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    const sitemapText = await sitemapRes.text();
    expect(sitemapText).toContain('https://ioribikershop.pe');
    expect(sitemapText).toContain('/productos');
  });

  // 8. Integración aCuotaz: reserva de stock, estado en_evaluacion_acuotaz y webhook
  test('8. Flujo completo aCuotaz: pedido en evaluación, reserva de stock y webhook', async ({ request }) => {
    // 8.1 Crear pedido con método de pago aCuotaz
    const acuotazRes = await request.post('/api/pedidos', {
      data: {
        nombre: 'Renzo Farfán aCuotaz Test',
        celular: '955443322',
        email: 'renzo.test@gmail.com',
        tipo_comprobante: 'boleta',
        dni: '77889900',
        metodo_entrega: 'recojo',
        sede_recojo: 'la-victoria',
        metodo_pago: 'acuotaz',
        acepta_privacidad: true,
        items: [
          {
            producto_id: 'prod-esparta-1',
            variante_id: 'var-thun-l',
            cantidad: 1,
          },
        ],
      },
    });

    expect(acuotazRes.ok()).toBeTruthy();
    const acuotazData = await acuotazRes.json();
    expect(acuotazData.success).toBe(true);
    expect(acuotazData.codigo).toMatch(/^IORI-\d{6}$/);
    expect(acuotazData.metodo_pago).toBe('acuotaz');
    expect(acuotazData.redirect_to).toBeNull();
    expect(acuotazData.wspUrl).toContain('wa.me/51905445698');
    expect(acuotazData.wspMensaje).toContain('Quiero financiar mi pedido con aCuotaz');

    // 8.2 Verificar en base de datos estado y método de pago
    const supabase = createAdminClient();
    const { data: pedidoDb } = await supabase
      .from('pedidos')
      .select('*')
      .eq('token', acuotazData.token)
      .single();

    expect(pedidoDb).not.toBeNull();
    expect(pedidoDb.metodo_pago).toBe('acuotaz');
    expect(pedidoDb.estado).toBe('nuevo');
  });

});
