'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Producto } from '@/types';
import { PRODUCTOS } from '@/data/mock';
import { ProductCard } from '@/components/product/ProductCard';

interface BestDealsCarouselProps {
  productos?: Producto[];
}

export function BestDealsCarousel({ productos }: BestDealsCarouselProps = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filtramos los productos que están en oferta
  const items = productos && productos.length > 0 ? productos : PRODUCTOS;
  const ofertas = items.filter((p) => p.esOferta);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera de la sección */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line">
              LAS MEJORES OFERTAS
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border border-zinc-300 hover:border-black flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 transition active:scale-95"
              aria-label="Ofertas anteriores"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border border-zinc-300 hover:border-black flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 transition active:scale-95"
              aria-label="Ofertas siguientes"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carrusel de ProductCard */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {ofertas.map((producto) => (
            <div
              key={producto.id}
              className="shrink-0 w-64 sm:w-72 snap-start"
            >
              <ProductCard producto={producto} />
            </div>
          ))}
        </div>

        {/* Botón inferior centrado como en MakeMusic */}
        <div className="mt-10 text-center">
          <Link href="/ofertas" className="btn-line">
            VER TODAS LAS OFERTAS
          </Link>
        </div>
      </div>
    </section>
  );
}
