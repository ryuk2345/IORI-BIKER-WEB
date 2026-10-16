'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { PromoEspecial } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

interface PromoEspartaSectionProps {
  promo: PromoEspecial | null;
}

export function PromoEspartaSection({ promo }: PromoEspartaSectionProps) {
  const [timeLeft, setTimeLeft] = useState<{
    dias: number;
    horas: number;
    minutos: number;
    segundos: number;
  }>({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  useEffect(() => {
    // Fecha objetivo: 31 de Octubre de 2026 23:59:59 (hora de Lima UTC-5)
    const targetDate = new Date('2026-10-31T23:59:59-05:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
        return;
      }

      const dias = Math.floor(difference / (1000 * 60 * 60 * 24));
      const horas = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ dias, horas, minutos, segundos });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ocultar bloque si no hay promo activa
  if (!promo) {
    return null;
  }

  const productos = promo.productos || [];

  return (
    <section className="section-py bg-white border-t border-zinc-200">
      <div className="container-iori">
        {/* Banner destacado de la Promo */}
        <div className="relative rounded-[4px] overflow-hidden bg-zinc-950 border border-zinc-800 text-white mb-8 sm:mb-12">
          {/* Fondo con imagen grande y degradado de contraste */}
          <div className="absolute inset-0">
            <Image
              src={promo.bannerDesktop || '/images-v2/bloque-arma-tu-equipo.jpg'}
              alt={promo.titulo}
              fill
              className="object-cover object-center opacity-60"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="badge-offer inline-flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  CAMPAÑA OFICIAL
                </span>
                <span className="text-12 text-zinc-400 font-heading uppercase tracking-wider">
                  Hasta el 31 de Octubre de 2026
                </span>
              </div>

              <h2 className="text-32 sm:text-40 lg:text-48 font-heading font-bold uppercase tracking-tight text-white leading-[0.95]">
                {promo.titulo}
              </h2>

              <p className="text-14 sm:text-16 text-zinc-200 leading-relaxed">
                {promo.subtitulo || promo.descripcion}
              </p>

              <div className="pt-2">
                <Link
                  href={`/promo/${promo.slug}`}
                  className="btn-primary"
                >
                  <span>Ver promoción y combos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Contador regresivo hasta el 31/10 */}
            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-[4px] p-5 sm:p-6 shrink-0 w-full lg:w-auto">
              <div className="text-12 font-heading uppercase tracking-widest text-[#F58220] font-bold mb-3 text-center lg:text-left">
                Tiempo restante de la oferta
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-[2px] p-2.5 sm:p-3 min-w-[55px] sm:min-w-[65px]">
                  <span className="block text-24 sm:text-32 font-heading font-black text-white leading-none">
                    {String(timeLeft.dias).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase font-heading tracking-wider mt-1 block">
                    Días
                  </span>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 rounded-[2px] p-2.5 sm:p-3 min-w-[55px] sm:min-w-[65px]">
                  <span className="block text-24 sm:text-32 font-heading font-black text-white leading-none">
                    {String(timeLeft.horas).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase font-heading tracking-wider mt-1 block">
                    Horas
                  </span>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 rounded-[2px] p-2.5 sm:p-3 min-w-[55px] sm:min-w-[65px]">
                  <span className="block text-24 sm:text-32 font-heading font-black text-white leading-none">
                    {String(timeLeft.minutos).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase font-heading tracking-wider mt-1 block">
                    Min
                  </span>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 rounded-[2px] p-2.5 sm:p-3 min-w-[55px] sm:min-w-[65px]">
                  <span className="block text-24 sm:text-32 font-heading font-black text-brand leading-none">
                    {String(timeLeft.segundos).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase font-heading tracking-wider mt-1 block">
                    Seg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila de productos asociados (solo si hay al menos 4 productos) */}
        {productos.length >= 4 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {productos.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} producto={prod} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
