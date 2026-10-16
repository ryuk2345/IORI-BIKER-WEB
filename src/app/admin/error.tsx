'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error('Error capturado en sección administrativa:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-18 font-heading font-black uppercase tracking-wider text-zinc-900">
            Ocurrió un error en esta sección
          </h2>
          <p className="text-12 text-zinc-500 leading-relaxed">
            {error?.message || 'No se pudo cargar la información de este módulo administrativo.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#F58220] hover:bg-[#e07116] text-white text-12 font-heading font-bold uppercase rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>

          <Link
            href={ADMIN_ROUTES.INICIO}
            className="w-full sm:w-auto px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-12 font-heading font-bold uppercase rounded-lg transition flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
