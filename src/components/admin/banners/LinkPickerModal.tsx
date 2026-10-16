'use client';

import React, { useState } from 'react';
import { Search, X, Tag, Package, Sparkles, Folder, Check, ArrowRight } from 'lucide-react';

interface LinkPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLink: (link: string, defaultTitle?: string) => void;
  categories?: any[];
  products?: any[];
  promos?: any[];
}

export function LinkPickerModal({
  isOpen,
  onClose,
  onSelectLink,
  categories = [],
  products = [],
  promos = [],
}: LinkPickerModalProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'promos' | 'categorias' | 'productos'>('promos');

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Enlaces de promociones y páginas clave fijas
  const defaultPromos = [
    { title: 'Promo Esparta (Dúo de Cascos)', url: '/promo/esparta', badge: 'CAMPAÑA OFICIAL' },
    { title: 'Zona de Ofertas y Liquidación', url: '/ofertas', badge: 'HASTA -40%' },
    { title: 'Combos y Packs Biker', url: '/combos', badge: 'PACKS' },
    { title: 'Nuevos Ingresos', url: '/lo-nuevo', badge: 'LO NUEVO' },
    { title: 'Outlet y Saldos', url: '/outlet', badge: 'OUTLET' },
    { title: 'Planes de Financiamiento aCuotaz', url: '/financiamiento', badge: 'CUOTAS SIN TARJETA' },
  ];

  const filteredPromos = defaultPromos.filter(
    (p) => p.title.toLowerCase().includes(q) || p.url.includes(q)
  );

  const filteredCategories = categories.filter((c) =>
    (c.nombre || '').toLowerCase().includes(q) || (c.slug || '').includes(q)
  );

  const filteredProducts = q.length >= 2
    ? products
        .filter((p) => (p.nombre || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q))
        .slice(0, 10)
    : products.slice(0, 8);

  const handleSelect = (url: string, title?: string) => {
    onSelectLink(url, title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="font-heading font-black text-base uppercase tracking-wider text-zinc-900">
              Seleccionar Destino del Banner
            </h3>
            <p className="text-xs text-zinc-500">
              Elige una campaña, categoría o producto sin escribir URLs manualmente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buscador */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar destino..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white"
            autoFocus
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-2.5 top-3" />
        </div>

        {/* Pestañas de tipos de destino */}
        <div className="flex border-b border-zinc-200 text-xs font-heading font-bold uppercase">
          <button
            type="button"
            onClick={() => setActiveTab('promos')}
            className={`px-4 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'promos'
                ? 'border-[#f58220] text-[#f58220]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Promos y Páginas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categorias')}
            className={`px-4 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'categorias'
                ? 'border-[#f58220] text-[#f58220]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Categorías ({categories.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('productos')}
            className={`px-4 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'productos'
                ? 'border-[#f58220] text-[#f58220]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Productos</span>
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {activeTab === 'promos' && (
            <div className="space-y-1.5">
              {filteredPromos.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => handleSelect(p.url, p.title)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-[#f58220] hover:bg-orange-50/40 text-left transition cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-zinc-900 group-hover:text-[#f58220]">
                        {p.title}
                      </span>
                      <span className="text-[9px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-bold uppercase">
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 block">{p.url}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#f58220]" />
                </button>
              ))}
            </div>
          )}

          {activeTab === 'categorias' && (
            <div className="space-y-1.5">
              {filteredCategories.map((c) => (
                <button
                  key={c.id || c.slug}
                  type="button"
                  onClick={() => handleSelect(`/categoria/${c.slug}`, c.nombre)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-[#f58220] hover:bg-orange-50/40 text-left transition cursor-pointer group"
                >
                  <div>
                    <span className="text-xs font-black text-zinc-900 group-hover:text-[#f58220] block">
                      {c.nombre}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 block">
                      /categoria/{c.slug}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#f58220]" />
                </button>
              ))}
            </div>
          )}

          {activeTab === 'productos' && (
            <div className="space-y-1.5">
              {filteredProducts.map((p) => (
                <button
                  key={p.id || p.sku}
                  type="button"
                  onClick={() => handleSelect(`/producto/${p.slug}`, p.nombre)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-[#f58220] hover:bg-orange-50/40 text-left transition cursor-pointer group"
                >
                  <div className="pr-2">
                    <span className="text-xs font-black text-zinc-900 group-hover:text-[#f58220] block line-clamp-1">
                      {p.nombre}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 block">
                      SKU: {p.sku} • /producto/{p.slug}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-[#f58220]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
