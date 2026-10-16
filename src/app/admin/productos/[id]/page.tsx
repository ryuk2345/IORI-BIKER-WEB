'use client';

import React, { use } from 'react';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminProductsView } from '@/components/admin/products/AdminProductsView';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

export default function AdminProductoEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = decodeURIComponent(resolvedParams.id);
  const { products, categories, brands, refreshAll, loadingData } = useAdminData();

  if (loadingData && products.length === 0) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <AdminProductsView
      products={products}
      categories={categories}
      brands={brands}
      onRefresh={refreshAll}
      initialMode="edit"
      initialProductId={id}
    />
  );
}
