import React, { Suspense } from 'react';
import { CatalogView } from '@/components/catalog/CatalogView';

export const metadata = {
  title: 'Combos y Packs Moteros | Iori Biker Shop',
  description: 'Ahorra comprando en pack: combos de cascos dúo, kits de mantenimiento de cadena y packs de protección para motociclistas.',
};

export default function CombosPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Cargando combos...</div>}>
      <CatalogView
        initialTitle="Combos y Packs Moteros"
        initialDescription="Aprovecha nuestros packs con descuento especial: promociones dúo en cascos certificados, kits de limpieza integral y equipamiento para piloto."
        isOnlyCombos
      />
    </Suspense>
  );
}
