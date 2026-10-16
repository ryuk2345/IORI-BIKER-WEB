import { AdminNotFoundFallback } from '@/components/admin/ui/AdminNotFoundFallback';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function AjustesNotFound() {
  return (
    <AdminNotFoundFallback
      title="Sección de Ajustes No Encontrada"
      description="La sección de configuración solicitada no existe. Secciones válidas: empresa, pagos, envios, acuotaz, equipo y publicacion."
      backHref={ADMIN_ROUTES.AJUSTES('empresa')}
      backLabel="Ir a Ajustes de Empresa"
    />
  );
}
