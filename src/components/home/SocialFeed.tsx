'use client';

import React from 'react';
import Image from 'next/image';
import { Play, ArrowUpRight, Heart } from 'lucide-react';
import { DATOS_NEGOCIO } from '@/data/mock';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export interface SocialPost {
  id: string;
  red: 'instagram' | 'tiktok';
  imagen: string;
  enlace?: string;
  caption?: string;
}

const DEFAULT_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    red: 'instagram',
    imagen: '/images-v2/hero-slide-1.jpg',
    enlace: DATOS_NEGOCIO.redes.instagram,
    caption: '¡Llegaron los cascos Shaft y MT con certificación ECE 22.06 a nuestras sedes de Lima! 🏍️🔥',
  },
  {
    id: 'post-2',
    red: 'tiktok',
    imagen: '/images-v2/hero-lateral-1.jpg',
    enlace: DATOS_NEGOCIO.redes.tiktok,
    caption: '¿Cómo saber si tu casco es original o réplica? Te lo explicamos en 30 segundos con Iori Biker 🪖',
  },
  {
    id: 'post-3',
    red: 'instagram',
    imagen: '/images-v2/bloque-arma-tu-equipo.jpg',
    enlace: DATOS_NEGOCIO.redes.instagram,
    caption: 'Promo Esparta activa en Octubre: Piloto + Copiloto equipados con la máxima seguridad europea 🇵🇪',
  },
  {
    id: 'post-4',
    red: 'tiktok',
    imagen: '/images-v2/hero-slide-2.jpg',
    enlace: DATOS_NEGOCIO.redes.tiktok,
    caption: 'Despacho del día hacia Trujillo y Arequipa por Agencia Shalom. ¡Envíos 100% seguros a todo el Perú! 📦✈️',
  },
  {
    id: 'post-5',
    red: 'instagram',
    imagen: '/images/hero/hero_desktop_1.png',
    enlace: DATOS_NEGOCIO.redes.instagram,
    caption: 'Intercomunicadores Bluetooth con cancelación de ruido ambiental. Conéctate con tu copiloto sin cables 🎧⚡',
  },
  {
    id: 'post-6',
    red: 'tiktok',
    imagen: '/images/banners/banner_mid_1.png',
    enlace: DATOS_NEGOCIO.redes.tiktok,
    caption: 'Casacas con protecciones nivel 2 en codos, hombros y espalda. Resistencia y estilo en ruta 🏍️🛡️',
  },
];

interface SocialFeedProps {
  posts?: SocialPost[];
}

export function SocialFeed({ posts = DEFAULT_POSTS }: SocialFeedProps) {
  // Oculto si no tiene contenido
  if (!posts || posts.length === 0) {
    return null;
  }

  const list = posts.slice(0, 6);

  return (
    <section className="section-py bg-[#111111] text-white border-t border-zinc-800 bg-grain">
      <div className="container-iori">
        {/* Encabezado del bloque Síguenos */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-12 font-heading font-bold text-brand uppercase tracking-widest block mb-1">
              COMUNIDAD BIKER OFICIAL
            </span>
            <h2 className="text-28 sm:text-36 font-heading font-bold uppercase tracking-tight text-white leading-tight">
              SÍGUENOS EN REDES: @IORIBIKERSHOP
            </h2>
            <p className="text-13 sm:text-14 text-zinc-400 mt-1 max-w-lg">
              Únete a nuestra comunidad en Instagram y TikTok. Conoce nuevos ingresos, pruebas de resistencia y testimonios reales.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={DATOS_NEGOCIO.redes.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-[2px] text-12 font-heading font-bold uppercase tracking-wider transition"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>

            <a
              href={DATOS_NEGOCIO.redes.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-black border border-zinc-700 hover:border-zinc-500 text-white rounded-[2px] text-12 font-heading font-bold uppercase tracking-wider transition"
            >
              <Play className="w-3.5 h-3.5 fill-current text-brand" />
              <span>TikTok</span>
            </a>
          </div>
        </div>

        {/* Grilla exacta de 6 imágenes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {list.map((post) => {
            const url = post.enlace || (post.red === 'instagram' ? DATOS_NEGOCIO.redes.instagram : DATOS_NEGOCIO.redes.tiktok);

            return (
              <a
                key={post.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square bg-zinc-900 rounded-[4px] overflow-hidden border border-zinc-800 hover:border-brand transition-all block"
              >
                <Image
                  src={post.imagen}
                  alt={post.caption || 'Publicación Iori Biker'}
                  fill
                  sizes="(min-width: 1024px) 200px, 50vw"
                  className="object-cover object-center group-hover:scale-108 transition-transform duration-500"
                />

                {/* Badge de la red social en la esquina superior */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="w-6 h-6 rounded-full bg-black/75 backdrop-blur-xs flex items-center justify-center text-white border border-white/10 group-hover:bg-brand group-hover:text-black transition-colors">
                    {post.red === 'instagram' ? (
                      <InstagramIcon className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3 fill-current text-white group-hover:text-black" />
                    )}
                  </span>
                </div>

                {/* Overlay hover con texto y enlace */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end text-white">
                  {post.caption && (
                    <p className="text-[11px] line-clamp-3 leading-snug text-zinc-200 mb-1">
                      {post.caption}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] font-heading font-bold uppercase tracking-wider text-brand">
                    <span>Ver post</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
