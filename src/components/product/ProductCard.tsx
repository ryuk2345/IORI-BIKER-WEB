'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Producto } from '@/types';
import { formatPEN } from '@/utils/currency';

interface ProductCardProps {
  producto: Producto;
  className?: string;
}

export function ProductCard({ producto, className = '' }: ProductCardProps) {
  const tieneSegundaImagen = producto.imagenes && producto.imagenes.length > 1;
  const imagenPrincipal = producto.imagenes?.[0] || '/images/products/prod_1.png';
  const imagenSecundaria = tieneSegundaImagen ? producto.imagenes[1] : null;

  // Cálculo del porcentaje de descuento
  const tieneOferta =
    (producto.precioOriginal && producto.precioOriginal > producto.precio) ||
    (producto.descuentoPorcentaje && producto.descuentoPorcentaje > 0);
  const porcentaje =
    producto.descuentoPorcentaje ||
    (producto.precioOriginal
      ? Math.round(((producto.precioOriginal - producto.precio) / producto.precioOriginal) * 100)
      : 0);

  // Regla: Máximo 1 badge (-%, Nuevo o Agotado)
  let badge: { texto: string; className: string } | null = null;
  if (producto.stock <= 0) {
    badge = { texto: 'AGOTADO', className: 'badge-out' };
  } else if (tieneOferta && porcentaje > 0) {
    badge = { texto: `-${porcentaje}%`, className: 'badge-offer' };
  } else if (producto.esNuevo) {
    badge = { texto: 'NUEVO', className: 'badge-new' };
  }

  return (
    <article className="h-full">
      <Link
        href={`/producto/${producto.slug}`}
        className={`group flex flex-col h-full bg-white border border-zinc-200 rounded-[4px] overflow-hidden hover:border-zinc-400 hover:shadow-md transition-all duration-200 ${className}`}
      >
        {/* 1. Foto SIEMPRE 1:1 sobre blanco */}
        <div className="relative aspect-square w-full bg-white flex items-center justify-center overflow-hidden">
          {/* Máximo 1 badge */}
          {badge && (
            <div className="absolute top-2 left-2 z-10">
              <span className={badge.className}>{badge.texto}</span>
            </div>
          )}

          {/* Primera foto */}
          <div
            className={`relative w-full h-full p-3 flex items-center justify-center ${
              tieneSegundaImagen
                ? 'group-hover:opacity-0 transition-opacity duration-300'
                : 'group-hover:scale-105 transition-transform duration-300'
            }`}
          >
            <Image
              src={imagenPrincipal}
              alt={producto.nombre}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2"
            />
          </div>

          {/* Segunda foto al hover si existe */}
          {tieneSegundaImagen && imagenSecundaria && (
            <div className="absolute inset-0 p-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="relative w-full h-full">
                <Image
                  src={imagenSecundaria}
                  alt={`${producto.nombre} - vista secundaria`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Información del producto sobre fondo blanco */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between border-t border-zinc-100 bg-white">
          <div>
            {/* Marca en gris */}
            <div className="text-12 font-medium uppercase tracking-wider text-zinc-500">
              {producto.marcaNombre || 'IORI'}
            </div>

            {/* Nombre en máximo 2 líneas */}
            <h3 className="mt-1 text-14 font-semibold text-zinc-900 line-clamp-2 leading-snug group-hover:text-brand transition-colors">
              {producto.nombre}
            </h3>
          </div>

          {/* Precios (tachado y actual) o aviso solo cotizar */}
          <div className="mt-3 pt-2 border-t border-zinc-100 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              {tieneOferta && producto.precioOriginal && (
                <del className="text-12 text-zinc-400 font-normal">
                  {formatPEN(producto.precioOriginal)}
                </del>
              )}
              <ins
                className={`no-underline text-16 sm:text-18 font-bold ${
                  tieneOferta ? 'text-[#F58220]' : 'text-zinc-950'
                }`}
              >
                {formatPEN(producto.precio)}
              </ins>
            </div>

            {producto.modoVenta === 'cotizar' && (
              <span className="text-12 font-heading uppercase font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-[2px] shrink-0 border border-zinc-200">
                Cotizar
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
