'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandBannerProps {
  marcaNombre?: string;
  tagline?: string;
  enlace?: string;
  imagenDesktop?: string;
  imagenMobile?: string;
}

export function BrandBanner({
  marcaNombre = 'SHAFT HELMETS',
  tagline = 'TECNOLOGÍA Y SEGURIDAD CERTIFICADA PARA CADA RUTA',
  enlace = '/marca/shaft',
  imagenDesktop = '/images/hero/hero-desktop-1.jpg',
  imagenMobile = '/images/hero/hero-mobile-2.jpg',
}: BrandBannerProps) {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={enlace}
          className="group block relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[280px] sm:min-h-[360px] rounded-3xl overflow-hidden shadow-lg border border-zinc-200"
        >
          {/* Imagen Desktop */}
          <div className="hidden sm:block absolute inset-0">
            <Image
              src={imagenDesktop}
              alt={marcaNombre}
              fill
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          </div>

          {/* Imagen Mobile */}
          <div className="sm:hidden absolute inset-0">
            <Image
              src={imagenMobile}
              alt={marcaNombre}
              fill
              sizes="100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>

          {/* Contenido superpuesto */}
          <div className="absolute inset-0 flex items-end sm:items-center p-6 sm:p-12 lg:p-16">
            <div className="max-w-md space-y-3">
              <span className="inline-block bg-white text-black text-[10px] sm:text-xs font-black px-2.5 py-1 rounded tracking-wider uppercase font-[family-name:var(--font-heading)]">
                MARCA OFICIAL DESTACADA
              </span>
              <h3 className="text-2xl sm:text-4xl font-black uppercase text-amber-500 font-[family-name:var(--font-heading)] tracking-wider leading-tight">
                {marcaNombre}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                {tagline}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow transition-colors">
                  EXPLORAR COLECCIÓN {marcaNombre} &rarr;
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
