'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { generarTextoRecuadro } from '@/lib/acuotaz-estimado';

interface ACuotazWidgetProps {
  amount: number;
  className?: string;
  variant?: 'product' | 'cart';
}

export function ACuotazWidget({ amount, className = '', variant = 'product' }: ACuotazWidgetProps) {
  const info = generarTextoRecuadro(amount);

  // Si el precio está fuera del mínimo o del máximo, el recuadro no aparece
  if (!info.visible) {
    return null;
  }

  return (
    <div
      className={`p-3.5 bg-zinc-50 border border-zinc-200 rounded-[4px] select-none ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Contenido Izquierdo */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-13 sm:text-14 text-zinc-800 leading-snug">
            {info.tieneCuota ? (
              <>
                <span>
                  Llévatelo en <strong className="font-bold text-zinc-950">{info.numeroCuotas}</strong> cuotas quincenales de{' '}
                  <strong className="font-black text-zinc-950">S/ {info.cuota?.toFixed(2)}</strong>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 bg-zinc-200/80 text-zinc-800 text-[11px] font-semibold rounded-[2px] shrink-0">
                  Sin tarjeta de crédito
                </span>
                <Link
                  href="/financiamiento"
                  className="text-12 font-heading font-bold uppercase tracking-wider text-[#F58220] hover:text-[#D96B0E] hover:underline shrink-0"
                >
                  Conoce más
                </Link>
              </>
            ) : (
              <>
                <span className="font-medium text-zinc-900">{info.texto}</span>
                <Link
                  href="/financiamiento"
                  className="text-12 font-heading font-bold uppercase tracking-wider text-[#F58220] hover:text-[#D96B0E] hover:underline shrink-0"
                >
                  Conoce más
                </Link>
              </>
            )}
          </div>

          {/* Aviso legal obligatorio en letra pequeña */}
          <p className="text-[11px] text-zinc-500 leading-tight">
            {info.avisoLegal}
          </p>
        </div>

        {/* Logo Oficial de aCuotaz a la derecha */}
        <div className="shrink-0 pl-2">
          <Image
            src="/brand/acuotaz.svg"
            alt="aCuotaz"
            width={80}
            height={24}
            className="h-5 sm:h-6 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
