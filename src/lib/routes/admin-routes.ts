/**
 * OBJETO TIPADO DE RUTAS ADMINISTRATIVAS - IORI BIKER SHOP
 * 
 * Centraliza todas las URLs del panel de administración.
 * Al estar tipado estrictamente, cualquier enlace o redirección
 * mal escrita generará un error de TypeScript en tiempo de compilación.
 */

export const ADMIN_SECCIONES_AJUSTES = [
  'empresa',
  'pagos',
  'envios',
  'acuotaz',
  'equipo',
  'publicacion',
] as const;

export type AdminAjustesSeccion = typeof ADMIN_SECCIONES_AJUSTES[number];

export const ADMIN_ROUTES = {
  INICIO: '/admin' as const,
  PEDIDOS: '/admin/pedidos' as const,
  PEDIDO_DETALLE: (codigo: string) => `/admin/pedidos/${encodeURIComponent(codigo)}`,
  PRODUCTOS: '/admin/productos' as const,
  PRODUCTO_NUEVO: '/admin/productos/nuevo' as const,
  PRODUCTO_EDITAR: (id: string) => `/admin/productos/${encodeURIComponent(id)}`,
  CATALOGO: '/admin/catalogo' as const,
  CATALOGO_MARCAS: '/admin/catalogo?tab=marcas' as const,
  CATALOGO_MARCAS_SIN_LOGO: '/admin/catalogo?tab=marcas&filtro=sin_logo#seccion-marcas' as const,
  BANNERS: '/admin/banners' as const,
  PROMOCIONES: '/admin/promociones' as const,
  PROMOCIONES_ESPARTA: '/admin/promociones#seccion-promo-esparta' as const,
  MENSAJES: '/admin/mensajes' as const,
  CONTENIDO: '/admin/contenido' as const,
  CONTENIDO_POLITICAS: '/admin/contenido#seccion-politicas' as const,
  AJUSTES: (seccion?: AdminAjustesSeccion): string =>
    seccion ? `/admin/ajustes/${seccion}` : '/admin/ajustes/empresa',
  AJUSTES_EMPRESA: '/admin/ajustes/empresa#seccion-empresa' as const,
  AJUSTES_PAGOS: '/admin/ajustes/pagos#seccion-pagos' as const,
  AJUSTES_ENVIOS: '/admin/ajustes/envios#seccion-envios' as const,
  AJUSTES_ACUOTAZ: '/admin/ajustes/acuotaz#seccion-acuotaz' as const,
  AJUSTES_EQUIPO: '/admin/ajustes/equipo#seccion-equipo' as const,
  AJUSTES_PUBLICACION: '/admin/ajustes/publicacion#seccion-publicacion' as const,
} as const;

export type AdminRouteKey = keyof typeof ADMIN_ROUTES;
