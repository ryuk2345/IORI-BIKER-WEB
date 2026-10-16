'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { PRODUCTOS } from '@/data/mock';
import { formatPEN } from '@/utils/currency';
import { useCartStore } from '@/store/useCartStore';

export function ProtagonistProduct() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  // Seleccionamos 3 productos protagonistas
  const protagonistas = PRODUCTOS.slice(0, 3);
  const current = protagonistas[currentIndex];

  const prev = () => {
    setCurrentIndex((prevIdx) => (prevIdx - 1 + protagonistas.length) % protagonistas.length);
  };

  const next = () => {
    setCurrentIndex((prevIdx) => (prevIdx + 1) % protagonistas.length);
  };

  return (
    <section className="py-12 sm:py-20 bg-[#f4f5f7] border-y border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-zinc-200/80 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Lado Izquierdo: Información */}
            <div className="space-y-5">
              <div>
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest block mb-2 font-[family-name:var(--font-heading)]">
                  PRODUCTO PROTAGONISTA
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line leading-tight text-zinc-900">
                  {current.nombre}
                </h2>
              </div>

              <div className="inline-block bg-zinc-100 text-zinc-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-zinc-200">
                {current.categoriaNombre} &bull; {current.marcaNombre}
              </div>

              <p className="text-sm text-zinc-600 leading-relaxed">
                {current.descripcionLarga}
              </p>

              {/* Especificaciones destacadas */}
              {current.especificaciones && (
                <div className="grid grid-cols-2 gap-3 py-2 text-xs border-y border-zinc-100">
                  {Object.entries(current.especificaciones).slice(0, 2).map(([k, v]) => (
                    <div key={k}>
                      <span className="font-semibold text-zinc-400 block">{k}:</span>
                      <span className="font-bold text-zinc-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Precio y Acciones */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                <div>
                  <span className="text-[11px] text-zinc-400 font-semibold block uppercase">
                    Precio especial
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-zinc-900">
                      {formatPEN(current.precio)}
                    </span>
                    {current.precioOriginal && (
                      <del className="text-sm text-zinc-400 font-medium">
                        {formatPEN(current.precioOriginal)}
                      </del>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addItem(current, 1)}
                  className="bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>AGREGAR AL CARRITO</span>
                </button>

                <Link
                  href="/productos"
                  className="btn-line text-xs"
                >
                  VER TODOS LOS PRODUCTOS
                </Link>
              </div>
            </div>

            {/* Lado Derecho: Imagen grande 1:1 sobre fondo blanco limpio */}
            <div className="relative aspect-square w-full max-w-lg mx-auto bg-zinc-50 rounded-2xl border border-zinc-100 p-6 sm:p-10 flex items-center justify-center">
              {current.descuentoPorcentaje && (
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-[#e52e2e] text-white text-sm font-black px-3 py-1.5 rounded-lg shadow uppercase">
                    -{current.descuentoPorcentaje}% OFF
                  </span>
                </div>
              )}

              <Link
                href={`/producto/${current.slug}`}
                className="relative w-full h-full flex items-center justify-center group"
              >
                <Image
                  src={current.imagenes[0]}
                  alt={current.nombre}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
            </div>
          </div>

          {/* Controles de cambio de protagonista */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              className="w-10 h-10 rounded-full border border-zinc-200 hover:border-black bg-white flex items-center justify-center text-zinc-700 hover:text-black shadow-sm transition active:scale-95"
              aria-label="Producto anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="w-10 h-10 rounded-full border border-zinc-200 hover:border-black bg-white flex items-center justify-center text-zinc-700 hover:text-black shadow-sm transition active:scale-95"
              aria-label="Producto siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
