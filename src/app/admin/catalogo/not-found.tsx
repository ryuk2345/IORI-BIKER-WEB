import { AdminNotFoundFallback } from '@/components/admin/ui/AdminNotFoundFallback';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function CatalogoNotFound() {
  return (
    <AdminNotFoundFallback
      title="Catálogo No Encontrado"
      description="La categoría o marca que intentas consultar no existe."
      backHref={ADMIN_ROUTES.CATALOGO}
      backLabel="Volver al Catálogo"
    />
  );
}
