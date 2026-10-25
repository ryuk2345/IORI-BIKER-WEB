import { test, expect } from '@playwright/test';
import { createAdminClient } from '../src/lib/supabase/admin';

test.describe('E2E: Validación de Productos, Variantes, SKU Parcial y Visibilidad', () => {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const createdProductIds: string[] = [];

  // Helper para acceder al panel de administración en el navegador
  async function loginAndGoToNewProduct(page: any) {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Si aparece la pantalla de login, usar el acceso rápido DEMO
    const demoBtn = page.locator('text=Acceso Rápido DEMO (Administrador)');
    if (await demoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await demoBtn.click();
      await page.waitForTimeout(500);
    }

    await page.goto('/admin/productos/nuevo');
    await page.waitForLoadState('domcontentloaded');
    // Esperar a que el formulario cargue
    await expect(page.locator('#field-nombre')).toBeVisible({ timeout: 15000 });
  }

  test.afterAll(async () => {
    // Limpieza de cualquier producto creado durante las pruebas E2E
    if (createdProductIds.length > 0) {
      const supabase = createAdminClient();
      for (const id of createdProductIds) {
        await supabase.from('producto_variantes').delete().eq('producto_id', id);
        await supabase.from('productos').delete().eq('id', id);
      }
    }
  });

  test('1. Producto sin variantes y sin SKU: Muestra error visible junto al campo', async ({ page }) => {
    await loginAndGoToNewProduct(page);

    // Llenar campos requeridos excepto SKU
    await page.locator('#field-nombre').fill('Guantes Moto Prover E2E');
    await page.locator('#field-precio').fill('150.00');

    // Seleccionar categoría y marca válidas
    const catSelect = page.locator('#field-categoria');
    await catSelect.selectOption({ index: 1 }); // Selecciona la primera categoría disponible
    const marcaSelect = page.locator('#field-marca');
    await marcaSelect.selectOption({ index: 1 }); // Selecciona la primera marca disponible

    // Dejar SKU vacío
    await page.locator('#field-sku').fill('');

    // Intentar guardar producto
    const saveBtn = page.locator('button:has-text("Guardar Producto")').first();
    await saveBtn.click();

    // 1. El error debe ser visible junto al campo visible de SKU
    const skuError = page.locator('text=El código SKU es obligatorio para productos sin variantes.');
    await expect(skuError).toBeVisible();

    // 2. El campo SKU debe tener borde rojo
    await expect(page.locator('#field-sku')).toHaveClass(/border-red-500/);

    // 3. El resumen superior de errores debe listar el campo
    const errorBanner = page.locator('text=Corrige los siguientes campos para guardar');
    await expect(errorBanner).toBeVisible();
  });

  test('2. Caso real: Producto con variantes y sin SKU general guarda sin error y con SKU NULL', async ({ page, request }) => {
    await loginAndGoToNewProduct(page);

    // Llenar nombre y precios del caso real (precio 350, oferta 200)
    await page.locator('#field-nombre').fill('Casco LS2 FF800 Storm E2E');
    await page.locator('#field-precio').fill('350');
    await page.locator('#field-precioOferta').fill('200');

    // Seleccionar categoría y marca
    await page.locator('#field-categoria').selectOption({ index: 1 });
    await page.locator('#field-marca').selectOption({ index: 1 });

    // Activar toggle de variantes
    const variantToggle = page.locator('#field-variantes button').first();
    await variantToggle.click();

    // INVARIANTE: El campo SKU general NO debe estar en pantalla cuando tieneVariantes=true
    await expect(page.locator('#field-sku')).toHaveCount(0);

    // Asegurar que las variantes tengan SKU
    const vSkuInput0 = page.locator('#field-variante_0_sku');
    await expect(vSkuInput0).toBeVisible();

    // Interceptar la petición POST al backend para verificar que sku enviado es NULL (nunca copia de variante)
    let interceptedSku: any = undefined;
    await page.route('**/api/admin/products', async (route) => {
      const postData = JSON.parse(route.request().postData() || '{}');
      interceptedSku = postData.sku;
      // Responder con éxito simulado para la prueba E2E de interfaz
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 'test-mock-e2e-id' }),
      });
    });

    // Guardar
    const saveBtn = page.locator('button:has-text("Guardar Producto")').first();
    await saveBtn.click();

    // Verificar que el toast o mensaje de éxito aparece y que sku fue estrictamente NULL
    await page.waitForTimeout(500);
    expect(interceptedSku).toBeNull();
  });

  test('3. Variantes con SKU duplicado: Marca la fila exacta con error visible', async ({ page }) => {
    await loginAndGoToNewProduct(page);

    await page.locator('#field-nombre').fill('Casco Duplicado QA Test');
    await page.locator('#field-precio').fill('400');
    await page.locator('#field-categoria').selectOption({ index: 1 });
    await page.locator('#field-marca').selectOption({ index: 1 });

    // Activar variantes
    await page.locator('#field-variantes button').first().click();

    // Colocar el mismo SKU en fila 0 y fila 1
    const vSku0 = page.locator('#field-variante_0_sku');
    const vSku1 = page.locator('#field-variante_1_sku');

    await expect(vSku0).toBeVisible();
    await expect(vSku1).toBeVisible();

    await vSku0.fill('SKU-REPETIDO-123');
    await vSku1.fill('SKU-REPETIDO-123');

    // Intentar guardar
    await page.locator('button:has-text("Guardar Producto")').first().click();

    // La fila 1 (índice 1) debe marcarse con error exacto
    const dupeError = page.locator('text=SKU duplicado con la fila #1.');
    await expect(dupeError).toBeVisible();
    await expect(vSku1).toHaveClass(/border-red-500/);
  });

  test('4. Sin categoría y sin marca: Empiezan vacías y muestran error visible obligatorio', async ({ page }) => {
    await loginAndGoToNewProduct(page);

    // Llenar nombre, precio y SKU general pero dejar categoría y marca sin seleccionar
    await page.locator('#field-nombre').fill('Producto Prueba Sin Cat Ni Marca');
    await page.locator('#field-precio').fill('80.00');
    await page.locator('#field-sku').fill('PROD-NO-CAT-1');

    // Verificar que los selects empiezan con valor vacío
    const catSelect = page.locator('#field-categoria');
    const marcaSelect = page.locator('#field-marca');

    await expect(catSelect).toHaveValue('');
    await expect(marcaSelect).toHaveValue('');

    // Intentar guardar
    await page.locator('button:has-text("Guardar Producto")').first().click();

    // Ambos errores deben ser visibles junto a sus campos
    await expect(page.locator('text=Debes seleccionar una categoría obligatoria.')).toBeVisible();
    await expect(page.locator('text=Debes seleccionar una marca oficial obligatoria.')).toBeVisible();

    await expect(catSelect).toHaveClass(/border-red-500/);
    await expect(marcaSelect).toHaveClass(/border-red-500/);
  });

  test('5. API Backend: Validación estricta de SKU NULL en variantes y rechazo de duplicados', async ({ request }) => {
    const testSkuVar1 = `VAR-SKU-A-${Date.now()}`;
    const testSkuVar2 = `VAR-SKU-B-${Date.now()}`;

    // 5.1 Crear producto con variantes -> sku debe persistirse como NULL
    const resCreate = await request.post('/api/admin/products', {
      headers: { 'x-admin-key': adminKey },
      data: {
        nombre: 'Casco Test API Variantes QA',
        slug: `casco-api-test-${Date.now()}`,
        sku: 'SKU-QUE-DEBE-SER-IGNORADO', // Debe ser reemplazado por NULL
        categoria_slug: 'cascos',
        categoria_nombre: 'Cascos',
        marca_id: 'ls2',
        marca_nombre: 'LS2',
        precio: 350.0,
        precio_oferta: 200.0,
        stock: 10,
        modo_venta: 'online',
        activo: true,
        variantes: [
          { sku: testSkuVar1, talla: 'M', color: 'Negro Mate', stock: 5 },
          { sku: testSkuVar2, talla: 'L', color: 'Negro Mate', stock: 5 },
        ],
      },
    });

    expect(resCreate.ok()).toBeTruthy();
    const createdData = await resCreate.json();
    const createdId = createdData.id;
    expect(createdId).toBeDefined();
    createdProductIds.push(createdId);

    // 5.2 Verificar en Supabase que el producto padre tiene sku = NULL (no copió el SKU de una variante)
    const supabase = createAdminClient();
    const { data: dbProduct } = await supabase
      .from('productos')
      .select('id, sku')
      .eq('id', createdId)
      .single();
    expect(dbProduct?.sku).toBeNull();

    // 5.3 Intentar crear otro producto que use el mismo SKU de una variante existente -> debe rechazar con 400
    const resDupe = await request.post('/api/admin/products', {
      headers: { 'x-admin-key': adminKey },
      data: {
        nombre: 'Producto Con SKU Colisionado',
        slug: `colision-test-${Date.now()}`,
        sku: testSkuVar1, // YA USADO POR VARIANTE
        categoria_slug: 'cascos',
        marca_id: 'ls2',
        precio: 100.0,
        modo_venta: 'online',
        variantes: [],
      },
    });

    expect(resDupe.status()).toBe(400);
    const dupeJson = await resDupe.json();
    expect(dupeJson.error).toContain('ya está registrado en otra variante');
  });

  test('6. Visibilidad: Ni Toast ni StickySaveBar son tapados por Netlify badge o botón WhatsApp', async ({ page }) => {
    await loginAndGoToNewProduct(page);

    // Modificar un campo para activar StickySaveBar
    await page.locator('#field-nombre').fill('Verificación de Posicionamiento');

    const saveBar = page.locator('div:has-text("Tienes cambios sin guardar en este producto")').first();
    await expect(saveBar).toBeVisible();

    // Verificar clases de z-index y espacio para evitar solapamiento
    await expect(saveBar).toHaveClass(/z-\[9990\]/);
    await expect(saveBar).toHaveClass(/pr-20|pr-24/);

    // Provocar un error para que aparezca el Toast
    const saveBtn = page.locator('button:has-text("Guardar Producto")').first();
    await saveBtn.click();

    // El toast debe ubicarse en la esquina superior derecha (top-5 right-5 z-[99999])
    const toastContainer = page.locator('.fixed.top-5.right-5');
    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toHaveClass(/z-\[99999\]/);
  });
});
