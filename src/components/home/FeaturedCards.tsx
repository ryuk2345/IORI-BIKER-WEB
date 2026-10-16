'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DESTACADOS_HOME } from '@/data/mock';

export function FeaturedCards() {
  return (
    <section className="py-12 sm:py-16 bg-[#f8f9fa] border-t border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line">
            DESTACADOS
          </h2>
        </div>

        {/* 3 cards grandes en proporción 16:9 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DESTACADOS_HOME.map((card) => (
            <Link
              key={card.id}
              href={card.enlace}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-300 shadow-md hover:shadow-2xl transition-all duration-300"
            >
              {/* Imagen 16:9 */}
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={card.imagen}
                  alt={card.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Tag */}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#f58220] text-black text-[10px] sm:text-xs font-black px-2.5 py-1 rounded uppercase tracking-wider shadow">
                    {card.tag}
                  </span>
                </div>

                {/* Texto superpuesto */}
                <div className="absolute bottom-4 inset-x-4 space-y-1">
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide text-white font-[family-name:var(--font-heading)] group-hover:text-amber-400 transition-colors">
                    {card.titulo}
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {card.descripcion}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
