'use client';

import React from 'react';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminCategoriesBrands } from '@/components/admin/AdminCategoriesBrands';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

export default function AdminCatalogoPage() {
  const { categories, brands, refreshAll, loadingData } = useAdminData();

  if (loadingData && categories.length === 0 && brands.length === 0) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <AdminCategoriesBrands
      categories={categories}
      brands={brands}
      onRefresh={refreshAll}
    />
  );
}
