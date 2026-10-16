const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../docs/rediseno/capturas');

const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440' },
  { width: 768, height: 1024, name: '768' },
  { width: 390, height: 844, name: '390' },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'catalogo', path: '/productos' },
  { name: 'producto', path: '/producto/casco-ls2-ff800-storm' },
  { name: 'carrito', path: '/carrito' },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const pg of PAGES) {
      const url = `http://localhost:3000${pg.path}`;
      console.log(`Capturing ${pg.name} at ${url}...`);

      try {
        if (pg.name === 'carrito') {
          await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
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
        }

        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);

        // Viewport screenshot
        const vpPath = path.join(OUTPUT_DIR, `local_${pg.name}_despues_${vp.name}_viewport.png`);
        await page.screenshot({ path: vpPath });
        console.log(`Saved: ${vpPath}`);

        // Full page screenshot
        const fullPath = path.join(OUTPUT_DIR, `local_${pg.name}_despues_${vp.name}_full.png`);
        await page.screenshot({ path: fullPath, fullPage: true });
        console.log(`Saved: ${fullPath}`);
      } catch (err) {
        console.error(`Error capturing ${pg.name} on ${vp.name}:`, err.message);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\nAll captures completed successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
