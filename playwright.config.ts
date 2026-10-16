import { defineConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno de .env.local nativamente
try {
  const envPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        const key = k.trim();
        const val = v.join('=').trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch {
  // Ignorar si falla lectura
}

// Verificación de seguridad: E2E no puede correr contra el dominio de producción del cliente
const targetBaseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
if (targetBaseUrl.includes('ioribikershop.com') || targetBaseUrl.includes('iori-biker.netlify.app')) {
  throw new Error('SEGURIDAD: Las pruebas E2E solo pueden ejecutarse contra el entorno local o de pruebas, nunca contra producción.');
}

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 60000,
  expect: {
    timeout: 12000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // 1. Google Chrome (Desktop 1440px & Mobile 390px)
    {
      name: 'chrome-desktop-1440',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    },
    {
      name: 'chrome-mobile-390',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    },

    // 2. Mozilla Firefox (Desktop 1440px & Mobile 390px)
    {
      name: 'firefox-desktop-1440',
      use: {
        browserName: 'firefox',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'firefox-mobile-390',
      use: {
        browserName: 'firefox',
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },

    // 3. Apple Safari / WebKit (Desktop 1440px & Mobile 390px)
    {
      name: 'safari-desktop-1440',
      use: {
        browserName: 'webkit',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'safari-mobile-390',
      use: {
        browserName: 'webkit',
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
});
