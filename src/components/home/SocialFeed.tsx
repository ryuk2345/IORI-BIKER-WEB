'use client';

import React from 'react';
import Image from 'next/image';
import { Play, ArrowUpRight } from 'lucide-react';
import { RedesSociales } from '@/types';

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

interface SocialFeedProps {
  posts?: SocialPost[];
  redes?: RedesSociales;
}

export function SocialFeed({ posts = [], redes }: SocialFeedProps) {
  // Regla estricta: si no hay posts reales cargados, la sección se oculta completamente
  if (!posts || posts.length === 0) {
    return null;
  }

  const instagramUrl = redes?.instagram || 'https://instagram.com/ioribikershop';
  const tiktokUrl = redes?.tiktok || 'https://tiktok.com/@ioribikershop';

  return (
    <section className="section-py bg-zinc-950 text-white border-t border-zinc-900">
      <div className="container-iori">
        {/* Cabecera con llamada a redes oficiales */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8 border-b border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-12 font-heading font-bold text-[#F58220] uppercase tracking-widest mb-1.5">
              <span>COMUNIDAD BIKER OFICIAL</span>
            </div>
            <h2 className="text-28 sm:text-36 font-heading font-bold uppercase tracking-tight text-white leading-tight">
              SÍGUENOS EN REDES
            </h2>
            <p className="mt-1 text-14 text-zinc-400">
              Videos de pruebas de impacto, unboxing de nuevos cascos y tips de mantenimiento.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[2px] bg-zinc-900 border border-zinc-700 hover:border-[#F58220] hover:text-[#F58220] text-12 font-heading uppercase font-bold tracking-wider transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Instagram</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}

            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[2px] bg-zinc-900 border border-zinc-700 hover:border-[#F58220] hover:text-[#F58220] text-12 font-heading uppercase font-bold tracking-wider transition-colors"
              >
                <span className="font-bold text-sm">TT</span>
                <span>TikTok</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* Grilla de imágenes */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {posts.map((post) => {
            const enlace = post.enlace || (post.red === 'instagram' ? instagramUrl : tiktokUrl);

            return (
              <a
                key={post.id}
                href={enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-[4px] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-[#F58220] transition-all duration-300"
              >
                <Image
                  src={post.imagen}
                  alt={post.caption || 'Publicación oficial Iori Biker'}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="self-end bg-black/70 p-1.5 rounded-full text-white">
                    {post.red === 'tiktok' ? (
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                    ) : (
                      <InstagramIcon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {post.caption && (
                    <p className="text-[11px] text-zinc-200 line-clamp-3 leading-snug font-medium drop-shadow-sm">
                      {post.caption}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
