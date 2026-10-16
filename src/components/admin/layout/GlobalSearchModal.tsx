'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Package, ArrowRight, X, Phone, Hash } from 'lucide-react';
import { formatPEN } from '@/utils/currency';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  onSelectProduct?: (product: any) => void;
  onSelectTab?: (tab: string) => void;
  onSelectOrder?: (codigo: string) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  products = [],
  onSelectProduct,
  onSelectTab,
  onSelectOrder,
}: GlobalSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setSearchTerm('');
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = searchTerm.trim().toLowerCase();

  // Búsqueda en productos
  const matchingProducts = q.length >= 2
    ? products
        .filter(
          (p) =>
            (p.nombre || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  // Búsqueda en códigos o celulares (ejemplo interactivo para pedidos)
  const isOrderQuery = q.startsWith('iori') || q.startsWith('#') || /^\d{5,9}$/.test(q);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-zinc-200 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Input de Búsqueda */}
        <div className="p-4 border-b border-zinc-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código de pedido, celular, nombre o SKU..."
            className="w-full text-14 text-zinc-900 placeholder:text-zinc-400 focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resultados */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          {q.length < 2 ? (
            <div className="py-8 text-center text-zinc-400 text-12">
              Escribe al menos 2 caracteres para buscar en pedidos y productos...
            </div>
          ) : (
            <>
              {/* Sección Pedidos */}
              {isOrderQuery && (
                <div className="space-y-1">
                  <div className="text-[11px] font-heading font-bold text-zinc-400 uppercase tracking-wider px-2">
                    Pedidos Coincidentes
                  </div>
                  <div
                    onClick={() => {
                      const orderCode = q.toUpperCase().startsWith('IORI') ? q.toUpperCase() : `IORI-${q}`;
                      if (onSelectOrder) {
                        onSelectOrder(orderCode);
                      } else if (onSelectTab) {
                        onSelectTab('pedidos');
                      }
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-50 border border-zinc-100 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F58220] flex items-center justify-center font-bold">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-13 text-zinc-900 block">
                          {q.toUpperCase().startsWith('IORI') ? q.toUpperCase() : `IORI-${q}`}
                        </span>
                        <span className="text-11 text-zinc-500">
                          Ver pedido en panel de administración
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              )}

              {/* Sección Productos */}
              <div className="space-y-1">
                <div className="text-[11px] font-heading font-bold text-zinc-400 uppercase tracking-wider px-2">
                  Productos ({matchingProducts.length})
                </div>

                {matchingProducts.length === 0 ? (
                  <p className="text-12 text-zinc-400 px-2 py-1">
                    No se encontraron productos con &quot;{searchTerm}&quot;.
                  </p>
                ) : (
                  matchingProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (onSelectProduct) onSelectProduct(p);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-orange-50/50 border border-zinc-100 cursor-pointer transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-white border border-zinc-200 p-1 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div>
                          <span className="font-bold text-13 text-zinc-900 group-hover:text-[#F58220] transition-colors block line-clamp-1">
                            {p.nombre}
                          </span>
                          <span className="font-mono text-11 text-zinc-500">
                            SKU: {p.sku} • {formatPEN(p.precio)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#F58220] transition-colors" />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer del buscador */}
        <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 px-4">
          <span>Presiona <kbd className="px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[10px]">ESC</kbd> para cerrar</span>
          <span>Búsqueda rápida unificada</span>
        </div>
      </div>
    </div>
  );
}
