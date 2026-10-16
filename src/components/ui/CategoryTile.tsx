import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Categoria } from '@/types';

interface CategoryTileProps {
  categoria: Categoria;
  totalProductos?: number;
  className?: string;
}

export function CategoryTile({ categoria, totalProductos, className = '' }: CategoryTileProps) {
  const imagen = categoria.imagen || '/images/categories/cat_1.png';

  // Contador real de productos o subcategorías desde la base de datos (o nada si no hay)
  const contadorTexto = totalProductos !== undefined && totalProductos > 0
    ? `${totalProductos} productos`
    : categoria.subcategorias && categoria.subcategorias.length > 0
    ? `${categoria.subcategorias.length} subcategorías`
    : null;

  return (
    <Link
      href={`/categoria/${categoria.slug}`}
      className={`group relative flex flex-col justify-between aspect-[4/5] w-full rounded-[4px] overflow-hidden border border-zinc-200 bg-[#F5F5F5] hover:border-zinc-400 hover:shadow-lg transition-all duration-300 p-3.5 sm:p-4 ${className}`}
    >
      {/* 1. Imagen de categoría con proporción 4:5 y zoom suave al hover */}
      <div className="absolute inset-0 bg-white">
        <Image
          src={imagen}
          alt={categoria.nombre}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {/* Degradado inferior pronunciado para legibilidad garantizada del título */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
      </div>

      {/* 2. Badge de contador de productos en la esquina superior (solo si existe conteo real) */}
      <div className="relative z-10 flex items-center justify-between">
        {contadorTexto ? (
          <span className="inline-block bg-black/75 backdrop-blur-xs text-white text-[11px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] border border-white/10 group-hover:bg-[#F58220] group-hover:text-black transition-colors">
            {contadorTexto}
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* 3. Textos de categoría en mayúsculas condensadas estilo KTM */}
      <div className="relative z-10 text-white space-y-1">
        <h3 className="text-16 sm:text-20 font-heading uppercase font-bold tracking-tight text-white group-hover:text-[#F58220] transition-colors leading-tight drop-shadow-xs">
          {categoria.nombre}
        </h3>
        <span className="inline-flex items-center gap-1 text-12 font-heading uppercase tracking-wider text-zinc-300 group-hover:translate-x-1 transition-transform">
          <span>Explorar</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F58220]" />
        </span>
      </div>
    </Link>
  );
}
