'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface ACuotazHeaderStripProps {
  maxCuotas?: number;
  texto?: string;
}

export function ACuotazHeaderStrip({
  maxCuotas = 9,
  texto = 'Divide tu pago en hasta {n} cuotas',
}: ACuotazHeaderStripProps) {
  const textoFormateado = texto.replace('{n}', '');

  return (
    <Link
      href="/financiamiento"
      aria-label="Financiamiento aCuotaz en cuotas sin tarjeta"
      className="block w-full bg-[#F4F4F5] hover:bg-[#ECECED] border-b border-zinc-200 text-zinc-800 transition-colors py-1.5 px-3 sm:px-4 select-none group"
    >
      <div className="container-iori flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap text-12">
        {/* Lado izquierdo: Logo aCuotaz + texto + etiqueta en contraste */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Image
            src="/brand/acuotaz.svg"
            alt="aCuotaz"
            width={78}
            height={22}
            className="h-4 sm:h-5 w-auto object-contain shrink-0"
            priority
          />

          <span className="text-zinc-700 text-12 font-normal">
            {maxCuotas ? (
              <>Divide tu pago en hasta <strong className="font-bold text-zinc-950">{maxCuotas}</strong> cuotas</>
            ) : (
              <span className="font-medium text-zinc-900">Divide tu compra en cuotas con tu DNI</span>
            )}
          </span>

          {/* Etiqueta en color de contraste */}
          <span className="inline-flex items-center bg-[#111111] text-white px-2 py-0.5 rounded-[2px] text-[11px] font-bold tracking-wide uppercase shrink-0">
            Sin tarjeta, solo con tu DNI
          </span>
        </div>

        {/* Lado derecho: Enlace visual directo */}
        <div className="shrink-0 flex items-center gap-1 text-12 font-heading font-bold uppercase tracking-wider text-[#F58220] group-hover:text-[#D96B0E] transition-colors ml-auto">
          <span className="hidden sm:inline">Conoce más</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

