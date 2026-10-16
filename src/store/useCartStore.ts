'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ItemCarrito, Producto } from '@/types';

export interface CuponActivo {
  codigo: string;
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number;
  descuento: number;
  minimo_compra?: number;
}

interface CartState {
  items: ItemCarrito[];
  cupon: CuponActivo | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (producto: Producto, cantidad?: number, talla?: string, color?: string) => boolean;
  removeItem: (idOrProductoId: string, talla?: string, color?: string) => void;
  updateQuantity: (idOrProductoId: string, cantidad: number, talla?: string, color?: string) => void;
  clearCart: () => void;
  setCupon: (cupon: CuponActivo | null) => void;
  getTotalCount: () => number;
  getSubtotal: () => number;
  getDescuento: () => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cupon: null,
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (producto, cantidad = 1, talla, color) => {
        // Regla: Los productos "solo cotizar" no entran al carrito
        if (
          (producto as any).modo_venta === 'solo_cotizar' || 
          (producto as any).solo_cotizar === true
        ) {
          return false;
        }

        set((state) => {
          const itemId = `${producto.id}-${talla || 'unica'}-${color || 'standard'}`;
          const index = state.items.findIndex(
            (i) => i.id === itemId || (i.producto.id === producto.id && i.tallaSeleccionada === talla && i.colorSeleccionado === color)
          );

          if (index > -1) {
            const nextItems = [...state.items];
            nextItems[index] = {
              ...nextItems[index],
              cantidad: nextItems[index].cantidad + cantidad,
            };
            return { items: nextItems, isOpen: true };
          }

          return {
            items: [
              ...state.items,
              {
                id: itemId,
                producto,
                cantidad,
                tallaSeleccionada: talla,
                colorSeleccionado: color,
              },
            ],
            isOpen: true,
          };
        });

        return true;
      },

      removeItem: (idOrProductoId, talla, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              i.id !== idOrProductoId &&
              !(
                i.producto.id === idOrProductoId &&
                i.tallaSeleccionada === talla &&
                i.colorSeleccionado === color
              )
          ),
        }));
      },

      updateQuantity: (idOrProductoId, cantidad, talla, color) => {
        if (cantidad <= 0) {
          get().removeItem(idOrProductoId, talla, color);
          return;
        }

        set((state) => ({
          items: state.items.map((i) => {
            if (
              i.id === idOrProductoId ||
              (
                i.producto.id === idOrProductoId &&
                i.tallaSeleccionada === talla &&
                i.colorSeleccionado === color
              )
            ) {
              return { ...i, cantidad };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [], cupon: null }),

      setCupon: (cupon) => set({ cupon }),

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.producto.precio_oferta || item.producto.precio) * item.cantidad, 0);
      },

      getDescuento: () => {
        const subtotal = get().getSubtotal();
        const cupon = get().cupon;
        if (!cupon) return 0;

        if (cupon.tipo === 'porcentaje') {
          return Math.round(((subtotal * cupon.valor) / 100) * 100) / 100;
        } else {
          return Math.min(subtotal, cupon.valor);
        }
      },

      getTotalItems: () => {
        return get().getTotalCount();
      },

      getTotalPrice: () => {
        const subtotal = get().getSubtotal();
        const descuento = get().getDescuento();
        return Math.max(0, subtotal - descuento);
      },
    }),
    {
      name: 'iori-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cupon: state.cupon }),
    }
  )
);

