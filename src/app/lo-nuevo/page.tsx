import React, { Suspense } from 'react';
import { CatalogView } from '@/components/catalog/CatalogView';

export default function LoNuevoPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Cargando novedades...</div>}>
      <CatalogView
        initialTitle="Lo Nuevo en Iori"
        initialDescription="Los últimos ingresos en equipamiento para motociclistas: cascos homologados ECE 22.06, accesorios y tecnología 2026."
        isOnlyNew
      />
    </Suspense>
  );
}
