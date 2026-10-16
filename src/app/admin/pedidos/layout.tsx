import { verifyAdminRole } from '@/lib/auth/admin-auth-server';

export default async function PedidosLayout({ children }: { children: React.ReactNode }) {
  // Pedidos está permitido para 'admin' y 'atencion'
  await verifyAdminRole(['admin', 'atencion']);
  return <>{children}</>;
}
