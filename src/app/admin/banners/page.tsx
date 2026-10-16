'use client';

import React from 'react';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminBannersView } from '@/components/admin/AdminBannersView';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

export default function AdminBannersPage() {
  const { banners, categories, products, promos, refreshAll, loadingData } = useAdminData();

  if (loadingData && banners.length === 0) {
    return <TableSkeleton rows={4} />;
  }

  return (
    <AdminBannersView
      banners={banners}
      categories={categories}
      products={products}
      promos={promos}
      onRefresh={refreshAll}
    />
  );
}
