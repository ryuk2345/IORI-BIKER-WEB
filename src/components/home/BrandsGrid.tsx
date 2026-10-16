import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MARCAS } from '@/data/mock';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Marca } from '@/types';

interface BrandsGridProps {
  marcas?: Marca[];
}

export function BrandsGrid({ marcas = MARCAS }: BrandsGridProps) {
  const listaMarcas = marcas && marcas.length > 0 ? marcas : MARCAS;

  return (
    <section className="py-10 sm:py-16 bg-[#F5F5F5]">
      <div className="container-iori">
        <SectionHeader
          titulo="NUESTRAS MARCAS"
          bajada="Distribuidores oficiales de las marcas más reconocidas a nivel nacional e internacional."
          verTodoHref="/marcas"
          verTodoTexto="Ver todas las marcas"
        />

        {/* Grilla fija de 14 marcas con logos en gris que toman color al pasar el mouse */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
          {listaMarcas.map((marca) => (
            <Link
              key={marca.id}
              href={`/marca/${marca.slug}`}
              className="group flex flex-col items-center justify-center p-4 bg-white border border-zinc-200 rounded-[4px] hover:border-zinc-400 hover:shadow-md transition-all duration-200 aspect-[3/2]"
              title={`Ver productos de la marca ${marca.nombre}`}
            >
              {marca.logo ? (
                <div className="relative w-full h-10 flex items-center justify-center">
                  <Image
                    src={marca.logo}
                    alt={`Marca ${marca.nombre}`}
                    fill
                    sizes="120px"
                    className="object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              ) : (
                <div className="w-full h-10 flex items-center justify-center">
                  <span className="font-heading font-black text-15 sm:text-17 uppercase tracking-wider text-zinc-800 group-hover:text-[#F58220] transition-colors">
                    {marca.nombre}
                  </span>
                </div>
              )}
              {marca.logo && (
                <span className="mt-2 text-12 font-heading uppercase font-bold text-zinc-600 group-hover:text-zinc-950 transition-colors truncate">
                  {marca.nombre}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
