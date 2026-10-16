'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Producto } from '@/types';

export interface HotspotPoint {
  id: string;
  label: string;
  categorySlug: string;
  categoryName: string;
  x: number; // Porcentaje 0 - 100
  y: number; // Porcentaje 0 - 100
}

interface GearBuilderBlockProps {
  imagen?: string;
  puntos?: HotspotPoint[];
  productos?: Producto[];
}

const DEFAULT_PUNTOS: HotspotPoint[] = [
  {
    id: 'casco',
    label: 'Casco Certificado',
    categorySlug: 'cascos',
    categoryName: 'Cascos de Seguridad',
    x: 52,
    y: 18,
  },
  {
    id: 'casaca',
    label: 'Casaca con Protección CE',
    categorySlug: 'indumentaria',
    categoryName: 'Casacas y Protección',
    x: 74,
    y: 28,
  },
  {
    id: 'guantes',
    label: 'Guantes de Cuero Biker',
    categorySlug: 'guantes',
    categoryName: 'Guantes de Conducción',
    x: 62,
    y: 54,
  },
  {
    id: 'pantalon',
    label: 'Accesorios y Soporte',
    categorySlug: 'accesorios-moto',
    categoryName: 'Accesorios Esenciales',
    x: 52,
    y: 72,
  },
  {
    id: 'botas',
    label: 'Botas Antitorsión',
    categorySlug: 'indumentaria',
    categoryName: 'Calzado Especializado',
    x: 82,
    y: 82,
  },
];

