'use client';

import React from 'react';
import Link from 'next/link';
import { Producto, Subcategoria } from '@/types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProductCarousel } from '@/components/ui/ProductCarousel';

interface CategoryRowSectionProps {
  titulo: string;
  bajada?: string;
  verTodoHref: string;
  verTodoTexto?: string;
  subcategorias?: Subcategoria[];
  categoriaSlug?: string;
  productos: Producto[];
  bgSubtle?: boolean;
}

export function CategoryRowSection({
  titulo,
  bajada,
  verTodoHref,
  verTodoTexto = 'Ver todo',
  subcategorias = [],
  categoriaSlug = '',
  productos = [],
  bgSubtle = false,
}: CategoryRowSectionProps) {
  // Regla oficial: Las filas de productos solo se muestran si tienen 4 productos o más
  if (!productos || productos.length < 4) return null;

  return (
    <section className={`section-py ${bgSubtle ? 'bg-[#F5F5F5]' : 'bg-white'}`}>
      <div className="container-iori">
        <SectionHeader
          titulo={titulo}
          bajada={bajada}
          verTodoHref={verTodoHref}
          verTodoTexto={verTodoTexto}
        />

        {/* Chips de subcategorías si existen */}
        {subcategorias.length > 0 && categoriaSlug && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
            {subcategorias.map((sub) => (
              <Link
                key={sub.id}
                href={`/categoria/${categoriaSlug}/${sub.slug}`}
                className="shrink-0 text-12 font-heading uppercase font-bold tracking-wider px-3 py-1.5 rounded-[2px] bg-white border border-zinc-300 text-zinc-700 hover:border-[#F58220] hover:text-[#F58220] transition-colors"
              >
                {sub.nombre}
              </Link>
            ))}
          </div>
        )}

        {/* Carrusel único: 4 productos en desktop y 2 en móvil */}
        <ProductCarousel productos={productos} />
      </div>
    </section>
  );
}
