'use client';

import React from 'react';
import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

export interface CustomerReview {
  id: string;
  autor: string;
  calificacion: number;
  comentario: string;
  fuente?: 'Google Maps' | 'Facebook' | 'Tienda Física' | 'Web' | string;
  fecha?: string;
  productoNombre?: string;
}

interface CustomerReviewsProps {
  reviews?: CustomerReview[];
}

export function CustomerReviews({ reviews = [] }: CustomerReviewsProps) {
  // Regla estricta: solo opiniones reales cargadas desde el admin. Nunca texto inventado.
  // Oculto automáticamente si no tiene contenido.
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="section-py bg-[#F5F5F5] border-t border-zinc-200">
      <div className="container-iori">
        <SectionHeader
          titulo="OPINIONES DE CLIENTES"
          bajada="Experiencias reales de la comunidad motera en nuestras sedes de Lima y envíos a provincia."
          verTodoHref="/contacto"
          verTodoTexto="Visítanos en tienda"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-[4px] p-5 sm:p-6 border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Estrellas y Fuente */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.calificacion
                            ? 'text-brand fill-brand'
                            : 'text-zinc-200 fill-zinc-200'
                        }`}
                      />
                    ))}
                  </div>

                  {rev.fuente && (
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-[2px] border border-zinc-200">
                      {rev.fuente}
                    </span>
                  )}
                </div>

                {/* Comentario real */}
                <p className="text-14 text-zinc-700 leading-relaxed italic line-clamp-4">
                  &ldquo;{rev.comentario}&rdquo;
                </p>
              </div>

              {/* Autor, verificación y fecha */}
              <div className="pt-4 border-t border-zinc-100 mt-4 flex items-center justify-between text-12">
                <div className="flex items-center gap-1.5 font-heading uppercase font-bold text-zinc-950">
                  <span>{rev.autor}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                </div>

                {rev.fecha && (
                  <span className="text-zinc-400 font-medium text-11">
                    {rev.fecha}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
