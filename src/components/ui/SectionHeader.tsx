import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  titulo: string;
  bajada?: string;
  verTodoHref?: string;
  verTodoTexto?: string;
  className?: string;
}

export function SectionHeader({
  titulo,
  bajada,
  verTodoHref,
  verTodoTexto = 'Ver todo',
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 mb-6 border-b border-zinc-200 ${className}`}>
      <div>
        <h2 className="text-24 sm:text-32 font-heading font-bold uppercase tracking-tight text-zinc-950">
          {titulo}
        </h2>
        {bajada && (
          <p className="mt-1 text-14 text-zinc-600 font-normal">
            {bajada}
          </p>
        )}
      </div>

      {verTodoHref && (
        <Link
          href={verTodoHref}
          className="inline-flex items-center gap-1.5 text-14 font-heading uppercase font-bold tracking-wide text-zinc-900 hover:text-brand transition-colors group shrink-0 self-start sm:self-end mt-1 sm:mt-0"
        >
          <span>{verTodoTexto}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
