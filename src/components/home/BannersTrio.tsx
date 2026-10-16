'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function BannersTrio() {
  return (
    <section className="py-12 sm:py-16 bg-[#f8f9fa] border-t border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Banner Ancho Superior (21:9 en desktop / 4:5 en móvil) */}
        <Link
          href="/productos?cat=accesorios-casco"
          className="group block relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[260px] sm:min-h-[340px] rounded-3xl overflow-hidden shadow-md border border-zinc-200"
        >
          {/* Imagen Desktop */}
          <div className="hidden sm:block absolute inset-0">
            <Image
              src="/images/banners/banner-ancho.jpg"
              alt="Intercomunicadores y Tecnología Biker"
              fill
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          </div>

          {/* Imagen Mobile */}
          <div className="sm:hidden absolute inset-0">
            <Image
              src="/images/hero/hero-mobile-2.jpg"
              alt="Intercomunicadores y Tecnología Biker"
              fill
              sizes="100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          <div className="absolute inset-0 flex items-end sm:items-center p-6 sm:p-12">
            <div className="max-w-lg space-y-2">
              <span className="inline-block bg-[#f58220] text-black text-[10px] font-black px-2.5 py-0.5 rounded tracking-wider uppercase font-[family-name:var(--font-heading)]">
                COMUNICACIÓN EN RUTA
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold uppercase text-white font-[family-name:var(--font-heading)] tracking-wider leading-tight">
                INTERCOMUNICADORES & ACCESORIOS DE CASCO
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Habla con tu copiloto y tu grupo de rodada con cancelación activa de ruido.
              </p>
              <div className="pt-2">
                <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 underline uppercase">
                  Ver intercomunicadores &rarr;
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Dos Banners Medianos lado a lado en proporción 3:2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner Mediano 1 */}
          <Link
            href="/productos?cat=seguridad-moto"
            className="group block relative w-full aspect-[3/2] rounded-3xl overflow-hidden shadow-md border border-zinc-200"
          >
            <Image
              src="https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?w=800&auto=format&fit=crop&q=80"
              alt="Seguridad y Candados con Alarma"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            <div className="absolute bottom-6 inset-x-6 space-y-1.5">
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                SEGURIDAD ANTI-ROBO
              </span>
              <h4 className="text-lg sm:text-2xl font-bold uppercase text-white font-[family-name:var(--font-heading)] tracking-wider">
                CANDADOS CON ALARMA 110dB
              </h4>
              <p className="text-xs text-zinc-300 line-clamp-2">
                Protege tu moto estacionada en la calle con sensores de impacto ultrasensibles.
              </p>
              <span className="inline-block text-xs font-bold text-amber-400 underline pt-1">
                Comprar seguridad &rarr;
              </span>
            </div>
          </Link>

          {/* Banner Mediano 2 */}
          <Link
            href="/productos?cat=mantenimiento-limpieza"
            className="group block relative w-full aspect-[3/2] rounded-3xl overflow-hidden shadow-md border border-zinc-200"
          >
            <Image
              src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80"
              alt="Mantenimiento y Lubricantes Motul"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            <div className="absolute bottom-6 inset-x-6 space-y-1.5">
              <span className="bg-[#f58220] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                CUIDADO DE TU MÁQUINA
              </span>
              <h4 className="text-lg sm:text-2xl font-bold uppercase text-white font-[family-name:var(--font-heading)] tracking-wider">
                LUBRICANTES & LIMPIEZA
              </h4>
              <p className="text-xs text-zinc-300 line-clamp-2">
                Kits de lubricación de cadena, desengrasantes y ceras protectoras para pintura.
              </p>
              <span className="inline-block text-xs font-bold text-amber-400 underline pt-1">
                Ver mantenimiento &rarr;
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
