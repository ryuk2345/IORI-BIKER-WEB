import React, { Suspense } from 'react';
import { CatalogView } from '@/components/catalog/CatalogView';

export default function OfertasPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Cargando ofertas...</div>}>
      <CatalogView
        initialTitle="Ofertas Especiales"
        initialDescription="Precios rebajados en cascos, intercomunicadores, guantes e indumentaria motera por tiempo limitado."
        isOnlyOffers
      />
    </Suspense>
  );
}
