import React, { Suspense } from 'react';
import { CatalogView } from '@/components/catalog/CatalogView';

export const metadata = {
  title: 'Outlet y Liquidación Motera | Iori Biker Shop',
  description: 'Últimas unidades y liquidación de temporada en cascas, cascos, protecciones y repuestos para moto a precios irrepetibles.',
};

export default function OutletPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Cargando liquidación outlet...</div>}>
      <CatalogView
        initialTitle="Outlet & Liquidación de Temporada"
        initialDescription="Precios de remate en últimas unidades, cambio de colección y accesorios seleccionados. Stock limitado hasta agotar existencias."
        isOnlyOutlet
      />
    </Suspense>
  );
}
