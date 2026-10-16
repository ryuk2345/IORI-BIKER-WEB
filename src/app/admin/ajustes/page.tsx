import { redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export default function AdminAjustesRootPage() {
  redirect(ADMIN_ROUTES.AJUSTES('empresa'));
}
