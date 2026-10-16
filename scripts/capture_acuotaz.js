const { chromium } = require('playwright');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../docs/rediseno/capturas');

const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440' },
  { width: 390, height: 844, name: '390' },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\nCapturing in ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // 1. Home (Franja aCuotaz fondo claro)
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `acuotaz_franja_home_${vp.name}.png`) });

    // 2. Ficha de producto (Recuadro cuotas estimadas)
    await page.goto('http://localhost:3000/producto/casco-ls2-ff800-storm', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
    if (vp.name === '390') {
      // Scroll down so the price and aCuotaz box are centered in the mobile viewport
      await page.evaluate(() => window.scrollBy(0, 420));
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, `acuotaz_recuadro_ficha_${vp.name}.png`) });

    // 3. Financiamiento
    await page.goto('http://localhost:3000/financiamiento', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `acuotaz_pagina_financiamiento_${vp.name}.png`) });

    // 4. Carrito (con producto y opción aCuotaz)
    await page.evaluate(() => {
      const sampleCart = {
        state: {
          items: [
            {
              id: 'prod_1-M-Grafito',
              producto: {
                id: 'prod_1',
                nombre: 'Casco LS2 FF800 Storm Esparta Double Visor',
                slug: 'casco-ls2-ff800-storm',
                precio: 449,
                precioOriginal: 580,
                enOferta: true,
                imagenes: ['/images/products/prod_1.png'],
                marcaNombre: 'LS2',
                categoriaNombre: 'Cascos',
                stock: 8,
              },
              cantidad: 1,
              tallaSeleccionada: 'M',
              colorSeleccionado: 'Grafito',
            }
          ],
          cupon: null,
          isOpen: false,
        },
        version: 0,
      };
      localStorage.setItem('iori-cart-storage', JSON.stringify(sampleCart));
    });

    await page.goto('http://localhost:3000/carrito', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
    if (vp.name === '390') {
      await page.evaluate(() => window.scrollBy(0, 520));
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, `acuotaz_carrito_opcion_${vp.name}.png`) });

    await context.close();
  }

  await browser.close();
  console.log('\nAll updated aCuotaz visual captures finished successfully!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
