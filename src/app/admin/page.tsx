'use client';

import React from 'react';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminDashboardHome } from '@/components/admin/AdminDashboardHome';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

export default function AdminDashboardPage() {
  const {
    products,
    categories,
    brands,
    banners,
    settings,
    shipping,
    promos,
    coupons,
    teamMembers,
    invitedStaffCount,
    inboxCounts,
    loadingData,
  } = useAdminData();

  if (loadingData && products.length === 0 && brands.length === 0) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <AdminDashboardHome
      products={products}
      categories={categories}
      brands={brands}
      banners={banners}
      settings={settings}
      shipping={shipping}
      promos={promos}
      coupons={coupons}
      teamMembers={teamMembers}
      invitedStaffCount={invitedStaffCount}
      inboxCounts={inboxCounts}
    />
  );
}
