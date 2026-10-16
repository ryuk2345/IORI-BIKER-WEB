'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminLayoutShell } from '@/components/admin/layout/AdminLayoutShell';
import { ToastProvider } from '@/components/admin/ui/Toast';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/admin';
  const router = useRouter();

  const {
    user,
    checkingAuth,
    handleLogout,
    products,
    inboxCounts,
    setUser,
  } = useAdminData();

  // Verificación y restricción estricta para el rol 'atencion'
  useEffect(() => {
    if (user?.profile?.rol === 'atencion') {
      const allowedRoutes = ['/admin', '/admin/pedidos', '/admin/mensajes'];
      const isAllowed = allowedRoutes.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
      );
      if (!isAllowed) {
        router.replace(ADMIN_ROUTES.PEDIDOS);
      }
    }
  }, [user, pathname, router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3 text-xs font-bold uppercase tracking-widest">
        <div className="w-6 h-6 border-2 border-[#F58220] border-t-transparent rounded-full animate-spin" />
        <span>Verificando credenciales autorizadas...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <AdminLogin
        onLoginSuccess={(u) => {
          if (typeof document !== 'undefined') {
            document.cookie = `iori-demo-admin=${u.profile?.rol || 'admin'}; path=/; max-age=86400`;
          }
          setUser(u);
        }}
      />
    );
  }

  return (
    <ToastProvider>
      <AdminLayoutShell
        user={user}
        onLogout={handleLogout}
        products={products}
        newOrdersCount={inboxCounts.pedidos}
        newMessagesCount={inboxCounts.contacto + inboxCounts.reclamaciones}
      >
        {children}
      </AdminLayoutShell>
    </ToastProvider>
  );
}
