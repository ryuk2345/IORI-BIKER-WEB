'use client';

import React from 'react';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminProductsView } from '@/components/admin/products/AdminProductsView';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

export default function AdminProductoNuevoPage() {
  const { products, categories, brands, refreshAll, loadingData } = useAdminData();

  if (loadingData && categories.length === 0) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <AdminProductsView
      products={products}
      categories={categories}
      brands={brands}
      onRefresh={refreshAll}
      initialMode="create"
    />
  );
}
