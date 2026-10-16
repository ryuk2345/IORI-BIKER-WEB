'use client';

import { AdminErrorFallback } from '@/components/admin/ui/AdminErrorFallback';

export default function PedidosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AdminErrorFallback error={error} reset={reset} sectionName="Pedidos" />;
}
