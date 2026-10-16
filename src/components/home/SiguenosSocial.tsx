'use client';

import React from 'react';
import Image from 'next/image';
import { Play, ArrowUpRight, Heart, MessageCircle } from 'lucide-react';
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

interface SocialPost {
  id: string;
  red: 'instagram' | 'tiktok';
  imagen: string;
  caption: string;
  likes: string;
}

const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    red: 'instagram',
    imagen: '/images/hero/hero_desktop_1.png',
    caption: '¡Llegaron los cascos Shaft Pro Series con doble homologación! Disponibles en Sede Independencia y La Victoria 🏍️🔥',
    likes: '482',
  },
  {
    id: 'post-2',
    red: 'tiktok',
    imagen: '/images/banners/banner_wide_1.png',
    caption: '¿Cómo saber si tu casco es original o réplica? Te lo explicamos en 30 segundos con Kiara de Iori Biker Shop 🪖',
    likes: '1.8K',
  },
  {
    id: 'post-3',
    red: 'instagram',
    imagen: '/images/banners/banner_mid_1.png',
    caption: 'Promo Esparta activa todo Octubre: Piloto + Copiloto equipados con la máxima seguridad europea 🇵🇪',
    likes: '620',
  },
  {
    id: 'post-4',
    red: 'tiktok',
    imagen: '/images/banners/banner_mid_2.png',
    caption: 'Despacho del día hacia Trujillo y Arequipa por Agencia Shalom. ¡Envíos 100% seguros a todo el Perú! 📦✈️',
    likes: '940',
  },
];

export function SiguenosSocial() {
  return (
    <section className="py-12 sm:py-16 bg-[#121214] text-white border-t border-zinc-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand uppercase tracking-widest font-[family-name:var(--font-heading)]">
              COMUNIDAD BIKER PERÚ
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider mt-1">
              SÍGUENOS EN REDES: @IORIBIKERSHOP
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-normal">
              Únete a nuestra comunidad en Instagram, TikTok y Facebook. Conoce nuevos lanzamientos, sorteos y testimonios reales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={DATOS_NEGOCIO.redes.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              <InstagramIcon className="w-4 h-4" /> Instagram
            </a>
            <a
              href={DATOS_NEGOCIO.redes.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-black border border-zinc-700 hover:border-zinc-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              <Play className="w-4 h-4 fill-current text-white" /> TikTok
            </a>
            <a
              href={DATOS_NEGOCIO.redes.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              Facebook
            </a>
          </div>
        </div>

        {/* Grilla de publicaciones de la comunidad */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {SOCIAL_POSTS.map((post) => (
            <a
              key={post.id}
              href={post.red === 'instagram' ? DATOS_NEGOCIO.redes.instagram : DATOS_NEGOCIO.redes.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-brand transition-all block"
            >
              <Image
                src={post.imagen}
                alt="Iori Biker Shop comunidad"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3.5 sm:p-4">
                <div className="self-end bg-black/60 backdrop-blur-xs p-1.5 rounded-lg text-white">
                  {post.red === 'instagram' ? (
                    <InstagramIcon className="w-4 h-4 text-pink-400" />
                  ) : (
                    <Play className="w-4 h-4 fill-current text-cyan-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] sm:text-xs text-zinc-200 line-clamp-2 leading-tight">
                    {post.caption}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-brand">
                      <Heart className="w-3 h-3 fill-current" /> {post.likes}
                    </span>
                    <span>• @ioribikershop</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
