'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, Flame, Tag } from 'lucide-react';
import { PRODUCTOS } from '@/data/mock';
import { ProductCard } from '@/components/product/ProductCard';

interface LimitedTimeDealsProps {
  showCountdown?: boolean; // Apagado por defecto según requerimiento de la regla
}

export function LimitedTimeDeals({ showCountdown = false }: LimitedTimeDealsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Contador regresivo (solo si showCountdown está activo)
  const [timeLeft, setTimeLeft] = useState({
    dias: 3,
    horas: 18,
    minutos: 45,
    segundos: 20,
  });

  useEffect(() => {
    if (!showCountdown) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.segundos > 0) {
          return { ...prev, segundos: prev.segundos - 1 };
        } else if (prev.minutos > 0) {
          return { ...prev, minutos: prev.minutos - 1, segundos: 59 };
        } else if (prev.horas > 0) {
          return { ...prev, horas: prev.horas - 1, minutos: 59, segundos: 59 };
        } else if (prev.dias > 0) {
          return { ...prev, dias: prev.dias - 1, horas: 23, minutos: 59, segundos: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown]);

  // Productos en promoción de temporada (ofertas, combos o novedades rebajadas)
  const deals = PRODUCTOS.filter((p) => p.esOferta || p.esCombo || (p.precioOriginal && p.precioOriginal > p.precio));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#f8f9fa] border-t border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera con título, bajada y estado de promoción */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-deal uppercase tracking-widest font-[family-name:var(--font-heading)] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> OPORTUNIDADES ACTIVAS
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line text-line--deal">
              PROMOCIONES DE TEMPORADA
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 font-normal">
              Precios rebajados y combos especiales en cascos, intercomunicadores e indumentaria motera para Lima y provincias.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 self-start lg:self-end">
            {/* Si showCountdown es true, se muestra el reloj. Por defecto está apagado según regla */}
            {showCountdown ? (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-xs">
                <Clock className="w-4 h-4 text-deal shrink-0" />
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 font-mono">
                  <span className="bg-zinc-100 px-1.5 py-0.5 rounded">{timeLeft.dias}d</span>:
                  <span className="bg-zinc-100 px-1.5 py-0.5 rounded">{timeLeft.horas}h</span>:
                  <span className="bg-zinc-100 px-1.5 py-0.5 rounded">{timeLeft.minutos}m</span>:
                  <span className="bg-zinc-100 px-1.5 py-0.5 rounded">{timeLeft.segundos}s</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shadow-xs text-xs font-bold text-zinc-700">
                <Tag className="w-3.5 h-3.5 text-brand" />
                <span>Campaña Oficial Octubre 2026</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full border border-zinc-300 bg-white hover:bg-black hover:text-white flex items-center justify-center transition shadow-sm cursor-pointer"
                aria-label="Desplazar ofertas a la izquierda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full border border-zinc-300 bg-white hover:bg-black hover:text-white flex items-center justify-center transition shadow-sm cursor-pointer"
                aria-label="Desplazar ofertas a la derecha"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carrusel de Productos en Promoción */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
        >
          {deals.map((prod) => (
            <div key={prod.id} className="shrink-0 w-[240px] sm:w-[280px]">
              <ProductCard producto={prod} />
            </div>
          ))}
        </div>

        {/* Enlace al listado de ofertas */}
        <div className="mt-8 text-center">
          <Link
            href="/ofertas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-brand text-white hover:text-black font-heading font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
          >
            Ver Todas las Ofertas y Promociones &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
