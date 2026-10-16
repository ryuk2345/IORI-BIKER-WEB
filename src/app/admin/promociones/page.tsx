'use client';

import React from 'react';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminPromosCoupons } from '@/components/admin/AdminPromosCoupons';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

export default function AdminPromocionesPage() {
  const { promos, coupons, settings, refreshAll, loadingData } = useAdminData();

  if (loadingData && promos.length === 0) {
    return <TableSkeleton rows={4} />;
  }

  return (
    <AdminPromosCoupons
      promos={promos}
      coupons={coupons}
      settings={settings}
      onRefresh={refreshAll}
    />
  );
}
