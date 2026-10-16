import { test, expect } from '@playwright/test';
import { calcularCuotaEstimada } from '../src/lib/acuotaz-estimado';
import { createAdminClient } from '../src/lib/supabase/admin';

test.describe('E2E Casos Borde y Resiliencia del Sistema', () => {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  test('1. Concurrencia: Dos pedidos sobre el último producto en stock (1 unidad)', async ({ request }) => {
    const supabase = createAdminClient();

    // 1.1 Crear un producto temporal con stock = 1
    const testSku = `CONC-SKU-${Date.now()}`;
    const { data: prodData, error: errInsert } = await supabase
      .from('productos')
      .insert({
        nombre: 'Producto Concurrencia Stock QA',
        slug: `prod-conc-${Date.now()}`,
        sku: testSku,
        categoria_slug: 'cascos',
        categoria_nombre: 'Cascos',
        subcategoria_slug: 'integrales',
        subcategoria_nombre: 'Integrales',
        marca_id: 'ls2',
        marca_nombre: 'LS2',
        precio: 350.0,
        stock: 1,
        activo: true,
      })
      .select('id')
      .single();

    if (errInsert) {
      console.error('Error insertando producto de concurrencia:', errInsert);
    }
    expect(prodData).not.toBeNull();
    const prodId = prodData!.id;

    // 1.2 Crear pedido A y pedido B para ese mismo producto
    const createOrderA = await request.post('/api/pedidos', {
      data: {
        nombre: 'Cliente A Concurrente',
        celular: '998877111',
        tipo_comprobante: 'boleta',
        dni: '71112222',
        metodo_entrega: 'recojo',
        sede_recojo: 'independencia',
        acepta_privacidad: true,
        items: [{ producto_id: prodId, cantidad: 1 }],
      },
    });
    const orderA = await createOrderA.json();

    const createOrderB = await request.post('/api/pedidos', {
      data: {
        nombre: 'Cliente B Concurrente',
        celular: '998877222',
        tipo_comprobante: 'boleta',
        dni: '73334444',
        metodo_entrega: 'recojo',
        sede_recojo: 'independencia',
        acepta_privacidad: true,
        items: [{ producto_id: prodId, cantidad: 1 }],
      },
    });
    const orderB = await createOrderB.json();

    // 1.3 Marcar pagado Pedido A -> debe tener éxito y dejar stock en 0
    const payA = await request.post('/api/admin/pedidos/estado', {
      headers: { 'x-admin-key': adminKey },
      data: {
        pedido_id: orderA.pedido_id,
        nuevo_estado: 'pagado',
        metodo_pago: 'Yape',
        numero_operacion: 'YAPE-CONC-1',
      },
    });
    expect(payA.ok()).toBeTruthy();

    // 1.4 Marcar pagado Pedido B -> debe fallar con 409 Conflict por stock insuficiente
    const payB = await request.post('/api/admin/pedidos/estado', {
      headers: { 'x-admin-key': adminKey },
      data: {
        pedido_id: orderB.pedido_id,
        nuevo_estado: 'pagado',
        metodo_pago: 'Plin',
        numero_operacion: 'PLIN-CONC-2',
      },
    });
    expect(payB.status()).toBe(409);
    const payBData = await payB.json();
    expect(payBData.warning_stock).toBe(true);

    // Limpiar producto de prueba
    await supabase.from('productos').delete().eq('id', prodId);
  });

  test('2. aCuotaz: Comportamiento ante precios fuera de rango', () => {
    // Por debajo del mínimo (S/ 100)
    expect(calcularCuotaEstimada(99.90)).toBeNull();
    expect(calcularCuotaEstimada(50.00)).toBeNull();
    expect(calcularCuotaEstimada(0)).toBeNull();

    // Por encima del máximo (S/ 2000)
    expect(calcularCuotaEstimada(2000.01)).toBeNull();
    expect(calcularCuotaEstimada(5500.00)).toBeNull();

    // Dentro del rango (S/ 100 - S/ 2000)
    const cuotaValida = calcularCuotaEstimada(450.00);
    expect(cuotaValida).not.toBeNull();
    expect(cuotaValida).toBeGreaterThan(0);
  });

  test('3. Textos muy largos: Ficha de producto y pedido con notas extensas', async ({ request, page }) => {
    const notasLargas = 'Nota de entrega muy extensa: '.repeat(20) + ' Por favor llamar al timbre rojo.';
    const res = await request.post('/api/pedidos', {
      data: {
        nombre: 'Cliente con Nombre Muy Largo y Apellidos Compuestos de la Vega y Carrión',
        celular: '912345678',
        email: 'nombre.largo@test.com',
        tipo_comprobante: 'boleta',
        dni: '78901234',
        metodo_entrega: 'recojo',
        sede_recojo: 'independencia',
        notas: notasLargas,
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

    // Navegar al pedido y verificar que no se desborde ni genere error
    await page.goto(`/pedido/${data.token}`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator(`text=${data.codigo}`).first()).toBeVisible();
    await expect(page.locator('text=Cliente con Nombre Muy Largo').first()).toBeVisible();
  });

  test('4. Formato de fechas en zona horaria de Lima (America/Lima)', () => {
    const fecha = new Date('2026-09-30T15:00:00Z');
    const fechaLima = fecha.toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      hour12: false,
    });
    // UTC 15:00 es Lima 10:00 (UTC-5)
    expect(fechaLima).toContain('10:00');
  });

  test('5. Categorías sin productos: renderizado seguro sin error 500', async ({ page }) => {
    // Si se visita una categoría o filtro sin productos, debe mostrar estado amigable
    await page.goto('/categoria/accesorios?q=palabra_que_no_existe_xyz_123');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');
  });

});
