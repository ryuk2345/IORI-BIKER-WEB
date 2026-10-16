import { verifyAdminRole } from '@/lib/auth/admin-auth-server';

export default async function BannersLayout({ children }: { children: React.ReactNode }) {
  // Banners restringido a 'admin'
  await verifyAdminRole(['admin']);
  return <>{children}</>;
}
