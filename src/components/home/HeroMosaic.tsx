'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { HeroSlide } from '@/types';

export interface LateralPromo {
  id: string;
  titulo: string;
  subtitulo?: string;
  badge?: string;
  precioGancho?: string;
  imagenDesktop: string;
  imagenMobile?: string;
  enlace: string;
  textoBoton?: string;
}

interface HeroMosaicProps {
  slides?: HeroSlide[];
  lateralPromos?: LateralPromo[];
  isAdmin?: boolean;
}

export function HeroMosaic({
  slides = [],
  lateralPromos = [],
  isAdmin = false,
}: HeroMosaicProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0 && lateralPromos.length === 0) {
    return null;
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const lateralList = lateralPromos.slice(0, 2);

  return (
    <section className="w-full bg-[#111111] py-4 md:py-6">
      <div className="container-iori">
        {/* Contenedor oficial de 1280 px, máximo 520 px de alto en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-4 lg:h-[520px]">
          {/* ========================================================= */}
          {/* 1. SLIDER PRINCIPAL A 2/3 DEL ANCHO (16:9 desktop, 4:5 móvil) */}
          {/* ========================================================= */}
          <div className="lg:col-span-2 relative h-[420px] sm:h-[460px] lg:h-[520px] rounded-[4px] overflow-hidden bg-black select-none border border-zinc-800">
            {slides.length > 0 ? (
              slides.map((slide, idx) => {
                const isActive = idx === currentSlide;
                const showMissingMobileWarning = isAdmin && !slide.imagenMobile;

                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                    }`}
                  >
                    {/* Imagen Desktop (16:9) */}
                    <div className="hidden md:block absolute inset-0">
                      <Image
                        src={slide.imagenDesktop}
                        alt={slide.titulo || 'Banner Iori Biker Shop'}
                        fill
                        priority={idx === 0}
                        className="object-cover object-center"
                        sizes="(min-width: 1024px) 850px, 100vw"
                      />
                      {/* Degradado oscuro solo del lado del texto (izquierda a derecha) */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                    </div>

                    {/* Imagen Móvil (4:5) con fallback centrado */}
                    <div className="md:hidden absolute inset-0">
                      <Image
                        src={slide.imagenMobile || slide.imagenDesktop}
                        alt={slide.titulo || 'Banner Iori Biker Shop'}
                        fill
                        priority={idx === 0}
                        className="object-cover object-center"
                        sizes="100vw"
                      />
                      {/* Degradado móvil inferior/lateral */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
                    </div>

                    {/* Aviso visible solo para administradores si falta versión móvil */}
                    {showMissingMobileWarning && (
                      <div className="absolute top-3 left-3 z-30 bg-amber-500/90 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] shadow-sm">
                        Falta versión móvil (4:5)
                      </div>
                    )}

                    {/* Enlace general si no hay textos */}
                    {!slide.titulo && !slide.textoBoton && (
                      <Link
                        href={slide.enlace || '/productos'}
                        className="absolute inset-0 z-20"
                        aria-label={slide.titulo || 'Ver promoción'}
                      />
                    )}

                    {/* Contenido de texto superpuesto */}
                    {(slide.titulo || slide.subtitulo || slide.badge || slide.textoBoton) && (
                      <div className="absolute inset-0 z-20 flex items-end md:items-center">
                        <div className="w-full px-5 pb-8 sm:pb-10 md:pb-0 md:px-10">
                          <div className="max-w-xl space-y-3.5">
                            {/* Etiqueta / Badge */}
                            {slide.badge && (
                              <div className="inline-block">
                                <span className="badge-offer">
                                  {slide.badge}
                                </span>
                              </div>
                            )}

                            {/* Título de 56 a 64 px en desktop y 36 px en móvil */}
                            {slide.titulo && (
                              <h1 className="text-36 sm:text-48 lg:text-[58px] font-heading font-bold text-white uppercase tracking-tight leading-[0.92]">
                                {slide.titulo}
                              </h1>
                            )}

                            {/* Bajada */}
                            {slide.subtitulo && (
                              <p className="text-14 sm:text-16 text-zinc-200 line-clamp-2 max-w-lg leading-relaxed">
                                {slide.subtitulo}
                              </p>
                            )}

                            {/* Fila de acción: Botón principal y Precio gancho opcional */}
                            <div className="pt-2 flex flex-wrap items-center gap-3">
                              {slide.textoBoton && (
                                <Link
                                  href={slide.enlace || '/productos'}
                                  className="btn-primary"
                                >
                                  {slide.textoBoton}
                                </Link>
                              )}

                              {slide.precioGancho && (
                                <span className="inline-flex items-center text-14 sm:text-16 font-heading font-bold text-white bg-black/60 border border-brand/50 px-3 py-1.5 rounded-[2px] uppercase tracking-wider">
                                  <span className="text-brand mr-1">Desde</span> {slide.precioGancho}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
                <p className="text-14 font-heading uppercase tracking-wider">
                  {isAdmin ? 'Falta imagen: No hay slides activos para el Hero Slider' : 'Cargando novedades...'}
                </p>
              </div>
            )}

            {/* Flechas de navegación */}
            {slides.length > 1 && (
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-[4px] bg-black/70 hover:bg-[#F58220] hover:text-[#111111] text-white flex items-center justify-center border border-white/20 pointer-events-auto transition-colors cursor-pointer"
                  aria-label="Diapositiva anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-[4px] bg-black/70 hover:bg-[#F58220] hover:text-[#111111] text-white flex items-center justify-center border border-white/20 pointer-events-auto transition-colors cursor-pointer"
                  aria-label="Diapositiva siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Barras de paginación plana */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 z-30 flex items-center justify-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1 rounded-[2px] transition-all duration-300 cursor-pointer ${
                      idx === currentSlide
                        ? 'w-8 bg-[#F58220]'
                        : 'w-5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Ir al slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 2. DOS PROMOS FIJAS APILADAS A 1/3 (16:9 en desktop y fila en móvil) */}
          {/* ========================================================= */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4 lg:h-[520px]">
            {lateralList.map((promo, idx) => (
              <Link
                key={promo.id || idx}
                href={promo.enlace || '/productos'}
                className="group relative flex-1 min-h-[170px] sm:min-h-[200px] lg:h-full rounded-[4px] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-brand/60 transition-all duration-300 flex flex-col justify-end p-4 sm:p-5"
              >
                {/* Imagen de fondo con zoom suave */}
                <div className="absolute inset-0">
                  <Image
                    src={promo.imagenDesktop}
                    alt={promo.titulo || 'Promo Iori Biker'}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 1024px) 420px, 50vw"
                  />
                  {/* Degradado oscuro solo del lado del texto */}
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                </div>

                {/* Contenido de la promo lateral */}
                <div className="relative z-10 space-y-1.5 text-white">
                  {promo.badge && (
                    <span className="inline-block bg-[#F58220] text-black text-[10px] sm:text-12 font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded-[2px]">
                      {promo.badge}
                    </span>
                  )}

                  <h3 className="text-16 sm:text-20 font-heading uppercase font-bold tracking-tight text-white group-hover:text-brand transition-colors leading-tight">
                    {promo.titulo}
                  </h3>

                  {promo.subtitulo && (
                    <p className="text-12 text-zinc-300 line-clamp-1 hidden sm:block">
                      {promo.subtitulo}
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-12 font-heading uppercase tracking-wider text-brand font-bold group-hover:translate-x-1 transition-transform">
                      <span>{promo.textoBoton || 'Ver oferta'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    {promo.precioGancho && (
                      <span className="text-12 font-bold text-zinc-200">
                        {promo.precioGancho}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {/* Fallback si no hay promos laterales cargadas */}
            {lateralList.length === 0 && (
              <div className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center p-6 bg-zinc-900/60 rounded-[4px] border border-dashed border-zinc-800 text-center text-zinc-500 h-full">
                <p className="text-12 font-heading uppercase tracking-wider">
                  {isAdmin ? 'Falta imagen: Configura banners con ubicación "Hero lateral"' : 'Promociones exclusivas'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
