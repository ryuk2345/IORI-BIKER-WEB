import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getCategorias } from '@/lib/data/supabase-data';
import { CATEGORIAS } from '@/data/mock';

export const revalidate = 60;

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoriaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug) || CATEGORIAS.find((c) => c.slug === slug);

  if (!categoria) {
    return {
      title: 'Categoría no encontrada | Iori Biker Shop',
    };
  }

  const title = `${categoria.nombre} para Moto | Catálogo Iori Biker Shop Perú`;
  const description = categoria.descripcion || `Encuentra los mejores productos y accesorios en ${categoria.nombre} con certificación y garantía en Perú.`;
  const canonicalUrl = `https://ioribikershop.pe/categoria/${categoria.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Iori Biker Shop',
      locale: 'es_PE',
    },
  };
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { slug } = await params;
  const categorias = await getCategorias();
  const categoria = categorias.find((c) => c.slug === slug) || CATEGORIAS.find((c) => c.slug === slug);

  if (!categoria) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold uppercase tracking-wider text-zinc-500">Cargando categoría...</div>}>
      <CatalogView
        initialTitle={categoria.nombre}
        initialDescription={categoria.descripcion || `Explora todos los productos disponibles en ${categoria.nombre}.`}
        forcedCatSlug={categoria.slug}
      />
    </Suspense>
  );
}
