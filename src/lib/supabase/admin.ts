import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Crea un cliente administrativo de Supabase con bypass de Row Level Security (RLS).
 * Requiere estrictamente la clave secreta service_role (SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY).
 * 
 * Si falta en producción o si se configuró por error la clave anónima pública,
 * emite un error explícito en consola y lanza una excepción clara para evitar fallos silenciosos.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    const errorMsg = '[Supabase Admin] Error crítico: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_URL no está configurada en las variables de entorno.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!serviceRoleKey) {
    const errorMsg =
      '[Supabase Admin] Error crítico de configuración: Falta la clave secreta administrativa (service_role). ' +
      'En Netlify / Producción DEBES configurar SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY con la clave ' +
      'privada que inicia con "sb_secret_". NUNCA se debe omitir ni reemplazar por la clave pública.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Comprobar que no se haya configurado por error la clave anónima pública
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (anonKey && serviceRoleKey === anonKey) {
    const errorMsg =
      '[Supabase Admin] ERROR DE SEGURIDAD CRÍTICO: SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY ' +
      'tiene exactamente el mismo valor que la clave pública anónima (anon). La clave de administración ' +
      'DEBE ser la clave secreta service_role con bypass de RLS (sb_secret_...), no la clave pública (sb_publishable_...).';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (serviceRoleKey.startsWith('sb_publishable_')) {
    const errorMsg =
      '[Supabase Admin] ERROR DE SEGURIDAD CRÍTICO: La clave configurada para el cliente de administración ' +
      'es una clave pública ("sb_publishable_..."). createAdminClient requiere estrictamente la clave secreta ' +
      'service_role ("sb_secret_...") para operar con bypass de RLS en el servidor.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

