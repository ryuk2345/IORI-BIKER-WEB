'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import { Categoria, Marca } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useTiendaSettings } from '@/context/TiendaSettingsContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [isMarcasExpanded, setIsMarcasExpanded] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  const { whatsapp } = useTiendaSettings();

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const [catsRes, subcatsRes, marcasRes] = await Promise.all([
          supabase.from('categorias').select('*').eq('activo', true).order('orden', { ascending: true }),
          supabase.from('subcategorias').select('*').order('orden', { ascending: true }),
          supabase.from('marcas').select('*').eq('activo', true).order('orden', { ascending: true }),
        ]);

        if (catsRes.data) {
          const subcats = subcatsRes.data || [];
          setCategorias(
            catsRes.data.map((cat: any) => ({
              id: cat.id,
              nombre: cat.nombre,
              slug: cat.slug,
              imagen: cat.imagen || '',
              subcategorias: subcats
                .filter((s: any) => s.categoria_id === cat.id)
                .map((s: any) => ({ id: s.id, nombre: s.nombre, slug: s.slug })),
            }))
          );
        }

        if (marcasRes.data) {
          setMarcas(
            marcasRes.data.map((m: any) => ({
              id: m.id,
              nombre: m.nombre,
              slug: m.slug,
            }))
          );
        }
      } catch (err) {
        console.error('Error al cargar datos en menú móvil:', err);
      }
    }

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (slug: string) => {
    setExpandedCat(expandedCat === slug ? null : slug);
  };

  const listaCategorias = categorias.slice(0, 8);

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
                <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-zinc-800/40">
                  <Link
                    href={`/categoria/${cat.slug}`}
                    onClick={onClose}
                    className="flex-1 text-14 font-heading font-bold uppercase tracking-wide text-zinc-100 hover:text-[#F58220] transition-colors"
                  >
                    {cat.nombre}
                  </Link>

                  {hasSubs && (
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className="p-1 text-zinc-400 hover:text-white"
                      aria-label={`Ver subcategorías de ${cat.nombre}`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#F58220]' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {isExpanded && hasSubs && (
                  <div className="pl-4 pr-2 pb-2 pt-1 space-y-1 bg-[#16161A] rounded-[2px] mt-0.5">
                    <Link
                      href={`/categoria/${cat.slug}`}
                      onClick={onClose}
                      className="block py-1 text-12 font-bold text-[#F58220] hover:underline"
                    >
                      Ver todo {cat.nombre} &rarr;
                    </Link>
                    {cat.subcategorias.map((sub) => (
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

          {/* Acordeón de Marcas */}
          <div className="border-b border-zinc-800/60 pb-1 pt-2">
            <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-zinc-800/40">
              <Link
                href="/marcas"
                onClick={onClose}
                className="flex-1 text-14 font-heading font-bold uppercase tracking-wide text-zinc-100 hover:text-[#F58220]"
              >
                Marcas Oficiales
              </Link>
              <button
                type="button"
                onClick={() => setIsMarcasExpanded(!isMarcasExpanded)}
                className="p-1 text-zinc-400 hover:text-white"
                aria-label="Ver todas las marcas"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMarcasExpanded ? 'rotate-180 text-[#F58220]' : ''
                  }`}
                />
              </button>
            </div>

            {isMarcasExpanded && marcas.length > 0 && (
              <div className="pl-4 pr-2 pb-2 pt-1 grid grid-cols-2 gap-1 bg-[#16161A] rounded-[2px] mt-0.5">
                {marcas.map((m) => (
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
              Nuestras Tiendas en Lima
            </Link>
          </div>
        </div>

        {/* Footer del Drawer: WhatsApp oficial desde Supabase */}
        <div className="p-3 border-t border-zinc-800 bg-[#0B0B0C]">
          <a
            href={whatsapp.url}
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
