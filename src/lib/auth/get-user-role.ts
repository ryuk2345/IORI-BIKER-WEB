import type { NextRequest } from 'next/server';
import { createAdminClient } from '../supabase/admin.ts';

export type UserRole = 'admin' | 'atencion' | 'cliente' | string;

export interface GetUserRoleResult {
  user: any | null;
  userId: string | null;
  email: string | null;
  rol: UserRole | null;
  isStaff: boolean;
  isAdmin: boolean;
  isAtencion: boolean;
  error?: string;
  status: 200 | 401 | 403;
}

export interface AuthVerificationResult {
  authorized: boolean;
  role: string | null;
  user: any | null;
  error?: string;
  status: 200 | 401 | 403;
}

/**
 * Función canónica compartida en el servidor para obtener y verificar el rol del usuario.
 * 
 * 1. Toma el usuario de la sesión con supabase.auth.getUser() (Cookies de sesión o Bearer token).
 * 2. Lee profiles.rol de ese ID con los clientes autorizados:
 *    - Sesión del usuario con política RLS (id = auth.uid())
 *    - Cliente de servidor con clave secreta filtrando por ese ID
 *    - Fallback a metadatos de sesión (user_metadata / app_metadata)
 * 3. Garantiza que la respuesta sea determinista y segura.
 */
export async function getUserRole(req?: NextRequest): Promise<GetUserRoleResult> {
  // 0. Si se proporciona la clave maestra interna de administración (x-admin-key)
  const serviceRoleSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (req && serviceRoleSecret) {
    const adminKeyHeader = req.headers.get('x-admin-key');
    if (adminKeyHeader && adminKeyHeader === serviceRoleSecret) {
      return {
        user: { id: 'service-role-admin', email: 'service-role@ioribikershop.internal' },
        userId: 'service-role-admin',
        email: 'service-role@ioribikershop.internal',
        rol: 'admin',
        isStaff: true,
        isAdmin: true,
        isAtencion: false,
        status: 200,
      };
    }
  }

  let user: any = null;
  let serverSupabase: any = null;

  // 1. Obtener usuario de la sesión mediante cookies del servidor
  try {
    const { createClient: createServerClient } = await import('../supabase/server.ts');
    serverSupabase = await createServerClient();
    const { data: userData, error: userError } = await serverSupabase.auth.getUser();
    if (!userError && userData?.user) {
      user = userData.user;
    }
  } catch (err) {
    // Si se invoca fuera de contexto de cookies o en background task
  }

  // 2. Si no hay usuario por cookies y viene en el request con Bearer token
  if (!user && req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const adminSupabase = createAdminClient();
        const { data: tokenData, error: tokenError } = await adminSupabase.auth.getUser(token);
        if (!tokenError && tokenData?.user) {
          user = tokenData.user;
        }
      } catch (err) {
        console.error('[getUserRole] Error al verificar Bearer token:', err);
      }
    }
  }

  // Si no hay usuario autenticado en la sesión
  if (!user) {
    return {
      user: null,
      userId: null,
      email: null,
      rol: null,
      isStaff: false,
      isAdmin: false,
      isAtencion: false,
      error: 'No autenticado. Se requiere iniciar sesión para acceder.',
      status: 401,
    };
  }

  // 3. Obtener profiles.rol con un cliente que pueda leerlo
  let rol: string | null = null;
  let nombre: string | null = null;

  // Estrategia A: Cliente de sesión de usuario (Aprovecha RLS "Usuarios ven su propio perfil": id = auth.uid())
  if (serverSupabase) {
    try {
      const { data: profileSession, error: profileErr } = await serverSupabase
        .from('profiles')
        .select('rol, nombre')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileErr && profileSession?.rol) {
        rol = String(profileSession.rol).trim().toLowerCase();
        nombre = profileSession.nombre || null;
      }
    } catch {
      // Intentar siguiente estrategia
    }
  }

  // Estrategia B: Cliente de administración con clave secreta (Bypass de RLS)
  if (!rol) {
    try {
      const adminSupabase = createAdminClient();
      const { data: profileAdmin, error: adminErr } = await adminSupabase
        .from('profiles')
        .select('rol, nombre')
        .eq('id', user.id)
        .maybeSingle();

      if (!adminErr && profileAdmin?.rol) {
        rol = String(profileAdmin.rol).trim().toLowerCase();
        nombre = profileAdmin.nombre || null;
      }
    } catch {
      // Intentar siguiente estrategia
    }
  }

  // Estrategia C: Fallback a metadatos de Supabase Auth
  if (!rol) {
    const metaRol =
      user.user_metadata?.rol ||
      user.app_metadata?.rol ||
      user.user_metadata?.role ||
      user.app_metadata?.role;
    if (metaRol) {
      rol = String(metaRol).trim().toLowerCase();
    }
  }

  // Rol resuelto
  const resolvedRole = rol || 'cliente';
  const isAdmin = resolvedRole === 'admin';
  const isAtencion = resolvedRole === 'atencion';
  const isStaff = isAdmin || isAtencion;

  return {
    user: { ...user, nombre: nombre || user.user_metadata?.nombre },
    userId: user.id,
    email: user.email || null,
    rol: resolvedRole,
    isStaff,
    isAdmin,
    isAtencion,
    status: 200,
  };
}

/**
 * Valida que el usuario tenga estrictamente rol de Administrador.
 * Si es rechazado, detalla qué rol encontró y cuál se necesita.
 */
export async function verifyAdminOnly(req?: NextRequest): Promise<AuthVerificationResult> {
  const result = await getUserRole(req);

  if (!result.user) {
    return {
      authorized: false,
      role: null,
      user: null,
      error: 'No autenticado. Se requiere iniciar sesión para acceder.',
      status: 401,
    };
  }

  if (!result.isAdmin) {
    return {
      authorized: false,
      role: result.rol,
      user: result.user,
      error: `Acceso no autorizado para este rol. Rol encontrado: "${result.rol || 'ninguno'}". Se requiere rol: "admin".`,
      status: 403,
    };
  }

  return {
    authorized: true,
    role: result.rol,
    user: result.user,
    status: 200,
  };
}

/**
 * Valida que el usuario tenga rol de Staff (admin o atencion).
 * Si es rechazado, detalla qué rol encontró y cuál se necesita.
 */
export async function verifyStaffAuth(req?: NextRequest): Promise<AuthVerificationResult> {
  const result = await getUserRole(req);

  if (!result.user) {
    return {
      authorized: false,
      role: null,
      user: null,
      error: 'No autenticado. Se requiere iniciar sesión para acceder.',
      status: 401,
    };
  }

  if (!result.isStaff) {
    return {
      authorized: false,
      role: result.rol,
      user: result.user,
      error: `Acceso no autorizado para este rol. Rol encontrado: "${result.rol || 'ninguno'}". Se requiere rol: "admin" o "atencion".`,
      status: 403,
    };
  }

  return {
    authorized: true,
    role: result.rol,
    user: result.user,
    status: 200,
  };
}
