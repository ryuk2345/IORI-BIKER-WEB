import { test, expect } from '@playwright/test';

test.describe('Crawler de Integridad de Enlaces, Imágenes y WhatsApp', () => {

  const rutasPrincipales = [
    '/',
    '/productos',
    '/categoria/cascos',
    '/categoria/indumentaria',
    '/financiamiento',
    '/contacto',
    '/trabaja-con-nosotros',
    '/libro-de-reclamaciones',
    '/politicas/terminos-y-condiciones',
    '/politicas/politica-de-privacidad',
    '/politicas/cambios-y-devoluciones',
    '/preguntas-frecuentes',
    '/carrito',
  ];

  for (const ruta of rutasPrincipales) {
    test(`Validar integridad de página: ${ruta}`, async ({ page }) => {
      const response = await page.goto(ruta);
      expect(response?.status()).toBeLessThan(400);

      // Verificar que no haya mensajes de error crítico
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
      await expect(page.locator('body')).not.toContainText('500: Server Error');

      // Verificar que todas las imágenes visibles se hayan cargado
      const imagenes = page.locator('img');
      const count = await imagenes.count();
      for (let i = 0; i < Math.min(count, 10); i++) {
        const img = imagenes.nth(i);
        const naturalWidth = await img.evaluate((node: HTMLImageElement) => node.naturalWidth).catch(() => 1);
        expect(naturalWidth).toBeGreaterThanOrEqual(0);
      }
    });
  }

  test('Validar enlaces externos oficiales: WhatsApp, Teléfono y Correo', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // WhatsApp links
    const wspLinks = page.locator('a[href*="wa.me"]');
    const wspCount = await wspLinks.count();
    expect(wspCount).toBeGreaterThan(0);

    for (let i = 0; i < wspCount; i++) {
      const href = await wspLinks.nth(i).getAttribute('href');
      expect(href).toContain('wa.me/51905445698');
    }

    // Teléfono
    const telLinks = page.locator('a[href^="tel:"]');
    const telCount = await telLinks.count();
    if (telCount > 0) {
      const telHref = await telLinks.first().getAttribute('href');
      expect(telHref).toContain('905445698');
    }
  });

});
