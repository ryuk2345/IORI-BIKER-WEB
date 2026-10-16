'use client';

import React from 'react';
import Link from 'next/link';
import { MARCAS } from '@/data/mock';

export function BrandsInfiniteCarousel() {
  // Duplicamos las marcas para lograr un efecto continuo infinito
  const marcasList = [...MARCAS, ...MARCAS];

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-zinc-200 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line">
            NUESTRAS MARCAS
          </h2>
        </div>

        {/* Cinta continua de marcas */}
        <div className="relative w-full overflow-hidden">
          <div className="flex items-center gap-6 animate-marquee hover:[animation-play-state:paused]">
            {marcasList.map((marca, idx) => (
              <Link
                key={`${marca.id}-${idx}`}
                href={`/marca/${marca.slug}`}
                className="shrink-0 w-36 sm:w-44 h-20 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-xl flex items-center justify-center p-4 transition-all duration-300 hover:scale-105 hover:shadow-md group"
              >
                <span className="font-extrabold text-sm sm:text-base text-zinc-700 group-hover:text-black tracking-wider uppercase font-[family-name:var(--font-heading)]">
                  {marca.nombre}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
