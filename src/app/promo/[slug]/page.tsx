import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Flame, Clock, MessageCircle } from 'lucide-react';
import { getPromoEsparta, getAjustesTienda } from '@/lib/data/supabase-data';
import { ProductCard } from '@/components/product/ProductCard';

export const revalidate = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === 'esparta') {
    const promo = await getPromoEsparta();
    if (promo) {
      return {
        title: `${promo.titulo} | Iori Biker Shop`,
        description: promo.descripcion || promo.subtitulo,
      };
    }
  }
  return {
    title: 'Promoción Especial | Iori Biker Shop',
  };
}

export default async function PromoSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug !== 'esparta') {
    notFound();
  }

  const [promo, ajustes] = await Promise.all([
    getPromoEsparta(),
    getAjustesTienda(),
  ]);

  if (!promo) {
    notFound();
  }

  const productos = promo.productos || [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Breadcrumb */}
      <div className="bg-black/60 border-b border-zinc-800 py-3">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#F58220] font-semibold">{promo.titulo}</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner Promo */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F58220_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F58220]/20 border border-[#F58220]/40 text-[#F58220] text-xs font-extrabold uppercase tracking-wider mb-4 animate-pulse">
              <Flame className="w-4 h-4 fill-[#F58220]" />
              Campaña Oficial Iori
            </div>

            <h1 className="text-3xl sm:text-6xl font-black uppercase tracking-tight font-[family-name:var(--font-heading)] leading-none text-white">
              {promo.titulo}
            </h1>

            <p className="mt-4 text-base sm:text-xl font-bold text-[#F58220] uppercase tracking-wide">
              {promo.subtitulo}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-zinc-300 bg-zinc-900/90 border border-zinc-700/80 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-[#F58220]" />
              <span>{promo.vigencia}</span>
            </div>

            <p className="mt-6 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              {promo.descripcion}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={`${ajustes.whatsapp.url}?text=${encodeURIComponent(`Hola Iori Biker Shop, quiero consultar por la ${promo.titulo}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F58220] text-black hover:bg-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all duration-300 shadow-xl shadow-[#F58220]/20 inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                Pedir Promo por WhatsApp
              </a>

              <Link
                href="/categoria/cascos"
                className="border border-zinc-700 hover:border-zinc-400 bg-zinc-900/60 text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-colors"
              >
                Ver todos los cascos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pasos de la Promoción */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-5 shadow-xl flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-[#F58220]/10 border border-[#F58220]/30 text-[#F58220] flex items-center justify-center font-black text-sm shrink-0">
              1
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase text-white font-[family-name:var(--font-heading)]">
                Elige 2 Cascos
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Combina cualquier modelo de cascos integrales o abatibles para ti y tu acompañante.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-5 shadow-xl flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-[#F58220]/10 border border-[#F58220]/30 text-[#F58220] flex items-center justify-center font-black text-sm shrink-0">
              2
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase text-white font-[family-name:var(--font-heading)]">
                Descuento Dúo Directo
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Recibe el precio promocional especial coordinado directamente con tu asesor por WhatsApp.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-5 shadow-xl flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-[#F58220]/10 border border-[#F58220]/30 text-[#F58220] flex items-center justify-center font-black text-sm shrink-0">
              3
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase text-white font-[family-name:var(--font-heading)]">
                Recibe en Todo el Perú
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Envío nacional por Shalom / Marvisur o recógelos en nuestras tiendas físicas de Lima.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modelos en la Promo (solo si hay al menos 1 producto) */}
      {productos.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-[#F58220] uppercase tracking-widest font-mono">
                SELECCIÓN RECOMENDADA
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-white">
                Cascos Participantes en la Promo
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-md">
              Puedes armar tu combinación favorita con cualquier casco de nuestro stock disponible.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
