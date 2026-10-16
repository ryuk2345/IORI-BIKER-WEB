import { AdminNotFoundFallback } from '@/components/admin/ui/AdminNotFoundFallback';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function MensajesNotFound() {
  return (
    <AdminNotFoundFallback
      title="Bandeja o Mensaje No Encontrado"
      description="El mensaje o bandeja solicitada no existe."
      backHref={ADMIN_ROUTES.MENSAJES}
      backLabel="Volver a Mensajes"
    />
  );
}
