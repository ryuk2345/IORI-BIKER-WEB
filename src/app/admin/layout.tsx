import { Metadata } from 'next';
import { AdminDataProvider } from '@/components/admin/AdminDataContext';
import { AdminAppShell } from '@/components/admin/layout/AdminAppShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Panel de Control | Iori Biker Shop',
  description: 'Administración y gestión interna de Iori Biker Shop.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDataProvider>
      <AdminAppShell>
        {children}
      </AdminAppShell>
    </AdminDataProvider>
  );
}
