'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MessageCircle, 
  MapPin, 
  Clock, 
  Lock, 
  ExternalLink
} from 'lucide-react';
import { WHATSAPP_BASE_URL } from '@/utils/whatsappTemplates';

interface TiendaEnPreparacionProps {
  mensaje?: string;
}

export function TiendaEnPreparacion({ 
  mensaje = 'Estamos preparando nuestro nuevo catálogo digital. ¡Muy pronto disponible!' 
}: TiendaEnPreparacionProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-[#F58220] selection:text-black">
      {/* 1. Header con Logo */}
      <header className="w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md py-4 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Image
              src="/brand/iori-logo.png"
              alt="Iori Biker Shop"
              width={160}
              height={45}
              priority
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>
          <a
            href={`${WHATSAPP_BASE_URL}?text=${encodeURIComponent('¡Hola, Iori Biker Shop! 👋 Quisiera hacer una consulta mientras preparan la web.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Directo
          </a>
        </div>
      </header>

      {/* 2. Cuerpo Principal */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Badge Superior */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F58220]/10 border border-[#F58220]/30 text-[#F58220] text-xs font-black uppercase tracking-widest mb-6">
          <span className="w-2 h-2 rounded-full bg-[#F58220] animate-pulse" />
          Tienda en Preparación • Muy Pronto
        </div>

        {/* Título de Impacto */}
        <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white max-w-4xl leading-[1.05]">
          Estamos preparando nuestro <span className="text-[#F58220]">nuevo catálogo digital</span>
        </h1>

        <p className="mt-5 text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {mensaje} Mientras afinamos los últimos detalles, seguimos atendiéndote con normalidad en nuestras sedes físicas y canal de WhatsApp.
        </p>

        {/* Botón Central de WhatsApp */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a
            href={`${WHATSAPP_BASE_URL}?text=${encodeURIComponent('¡Hola, Iori Biker Shop! 👋 Quisiera información sobre cascos y productos disponibles.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-sm uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-3 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" />
            Atención por WhatsApp al +51 905 445 698
          </a>
        </div>

        {/* Bloque de las 2 Tiendas Físicas */}
        <div className="mt-14 w-full max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px bg-zinc-800 flex-1 max-w-[100px]" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F58220]" />
              Visita Nuestras 2 Tiendas Físicas en Lima
            </span>
            <span className="h-px bg-zinc-800 flex-1 max-w-[100px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {/* Sede 1: Independencia */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-white uppercase">
                  Sede Independencia (Principal)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F58220]/20 text-[#F58220] uppercase">
                  Tahuantinsuyo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima
              </p>
              <p className="text-xs text-zinc-500 flex items-start gap-2">
                <Clock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Lun a Sáb:</strong> 9:00 am – 10:00 pm<br />
                  <strong>Dom y Feriados:</strong> 11:00 am – 8:00 pm
                </span>
              </p>
              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Av.+Contisuyo+418,+Independencia,+Lima"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F58220] hover:underline"
                >
                  Ver en Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Sede 2: La Victoria */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-white uppercase">
                  Sede La Victoria
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 uppercase">
                  Arriola
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                Av. Nicolás Arriola 901, La Victoria, Lima
              </p>
              <p className="text-xs text-zinc-500 flex items-start gap-2">
                <Clock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Lunes a Sábado:</strong> 9:00 am – 6:00 pm<br />
                  <strong>Domingos:</strong> Cerrado
                </span>
              </p>
              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Av.+Nicolás+Arriola+901,+La+Victoria,+Lima"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F58220] hover:underline"
                >
                  Ver en Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer Discreto con Acceso Admin */}
      <footer className="w-full border-t border-zinc-800/60 py-6 px-6 sm:px-8 text-center text-xs text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto">
        <p>© {new Date().getFullYear()} IORI SAC • RUC 20610816089. Todos los derechos reservados.</p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition text-[11px] uppercase tracking-wider font-semibold"
        >
          <Lock className="w-3 h-3" /> Acceso de Administración
        </Link>
      </footer>
    </div>
  );
}
