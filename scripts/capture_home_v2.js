const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../docs/rediseno/capturas');
const ARTIFACTS_DIR = '/Users/user/.gemini/antigravity-ide/brain/e42f3db6-0fb5-4e1d-891a-46f141251064';

const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440' },
  { width: 768, height: 1024, name: '768' },
  { width: 390, height: 844, name: '390' },
];

async function capture() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Capturando Viewport ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    // Agregar cookie admin para saltar cortina "tienda en preparación"
    await context.addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    const page = await context.newPage();

    // 1. Navegar a Home con demo=1
    await page.goto('http://localhost:3000/?demo=1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Captura Viewport
    const vpFile = path.join(OUTPUT_DIR, `home_v2_despues_${vp.name}_viewport.png`);
    await page.screenshot({ path: vpFile, fullPage: false });
    console.log(`Viewport guardado: ${vpFile}`);

    // Captura Full Page
    const fullFile = path.join(OUTPUT_DIR, `home_v2_despues_${vp.name}_full.png`);
    await page.screenshot({ path: fullFile, fullPage: true });
    console.log(`Full Page guardado: ${fullFile}`);

    // Copiar a la carpeta de artefactos para visualización
    if (fs.existsSync(ARTIFACTS_DIR)) {
      fs.copyFileSync(vpFile, path.join(ARTIFACTS_DIR, `home_v2_despues_${vp.name}_viewport.png`));
      fs.copyFileSync(fullFile, path.join(ARTIFACTS_DIR, `home_v2_despues_${vp.name}_full.png`));
    }

    await context.close();
  }

  await browser.close();
  console.log('\nCapturas completadas exitosamente.');
}

capture().catch((err) => {
  console.error('Error generando capturas:', err);
  process.exit(1);
});
