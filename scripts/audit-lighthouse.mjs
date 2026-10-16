import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Users/user/Library/Caches/ms-playwright/chromium-1243/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const PORT = process.env.AUDIT_PORT || '3005';

const urls = [
  { name: 'Home', path: '/' },
  { name: 'Listado (Catálogo)', path: '/productos' },
  { name: 'Ficha de Producto', path: '/producto/casco-shaft-pro-series-carbono' },
  { name: 'Carrito', path: '/carrito' },
];

async function runAudit() {
  console.log(`🚀 Iniciando auditoría Lighthouse Móvil en http://localhost:${PORT}...`);
  
  const chrome = await chromeLauncher.launch({
    chromePath: CHROME_PATH,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  const results = [];

  for (const item of urls) {
    const targetUrl = `http://localhost:${PORT}${item.path}`;
    console.log(`Evaluando: ${item.name} (${targetUrl})...`);
    try {
      const runnerResult = await lighthouse(targetUrl, {
        port: chrome.port,
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2.75,
          disabled: false,
        },
        throttlingMethod: 'simulate',
      });

      const categories = runnerResult.lhr.categories;
      const scores = {
        name: item.name,
        path: item.path,
        url: targetUrl,
        performance: Math.round((categories.performance?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100),
      };

      console.log(`📊 ${item.name}:`);
      console.log(`   - Performance: ${scores.performance}`);
      console.log(`   - Accessibility: ${scores.accessibility}`);
      console.log(`   - Best Practices: ${scores.bestPractices}`);
      console.log(`   - SEO: ${scores.seo}`);

      results.push(scores);
    } catch (err) {
      console.error(`❌ Error auditando ${item.name}:`, err.message);
    }
  }

  await chrome.kill();

  const reportPath = path.resolve('docs/qa/lighthouse-results.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`✅ Resultados guardados en ${reportPath}`);
}

runAudit();
