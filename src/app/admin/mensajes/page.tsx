'use client';

import React from 'react';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminInboxes } from '@/components/admin/AdminInboxes';
import { TableSkeleton } from '@/components/admin/ui/Skeleton';

export default function AdminMensajesPage() {
  const { inboxCounts, refreshAll, loadingData } = useAdminData();

  if (loadingData && !inboxCounts) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <AdminInboxes
      counts={inboxCounts}
      onRefresh={refreshAll}
    />
  );
}
