import { verifyAdminRole } from '@/lib/auth/admin-auth-server';

export default async function PromocionesLayout({ children }: { children: React.ReactNode }) {
  // Promociones restringido a 'admin'
  await verifyAdminRole(['admin']);
  return <>{children}</>;
}
