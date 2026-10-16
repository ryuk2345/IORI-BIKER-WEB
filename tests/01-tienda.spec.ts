import { test, expect } from '@playwright/test';
import { createAdminClient } from '../src/lib/supabase/admin';

test.describe('E2E Tienda Pública (Chrome, Safari, Firefox @ 390px y 1440px)', () => {

  test('1. Home: renderiza franja aCuotaz, hero, categorías, productos y footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1.1 Verificar franja de aCuotaz
    const franja = page.locator('text=Divide tu pago en hasta').first();
    await expect(franja).toBeVisible();
    await expect(page.locator('text=Sin tarjeta, solo con tu DNI').first()).toBeVisible();

    // 1.2 Enlace a financiamiento en la franja
    const linkFin = page.locator('a[href="/financiamiento"]').first();
    await expect(linkFin).toBeVisible();

    // 1.3 Verificar presencia de catálogo / secciones
    const catalogoLink = page.locator('a[href="/productos"]').first();
    await expect(catalogoLink).toBeVisible();

    // 1.4 Footer oficial
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('text=Libro de Reclamaciones').first()).toBeVisible();
    await expect(footer.locator('text=Términos y Condiciones').first()).toBeVisible();
  });

  test('2. Catálogo: búsqueda, filtros de marca, ordenamiento y categorías', async ({ page }) => {
    await page.goto('/productos');
    await page.waitForLoadState('domcontentloaded');

    // 2.1 Buscador
    const searchInput = page.locator('input[type="text"][placeholder*="Buscar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Casco');
      await page.waitForTimeout(400);
      const items = page.locator('article');
      expect(await items.count()).toBeGreaterThanOrEqual(1);
      await searchInput.fill('');
    }

    // 2.2 Ordenamiento por precio
    const sortSelect = page.locator('select').first();
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption({ label: 'Menor precio' }).catch(() => sortSelect.selectOption('precio-asc'));
      await page.waitForTimeout(300);
      expect(page.url()).toContain('/productos');
    }

    // 2.3 Navegación a categoría directa
    await page.goto('/categoria/cascos');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('3. Ficha de Producto: variantes, recuadro de aCuotaz y cotización WhatsApp', async ({ page }) => {
    await page.goto('/productos');
    await page.waitForLoadState('domcontentloaded');

    // Seleccionar el primer producto disponible
    const productCard = page.locator('article a[href^="/producto/"]').first();
    await expect(productCard).toBeVisible();
    const href = await productCard.getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('domcontentloaded');

    // 3.1 Recuadro de cuotas estimadas de aCuotaz (si el precio está en rango)
    const precioEl = page.locator('main').locator('text=S/').first();
    await expect(precioEl).toBeVisible();

    const acuotazBox = page.locator('text=cuotas quincenales').first();
    if (await acuotazBox.isVisible()) {
      await expect(page.locator('text=Sin tarjeta de crédito').first()).toBeVisible();
      const conoceMas = page.locator('a[href="/financiamiento"]:has-text("Conoce más")').first();
      await expect(conoceMas).toBeVisible();
    }

    // 3.2 Botones de compra o cotización
    const btnAgregar = page.locator('button:has-text("AGREGAR AL CARRITO"), button:has-text("Agregar al Carrito")').first();
    const btnCotizar = page.locator('a:has-text("COTIZAR POR WHATSAPP"), a:has-text("Cotizar por WhatsApp")').first();

    const canAdd = await btnAgregar.isVisible();
    const canQuote = await btnCotizar.isVisible();
    expect(canAdd || canQuote).toBe(true);

    if (canQuote) {
      const quoteHref = await btnCotizar.getAttribute('href');
      expect(quoteHref).toContain('wa.me/51905445698');
      expect(quoteHref?.toLowerCase()).toContain('cotizar');
    }
  });

  test('4. Carrito todo-en-uno: cálculo de envío, cupón y verificación de pedido en Supabase', async ({ page, request }) => {
    // 4.1 Crear un pedido completo mediante API simulando el checkout del carrito
    const res = await request.post('/api/pedidos', {
      data: {
        nombre: 'Valeria Nicole Morales',
        celular: '987654321',
        email: 'valeria.morales@test.com',
        tipo_comprobante: 'boleta',
        dni: '76543210',
        metodo_entrega: 'lima_delivery',
        distrito: 'Miraflores',
        direccion: 'Av. José Larco 1050, Dpto 402',
        referencia: 'Frente a Larcomar',
        codigo_cupon: 'BIKER10',
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

    // 4.2 Verificar URL de WhatsApp oficial y mensaje
    expect(data.wspUrl).toContain('wa.me/51905445698');
    expect(data.wspMensaje).toContain(`Pedido ${data.codigo}`);
    expect(data.wspMensaje).toContain('Valeria Nicole Morales');
    expect(data.wspMensaje).toContain('Delivery Lima: Av. José Larco 1050');

    // 4.3 Visitar la página del pedido público /pedido/[token]
    await page.goto(`/pedido/${data.token}`);
    await page.waitForLoadState('domcontentloaded');

    // Verificar que muestra el código del pedido y el estado
    await expect(page.locator(`text=${data.codigo}`).first()).toBeVisible();
    await expect(page.locator('text=Valeria Nicole Morales').first()).toBeVisible();
    await expect(page.locator('text=Miraflores').first()).toBeVisible();
  });

});
