import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCategorias, getProductos } from '@/lib/data/supabase-data';
import { CatalogView } from '@/components/catalog/CatalogView';

export const revalidate = 60;

export default async function SubcategoriaPage({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { slug, sub } = await params;
  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos(),
  ]);

  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) notFound();

  const subcat = categoria.subcategorias.find((s) => s.slug === sub);
  if (!subcat) notFound();

  const productosSub = productos.filter(
    (p) => p.categoriaSlug === categoria.slug && p.subcategoriaSlug === subcat.slug
  );

  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold uppercase tracking-wider text-zinc-500">Cargando subcategoría...</div>}>
      <CatalogView
        initialTitle={`${categoria.nombre} - ${subcat.nombre}`}
        initialDescription={categoria.descripcion || `Modelos especializados en ${subcat.nombre} para pilotos y motociclistas.`}
        forcedCatSlug={categoria.slug}
        forcedSubSlug={subcat.slug}
        initialProductos={productosSub}
        initialCategorias={categorias}
      />
    </Suspense>
  );
}
