import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export type AdminRole = 'admin' | 'atencion';

export interface AdminServerSession {
  userId: string;
  email: string;
  role: AdminRole;
  isOwner: boolean;
  nombre?: string;
}

/**
 * Verifica el rol del usuario en el servidor para layouts y server components del admin.
 * Si el rol no está permitido (por ejemplo, 'atencion' queriendo entrar a productos),
 * redirige inmediatamente a la sección permitida (/admin/pedidos).
 * Si no hay sesión válida, redirige a /admin (donde se solicita login).
 */
export async function verifyAdminRole(allowedRoles: AdminRole[] = ['admin', 'atencion']): Promise<AdminServerSession | null> {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get('iori-demo-admin')?.value;

  // 1. Soporte para modo DEMO / Desarrollo local si está habilitado
  if (demoCookie === 'admin' || demoCookie === 'atencion') {
    const demoRole = demoCookie as AdminRole;
    if (!allowedRoles.includes(demoRole)) {
      redirect(ADMIN_ROUTES.PEDIDOS);
    }
    return {
      userId: 'demo-user-id',
      email: demoRole === 'admin' ? 'admin@ioribikershop.pe' : 'atencion@ioribikershop.pe',
      role: demoRole,
      isOwner: demoRole === 'admin',
      nombre: demoRole === 'admin' ? 'Administrador Iori (DEMO)' : 'Asesor de Atención (DEMO)',
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Sin sesión de Supabase: redirigir a /admin si estamos en una subruta
      return null;
    }

    // Consultar perfil y rol en public.profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol, is_owner, nombre, email')
      .eq('id', user.id)
      .single();

    const role = (profile?.rol as AdminRole) || 'admin';
    const isOwner = Boolean(profile?.is_owner);

    if (!allowedRoles.includes(role)) {
      // Usuario con rol no autorizado para esta sección (ej: 'atencion' en /admin/productos)
      redirect(ADMIN_ROUTES.PEDIDOS);
    }

    return {
      userId: user.id,
      email: user.email || profile?.email || '',
      role,
      isOwner,
      nombre: profile?.nombre || user.email?.split('@')[0],
    };
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('Error verificando rol en servidor:', err);
    return null;
  }
}
