'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Clock, Phone, Navigation, ArrowRight } from 'lucide-react';
import { TiendaFisica } from '@/types';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface StoresSectionProps {
  tiendas?: TiendaFisica[];
}

export function StoresSection({ tiendas = [] }: StoresSectionProps) {
  // Si no hay tiendas configuradas en Supabase, ocultar la sección
  if (!tiendas || tiendas.length === 0) {
    return null;
  }

  return (
    <section className="section-py bg-white border-t border-zinc-200">
      <div className="container-iori">
        <SectionHeader
          titulo="VISÍTANOS EN TIENDA"
          bajada="Visita nuestras sedes en Lima para probarte tu casco, verificar tu talla exacta y recibir asesoría técnica personalizada."
          verTodoHref="/contacto"
          verTodoTexto="Ver todas las ubicaciones"
        />

        {/* Tiendas físicas lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {tiendas.map((tienda, idx) => (
            <div
              key={tienda.id || idx}
              className="bg-[#F5F5F5] rounded-[4px] overflow-hidden border border-zinc-200 hover:border-zinc-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Contenido descriptivo y dirección real */}
              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-black text-white text-[11px] font-heading uppercase font-bold tracking-wider rounded-[2px]">
                    Sede Oficial
                  </span>
                  {tienda.ciudad && (
                    <span className="text-12 font-heading font-bold text-zinc-500 uppercase tracking-wider">
                      {tienda.ciudad}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-20 sm:text-22 font-heading uppercase font-bold text-zinc-950 tracking-tight">
                    {tienda.nombre}
                  </h3>
                  <div className="mt-2.5 flex items-start gap-2.5 text-13 text-zinc-700">
                    <MapPin className="w-4 h-4 text-[#F58220] shrink-0 mt-0.5" />
                    <span>{tienda.direccion}</span>
                  </div>
                  {tienda.referencia && (
                    <p className="mt-1 text-12 text-zinc-500 pl-6 italic">
                      Ref: {tienda.referencia}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-200/80 space-y-2 text-13 text-zinc-700">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-heading uppercase font-bold text-12 text-zinc-900 block">
                        Horario de Atención:
                      </span>
                      <span>{tienda.horario}</span>
                    </div>
                  </div>

                  {tienda.telefonoWhatsApp && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                      <div>
                        <span className="font-heading uppercase font-bold text-12 text-zinc-900">
                          WhatsApp directo:{' '}
                        </span>
                        <a
                          href={`https://wa.me/${tienda.telefonoWhatsApp.replace(/\D/g, '').replace(/^(9\d{8})$/, '51$1')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#F58220] font-bold hover:underline"
                        >
                          {tienda.telefonoWhatsApp}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de acción hacia Google Maps */}
              <div className="p-6 pt-0">
                <a
                  href={tienda.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(tienda.direccion)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-outline border-zinc-300 text-zinc-900 hover:bg-black hover:text-white hover:border-black flex items-center justify-center gap-2 text-12 py-3 rounded-[2px]"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Cómo llegar en Google Maps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
