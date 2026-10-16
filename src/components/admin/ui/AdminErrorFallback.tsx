'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

interface AdminErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  sectionName?: string;
}

export function AdminErrorFallback({ error, reset, sectionName = 'esta sección' }: AdminErrorFallbackProps) {
  return (
    <div className="bg-white border border-red-200 rounded-3xl p-8 max-w-xl mx-auto my-12 text-center shadow-xs">
      <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-black text-zinc-900 font-[family-name:var(--font-heading)] uppercase tracking-wide mb-2">
        Error en {sectionName}
      </h2>
      <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
        Ocurrió un problema inesperado al cargar la información. El resto del sistema administrativo sigue operativo.
      </p>

      {error?.message && (
        <div className="mb-6 p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs font-mono text-red-800 text-left overflow-x-auto max-h-32">
          {error.message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar</span>
        </button>

        <Link
          href={ADMIN_ROUTES.INICIO}
          className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
        >
          <Home className="w-4 h-4 text-zinc-500" />
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
}
