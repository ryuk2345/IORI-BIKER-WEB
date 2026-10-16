'use client';

import React from 'react';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { AdminContentManager } from '@/components/admin/AdminContentManager';

export default function AdminContenidoPage() {
  const { settings, refreshAll } = useAdminData();

  return (
    <AdminContentManager
      settings={settings}
      onRefresh={refreshAll}
    />
  );
}
