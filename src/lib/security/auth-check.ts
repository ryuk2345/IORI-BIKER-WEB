import { NextRequest } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AuthCheckResult {
  authorized: boolean;
  role?: string;
  user?: any;
  error?: string;
}

/**
 * Verifica si el usuario autenticado tiene rol de Staff (admin o atencion).
 */
export async function verifyStaffAuth(req: NextRequest): Promise<AuthCheckResult> {
  const adminSupabase = createAdminClient();
  let user: any = null;

  // 0. Si se proporciona la clave secreta de administración en header x-admin-key
  const serviceRoleSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const adminKeyHeader = req.headers.get('x-admin-key');
  if (serviceRoleSecret && adminKeyHeader && adminKeyHeader === serviceRoleSecret) {
    return { authorized: true, role: 'admin', user: { role: 'service_role' } };
  }

  // 1. Verificar Header Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data, error } = await adminSupabase.auth.getUser(token);
    if (!error && data?.user) {
      user = data.user;
    }
  }

  // 2. Si no, verificar por Cookies de sesión de Supabase
  if (!user) {
    try {
      const serverSupabase = await createServerClient();
      const { data } = await serverSupabase.auth.getUser();
      user = data?.user;
    } catch {
      // Ignorar error al leer cookies
    }
  }

  // 2.1 Verificar cookie de sesión DEMO para entorno de administración local / pruebas
  const demoCookie = req.cookies.get('iori-demo-admin')?.value;
  if (demoCookie === 'admin') {
    return { authorized: true, role: 'admin', user: { id: 'demo-admin-id', role: 'admin', email: 'admin@ioribikershop.pe' } };
  } else if (demoCookie === 'atencion') {
    return { authorized: true, role: 'atencion', user: { id: 'demo-atencion-id', role: 'atencion', email: 'atencion@ioribikershop.pe' } };
  }

  if (!user) {
    return { authorized: false, error: 'No autenticado. Inicie sesión.' };
  }

  // 3. Verificar rol en la tabla profiles
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('rol, nombre')
    .eq('id', user.id)
    .single();

  const role = profile?.rol;

  if (role === 'admin' || role === 'atencion') {
    return { authorized: true, role, user: { ...user, profile } };
  }

  return { authorized: false, error: 'Acceso no autorizado para este rol.' };
}

/**
 * Verifica si el usuario tiene estrictamente rol de Administrador (no atencion).
 */
export async function verifyAdminOnly(req: NextRequest): Promise<AuthCheckResult> {
  const res = await verifyStaffAuth(req);
  if (!res.authorized) return res;

  if (res.role !== 'admin') {
    return { 
      authorized: false, 
      role: res.role, 
      error: 'Acceso restringido. Se requiere rol de Administrador.' 
    };
  }

  return res;
}
