'use client';

import React from 'react';
import Link from 'next/link';
import { PRODUCTOS } from '@/data/mock';
import { ProductCard } from '@/components/product/ProductCard';

export function BrandNewArrivals() {
  // Tomamos 4 productos destacados de la marca
  const shaftProducts = PRODUCTOS.slice(0, 4);

  return (
    <section className="py-12 sm:py-16 bg-[#f8f9fa] border-t border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line">
            LO NUEVO DE SHAFT
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-zinc-600">
            Descubre los últimos lanzamientos con certificación europea ECE 22.06 y diseños exclusivos.
          </p>
        </div>

        {/* Grilla de 4 productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shaftProducts.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>

        {/* Botón inferior */}
        <div className="mt-10 text-center">
          <Link href="/marca/shaft" className="btn-line">
            VER TODAS LAS NOVEDADES DE SHAFT
          </Link>
        </div>
      </div>
    </section>
  );
}
