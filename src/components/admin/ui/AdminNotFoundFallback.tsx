import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

interface AdminNotFoundFallbackProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function AdminNotFoundFallback({
  title = 'Elemento o sección no encontrada',
  description = 'El recurso solicitado no existe, fue eliminado o la dirección es incorrecta.',
  backHref = ADMIN_ROUTES.INICIO,
  backLabel = 'Volver al Inicio',
}: AdminNotFoundFallbackProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-10 max-w-xl mx-auto my-12 text-center shadow-xs">
      <div className="w-14 h-14 bg-zinc-100 text-zinc-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-200">
        <FileQuestion className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-black text-zinc-900 font-[family-name:var(--font-heading)] uppercase tracking-wide mb-2">
        {title}
      </h2>
      <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={backHref}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </Link>

        {backHref !== ADMIN_ROUTES.INICIO && (
          <Link
            href={ADMIN_ROUTES.INICIO}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
          >
            <Home className="w-4 h-4 text-zinc-500" />
            <span>Inicio del Admin</span>
          </Link>
        )}
      </div>
    </div>
  );
}
