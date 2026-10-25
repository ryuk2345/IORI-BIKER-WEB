import { redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';
import { getUserRole } from '@/lib/auth/get-user-role';

export type AdminRole = 'admin' | 'atencion';

export interface AdminServerSession {
  userId: string;
  email: string;
  role: AdminRole;
  isOwner: boolean;
  nombre?: string;
}

/**
 * Verifica el rol del usuario en el servidor para layouts y server components del admin usando getUserRole().
 * Si el rol no está permitido (por ejemplo, 'atencion' queriendo entrar a productos),
 * redirige inmediatamente a la sección permitida (/admin/pedidos).
 * Si no hay sesión válida, retorna null.
 */
export async function verifyAdminRole(allowedRoles: AdminRole[] = ['admin', 'atencion']): Promise<AdminServerSession | null> {
  try {
    const result = await getUserRole();

    if (!result.user || !result.userId) {
      return null;
    }

    const role = (result.rol as AdminRole) || 'cliente';
    const isOwner = Boolean(result.user.user_metadata?.is_owner ?? true);

    if (!allowedRoles.includes(role)) {
      redirect(ADMIN_ROUTES.PEDIDOS);
    }

    return {
      userId: result.userId,
      email: result.email || '',
      role,
      isOwner,
      nombre: result.user.nombre || result.email?.split('@')[0],
    };
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('Error verificando rol en servidor:', err);
    return null;
  }
}
