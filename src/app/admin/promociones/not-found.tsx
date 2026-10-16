import { AdminNotFoundFallback } from '@/components/admin/ui/AdminNotFoundFallback';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function PromocionesNotFound() {
  return (
    <AdminNotFoundFallback
      title="Promoción No Encontrada"
      description="La promoción o campaña solicitada no existe o ha expirado."
      backHref={ADMIN_ROUTES.PROMOCIONES}
      backLabel="Volver a Promociones"
    />
  );
}
