import { verifyAdminRole } from '@/lib/auth/admin-auth-server';

export default async function ProductosLayout({ children }: { children: React.ReactNode }) {
  // Productos está restringido exclusivamente al rol 'admin'
  await verifyAdminRole(['admin']);
  return <>{children}</>;
}
