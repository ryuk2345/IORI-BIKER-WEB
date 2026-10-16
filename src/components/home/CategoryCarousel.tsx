'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIAS } from '@/data/mock';

export function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera con título decorado text-line */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line">
              EXPLORA POR CATEGORÍAS
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border border-zinc-300 hover:border-black flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 transition active:scale-95"
              aria-label="Categorías anteriores"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border border-zinc-300 hover:border-black flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 transition active:scale-95"
              aria-label="Categorías siguientes"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carrusel de categorías en proporción 1:1 */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {CATEGORIAS.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className="group shrink-0 w-44 sm:w-56 md:w-64 snap-start flex flex-col items-center text-center"
            >
              {/* Contenedor 1:1 */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm group-hover:shadow-xl transition-all duration-300">
                <Image
                  src={cat.imagen}
                  alt={cat.nombre}
                  fill
                  sizes="(max-width: 640px) 176px, (max-width: 768px) 224px, 256px"
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-opacity" />

                <div className="absolute bottom-3 inset-x-3 text-center">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-[family-name:var(--font-heading)] leading-snug drop-shadow-md">
                    {cat.nombre}
                  </h3>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Ver productos &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
