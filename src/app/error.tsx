'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/utils/whatsappTemplates';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error no controlado capturado por app/error.tsx:', error);
  }, [error]);

  const reportUrl = buildWhatsAppUrl(
    `Hola, Iori Biker Shop. Tuve un inconveniente navegando en la web: ${error.message || 'Error inesperado'}.`
  );

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-zinc-950 to-black pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-red-950/80 border border-red-800 text-red-500 flex items-center justify-center mx-auto shadow-xl">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-red-400 bg-red-950/50 px-3 py-1 rounded-full border border-red-900">
            Falla Técnica en la Pista
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl uppercase text-white tracking-wide">
            ALGO SE DESCALIBRÓ EN EL MOTOR
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Hemos registrado este incidente para repararlo de inmediato. Puedes intentar reiniciar la página o volver a la tienda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white font-heading font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar Arranque
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-heading font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Home className="w-4 h-4" /> Ir al Inicio
          </Link>
        </div>

        <div className="pt-6 border-t border-zinc-800/80 text-xs text-zinc-500">
          ¿El problema persiste?{' '}
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f58220] hover:underline font-bold inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Reportar a Soporte por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
