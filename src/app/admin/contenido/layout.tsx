import { verifyAdminRole } from '@/lib/auth/admin-auth-server';

export default async function ContenidoLayout({ children }: { children: React.ReactNode }) {
  // Contenido restringido a 'admin'
  await verifyAdminRole(['admin']);
  return <>{children}</>;
}
