import { test, expect } from '@playwright/test';

test.describe('Módulo de Banners y Hero Slider (Desktop 1440px y Móvil 390px)', () => {

  test('1. Home Desktop (1440px): Hero Slider muestra banners activos con imagen 21:9', async ({ page }) => {
    // Si el proyecto actual no es desktop 1440, adaptar el viewport
    if ((page.viewportSize()?.width || 0) < 1024) {
      await page.setViewportSize({ width: 1440, height: 900 });
    }

    // Cookie de administrador para previsualizar la tienda aunque esté en modo preparación
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // El slider debe estar presente y visible
    const heroSlider = page.locator('section:has-text("PROMO ESPARTA")').first();
    await expect(heroSlider).toBeVisible();

    // Debe mostrar la campaña oficial
    await expect(page.locator('text=CAMPAÑA OFICIAL').first()).toBeVisible();
    await expect(page.locator('text=PROMO ESPARTA').first()).toBeVisible();

    // Botón de acción hacia /promo/esparta
    const ctaBtn = page.locator('a[href="/promo/esparta"]:has-text("Ver Promo Esparta")').first();
    await expect(ctaBtn).toBeVisible();

    // Imagen Desktop visible dentro del hero slider
    const desktopImgContainer = heroSlider.locator('.hidden.md\\:block').first();
    await expect(desktopImgContainer).toBeVisible();
  });

  test('2. Home Móvil (390px): Hero Slider muestra versión 4:5 adaptada', async ({ page }) => {
    // Si el proyecto actual no es móvil 390, adaptar el viewport
    if ((page.viewportSize()?.width || 0) > 640) {
      await page.setViewportSize({ width: 390, height: 844 });
    }

    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // En móvil debe verse la tarjeta adaptada
    await expect(page.locator('text=PROMO ESPARTA').first()).toBeVisible();
    const ctaBtn = page.locator('a[href="/promo/esparta"]:has-text("Ver Promo Esparta")').first();
    await expect(ctaBtn).toBeVisible();

    // Contenedor móvil dentro del hero activo
    const heroSlider = page.locator('section:has-text("PROMO ESPARTA")').first();
    const mobileImgContainer = heroSlider.locator('.md\\:hidden').first();
    await expect(mobileImgContainer).toBeVisible();
  });

  test('3. Admin Banners: Lista con miniaturas, badges de estado y selector Desktop/Móvil', async ({ page }) => {
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    await page.goto('/admin/banners');
    await page.waitForLoadState('domcontentloaded');

    // Título del módulo
    await expect(page.locator('text=Control de Banners y Sliders')).toBeVisible();

    // Selector de vista previa Desktop (21:9) y Móvil (4:5)
    const desktopBtn = page.locator('button:has-text("Desktop (21:9)")');
    const mobileBtn = page.locator('button:has-text("Móvil (4:5)")');
    await expect(desktopBtn).toBeVisible();
    await expect(mobileBtn).toBeVisible();

    // Alternar a Móvil
    await mobileBtn.click();
    await expect(mobileBtn).toHaveClass(/bg-black/);

    // Alternar a Desktop
    await desktopBtn.click();
    await expect(desktopBtn).toHaveClass(/bg-black/);

    // Lista de banners registrados con al menos 1 banner
    await expect(page.locator('text=Catálogo de Banners Registrados')).toBeVisible();
    await expect(page.locator('text=PROMO ESPARTA').first()).toBeVisible();
    await expect(page.locator('text=Activo').first()).toBeVisible();
  });

  test('4. Admin Banners: Formulario de edición con selector de destino y vista previa', async ({ page }) => {
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    await page.goto('/admin/banners');
    await page.waitForLoadState('domcontentloaded');

    // Hacer clic en editar el primer banner
    const editBtn = page.locator('button[title="Editar banner"]').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Debe abrirse el formulario de edición en la misma página
    await expect(page.locator('text=Editar Banner')).toBeVisible();
    await expect(page.locator('text=/1\\. Imagen Desktop/')).toBeVisible();
    await expect(page.locator('text=/2\\. Imagen Móvil/')).toBeVisible();

    // Botón selector de destino asistido
    const chooseDestBtn = page.locator('button:has-text("Elegir destino...")');
    await expect(chooseDestBtn).toBeVisible();
    await chooseDestBtn.scrollIntoViewIfNeeded();
    await chooseDestBtn.click();

    // Modal selector de destino abierto
    await expect(page.locator('text=Seleccionar Destino del Banner')).toBeVisible();
    await expect(page.locator('text=Promos y Páginas')).toBeVisible();
    await expect(page.locator('button:has-text("Categorías")').first()).toBeVisible();

    // Cerrar modal con botón cancelar o Escape
    await page.keyboard.press('Escape');
  });

  test('5. Admin Banners: Duplicar y reordenar banners', async ({ page }) => {
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    await page.goto('/admin/banners');
    await page.waitForLoadState('domcontentloaded');

    // Verificar botones de orden (#1, #2...)
    const orderOne = page.locator('text=#1').first();
    await expect(orderOne).toBeVisible();

    // Botón de duplicar banner disponible
    const copyBtn = page.locator('button[title="Duplicar banner"]').first();
    await expect(copyBtn).toBeVisible();

    // Botón de alternar activo disponible
    const powerBtn = page.locator('button[title*="banner"]').first();
    await expect(powerBtn).toBeVisible();
  });

});
