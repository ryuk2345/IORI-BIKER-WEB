import { verifyAdminRole } from '@/lib/auth/admin-auth-server';

export default async function CatalogoLayout({ children }: { children: React.ReactNode }) {
  // Catálogo (Categorías y Marcas) restringido a 'admin'
  await verifyAdminRole(['admin']);
  return <>{children}</>;
}
