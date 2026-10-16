import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, Sparkles, Award } from 'lucide-react';
import { MARCAS, PRODUCTOS } from '@/data/mock';

export const metadata = {
  title: 'Marcas Oficiales | Iori Biker Shop',
  description: 'Conoce las 14 marcas oficiales de cascos, accesorios e indumentaria motera disponibles en Iori Biker Shop Perú: LS2, XKUDO, KRATOZ, SOMAN, LOGAN, XTREME, HJC, SHAFT, MT HELMET, ALPINSTAR, AIROH, SFX, ROYAL y MOTOWOLF.',
};

export default function MarcasPage() {
  return (
    <main className="min-h-screen bg-zinc-50 pb-16">
      {/* Header / Breadcrumb */}
      <section className="bg-black text-white py-10 border-b border-zinc-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-brand font-semibold">Marcas Oficiales</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/30 rounded-full text-brand text-xs font-bold mb-3 tracking-wider uppercase">
                <Award className="w-3.5 h-3.5" />
                Distribuidores Autorizados
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider">
                Nuestras 14 Marcas Oficiales
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                Seleccionamos rigurosamente las marcas con mayor reputación, certificaciones internacionales ECE y DOT, y durabilidad comprobada en las pistas del Perú.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-center">
                <span className="block text-xl font-bold text-brand">14</span>
                <span>Marcas Activas</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-center">
                <span className="block text-xl font-bold text-white">100%</span>
                <span>Originales</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de las 14 Marcas */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MARCAS.map((marca) => {
            const count = PRODUCTOS.filter((p) => p.marcaId === marca.id).length;

            return (
              <div
                key={marca.id}
                className="bg-white rounded-2xl border border-zinc-200/80 p-6 flex flex-col justify-between hover:border-brand/40 hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 group-hover:bg-brand group-hover:text-black group-hover:border-brand transition-colors">
                      {marca.destacada ? 'TOP VENTAS' : 'OFICIAL'}
                    </span>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>

                  <h3 className="text-xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-black group-hover:text-brand transition-colors">
                    {marca.nombre}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Productos homologados y repuestos originales con garantía Iori.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium">
                    {count > 0 ? `${count} productos disponibles` : 'Catálogo disponible'}
                  </span>
                  <Link
                    href={`/marca/${marca.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand group-hover:translate-x-1 transition-transform"
                  >
                    <span>Ver catálogo</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner Asesoría WhatsApp para Marcas */}
        <div className="mt-12 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-white uppercase font-[family-name:var(--font-heading)]">
              ¿Buscas un modelo específico de alguna de nuestras marcas?
            </h4>
            <p className="text-xs text-zinc-400">
              Escríbenos directamente por WhatsApp. Verificamos stock en tiempo real en nuestras 2 tiendas de Lima.
            </p>
          </div>
          <a
            href="https://wa.me/51905445698?text=Hola%20Iori%20Biker%20Shop,%20estoy%20buscando%20un%20producto%20de%20sus%20marcas%20oficiales."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-brand text-black hover:bg-white px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-brand/20"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
