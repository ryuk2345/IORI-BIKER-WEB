'use client';

import { AdminErrorFallback } from '@/components/admin/ui/AdminErrorFallback';

export default function PromocionesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AdminErrorFallback error={error} reset={reset} sectionName="Promociones" />;
}
