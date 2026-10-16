'use client';

import React, { use } from 'react';
import { AdminOrdersManager } from '@/components/admin/AdminOrdersManager';

export default function AdminPedidoDetallePage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const resolvedParams = use(params);
  const codigo = decodeURIComponent(resolvedParams.codigo);

  return <AdminOrdersManager initialCodigo={codigo} />;
}
