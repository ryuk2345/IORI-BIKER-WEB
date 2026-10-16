import { AdminNotFoundFallback } from '@/components/admin/ui/AdminNotFoundFallback';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function ContenidoNotFound() {
  return (
    <AdminNotFoundFallback
      title="Contenido No Encontrado"
      description="El artículo, pregunta frecuente o política no existe."
      backHref={ADMIN_ROUTES.CONTENIDO}
      backLabel="Volver a Contenido"
    />
  );
}
