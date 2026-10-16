import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CATEGORIAS } from '@/data/mock';
import { CatalogView } from '@/components/catalog/CatalogView';

export default async function SubcategoriaPage({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { slug, sub } = await params;
  const categoria = CATEGORIAS.find((c) => c.slug === slug);
  if (!categoria) notFound();

  const subcat = categoria.subcategorias.find((s) => s.slug === sub);
  if (!subcat) notFound();

  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Cargando subcategoría...</div>}>
      <CatalogView
        initialTitle={`${categoria.nombre} - ${subcat.nombre}`}
        initialDescription={`Modelos especializados en ${subcat.nombre} para pilotos y motociclistas.`}
        forcedCatSlug={categoria.slug}
        forcedSubSlug={subcat.slug}
      />
    </Suspense>
  );
}
