'use client';

import React from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  action,
  className = '',
}: FormSectionProps) {
  return (
    <section className={`bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden ${className}`}>
      {/* Header de la sección */}
      <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-zinc-100 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-15 sm:text-16 text-zinc-900 uppercase tracking-wide">
            {title}
          </h2>
          {description && (
            <p className="text-12 text-zinc-500 mt-0.5 font-normal">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Contenido del formulario */}
      <div className="p-5 sm:p-6 space-y-4">
        {children}
      </div>
    </section>
  );
}
