'use client';

import React from 'react';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminProductsView } from '@/components/admin/products/AdminProductsView';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

export default function AdminProductosListPage() {
  const { products, categories, brands, refreshAll, loadingData } = useAdminData();

  if (loadingData && products.length === 0) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <AdminProductsView
      products={products}
      categories={categories}
      brands={brands}
      onRefresh={refreshAll}
      initialMode="list"
    />
  );
}