export function GearBuilderBlock({
  imagen = '/images-v2/bloque-arma-tu-equipo.jpg',
  puntos = DEFAULT_PUNTOS,
  productos = [],
}: GearBuilderBlockProps) {
  const [selectedPointId, setSelectedPointId] = useState<string>(puntos[0]?.id || 'casco');

  // Ocultar si no hay puntos configurados o no hay productos cargados en la base de datos
  if (!puntos || puntos.length === 0 || !productos || productos.length === 0) {
    return null;
  }

  const activePoint = puntos.find((p) => p.id === selectedPointId) || puntos[0];

  // Filtrar hasta 3 productos de la categoría seleccionada
  const matchingProducts = productos
    .filter(
      (prod) =>
        prod.categoriaSlug === activePoint.categorySlug ||
        prod.categoriaNombre?.toLowerCase().includes(activePoint.categorySlug) ||
        prod.categoriaNombre?.toLowerCase().includes(activePoint.label.toLowerCase())
    )
    .slice(0, 3);

  return (
    <section className="relative w-full bg-[#111111] text-white py-16 sm:py-24 bg-grain overflow-hidden border-y border-zinc-800">
      {/* Separadores en diagonal decorativos sutiles */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      <div className="container-iori relative z-10">
        {/* Encabezado del bloque */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-12 font-heading font-bold text-brand uppercase tracking-widest mb-1.5">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <span>PROTECCIÓN DE PIES A CABEZA</span>
            </div>
            <h2 className="text-32 sm:text-40 lg:text-44 font-heading font-bold uppercase tracking-tight text-white leading-tight">
              ARMA TU EQUIPO COMPLETO
            </h2>
            <p className="text-14 sm:text-16 text-zinc-400 max-w-xl mt-1">
              Haz clic en cada punto del motociclista para ver las piezas recomendadas y asegurarte de rodar con homologación oficial.
            </p>
          </div>

          <Link
            href="/combos"
            className="btn-outline border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-500 shrink-0 self-start md:self-auto"
          >
            <span>Ver combos y packs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Contenido interactivo: Imagen con Hotspots a la izquierda + Tarjeta contextual a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 1. Contenedor interactivo de la imagen */}
          <div className="lg:col-span-7 relative aspect-[16/9] sm:aspect-[16/10] bg-zinc-950 rounded-[4px] overflow-hidden border border-zinc-800 shadow-2xl">
            <Image
              src={imagen}
              alt="Arma tu equipo Iori Biker"
              fill
              className="object-cover object-center opacity-90"
              sizes="(min-width: 1024px) 700px, 100vw"
            />
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />

            {/* Los 5 puntos interactivos */}
            {puntos.map((punto) => {
              const isSelected = punto.id === selectedPointId;

              return (
                <button
                  key={punto.id}
                  type="button"
                  onClick={() => setSelectedPointId(punto.id)}
                  style={{ top: `${punto.y}%`, left: `${punto.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-hidden z-20"
                  aria-label={`Ver equipamiento para ${punto.label}`}
                >
                  {/* Onda expansiva */}
                  <span
                    className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                      isSelected ? 'bg-brand' : 'bg-white/60'
                    }`}
                  />
                  {/* Punto central */}
                  <span
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shadow-lg ${
                      isSelected
                        ? 'bg-brand text-black border-white scale-110'
                        : 'bg-black/80 text-white border-brand hover:scale-105'
                    }`}
                  >
                    <span className="text-11 font-heading font-black">
                      {isSelected ? '✓' : '+'}
                    </span>
                  </span>

                  {/* Etiqueta tooltip flotante */}
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap bg-black/90 backdrop-blur-xs text-white text-[11px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-[2px] border border-zinc-700 pointer-events-none transition-all duration-200 ${
                      isSelected ? 'opacity-100 translate-y-0 text-brand' : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                  >
                    {punto.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2. Tarjeta de detalle de la pieza activa y productos asociados */}
          <div className="lg:col-span-5 bg-zinc-900/95 border border-zinc-800 rounded-[4px] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
                <div>
                  <span className="text-[11px] font-heading font-bold text-brand uppercase tracking-widest block">
                    PUNTO SELECCIONADO
                  </span>
                  <h3 className="text-24 font-heading font-bold uppercase tracking-tight text-white mt-0.5">
                    {activePoint.label}
                  </h3>
                </div>

                <Link
                  href={`/categoria/${activePoint.categorySlug}`}
                  className="text-12 font-heading uppercase tracking-wider text-brand hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <span>Ver categoría</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Botones selectores rápidos de piezas */}
              <div className="flex flex-wrap gap-2 mb-6">
                {puntos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPointId(p.id)}
                    className={`text-11 font-heading uppercase font-bold tracking-wider px-3 py-1.5 rounded-[2px] border transition-colors cursor-pointer ${
                      p.id === selectedPointId
                        ? 'bg-brand text-black border-brand'
                        : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Productos de la pieza seleccionada (hasta 3) */}
              <div className="space-y-3">
                <p className="text-12 uppercase font-heading tracking-wider text-zinc-400 font-bold">
                  Modelos destacados recomendados:
                </p>

                {matchingProducts.length > 0 ? (
                  matchingProducts.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/producto/${prod.slug}`}
                      className="group flex items-center gap-3 p-2.5 rounded-[2px] bg-black/60 border border-zinc-800 hover:border-brand/60 transition-colors"
                    >
                      <div className="relative w-14 h-14 bg-white rounded-[2px] overflow-hidden shrink-0">
                        <Image
                          src={prod.imagenes?.[0] || '/images/products/prod_1.png'}
                          alt={prod.nombre}
                          fill
                          className="object-contain p-1 group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-zinc-400 uppercase font-heading tracking-wider block truncate">
                          {prod.marcaNombre}
                        </span>
                        <h4 className="text-13 font-heading uppercase font-bold text-white group-hover:text-brand transition-colors truncate">
                          {prod.nombre}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-14 font-heading font-black text-brand">
                            S/ {prod.precio.toFixed(2)}
                          </span>
                          {prod.precioOriginal && (
                            <span className="text-11 text-zinc-500 line-through">
                              S/ {prod.precioOriginal.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-brand group-hover:translate-x-1 transition-all shrink-0 mr-1" />
                    </Link>
                  ))
                ) : (
                  <div className="p-4 bg-black/40 rounded-[2px] border border-dashed border-zinc-800 text-center text-zinc-500 text-12">
                    <p>Explora todos los modelos certificados en tienda física y web.</p>
                    <Link
                      href={`/categoria/${activePoint.categorySlug}`}
                      className="text-brand font-bold uppercase tracking-wider text-11 mt-2 inline-block hover:underline"
                    >
                      Explorar modelos disponibles →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 mt-6 flex items-center justify-between text-12 text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>Asesoría gratuita por WhatsApp</span>
              </span>
              <a
                href="https://wa.me/51905445698"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand font-bold uppercase font-heading tracking-wider hover:underline"
              >
                Consultar talla
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
