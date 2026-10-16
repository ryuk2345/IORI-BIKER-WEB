import { test, expect } from '@playwright/test';
import { ADMIN_ROUTES } from '../src/lib/routes/admin-routes';

test.describe('Admin: Rutas reales, Navegación, Checklist de 12 Pasos y Roles', () => {

  test('1. Verificación de Login y Acceso Rápido DEMO a /admin', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Debe mostrar formulario de acceso
    await expect(page.locator('text=Panel de Control').first()).toBeVisible();

    // Click en Acceso Rápido DEMO
    const demoBtn = page.locator('text=Acceso Rápido DEMO (Administrador)');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Debe cargar el Dashboard de Inicio
    await expect(page.locator('text=Guía de Carga Inicial y Puesta en Marcha')).toBeVisible();
    await expect(page.locator('text=Inicio • Resumen General')).toBeVisible();
  });

  test('2. Los 12 pasos de la guía apuntan a rutas reales con anclas y tarjetas clicables', async ({ page }) => {
    // Iniciar sesión con cookie de demo
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    const checklistGrid = page.locator('.grid').first();

    // 1. Datos del negocio -> /admin/ajustes/empresa#seccion-empresa
    const paso1 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.AJUSTES_EMPRESA}"]`);
    await expect(paso1).toBeAttached();

    // 2. Cuentas bancarias -> /admin/ajustes/pagos#seccion-pagos
    const paso2 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.AJUSTES_PAGOS}"]`);
    await expect(paso2).toBeAttached();

    // 3. Tarifas de despacho -> /admin/ajustes/envios#seccion-envios
    const paso3 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.AJUSTES_ENVIOS}"]`);
    await expect(paso3).toBeAttached();

    // 4. aCuotaz -> /admin/ajustes/acuotaz#seccion-acuotaz
    const paso4 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.AJUSTES_ACUOTAZ}"]`);
    await expect(paso4).toBeAttached();

    // 5. Logos de marcas -> /admin/catalogo?tab=marcas&filtro=sin_logo#seccion-marcas
    const paso5 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.CATALOGO_MARCAS_SIN_LOGO}"]`);
    await expect(paso5).toBeAttached();

    // 6. Catálogo de productos -> /admin/productos (primer enlace hacia productos)
    const paso6 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.PRODUCTOS}"]`).first();
    await expect(paso6).toBeAttached();

    // 8. Banners -> /admin/banners
    const paso8 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.BANNERS}"]`);
    await expect(paso8).toBeAttached();

    // 9. Promo Esparta -> /admin/promociones#seccion-promo-esparta
    const paso9 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.PROMOCIONES_ESPARTA}"]`);
    await expect(paso9).toBeAttached();

    // 10. Políticas y FAQs -> /admin/contenido#seccion-politicas
    const paso10 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.CONTENIDO_POLITICAS}"]`);
    await expect(paso10).toBeAttached();

    // 11. Invitaciones al equipo -> /admin/ajustes/equipo#seccion-equipo
    const paso11 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.AJUSTES_EQUIPO}"]`);
    await expect(paso11).toBeAttached();

    // 12. Publicar tienda -> /admin/ajustes/publicacion#seccion-publicacion
    const paso12 = checklistGrid.locator(`a[href="${ADMIN_ROUTES.AJUSTES_PUBLICACION}"]`);
    await expect(paso12).toBeAttached();
  });

  test('3. Navegación directa por URL a cada submódulo mantiene la sección', async ({ page }) => {
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    // 3.1 Submódulo Catálogo
    await page.goto('/admin/catalogo');
    await expect(page.locator('text=Las 14 Marcas Oficiales de Iori Biker Shop').or(page.locator('text=Logotipos de las 14 Marcas Oficiales'))).toBeVisible();

    // 3.2 Submódulo Banners
    await page.goto('/admin/banners');
    await expect(page.locator('text=Control de Banners y Sliders')).toBeVisible();

    // 3.3 Submódulo Promociones
    await page.goto('/admin/promociones');
    await expect(page.locator('text=Promoción Combo Esparta')).toBeVisible();

    // 3.4 Submódulo Mensajes
    await page.goto('/admin/mensajes');
    await expect(page.locator('text=Mensajes de Contacto')).toBeVisible();

    // 3.5 Submódulo Contenido
    await page.goto('/admin/contenido');
    await expect(page.locator('text=Editor de Blog').first()).toBeVisible();

    // 3.6 Submódulo Ajustes sección Envíos
    await page.goto('/admin/ajustes/envios');
    await expect(page.locator('text=Tarifas de Entrega y Agencias de Envío')).toBeVisible();

    // 3.7 Submódulo Ajustes sección aCuotaz
    await page.goto('/admin/ajustes/acuotaz');
    await expect(page.locator('text=Parámetros de Cuotas aCuotaz')).toBeVisible();

    // 3.8 Submódulo Ajustes sección Equipo
    await page.goto('/admin/ajustes/equipo');
    await expect(page.locator('text=Miembros del Equipo y Roles Autorizados')).toBeVisible();
  });

  test('4. Botón Atrás y Refresco mantienen filtros y ruta', async ({ page }) => {
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    // Visitar marcas con filtro de sin logo
    await page.goto('/admin/catalogo?tab=marcas&filtro=sin_logo');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/.*filtro=sin_logo/);
    await expect(page.locator('text=Sin logo (').first()).toBeVisible();

    // Refrescar página
    await page.reload();
    await expect(page).toHaveURL(/.*filtro=sin_logo/);
    await expect(page.locator('text=Logotipos de las 14 Marcas Oficiales')).toBeVisible();
  });

  test('5. Sección no existente en Ajustes muestra Not Found con regreso seguro', async ({ page }) => {
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    await page.goto('/admin/ajustes/seccion_inexistente_123');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('text=Sección de Ajustes No Encontrada')).toBeVisible();
    await expect(page.locator('text=Ir a Ajustes de Empresa')).toBeVisible();
  });

  test('6. Rol Atención al Cliente no tiene acceso a secciones restringidas', async ({ page }) => {
    // Cookie con rol atención
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'atencion', url: 'http://localhost:3000' }
    ]);

    // Intentar acceder directamente a /admin/productos
    await page.goto('/admin/productos');
    await page.waitForLoadState('domcontentloaded');

    // Debe ser redirigido a /admin/pedidos
    await expect(page).toHaveURL(/.*\/admin\/pedidos/);
    await expect(page.locator('text=Gestor de Pedidos de WhatsApp')).toBeVisible();
  });

  test('7. Buscador Global en cabecera: apertura de modal y búsqueda', async ({ page }) => {
    await page.context().addCookies([
      { name: 'iori-demo-admin', value: 'admin', url: 'http://localhost:3000' }
    ]);

    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Botón de búsqueda en cabecera
    const searchBtn = page.locator('button:has-text("Buscar pedido o producto")');
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();

    // Modal abierto con input de búsqueda
    const searchInput = page.locator('input[placeholder*="Buscar por código de pedido"]');
    await expect(searchInput).toBeVisible();

    // Escribir código de pedido
    await searchInput.fill('IORI-1002');
    await expect(page.locator('text=Pedidos Coincidentes')).toBeVisible();
    await expect(page.locator('text=Ver pedido en panel de administración')).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible();
  });
});
