import { verifyAdminRole } from '@/lib/auth/admin-auth-server';

export default async function AjustesLayout({ children }: { children: React.ReactNode }) {
  // Ajustes restringido estrictamente a 'admin'
  await verifyAdminRole(['admin']);
  return <>{children}</>;
}
