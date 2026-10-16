'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPEN } from '@/utils/currency';

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  if (!isOpen) return null;

  const subtotal = getSubtotal();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Panel lateral offcanvas */}
      <div className="relative w-full max-w-md bg-[#16161a] text-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Cabecera del carrito estilo MakeMusic */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-[#121214]">
          <div>
            <h3 className="text-lg font-bold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line">
              Mi Carrito
            </h3>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-1.5 text-zinc-400 hover:text-white rounded-md transition"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Listado de items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-zinc-200">Tu carrito está vacío</h4>
                <p className="text-xs text-zinc-400">
                  Explora nuestros cascos certificados, guantes y accesorios para moto.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="btn-line btn-line--brand text-xs mt-2"
              >
                EMPEZAR A COMPRAR
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={`${item.producto.id}-${item.tallaSeleccionada}-${item.colorSeleccionado}-${idx}`}
                  className="flex gap-3 p-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition"
                >
                  {/* Imagen del producto en 1:1 sobre fondo blanco */}
                  <div className="w-20 h-20 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                    <Image
                      src={item.producto.imagenes[0]}
                      alt={item.producto.nombre}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  {/* Detalles */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-tight">
                        {item.producto.nombre}
                      </h4>
                      {(item.tallaSeleccionada || item.colorSeleccionado) && (
                        <div className="flex gap-2 text-[10px] text-zinc-400 mt-1">
                          {item.tallaSeleccionada && (
                            <span>Talla: <strong>{item.tallaSeleccionada}</strong></span>
                          )}
                          {item.colorSeleccionado && (
                            <span>Color: <strong>{item.colorSeleccionado}</strong></span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                      {/* Selector de cantidad */}
                      <div className="flex items-center border border-zinc-700 rounded-md overflow-hidden bg-zinc-800/80">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.producto.id,
                              item.cantidad - 1,
                              item.tallaSeleccionada,
                              item.colorSeleccionado
                            )
                          }
                          className="p-1 hover:bg-zinc-700 text-zinc-300 transition"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.producto.id,
                              item.cantidad + 1,
                              item.tallaSeleccionada,
                              item.colorSeleccionado
                            )
                          }
                          className="p-1 hover:bg-zinc-700 text-zinc-300 transition"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Precio y eliminar */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-500">
                          {formatPEN(item.producto.precio * item.cantidad)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.producto.id,
                              item.tallaSeleccionada,
                              item.colorSeleccionado
                            )
                          }
                          className="text-zinc-500 hover:text-red-400 transition"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer del Carrito */}
        {items.length > 0 && (
          <div className="p-5 border-t border-zinc-800 bg-[#121214] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Subtotal
              </span>
              <span className="text-lg font-black text-amber-500">
                {formatPEN(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              * El cálculo final de envío se realizará en el checkout para Lima o provincias.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/carrito"
                onClick={closeCart}
                className="w-full py-3 text-center border-2 border-zinc-700 hover:border-zinc-500 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-lg transition"
              >
                Ver Carrito
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3 text-center bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <span>Finalizar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
