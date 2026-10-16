'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import { CATEGORIAS, MARCAS, DATOS_NEGOCIO } from '@/data/mock';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [isMarcasExpanded, setIsMarcasExpanded] = useState(false);

  if (!isOpen) return null;

  const toggleCategory = (slug: string) => {
    setExpandedCat(expandedCat === slug ? null : slug);
  };

  const listaCategorias = CATEGORIAS.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-[#111111] text-white h-full flex flex-col shadow-2xl z-10 border-r border-zinc-800">
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#0B0B0C]">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <img
              src="/brand/iori-logo.png"
              alt="Iori Biker Shop"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enlace destacado: Ofertas */}
        <div className="p-3 border-b border-zinc-800 bg-[#16161A]">
          <Link
            href="/ofertas"
            onClick={onClose}
            className="flex items-center justify-between py-2 px-3 bg-[#F58220] hover:bg-[#E07216] text-[#111111] font-heading font-bold text-14 uppercase tracking-wider rounded-[4px] transition-colors"
          >
            <span>Ver Ofertas Activas</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Lista de Categorías con Acordeones */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-12 font-heading font-bold uppercase tracking-wider text-zinc-400">
            Categorías
          </div>

          {listaCategorias.map((cat) => {
            const isExpanded = expandedCat === cat.slug;
            const hasSubs = cat.subcategorias && cat.subcategorias.length > 0;

            return (
              <div key={cat.id} className="border-b border-zinc-800/60 pb-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/categoria/${cat.slug}`}
                    onClick={onClose}
                    className="flex-1 py-2 px-2 text-14 font-heading font-bold uppercase tracking-wide text-zinc-200 hover:text-[#F58220] transition-colors"
                  >
                    {cat.nombre}
                  </Link>

                  {hasSubs && (
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className="p-2 text-zinc-400 hover:text-white cursor-pointer"
                      aria-label={`Desplegar ${cat.nombre}`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#F58220]' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategorías en acordeón */}
                {isExpanded && hasSubs && (
                  <div className="pl-4 pr-2 pb-2 pt-1 space-y-1 bg-[#16161A] rounded-[2px] mt-0.5">
                    <Link
                      href={`/categoria/${cat.slug}`}
                      onClick={onClose}
                      className="block py-1 text-12 text-[#F58220] font-heading font-bold uppercase"
                    >
                      Ver todo en {cat.nombre} →
                    </Link>
                    {cat.subcategorias?.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categoria/${cat.slug}/${sub.slug}`}
                        onClick={onClose}
                        className="block py-1 text-12 text-zinc-300 hover:text-white transition-colors"
                      >
                        {sub.nombre}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Marcas Acordeón */}
          <div className="border-b border-zinc-800/60 pb-1 pt-1">
            <div className="flex items-center justify-between">
              <Link
                href="/marcas"
                onClick={onClose}
                className="flex-1 py-2 px-2 text-14 font-heading font-bold uppercase tracking-wide text-zinc-200 hover:text-[#F58220] transition-colors"
              >
                Marcas Oficiales
              </Link>
              <button
                type="button"
                onClick={() => setIsMarcasExpanded(!isMarcasExpanded)}
                className="p-2 text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Desplegar marcas"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMarcasExpanded ? 'rotate-180 text-[#F58220]' : ''
                  }`}
                />
              </button>
            </div>

            {isMarcasExpanded && (
              <div className="pl-4 pr-2 pb-2 pt-1 grid grid-cols-2 gap-1 bg-[#16161A] rounded-[2px] mt-0.5">
                {MARCAS.map((m) => (
                  <Link
                    key={m.id}
                    href={`/marca/${m.slug}`}
                    onClick={onClose}
                    className="block py-1 text-12 text-zinc-300 hover:text-[#F58220] transition-colors"
                  >
                    {m.nombre}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Enlaces de Ayuda y Cuenta */}
          <div className="pt-3 space-y-1">
            <Link
              href="/mi-cuenta"
              onClick={onClose}
              className="block py-2 px-2 text-12 text-zinc-300 hover:text-white uppercase font-heading font-bold"
            >
              Mi Cuenta
            </Link>
            <Link
              href="/financiamiento"
              onClick={onClose}
              className="block py-2 px-2 text-12 text-[#F58220] hover:underline uppercase font-heading font-bold"
            >
              Financiamiento aCuotaz
            </Link>
            <Link
              href="/contacto"
              onClick={onClose}
              className="block py-2 px-2 text-12 text-zinc-300 hover:text-white uppercase font-heading font-bold"
            >
              Nuestras 2 Tiendas en Lima
            </Link>
          </div>
        </div>

        {/* Footer del Drawer: WhatsApp oficial */}
        <div className="p-3 border-t border-zinc-800 bg-[#0B0B0C]">
          <a
            href={DATOS_NEGOCIO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-[4px] text-12 font-heading font-bold uppercase tracking-wider transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Asesoría por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
