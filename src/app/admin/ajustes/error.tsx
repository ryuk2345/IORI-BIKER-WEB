'use client';

import { AdminErrorFallback } from '@/components/admin/ui/AdminErrorFallback';

export default function AjustesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AdminErrorFallback error={error} reset={reset} sectionName="Ajustes y Configuración" />;
}
