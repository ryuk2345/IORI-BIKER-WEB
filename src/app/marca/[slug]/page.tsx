import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getMarcas } from '@/lib/data/supabase-data';
import { MARCAS } from '@/data/mock';

export const revalidate = 60;

interface MarcaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MarcaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const marcas = await getMarcas();
  const marca = marcas.find((m) => m.slug === slug) || MARCAS.find((m) => m.slug === slug);

  if (!marca) {
    return {
      title: 'Marca no encontrada | Iori Biker Shop',
    };
  }

  const title = `${marca.nombre} Perú | Cascos y Accesorios Oficiales en Iori Biker Shop`;
  const description = `Catálogo oficial de productos, repuestos y accesorios de la marca ${marca.nombre} con garantía y envíos a todo el Perú.`;
  const canonicalUrl = `https://ioribikershop.pe/marca/${marca.slug}`;

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

export default async function MarcaPage({ params }: MarcaPageProps) {
  const { slug } = await params;
  const marcas = await getMarcas();
  const marca = marcas.find((m) => m.slug === slug) || MARCAS.find((m) => m.slug === slug);

  if (!marca) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold uppercase tracking-wider text-zinc-500">Cargando marca...</div>}>
      <CatalogView
        initialTitle={`Productos ${marca.nombre}`}
        initialDescription={`Catálogo oficial de productos, repuestos y accesorios de la marca ${marca.nombre} en Perú.`}
        forcedMarcaSlug={marca.slug}
      />
    </Suspense>
  );
}
