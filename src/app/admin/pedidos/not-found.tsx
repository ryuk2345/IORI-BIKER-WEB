import { AdminNotFoundFallback } from '@/components/admin/ui/AdminNotFoundFallback';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function PedidosNotFound() {
  return (
    <AdminNotFoundFallback
      title="Pedido No Encontrado"
      description="El pedido que intentas consultar no existe o ha sido modificado."
      backHref={ADMIN_ROUTES.PEDIDOS}
      backLabel="Volver a Lista de Pedidos"
    />
  );
}
