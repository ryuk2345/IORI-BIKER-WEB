/**
 * CONFIGURACIÓN TÉCNICA DE LA APLICACIÓN
 * 
 * Regla de arquitectura:
 * En este archivo van EXCLUSIVAMENTE constantes técnicas y operativas del sistema.
 * 
 * Los datos del negocio (Razón Social, RUC, Horarios, Teléfonos WhatsApp, Direcciones
 * de Sedes Físicas y Enlaces de Redes Sociales) se leen dinámicamente desde la tabla
 * 'ajustes_generales' en Supabase y son editables por el cliente desde el panel admin.
 */

export const CONFIG_TECNICA = {
  // Identificador de plataforma
  NOMBRE_SISTEMA: 'Iori Biker Web App',
  VERSION: '1.0.0',
  
  // Parámetros de Catálogo y Paginación
  PRODUCTOS_POR_PAGINA: 24,
  MAX_FOTOS_POR_PRODUCTO: 8,
  MIN_BUSQUEDA_CARACTERES: 2,
  DEBOUNCE_BUSQUEDA_MS: 250,
  
  // Parámetros de Moneda y Localización
  MONEDA_CODIGO: 'PEN',
  MONEDA_SIMBOLO: 'S/',
  PAIS_CODIGO: 'PE',
  ZONA_HORARIA: 'America/Lima',
  
  // Revalidación de Rutas (Segundos)
  REVALIDACION_CATALOGO_SEGUNDOS: 10,
  REVALIDACION_BANNERS_SEGUNDOS: 10,
  REVALIDACION_AJUSTES_SEGUNDOS: 30,
  
  // Límites de Seguridad y Antispam
  MAX_INTENTOS_FORMULARIO_POR_HORA: 10,
  MAX_SUBIDA_IMAGEN_MB: 5,
  FORMATOS_IMAGEN_PERMITIDOS: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Proporciones Estándar de Banners
  PROPORCIONES: {
    HERO_DESKTOP: '16:9',
    HERO_MOBILE: '4:5',
    HERO_LATERAL: '16:9',
    CATEGORIA_CARD: '4:5',
  },
} as const;

export type ConfigTecnica = typeof CONFIG_TECNICA;
