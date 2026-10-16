import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  Calendar, Clock, User, ArrowLeft, Share2, MessageCircle, 
  Tag, ChevronRight, CheckCircle2, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60;

interface Articulo {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  imagen: string;
  categoria: string;
  autor: string;
  fecha: string;
  lectura_minutos: number;
  publicado: boolean;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  created_at: string;
  updated_at?: string;
}

async function getArticulo(slug: string): Promise<Articulo | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('blog')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }
    return data;
  } catch (err) {
    console.error('Error al obtener artículo:', err);
    return null;
  }
}

async function getArticulosRelacionados(slugActual: string, categoria: string): Promise<Articulo[]> {
  try {
    const supabase = createAdminClient();
    // Primero intentamos buscar de la misma categoría
    let { data } = await supabase
      .from('blog')
      .select('*')
      .neq('slug', slugActual)
      .eq('categoria', categoria)
      .limit(3);

    if (!data || data.length === 0) {
      // Si no hay de la misma categoría, traemos los más recientes
      const res = await supabase
        .from('blog')
        .select('*')
        .neq('slug', slugActual)
        .limit(3);
      data = res.data;
    }

    return data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const articulo = await getArticulo(slug);

  if (!articulo) {
    return {
      title: 'Artículo no encontrado | Iori Biker Shop',
    };
  }

  const title = articulo.meta_title || `${articulo.titulo} | Iori Biker Shop`;
  const description = articulo.meta_description || articulo.resumen;
  const keywords = articulo.keywords || `${articulo.categoria}, blog motero peru, iori biker shop`;

  const canonicalUrl = `https://ioribikershop.pe/blog/${articulo.slug}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      images: [
        {
          url: articulo.imagen.startsWith('http') ? articulo.imagen : `https://ioribikershop.pe${articulo.imagen}`,
          width: 1200,
          height: 675, // 16:9
          alt: articulo.titulo,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [articulo.imagen],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const articulo = await getArticulo(slug);

  if (!articulo) {
    notFound();
  }

  const relacionados = await getArticulosRelacionados(articulo.slug, articulo.categoria);

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: articulo.titulo,
    description: articulo.resumen,
    image: [articulo.imagen.startsWith('http') ? articulo.imagen : `https://ioribikershop.pe${articulo.imagen}`],
    datePublished: articulo.created_at || '2026-01-01T00:00:00Z',
    dateModified: articulo.updated_at || articulo.created_at || '2026-01-01T00:00:00Z',
    author: {
      '@type': 'Person',
      name: articulo.autor || 'Iori Biker Shop',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Iori Biker Shop',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ioribikershop.pe/images/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ioribikershop.pe/blog/${articulo.slug}`,
    },
  };

  // Renderizador simple de Markdown enriquecido a HTML/React
  const renderContenidoEnriquecido = (rawContent: string) => {
    const lineas = rawContent.split('\n');
    return lineas.map((linea, idx) => {
      const l = linea.trim();
      if (!l) return <div key={idx} className="h-4" />;

      if (l.startsWith('# ')) {
        return (
          <h2 key={idx} className="font-heading font-black text-2xl sm:text-3xl uppercase text-zinc-900 mt-8 mb-4 border-b border-zinc-200 pb-2">
            {l.replace('# ', '')}
          </h2>
        );
      }
      if (l.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-heading font-bold text-xl sm:text-2xl uppercase text-zinc-900 mt-6 mb-3">
            {l.replace('## ', '')}
          </h3>
        );
      }
      if (l.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-heading font-bold text-lg uppercase text-zinc-800 mt-5 mb-2">
            {l.replace('### ', '')}
          </h4>
        );
      }
      if (l.startsWith('> ')) {
        return (
          <blockquote key={idx} className="p-4 sm:p-5 my-5 bg-orange-50/70 border-l-4 border-brand rounded-r-xl text-zinc-800 text-sm font-medium italic">
            {l.replace('> ', '')}
          </blockquote>
        );
      }
      if (l.startsWith('- ') || l.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-sm sm:text-base text-zinc-700 my-1.5 leading-relaxed">
            {l.slice(2)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(l)) {
        return (
          <li key={idx} className="ml-5 list-decimal text-sm sm:text-base text-zinc-700 my-1.5 leading-relaxed">
            {l.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (l.startsWith('![')) {
        const match = l.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <div key={idx} className="my-6 rounded-2xl overflow-hidden aspect-[16/9] bg-zinc-900 border border-zinc-200">
              <img src={match[2]} alt={match[1]} className="w-full h-full object-cover" />
            </div>
          );
        }
      }
      return (
        <p key={idx} className="text-sm sm:text-base text-zinc-700 leading-relaxed my-3 font-normal">
          {l}
        </p>
      );
    });
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Revisa este artículo de Iori Biker Shop: "${articulo.titulo}" 👉 https://ioribikershop.pe/blog/${articulo.slug}`
  )}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <div className="py-8 sm:py-16 bg-zinc-50 min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-brand font-bold">{articulo.categoria}</span>
          <span>/</span>
          <span className="text-zinc-900 font-semibold truncate max-w-[280px] sm:max-w-md">{articulo.titulo}</span>
        </nav>

        <article className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-12 border border-zinc-200 shadow-sm">
          {/* Badge y Metadatos */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 bg-brand text-white text-xs font-heading font-bold uppercase tracking-wider rounded-lg shadow-xs">
                {articulo.categoria}
              </span>
              {!articulo.publicado && (
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-heading font-bold uppercase tracking-wider rounded-lg shadow-xs">
                  Modo Borrador
                </span>
              )}
            </div>

            <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-black leading-tight">
              {articulo.titulo}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 font-medium leading-relaxed">
              {articulo.resumen}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-zinc-100 text-xs text-zinc-500">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5 font-bold text-zinc-800">
                  <User className="w-4 h-4 text-brand" /> {articulo.autor}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand" /> {articulo.fecha}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand" /> {articulo.lectura_minutos} min de lectura
                </span>
              </div>

              {/* Botón de Compartir por WhatsApp */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" /> Compartir en WhatsApp
              </a>
            </div>
          </div>

          {/* Portada Estrictamente 16:9 */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-900 my-8 shadow-md">
            <img
              src={articulo.imagen}
              alt={articulo.titulo}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Contenido Enriquecido */}
          <div className="prose prose-zinc max-w-none">
            {renderContenidoEnriquecido(articulo.contenido || articulo.resumen)}
          </div>

          {/* Banner de Contacto directo con el equipo */}
          <div className="mt-12 p-6 sm:p-8 bg-zinc-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4 border-brand shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-heading font-bold text-lg uppercase tracking-wider">
                ¿Te gustó este artículo o necesitas asesoría?
              </h3>
              <p className="text-xs text-zinc-400">
                Escríbenos a nuestro WhatsApp oficial y recibe cotizaciones con fotos reales en tiempo récord.
              </p>
            </div>
            <a
              href="https://wa.me/51905445698?text=Hola%20Iori%20Biker%20Shop%2C%20le%C3%AD%20el%20art%C3%ADculo%20sobre%20seguridad%20y%20deseo%20m%C3%A1s%20detalles"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
            </a>
          </div>

          {/* Volver al listado */}
          <div className="mt-8 pt-6 border-t border-zinc-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-brand transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a todos los artículos
            </Link>
          </div>
        </article>

        {/* Sección: Artículos Relacionados */}
        {relacionados.length > 0 && (
          <div className="max-w-4xl mx-auto mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">Lectura Recomendada</span>
                <h3 className="font-heading font-bold text-2xl uppercase tracking-wider text-black mt-1">
                  Artículos Relacionados
                </h3>
              </div>
              <Link href="/blog" className="text-xs font-bold uppercase text-brand hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relacionados.map((rel) => (
                <article
                  key={rel.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:border-brand/40 shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <Link href={`/blog/${rel.slug}`} className="block relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={rel.imagen}
                      alt={rel.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                        {rel.categoria}
                      </span>
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-semibold block mb-1">
                        {rel.fecha} • {rel.lectura_minutos} min
                      </span>
                      <h4 className="font-heading font-bold text-sm uppercase text-zinc-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${rel.slug}`}>{rel.titulo}</Link>
                      </h4>
                    </div>

                    <Link
                      href={`/blog/${rel.slug}`}
                      className="text-xs font-bold uppercase text-brand flex items-center gap-1 hover:underline pt-2 border-t border-zinc-100"
                    >
                      Leer guía <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
