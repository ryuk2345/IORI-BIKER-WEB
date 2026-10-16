import { AdminNotFoundFallback } from '@/components/admin/ui/AdminNotFoundFallback';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function BannersNotFound() {
  return (
    <AdminNotFoundFallback
      title="Banner No Encontrado"
      description="El banner que intentas consultar no existe."
      backHref={ADMIN_ROUTES.BANNERS}
      backLabel="Volver a Banners"
    />
  );
}
