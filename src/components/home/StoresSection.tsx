'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Clock, Phone, Navigation, ArrowRight } from 'lucide-react';
import { TIENDAS_FISICAS } from '@/data/mock';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface StoreWithImages {
  id: string;
  nombre: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  referencia: string;
  horario: string;
  telefonoWhatsApp: string;
  mapsUrl: string;
  fotoFachada?: string;
  fotoInterior?: string;
}

export function StoresSection() {
  const tiendas: StoreWithImages[] = [
    {
      ...TIENDAS_FISICAS[0],
      fotoFachada: '/images/banners/banner_mid_1.png',
      fotoInterior: '/images/banners/banner_wide_1.png',
    },
    {
      ...TIENDAS_FISICAS[1],
      fotoFachada: '/images/banners/banner_mid_2.png',
      fotoInterior: '/images/hero/hero_desktop_1.png',
    },
  ];

  return (
    <section className="section-py bg-white border-t border-zinc-200">
      <div className="container-iori">
        <SectionHeader
          titulo="VISÍTANOS EN TIENDA"
          bajada="Visita nuestras dos sedes en Lima para probarte tu casco, verificar tu talla exacta y recibir asesoría técnica personalizada."
          verTodoHref="/contacto"
          verTodoTexto="Ver todas las ubicaciones"
        />

        {/* 2 Tiendas físicas lado a lado con fotos de fachada e interior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {tiendas.map((tienda) => (
            <div
              key={tienda.id}
              className="bg-[#F5F5F5] rounded-[4px] overflow-hidden border border-zinc-200 hover:border-zinc-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Fotos de Fachada e Interior (2 fotos en split) */}
              <div className="grid grid-cols-2 gap-1 h-44 sm:h-52 bg-zinc-900 relative">
                <div className="relative h-full overflow-hidden">
                  <Image
                    src={tienda.fotoFachada || '/images/banners/banner_mid_1.png'}
                    alt={`Fachada ${tienda.nombre}`}
                    fill
                    className="object-cover object-center hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 768px) 300px, 50vw"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] font-heading uppercase font-bold tracking-wider px-2 py-0.5 rounded-[2px]">
                    Fachada
                  </span>
                </div>

                <div className="relative h-full overflow-hidden">
                  <Image
                    src={tienda.fotoInterior || '/images/banners/banner_mid_2.png'}
                    alt={`Interior ${tienda.nombre}`}
                    fill
                    className="object-cover object-center hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 768px) 300px, 50vw"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] font-heading uppercase font-bold tracking-wider px-2 py-0.5 rounded-[2px]">
                    Interior
                  </span>
                </div>
              </div>

              {/* Información de la tienda */}
              <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#111111] text-[#f58220] text-12 font-heading font-black uppercase px-2.5 py-0.5 rounded-[2px] tracking-wider">
                      {tienda.distrito}
                    </span>
                    <span className="text-12 text-zinc-500 font-medium">
                      Lima, Perú
                    </span>
                  </div>

                  <h3 className="text-20 sm:text-24 font-heading font-bold uppercase tracking-tight text-zinc-950">
                    {tienda.nombre}
                  </h3>

                  <div className="space-y-2.5 text-14 text-zinc-700">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#f58220] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-zinc-950">{tienda.direccion}</p>
                        {tienda.referencia && (
                          <p className="text-12 text-zinc-500 mt-0.5">{tienda.referencia}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-[#f58220] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-zinc-500 block text-11 uppercase font-heading font-bold tracking-wider">
                          Horario de Atención:
                        </span>
                        <p className="text-zinc-900 font-medium text-13">{tienda.horario}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#f58220] shrink-0" />
                      <a
                        href={`https://wa.me/51905445698?text=Hola%20Iori%20Biker,%20consulto%20por%20${encodeURIComponent(tienda.nombre)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-800 hover:text-brand font-medium text-13 transition-colors"
                      >
                        {tienda.telefonoWhatsApp} (WhatsApp directo)
                      </a>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center gap-3">
                  <a
                    href={tienda.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2 px-4 text-13 inline-flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Cómo llegar</span>
                  </a>

                  <a
                    href={`https://wa.me/51905445698?text=Hola,%20deseo%20saber%20si%20tienen%20disponible%20mi%20talla%20en%20${encodeURIComponent(tienda.nombre)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-2 px-4 text-13"
                  >
                    <span>Consultar stock en sede</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
