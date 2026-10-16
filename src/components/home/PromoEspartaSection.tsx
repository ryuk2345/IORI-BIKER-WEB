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
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!promo?.fechaFin) {
      setIsExpired(true);
      return;
    }

    const targetDate = new Date(promo.fechaFin).getTime();
    if (isNaN(targetDate) || targetDate <= Date.now()) {
      setIsExpired(true);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsExpired(true);
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
  }, [promo?.fechaFin]);

  // Ocultar sección completamente si no hay promo activa o si ya expiró
  if (!promo || isExpired) {
    return null;
  }

  const productos = promo.productos || [];
  const fechaTexto = promo.fechaFin
    ? new Date(promo.fechaFin).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <section className="section-py bg-white border-t border-zinc-200">
      <div className="container-iori">
        {/* Banner destacado de la Promo */}
        <div className="relative rounded-[4px] overflow-hidden bg-zinc-950 border border-zinc-800 text-white mb-8 sm:mb-12">
          {/* Fondo con imagen grande y degradado de contraste */}
          <div className="absolute inset-0">
            {promo.bannerDesktop ? (
              <Image
                src={promo.bannerDesktop}
                alt={promo.titulo}
                fill
                className="object-cover object-center opacity-60"
                sizes="100vw"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 opacity-60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="badge-offer inline-flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  CAMPAÑA OFICIAL
                </span>
                {fechaTexto && (
                  <span className="text-12 text-zinc-400 font-heading uppercase tracking-wider">
                    Hasta el {fechaTexto}
                  </span>
                )}
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

            {/* Temporizador regresivo */}
            <div className="shrink-0 bg-black/85 backdrop-blur-md border border-zinc-800 p-5 sm:p-6 rounded-[4px] w-full lg:w-auto">
              <span className="text-11 font-heading uppercase tracking-widest text-[#F58220] block mb-3 font-bold text-center lg:text-left">
                TIEMPO RESTANTE
              </span>
              <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-zinc-900 border border-zinc-700 rounded-[2px] flex items-center justify-center">
                    <span className="text-22 sm:text-26 font-mono font-bold text-white">
                      {String(timeLeft.dias).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-10 font-heading uppercase text-zinc-400 mt-1 font-bold">DÍAS</span>
                </div>
                <span className="text-20 text-[#F58220] font-bold -mt-4">:</span>
                <div className="flex flex-col items-center">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-zinc-900 border border-zinc-700 rounded-[2px] flex items-center justify-center">
                    <span className="text-22 sm:text-26 font-mono font-bold text-white">
                      {String(timeLeft.horas).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-10 font-heading uppercase text-zinc-400 mt-1 font-bold">HORAS</span>
                </div>
                <span className="text-20 text-[#F58220] font-bold -mt-4">:</span>
                <div className="flex flex-col items-center">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-zinc-900 border border-zinc-700 rounded-[2px] flex items-center justify-center">
                    <span className="text-22 sm:text-26 font-mono font-bold text-white">
                      {String(timeLeft.minutos).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-10 font-heading uppercase text-zinc-400 mt-1 font-bold">MIN</span>
                </div>
                <span className="text-20 text-[#F58220] font-bold -mt-4">:</span>
                <div className="flex flex-col items-center">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-zinc-900 border border-zinc-700 rounded-[2px] flex items-center justify-center">
                    <span className="text-22 sm:text-26 font-mono font-bold text-[#F58220]">
                      {String(timeLeft.segundos).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-10 font-heading uppercase text-zinc-400 mt-1 font-bold">SEG</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila de productos de la promoción (solo si hay 4 o más productos) */}
        {productos.length >= 4 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {productos.slice(0, 4).map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
