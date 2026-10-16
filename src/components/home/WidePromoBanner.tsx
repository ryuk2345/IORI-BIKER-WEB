'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface WidePromoBannerProps {
  imagenDesktop?: string;
  imagenMobile?: string;
  titulo?: string;
  subtitulo?: string;
  enlace?: string;
  textoBoton?: string;
}

export function WidePromoBanner({
  imagenDesktop = '/images/banners/banner-ancho.jpg',
  imagenMobile = '/images/hero/hero-mobile-1.jpg',
  titulo = 'TEMPORADA DE CASCOS HOMOLOGADOS',
  subtitulo = 'Garantiza tu máxima protección con la nueva certificación ECE 22.06 disponible en nuestras 2 tiendas de Lima.',
  enlace = '/productos?cat=cascos-certificados',
  textoBoton = 'VER CATÁLOGO',
}: WidePromoBannerProps) {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={enlace}
          className="group block relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[300px] sm:min-h-[380px] rounded-3xl overflow-hidden shadow-lg border border-zinc-200"
        >
          {/* Imagen Desktop (21:9) */}
          <div className="hidden sm:block absolute inset-0">
            <Image
              src={imagenDesktop}
              alt={titulo}
              fill
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          </div>

          {/* Imagen Móvil (4:5) */}
          <div className="sm:hidden absolute inset-0">
            <Image
              src={imagenMobile}
              alt={titulo}
              fill
              sizes="100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          {/* Contenido */}
          <div className="absolute inset-0 flex items-end sm:items-center p-6 sm:p-12 lg:p-16">
            <div className="max-w-lg space-y-3">
              <span className="inline-block bg-[#f58220] text-black text-[10px] sm:text-xs font-black px-2.5 py-1 rounded tracking-wider uppercase font-[family-name:var(--font-heading)]">
                PROMOCIÓN ESPECIAL IORI
              </span>
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold uppercase text-white font-[family-name:var(--font-heading)] tracking-wider leading-tight">
                {titulo}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {subtitulo}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 bg-white text-black group-hover:bg-[#f58220] group-hover:text-black font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow transition-colors">
                  {textoBoton} &rarr;
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
