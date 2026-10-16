import { AdminNotFoundFallback } from '@/components/admin/ui/AdminNotFoundFallback';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function AdminRootNotFound() {
  return (
    <AdminNotFoundFallback
      title="Ruta Administrativa No Encontrada"
      description="La página que buscas dentro del panel de administración no existe o fue movida."
      backHref={ADMIN_ROUTES.INICIO}
      backLabel="Ir al Inicio del Admin"
    />
  );
}
