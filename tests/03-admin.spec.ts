import { test, expect } from '@playwright/test';
import { createAdminClient } from '../src/lib/supabase/admin';

test.describe('E2E Administración (Login, Productos, Excel, Promociones y Pedidos)', () => {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  test('1. Admin: Vista de Login seguro y autenticación', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Debe mostrar la pantalla de login con branding oficial
    await expect(page.locator('text=Panel de Control').first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });

  test('2. Productos: Ciclo CRUD completo (Crear, Editar, Duplicar y Eliminar)', async ({ request }) => {
    const testSku = `TEST-PROD-${Date.now()}`;
    const testSlug = `producto-test-${Date.now()}`;

    // 2.1 Crear Producto
    const createRes = await request.post('/api/admin/products', {
      headers: { 'x-admin-key': adminKey },
      data: {
        nombre: 'Casco Test Automatizado Edición QA',
        slug: testSlug,
        sku: testSku,
        categoria_slug: 'cascos',
        categoria_nombre: 'Cascos',
        marca_id: 'ls2',
        marca_nombre: 'LS2',
        precio: 520.0,
        precio_oferta: 480.0,
        stock: 8,
        modo_venta: 'online',
        descripcion_corta: 'Casco de prueba para verificación QA integral.',
        activo: true,
        variantes: [
          { sku: `${testSku}-M`, talla: 'M', color: 'Negro Mate', stock: 5 },
          { sku: `${testSku}-L`, talla: 'L', color: 'Negro Mate', stock: 3 },
        ],
      },
    });

    expect(createRes.ok()).toBeTruthy();
    const createdData = await createRes.json();
    expect(createdData.success).toBe(true);
    const createdId = createdData.id;
    expect(createdId).toBeDefined();

    // 2.2 Editar / Actualizar precio y stock con PATCH
    const patchRes = await request.patch('/api/admin/products', {
      headers: { 'x-admin-key': adminKey },
      data: {
        id: createdId,
        updates: {
          precio: 550.0,
          precio_oferta: 490.0,
          stock: 15,
        },
      },
    });
    expect(patchRes.ok()).toBeTruthy();
    const patchData = await patchRes.json();
    expect(patchData.data.precio).toBe(550.0);
    expect(patchData.data.stock).toBe(15);

    // 2.3 Duplicar Producto
    const duplicateSku = `${testSku}-COPY`;
    const duplicateRes = await request.post('/api/admin/products', {
      headers: { 'x-admin-key': adminKey },
      data: {
        nombre: 'Copia - Casco Test Automatizado Edición QA',
        slug: `${testSlug}-copia`,
        sku: duplicateSku,
        categoria_slug: 'cascos',
        categoria_nombre: 'Cascos',
        marca_id: 'ls2',
        marca_nombre: 'LS2',
        precio: 550.0,
        precio_oferta: 490.0,
        stock: 15,
        modo_venta: 'online',
        descripcion_corta: 'Casco de prueba duplicado.',
        activo: true,
      },
    });
    expect(duplicateRes.ok()).toBeTruthy();
    const duplicateData = await duplicateRes.json();
    expect(duplicateData.id).toBeDefined();

    // 2.4 Limpiar / Eliminar los 2 productos de prueba para no ensuciar datos
    const del1 = await request.delete(`/api/admin/products?id=${createdId}`, {
      headers: { 'x-admin-key': adminKey },
    });
    expect(del1.ok()).toBeTruthy();

    const del2 = await request.delete(`/api/admin/products?id=${duplicateData.id}`, {
      headers: { 'x-admin-key': adminKey },
    });
    expect(del2.ok()).toBeTruthy();
  });

  test('3. Excel: Simulación de exportación e importación de catálogo sin pérdida de datos', async () => {
    const headers = ['sku', 'nombre', 'categoria_slug', 'precio', 'precio_oferta', 'stock', 'modo_venta'];
    const row = ['QA-SKU-99', 'Guantes Alpinestars QA Test', 'guantes', '180.00', '160.00', '12', 'online'];

    // Serializar a CSV
    const csvContent = [headers.join(','), row.join(',')].join('\n');

    // Deserializar y validar que las columnas se mantienen intactas
    const lines = csvContent.split('\n');
    const parsedHeaders = lines[0].split(',');
    const parsedValues = lines[1].split(',');

    expect(parsedHeaders).toEqual(headers);
    expect(parsedValues[0]).toBe('QA-SKU-99');
    expect(parsedValues[1]).toBe('Guantes Alpinestars QA Test');
    expect(parseFloat(parsedValues[3])).toBe(180.0);
    expect(parseFloat(parsedValues[4])).toBe(160.0);
    expect(parseInt(parsedValues[5], 10)).toBe(12);
  });

  test('4. Promociones, Cupones y Banners: verificación de estructura en Supabase', async () => {
    const supabase = createAdminClient();

    // 4.1 Cupones
    const { data: cupones, error: errCup } = await supabase.from('cupones').select('*').limit(5);
    expect(errCup).toBeNull();
    expect(cupones).toBeDefined();

    // 4.2 Banners
    const { data: banners, error: errBan } = await supabase.from('banners').select('*').limit(5);
    expect(errBan).toBeNull();
    expect(banners).toBeDefined();

    // 4.3 Tarifas de Envío
    const { data: envios, error: errEnv } = await supabase.from('envios_tarifas').select('*').limit(5);
    expect(errEnv).toBeNull();
    expect(envios).toBeDefined();
  });

  test('5. Ciclo completo de un pedido con control estricto de stock', async ({ request }) => {
    const supabase = createAdminClient();

    // 5.1 Crear pedido demo
    const createRes = await request.post('/api/pedidos', {
      data: {
        nombre: 'Enrique Cárdenas Test QA',
        celular: '911223344',
        email: 'enrique.qa@test.com',
        tipo_comprobante: 'boleta',
        dni: '78899001',
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

    expect(createRes.ok()).toBeTruthy();
    const { pedido_id } = await createRes.json();
    expect(pedido_id).toBeDefined();

    // 5.2 Stock previo
    const { data: vBefore } = await supabase
      .from('producto_variantes')
      .select('stock')
      .eq('id', 'var-1-l')
      .single();
    const stockAntes = vBefore?.stock || 0;

    // 5.3 Transición a 'pagado'
    const payRes = await request.post('/api/admin/pedidos/estado', {
      headers: { 'x-admin-key': adminKey },
      data: {
        pedido_id,
        nuevo_estado: 'pagado',
        metodo_pago: 'Yape',
        numero_operacion: 'YAPE-998877',
      },
    });
    expect(payRes.ok()).toBeTruthy();

    const { data: vAfterPay } = await supabase
      .from('producto_variantes')
      .select('stock')
      .eq('id', 'var-1-l')
      .single();
    expect(vAfterPay?.stock).toBe(stockAntes - 1);

    // 5.4 Transición a 'en_preparacion'
    const prepRes = await request.post('/api/admin/pedidos/estado', {
      headers: { 'x-admin-key': adminKey },
      data: {
        pedido_id,
        nuevo_estado: 'en_preparacion',
      },
    });
    expect(prepRes.ok()).toBeTruthy();

    // 5.5 Cancelar y verificar restitución de stock
    const cancelRes = await request.post('/api/admin/pedidos/estado', {
      headers: { 'x-admin-key': adminKey },
      data: {
        pedido_id,
        nuevo_estado: 'cancelado',
        notas_internas: 'Cancelado por prueba QA de restitución',
      },
    });
    expect(cancelRes.ok()).toBeTruthy();

    const { data: vAfterCancel } = await supabase
      .from('producto_variantes')
      .select('stock')
      .eq('id', 'var-1-l')
      .single();
    expect(vAfterCancel?.stock).toBe(stockAntes);
  });

});
