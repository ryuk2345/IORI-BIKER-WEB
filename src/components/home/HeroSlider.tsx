'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSlide } from '@/types';

interface HeroSliderProps {
  slides?: HeroSlide[];
}

export function HeroSlider({ slides = [] }: HeroSliderProps = {}) {
  const currentSlides = slides || [];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (currentSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlides.length]);

  if (currentSlides.length === 0) {
    return null;
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + currentSlides.length) % currentSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
  };

  return (
    <section className="relative w-full overflow-hidden bg-black select-none">
      {/* Contenedor con proporciones estrictas: 21:9 en desktop y 4:5 en móvil */}
      <div className="relative w-full aspect-[4/5] md:aspect-[21/9] min-h-[440px] md:min-h-[500px]">
        {currentSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            {/* Imagen Desktop (21:9) */}
            <div className="hidden md:block absolute inset-0">
              <Image
                src={slide.imagenDesktop}
                alt={slide.titulo || 'Banner Iori Biker Shop'}
                fill
                priority={idx === 0}
                className="object-cover object-center"
              />
              <div className={`absolute inset-0 ${slide.titulo ? 'bg-black/40' : 'bg-black/10'}`} />
            </div>

            {/* Imagen Móvil (4:5) con fallback a desktop centrado */}
            <div className="md:hidden absolute inset-0">
              <Image
                src={slide.imagenMobile || slide.imagenDesktop}
                alt={slide.titulo || 'Banner Iori Biker Shop'}
                fill
                priority={idx === 0}
                className="object-cover object-center"
              />
              <div className={`absolute inset-0 ${slide.titulo ? 'bg-black/45' : 'bg-black/10'}`} />
            </div>

            {/* Enlace de toda el área si no hay botón explícito */}
            {(!slide.titulo && !slide.textoBoton) && (
              <Link 
                href={slide.enlace} 
                className="absolute inset-0 z-20" 
                aria-label={slide.titulo || 'Ver promoción'}
              />
            )}

            {/* Contenido de texto superpuesto (opcional) */}
            {(slide.titulo || slide.subtitulo || slide.badge || slide.textoBoton) && (
              <div className="absolute inset-0 z-20 flex items-end md:items-center">
                <div className="container-iori w-full pb-8 md:pb-0">
                  <div className="max-w-xl space-y-3">
                    {slide.badge && (
                      <span className="badge-offer">
                        {slide.badge}
                      </span>
                    )}
                    {slide.titulo && (
                      <h1 className="text-32 md:text-40 font-heading font-bold text-white uppercase tracking-tight leading-tight">
                        {slide.titulo}
                      </h1>
                    )}
                    {slide.subtitulo && (
                      <p className="text-14 md:text-16 text-zinc-200 line-clamp-3 leading-relaxed">
                        {slide.subtitulo}
                      </p>
                    )}
                    {slide.textoBoton && (
                      <div className="pt-2">
                        <Link
                          href={slide.enlace}
                          className="btn-primary"
                        >
                          {slide.textoBoton}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Flechas de control con esquinas rectas <= 4px */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-between pointer-events-none">
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

        {/* Indicadores en barras planas estilo KTM PowerWear */}
        <div className="absolute bottom-4 inset-x-0 z-30 flex items-center justify-center gap-1.5">
          {currentSlides.map((_, idx) => (
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
      </div>
    </section>
  );
}
