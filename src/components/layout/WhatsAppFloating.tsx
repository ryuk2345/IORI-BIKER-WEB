'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { MENSAJE_BOTON_FLOTANTE, buildWhatsAppUrl } from '@/utils/whatsappTemplates';
import { trackFloatingWhatsAppClick } from '@/lib/analytics';
import { useTiendaSettings } from '@/context/TiendaSettingsContext';

export function WhatsAppFloating() {
  const { whatsapp } = useTiendaSettings();
  const url = buildWhatsAppUrl(MENSAJE_BOTON_FLOTANTE, whatsapp.numero);

  return (
    <aside aria-label="Contacto rápido" className="fixed bottom-24 sm:bottom-6 right-5 sm:right-6 z-50 group">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackFloatingWhatsAppClick()}
        className="flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
        aria-label="Hablar por WhatsApp con Iori Biker Shop"
      >
        <span className="sr-only">Contactar por WhatsApp</span>
        {/* Pulso de atención */}
        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping -z-10 group-hover:opacity-0" />
        <MessageCircle className="w-7 h-7 fill-white" />
      </a>

      {/* Tooltip flotante */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#121214] text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-700 hidden sm:block">
        ¿Dudas con tu talla? Escríbenos por WhatsApp 📲
      </div>
    </aside>
  );
}
