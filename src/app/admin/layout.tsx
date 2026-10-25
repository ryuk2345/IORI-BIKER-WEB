import { Metadata } from 'next';
import { AdminDataProvider } from '@/components/admin/AdminDataContext';
import { AdminAppShell } from '@/components/admin/layout/AdminAppShell';
import { getUserRole } from '@/lib/auth/get-user-role';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Panel de Control | Iori Biker Shop',
  description: 'Administración y gestión interna de Iori Biker Shop.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getUserRole();

  return (
    <AdminDataProvider
      initialUser={
        auth.user
          ? {
              ...auth.user,
              profile: {
                id: auth.userId,
                email: auth.email,
                rol: auth.rol,
                nombre: auth.user.nombre,
              },
            }
          : null
      }
      initialRole={auth.rol}
    >
      <AdminAppShell>
        {children}
      </AdminAppShell>
    </AdminDataProvider>
  );
}
