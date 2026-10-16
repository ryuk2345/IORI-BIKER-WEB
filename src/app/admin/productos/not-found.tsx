import { AdminNotFoundFallback } from '@/components/admin/ui/AdminNotFoundFallback';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function ProductosNotFound() {
  return (
    <AdminNotFoundFallback
      title="Producto No Encontrado"
      description="El producto que buscas no existe o ha sido eliminado del catálogo."
      backHref={ADMIN_ROUTES.PRODUCTOS}
      backLabel="Volver al Catálogo de Productos"
    />
  );
}
