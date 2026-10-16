import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getProductos, getCategorias, getMarcas } from '@/lib/data/supabase-data';

export const revalidate = 10;

export const metadata: Metadata = {
  title: 'Catálogo de Cascos, Indumentaria y Accesorios | Iori Biker Shop Perú',
  description: 'Explora nuestro catálogo de cascos certificados DOT / ECE 22.06, guantes, casacas, intercomunicadores y repuestos con envíos a todo el Perú.',
  alternates: {
    canonical: 'https://ioribikershop.pe/productos',
  },
  openGraph: {
    title: 'Catálogo Oficial | Iori Biker Shop',
    description: 'Cascos certificados, accesorios e indumentaria motera de las mejores marcas.',
    url: 'https://ioribikershop.pe/productos',
    siteName: 'Iori Biker Shop',
    locale: 'es_PE',
    type: 'website',
  },
};

export default async function ProductosPage() {
  const [productos, categorias, marcas] = await Promise.all([
    getProductos(),
    getCategorias(),
    getMarcas(),
  ]);

  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold uppercase tracking-wider text-zinc-500">Cargando catálogo...</div>}>
      <CatalogView 
        initialProductos={productos} 
        initialCategorias={categorias} 
        initialMarcas={marcas} 
      />
    </Suspense>
  );
}
