import { test, expect } from '@playwright/test';

test.describe('E2E Pruebas de Seguridad y Control de Acceso', () => {

  test('1. Un visitante anónimo no puede descargar CVs sin autenticación', async ({ request }) => {
    const res = await request.get('/api/admin/cv-download?path=ventas/curriculum.pdf');
    expect(res.status()).toBe(401);
    const data = await res.json();
    expect(data.error.toLowerCase()).toContain('no autorizado');
  });

  test('2. Un visitante anónimo no puede modificar estados de pedidos sin credenciales', async ({ request }) => {
    const res = await request.post('/api/admin/pedidos/estado', {
      data: {
        pedido_id: 'fake-id-123',
        nuevo_estado: 'pagado',
      },
    });
    expect(res.status()).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('No autorizado');
  });

  test('3. Un visitante anónimo no puede crear ni modificar productos por API', async ({ request }) => {
    const res = await request.post('/api/admin/products', {
      data: {
        nombre: 'Producto Hackeado',
        sku: 'HACK-001',
        precio: 1.0,
      },
    });
    expect(res.status()).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/No autenticado|No autorizado/i);
  });

  test('4. El servidor rechaza cualquier manipulación de precio desde el navegador', async ({ request }) => {
    // Cliente envía precio alterado de S/ 0.50 para un casco que vale S/ 499.00
    const res = await request.post('/api/pedidos', {
      data: {
        nombre: 'Hacker Intentando Alterar Precio',
        celular: '998877665',
        email: 'hacker@test.com',
        tipo_comprobante: 'boleta',
        dni: '72334455',
        metodo_entrega: 'recojo',
        sede_recojo: 'independencia',
        acepta_privacidad: true,
        items: [
          {
            producto_id: 'prod-esparta-1',
            variante_id: 'var-thun-l',
            cantidad: 1,
            precio: 0.5, // PRECIO MANIPULADO
          },
        ],
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    // El servidor debe haber cobrado 499.00, NO 0.50
    expect(data.total).toBe(499);
    expect(data.wspMensaje).toContain('S/ 499.00');
  });

  test('5. Los pedidos requieren un token único UUIDv4 para ser consultados', async ({ page }) => {
    // Intentar acceder a un token inválido o inexistente
    const res = await page.goto('/pedido/token-falso-invalido-12345');
    expect(res?.status()).toBe(404);
    await page.waitForLoadState('domcontentloaded');

    // Debe mostrar la pantalla 404 oficial de la tienda
    await expect(page.locator('text=CURVA EQUIVOCADA').first()).toBeVisible();
  });

  test('6. Los formularios bloquean envíos con campos honeypot (Anti-Spam)', async ({ request }) => {
    const spamRes = await request.post('/api/contacto', {
      data: {
        nombre: 'Bot Attacker',
        celular: '999888777',
        email: 'bot@spam.com',
        motivo: 'consulta_productos',
        mensaje: 'Spam payload',
        acepta_privacidad: true,
        _hp: 'robot-data', // Honeypot
      },
    });

    expect(spamRes.status()).toBe(400);
  });

});
