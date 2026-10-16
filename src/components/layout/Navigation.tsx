'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { CATEGORIAS, MARCAS } from '@/data/mock';

export function Navigation() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Asegurar las 8 categorías oficiales
  const listaCategorias = CATEGORIAS.slice(0, 8);

  return (
    <nav className="hidden lg:block w-full bg-[#111111] text-white border-b border-zinc-800 relative z-30">
      <div className="container-iori">
        <ul className="flex items-center justify-between text-12 font-heading font-bold uppercase tracking-wider">
          {/* Las 8 categorías oficiales de Iori Biker Shop */}
          {listaCategorias.map((cat) => {
            const isOpen = openDropdown === cat.slug;
            return (
              <li
                key={cat.id}
                className="relative"
                onMouseEnter={() => setOpenDropdown(cat.slug)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={`/categoria/${cat.slug}`}
                  className={`inline-flex items-center gap-1 py-2.5 px-2 transition-colors ${
                    isOpen ? 'text-[#F58220]' : 'text-zinc-200 hover:text-[#F58220]'
                  }`}
                >
                  <span>{cat.nombre}</span>
                  {cat.subcategorias && cat.subcategorias.length > 0 && (
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  )}
                </Link>

                {/* Desplegable simple con sus subcategorías (sin mega menú de columnas) */}
                {isOpen && cat.subcategorias && cat.subcategorias.length > 0 && (
                  <div className="absolute top-full left-0 min-w-[220px] bg-[#16161A] border border-zinc-800 rounded-[4px] shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 border-b border-zinc-800 mb-1">
                      <Link
                        href={`/categoria/${cat.slug}`}
                        onClick={() => setOpenDropdown(null)}
                        className="text-12 font-bold text-[#F58220] hover:underline flex items-center justify-between"
                      >
                        <span>Ver todo {cat.nombre}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <ul className="py-1">
                      {cat.subcategorias.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={`/categoria/${cat.slug}/${sub.slug}`}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-3 py-1.5 text-12 text-zinc-300 hover:text-white hover:bg-zinc-800/60 font-medium normal-case transition-colors"
                          >
                            {sub.nombre}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}

          {/* Marcas con su desplegable */}
          <li
            className="relative"
            onMouseEnter={() => setOpenDropdown('marcas')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link
              href="/marcas"
              className={`inline-flex items-center gap-1 py-2.5 px-2 transition-colors ${
                openDropdown === 'marcas' ? 'text-[#F58220]' : 'text-zinc-200 hover:text-[#F58220]'
              }`}
            >
              <span>Marcas</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </Link>

            {openDropdown === 'marcas' && (
              <div className="absolute top-full right-0 min-w-[240px] bg-[#16161A] border border-zinc-800 rounded-[4px] shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 border-b border-zinc-800 mb-1">
                  <Link
                    href="/marcas"
                    onClick={() => setOpenDropdown(null)}
                    className="text-12 font-bold text-[#F58220] hover:underline flex items-center justify-between"
                  >
                    <span>Ver todas las marcas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-x-1 px-1 py-1 max-h-[300px] overflow-y-auto">
                  {MARCAS.map((m) => (
                    <Link
                      key={m.id}
                      href={`/marca/${m.slug}`}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-2.5 py-1 text-12 text-zinc-300 hover:text-[#F58220] hover:bg-zinc-800/60 font-medium transition-colors"
                    >
                      {m.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
