import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Auditoría de Accesibilidad WCAG (axe-core)', () => {

  test('1. Accesibilidad en Home (/)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast']) // El contraste se evalúa en diseño
      .analyze();

    // Verificamos que no haya violaciones críticas estructurales (ej. falta de roles aria o etiquetas faltantes)
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('2. Accesibilidad en Catálogo (/productos)', async ({ page }) => {
    await page.goto('/productos');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('3. Accesibilidad en Carrito (/carrito)', async ({ page }) => {
    await page.goto('/carrito');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('4. Accesibilidad en Panel de Administración (/admin)', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    expect(criticalViolations).toEqual([]);
  });

});
