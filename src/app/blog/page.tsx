import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Clock, User, Calendar, ArrowRight, Tag, BookOpen, ShieldAlert } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 60; // Revalidar cada minuto

export const metadata: Metadata = {
  title: 'Blog & Consejos Biker | Iori Biker Shop',
  description: 'Guías de seguridad en moto, mantenimiento preventivo de cadena, homologación de cascos ECE 22.06 y accesorios en Perú.',
  keywords: 'blog motero, consejos biker peru, cascos certificados lima, mantenimiento moto',
};

interface ArticuloBlog {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  imagen: string;
  categoria: string;
  autor: string;
  fecha: string;
  lectura_minutos: number;
  publicado: boolean;
  created_at: string;
}

async function getArticulos(): Promise<ArticuloBlog[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('blog')
      .select('*')
      .eq('publicado', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback
      return [
        {
          id: 'blog-1',
          titulo: 'Cómo elegir la talla correcta de tu casco para que no baile ni apriete de más',
          slug: 'como-elegir-talla-de-casco',
          resumen: 'Aprende a medir el contorno de tu cabeza con cinta métrica y conoce el tiempo de adaptación de las almohadillas.',
          imagen: '/images/banners/banner_mid_1.png',
          categoria: 'Seguridad y Tallas',
          autor: 'Iori Biker Team',
          fecha: '25 Sep 2026',
          lectura_minutos: 4,
          publicado: true,
          created_at: new Date().toISOString(),
        },
      ];
    }
    return data;
  } catch (err) {
    console.error('Error al cargar artículos de blog:', err);
    return [];
  }
}

export default async function BlogPage() {
  const articulos = await getArticulos();
  const articuloDestacado = articulos[0];
  const otrosArticulos = articulos.slice(1);

  const categorias = Array.from(new Set(articulos.map((a) => a.categoria)));

  return (
    <div className="py-8 sm:py-16 bg-zinc-50 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Blog & Consejos Biker</span>
        </nav>

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold text-brand uppercase tracking-widest bg-orange-100 text-brand px-3 py-1 rounded-full">
            Comunidad y Cultura Motera
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-wider text-black mt-3 mb-4">
            Blog Biker & Guías de Seguridad
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Consejos de expertos para rodar con máxima protección en las pistas peruanas. Aprende sobre mantenimiento de tu máquina, normas de certificación y novedades en equipamiento.
          </p>
        </div>

        {/* Categorías pill selector */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-zinc-200">
            <span className="text-xs font-bold uppercase text-zinc-400 mr-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Temas:
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase bg-black text-white cursor-pointer">
              Todos ({articulos.length})
            </span>
            {categorias.map((cat) => (
              <span
                key={cat}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase bg-white border border-zinc-200 text-zinc-700 hover:border-brand hover:text-brand transition-colors cursor-pointer"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Artículo Destacado (si existe) */}
        {articuloDestacado && (
          <div className="mb-14">
            <Link
              href={`/blog/${articuloDestacado.slug}`}
              className="group block bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:border-brand/40 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                {/* Portada con estricto aspect 16:9 */}
                <div className="lg:col-span-7 relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                  <img
                    src={articuloDestacado.imagen}
                    alt={articuloDestacado.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-brand text-white text-xs font-heading font-bold uppercase tracking-wider rounded-lg shadow-md">
                      {articuloDestacado.categoria}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand" /> {articuloDestacado.fecha}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand" /> {articuloDestacado.lectura_minutos} min de lectura
                      </span>
                    </div>

                    <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-zinc-900 group-hover:text-brand transition-colors leading-tight">
                      {articuloDestacado.titulo}
                    </h2>

                    <p className="text-zinc-600 text-sm line-clamp-3 leading-relaxed">
                      {articuloDestacado.resumen}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                      <User className="w-4 h-4 text-brand" /> {articuloDestacado.autor}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-brand group-hover:translate-x-1 transition-transform">
                      Leer artículo <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Grilla de Otros Artículos */}
        {otrosArticulos.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-heading font-bold text-xl uppercase tracking-wider text-black">
              Más Guías y Consejos Biker
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otrosArticulos.map((art) => (
                <article
                  key={art.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:border-brand/40 shadow-xs hover:shadow-lg transition-all flex flex-col"
                >
                  <Link href={`/blog/${art.slug}`} className="block relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={art.imagen}
                      alt={art.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 bg-black/80 backdrop-blur-xs text-white text-[11px] font-heading font-bold uppercase tracking-wider rounded-md">
                        {art.categoria}
                      </span>
                    </div>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-brand" /> {art.fecha}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand" /> {art.lectura_minutos} min
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-lg uppercase text-zinc-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${art.slug}`}>{art.titulo}</Link>
                      </h4>

                      <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                        {art.resumen}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-500">
                        Por {art.autor}
                      </span>
                      <Link
                        href={`/blog/${art.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase text-brand hover:underline"
                      >
                        Leer <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* CTA Biker Shop */}
        <div className="mt-16 bg-black text-white rounded-3xl p-8 sm:p-10 text-center max-w-3xl mx-auto shadow-xl border-b-4 border-brand">
          <BookOpen className="w-10 h-10 text-brand mx-auto mb-3" />
          <h3 className="font-heading font-bold text-2xl uppercase tracking-wider mb-2">
            ¿Buscas asesoría personalizada sobre tu talla o casco?
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm mb-6 max-w-lg mx-auto">
            Nuestros asesores en tienda y WhatsApp te orientan sobre las normas de seguridad ECE 22.06 y qué modelo se adapta mejor a tu estilo de manejo.
          </p>
          <a
            href="https://wa.me/51905445698?text=Hola%2C%20le%C3%AD%20su%20blog%20y%20deseo%20asesor%C3%ADa%20en%20equipamiento"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand hover:bg-brand-dark text-white font-heading font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-md active:scale-95"
          >
            Hablar con un Asesor Motero
          </a>
        </div>
      </div>
    </div>
  );
}
