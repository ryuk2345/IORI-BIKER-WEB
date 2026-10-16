'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { CONSEJOS_BIKER } from '@/data/mock';

export function ConsejosBiker() {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand uppercase tracking-widest font-[family-name:var(--font-heading)] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> BLOG &amp; CONSEJOS BIKER
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line mt-1">
              CONSEJOS BIKER PARA EL DÍA A DÍA EN EL ASFALTO
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-normal">
              Aprende a cuidar tu equipamiento, alargar la vida útil de tus accesorios y rodar con máxima seguridad por Lima y rutas del Perú.
            </p>
          </div>
        </div>

        {/* Grilla de 3 Artículos de Consejos Biker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {CONSEJOS_BIKER.map((item) => (
            <article
              key={item.id}
              className="group bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 hover:border-brand shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                <Image
                  src={item.imagen}
                  alt={item.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <span className="absolute top-3 left-3 bg-brand text-black text-[10px] font-black uppercase px-2.5 py-1 rounded shadow">
                  {item.categoria}
                </span>
              </div>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>{item.fecha}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand" /> {item.lecturaMinutos} min de lectura
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-brand transition-colors leading-snug line-clamp-2">
                    {item.titulo}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 line-clamp-3 leading-relaxed">
                    {item.resumen}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-200/80 flex items-center justify-between text-xs font-bold text-brand uppercase tracking-wider">
                  <span>Leer consejo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
