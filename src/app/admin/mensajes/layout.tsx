import { verifyAdminRole } from '@/lib/auth/admin-auth-server';

export default async function MensajesLayout({ children }: { children: React.ReactNode }) {
  // Mensajes permitido para 'admin' y 'atencion'
  await verifyAdminRole(['admin', 'atencion']);
  return <>{children}</>;
}
