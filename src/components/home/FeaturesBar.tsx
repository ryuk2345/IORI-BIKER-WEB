'use client';

import React from 'react';
import { Truck, Store, CreditCard, MessageCircle } from 'lucide-react';

export function FeaturesBar() {
  const beneficios = [
    {
      icono: <Truck className="w-4 h-4 text-[#f58220] shrink-0" strokeWidth={2} />,
      texto: 'Envíos a todo el Perú',
    },
    {
      icono: <Store className="w-4 h-4 text-[#f58220] shrink-0" strokeWidth={2} />,
      texto: 'Recojo en 2 tiendas',
    },
    {
      icono: <CreditCard className="w-4 h-4 text-[#f58220] shrink-0" strokeWidth={2} />,
      texto: 'Yape, Plin o transferencia',
    },
    {
      icono: <MessageCircle className="w-4 h-4 text-[#f58220] shrink-0" strokeWidth={2} />,
      texto: 'Atención por WhatsApp',
    },
  ];

  return (
    <section className="w-full bg-white border-y border-zinc-200 text-zinc-900 py-3.5 shadow-xs">
      <div className="container-iori">
        {/* En una sola línea en desktop, scroll suave en móvil */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar sm:justify-around text-12 font-heading uppercase font-bold tracking-wider text-zinc-900">
          {beneficios.map((b, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2.5 shrink-0">
                {b.icono}
                <span className="text-zinc-800">{b.texto}</span>
              </div>
              {idx < beneficios.length - 1 && (
                <span className="hidden md:inline text-zinc-300 select-none">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
