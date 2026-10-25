import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type AdminKeyType = 'secret' | 'service_role' | 'publishable' | 'anon' | 'desconocida' | 'ausente';

export interface AdminKeyInfo {
  /** Variable de entorno de donde salió la clave elegida */
  source: 'SUPABASE_SERVICE_ROLE_KEY' | 'SUPABASE_SECRET_KEY' | null;
  type: AdminKeyType;
  /** true solo si la clave salta RLS (sb_secret_... o JWT con role=service_role) */
  valid: boolean;
}

/** Detecta el tipo de clave de Supabase sin exponer su valor. */
export function detectSupabaseKeyType(rawKey: string | undefined | null): AdminKeyType {
  const key = (rawKey || '').trim();
  if (!key) return 'ausente';
  if (key.startsWith('sb_secret_')) return 'secret';
  if (key.startsWith('sb_publishable_')) return 'publishable';

  // Claves legacy: JWT firmados con un claim "role"
  const parts = key.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (payload?.role === 'service_role') return 'service_role';
      if (payload?.role === 'anon') return 'anon';
    } catch {
      // no es un JWT legible
    }
  }
  return 'desconocida';
}

/**
 * Elige la clave secreta del servidor entre SUPABASE_SERVICE_ROLE_KEY y SUPABASE_SECRET_KEY.
 * Nunca acepta una clave pública (publishable / anon) como reemplazo.
 */
export function resolveAdminKey(env: NodeJS.ProcessEnv = process.env): AdminKeyInfo & { key: string | null } {
  const candidates = [
    ['SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY],
    ['SUPABASE_SECRET_KEY', env.SUPABASE_SECRET_KEY],
  ] as const;

  let firstInvalid: AdminKeyInfo | null = null;
  for (const [source, raw] of candidates) {
    const type = detectSupabaseKeyType(raw);
    if (type === 'ausente') continue;
    if (type === 'secret' || type === 'service_role') {
      return { source, type, valid: true, key: (raw || '').trim() };
    }
    if (!firstInvalid) firstInvalid = { source, type, valid: false };
  }

  return { ...(firstInvalid || { source: null, type: 'ausente', valid: false }), key: null };
}

function failConfig(message: string): never {
  const errorMsg = `[Supabase Admin] ${message}`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

/**
 * Crea un cliente administrativo de Supabase con bypass de Row Level Security (RLS).
 * Requiere estrictamente la clave secreta (sb_secret_... o service_role legacy) en
 * SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY. Nunca usa la clave pública como reemplazo:
 * si falta o está mal configurada, lanza un error claro en vez de fallar en silencio con RLS.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    failConfig('Error crítico: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_URL no está configurada en las variables de entorno.');
  }

  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
  for (const name of ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY'] as const) {
    const value = process.env[name]?.trim();
    if (anonKey && value === anonKey) {
      failConfig(
        `ERROR DE SEGURIDAD CRÍTICO: ${name} tiene exactamente el mismo valor que la clave pública anónima (anon). ` +
          'La clave de administración DEBE ser la clave secreta (sb_secret_...), no la clave pública (sb_publishable_...).'
      );
    }
  }

  const resolved = resolveAdminKey();
  if (!resolved.key) {
    if (resolved.type === 'ausente') {
      failConfig(
        'Error crítico de configuración: Falta la clave secreta administrativa (service_role). ' +
          'En Netlify / Producción DEBES configurar SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY con la clave ' +
          'privada que inicia con "sb_secret_". NUNCA se debe omitir ni reemplazar por la clave pública.'
      );
    }
    if (resolved.type === 'publishable' || resolved.type === 'anon') {
      failConfig(
        `ERROR DE SEGURIDAD CRÍTICO: ${resolved.source} es una clave pública ("sb_publishable_...") o JWT anon. ` +
          'createAdminClient requiere estrictamente la clave secreta ("sb_secret_...") para operar con bypass de RLS en el servidor.'
      );
    }
    failConfig(
      `Clave secreta inválida en ${resolved.source}: no tiene formato "sb_secret_..." ni de JWT service_role. ` +
        'Revisa que no se haya quedado el texto de ejemplo y vuelve a desplegar.'
    );
  }

  return createClient(supabaseUrl as string, resolved.key as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
