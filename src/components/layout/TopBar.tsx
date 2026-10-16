'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, X } from 'lucide-react';
import { DATOS_NEGOCIO } from '@/data/mock';

export function TopBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#18181b] text-zinc-200 text-xs border-b border-zinc-800">
      {/* Cintillo de promoción */}
      <div className="bg-[#f58220] text-black font-semibold py-1.5 px-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex-1 text-center truncate">
            <Link
              href="/promo/esparta"
              className="hover:underline transition-all inline-flex items-center gap-1.5"
            >
              <span>🔥 ¡PROMO ESPARTA ACTIVA! Lleva 2 cascos certificados a precio rebajado todo Octubre.</span>
              <span className="underline font-bold hidden sm:inline">Ver Promoción &rarr;</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="text-black/80 hover:text-black ml-2 p-0.5 rounded transition cursor-pointer"
            aria-label="Cerrar barra promocional"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-barra superior con links auxiliares y WhatsApp */}
      <div className="hidden sm:block py-1.5 px-4 lg:px-8 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-zinc-300 text-[11px]">
          <nav className="flex items-center space-x-6">
            <Link href="/marcas" className="hover:text-brand transition-colors">
              Marcas Oficiales
            </Link>
            <Link href="/combos" className="hover:text-brand transition-colors">
              Combos &amp; Packs
            </Link>
            <Link href="/outlet" className="hover:text-brand transition-colors">
              Outlet
            </Link>
            <Link href="/preguntas-frecuentes" className="hover:text-brand transition-colors">
              Preguntas Frecuentes
            </Link>
            <Link href="/contacto" className="hover:text-brand transition-colors">
              Tiendas &amp; Contacto
            </Link>
          </nav>
          <div className="flex items-center space-x-5">
            <a
              href={`mailto:${DATOS_NEGOCIO.correo}`}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-brand" />
              <span>{DATOS_NEGOCIO.correo}</span>
            </a>
            <a
              href={DATOS_NEGOCIO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-zinc-200 hover:text-emerald-400 font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: +51 905 445 698</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
