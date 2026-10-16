'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Producto } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductCarouselProps {
  productos: Producto[];
  className?: string;
}

export function ProductCarousel({ productos, className = '' }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    // initial check asynchronously
    const timer = setTimeout(onSelect, 0);
    return () => {
      clearTimeout(timer);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!productos || productos.length === 0) return null;

  return (
    <div className={`relative group/carousel ${className}`}>
      {/* Contenedor del Carrusel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 py-1">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="flex-[0_0_50%] min-w-0 pl-4 md:flex-[0_0_25%]"
            >
              <ProductCard producto={producto} />
            </div>
          ))}
        </div>
      </div>

      {/* Flechas de navegación */}
      <div className="hidden sm:flex items-center gap-1.5 absolute -top-12 right-0">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          aria-label="Anterior"
          className="w-8 h-8 rounded-[4px] border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-zinc-800 transition-colors shadow-none cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          aria-label="Siguiente"
          className="w-8 h-8 rounded-[4px] border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-zinc-800 transition-colors shadow-none cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export const Carousel = ProductCarousel;
