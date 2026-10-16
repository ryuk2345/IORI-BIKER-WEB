'use client';

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminSettingsShipping } from '@/components/admin/AdminSettingsShipping';
import { ADMIN_SECCIONES_AJUSTES, AdminAjustesSeccion } from '@/lib/routes/admin-routes';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

export default function AdminAjustesSeccionPage({
  params,
}: {
  params: Promise<{ seccion: string }>;
}) {
  const resolvedParams = use(params);
  const seccion = resolvedParams.seccion as AdminAjustesSeccion;

  if (!ADMIN_SECCIONES_AJUSTES.includes(seccion)) {
    notFound();
  }

  const { settings, shipping, teamMembers, refreshAll, loadingData } = useAdminData();

  if (loadingData && Object.keys(settings).length === 0) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <AdminSettingsShipping
      settings={settings}
      shipping={shipping}
      teamMembers={teamMembers}
      initialSection={seccion}
      onRefresh={refreshAll}
    />
  );
}
