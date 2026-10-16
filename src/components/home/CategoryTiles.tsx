'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { CATEGORIAS } from '@/data/mock';

export function CategoryTiles() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-zinc-50 border-t border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera con titular propio de Iori y controles */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand uppercase tracking-widest font-[family-name:var(--font-heading)]">
              SELECCIÓN IORI BIKER SHOP
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line mt-1">
              TODO LO QUE TU MOTO Y TU CUERPO NECESITAN EN UN SOLO LUGAR
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-normal">
              Explora las líneas principales de accesorios, cascos e indumentaria con garantía oficial y envíos a todo el Perú.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border border-zinc-300 bg-white hover:bg-black hover:text-white flex items-center justify-center transition shadow-sm cursor-pointer"
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border border-zinc-300 bg-white hover:bg-black hover:text-white flex items-center justify-center transition shadow-sm cursor-pointer"
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carrusel horizontal de Tiles por Categoría */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
        >
          {CATEGORIAS.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className="group shrink-0 w-[240px] sm:w-[280px] bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:border-brand shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                <Image
                  src={cat.imagen}
                  alt={cat.nombre}
                  fill
                  sizes="280px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <span className="absolute bottom-3 left-3 bg-brand text-black text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                  {cat.subcategorias.length} Subcategorías
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900 group-hover:text-brand transition-colors">
                    {cat.nombre}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                    {cat.descripcion || 'Accesorios y equipamiento seleccionado de alta durabilidad.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-700 group-hover:text-brand">
                  <span>Ver productos</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
