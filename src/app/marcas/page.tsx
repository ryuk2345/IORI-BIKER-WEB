import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, Award } from 'lucide-react';
import { getMarcas, getProductos, getAjustesTienda } from '@/lib/data/supabase-data';

export const revalidate = 10;

export const metadata = {
  title: 'Marcas Oficiales | Iori Biker Shop',
  description: 'Conoce las marcas oficiales de cascos, accesorios e indumentaria motera disponibles en Iori Biker Shop Perú.',
};

export default async function MarcasPage() {
  const [marcas, productos, ajustes] = await Promise.all([
    getMarcas(),
    getProductos(),
    getAjustesTienda(),
  ]);

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
            <span className="text-[#F58220] font-semibold">Marcas Oficiales</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F58220]/10 border border-[#F58220]/30 rounded-full text-[#F58220] text-xs font-bold mb-3 tracking-wider uppercase">
                <Award className="w-3.5 h-3.5" />
                Distribuidores Autorizados
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider">
                Marcas Oficiales
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                Seleccionamos marcas con certificaciones internacionales ECE y DOT, y durabilidad comprobada en las pistas del Perú.
              </p>
            </div>

            {marcas.length > 0 && (
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-center">
                  <span className="block text-xl font-bold text-[#F58220]">{marcas.length}</span>
                  <span>Marcas Activas</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grid de Marcas */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {marcas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marcas.map((marca) => {
              const count = productos.filter((p) => p.marcaId === marca.id).length;

              return (
                <div
                  key={marca.id}
                  className="bg-white rounded-2xl border border-zinc-200/80 p-6 flex flex-col justify-between hover:border-[#F58220]/40 hover:shadow-xl transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 group-hover:bg-[#F58220] group-hover:text-black group-hover:border-[#F58220] transition-colors">
                        {marca.destacada ? 'TOP VENTAS' : 'OFICIAL'}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>

                    <h3 className="text-xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-black group-hover:text-[#F58220] transition-colors">
                      {marca.nombre}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Productos homologados y repuestos oficiales con garantía Iori.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">
                      {count > 0 ? `${count} productos disponibles` : 'Catálogo disponible'}
                    </span>
                    <Link
                      href={`/marca/${marca.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F58220] group-hover:translate-x-1 transition-transform"
                    >
                      <span>Ver catálogo</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
            <h3 className="text-xl font-bold uppercase font-heading text-zinc-900">
              Marcas en actualización
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Estamos actualizando las marcas oficiales asociadas en la plataforma.
            </p>
          </div>
        )}

        {/* Banner Asesoría WhatsApp para Marcas */}
        <div className="mt-12 bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-white uppercase font-[family-name:var(--font-heading)]">
              ¿Buscas un modelo específico de alguna de nuestras marcas?
            </h4>
            <p className="text-xs text-zinc-400">
              Escríbenos directamente por WhatsApp. Verificamos stock en tiempo real en nuestras sedes físicas.
            </p>
          </div>
          <a
            href={`${ajustes.whatsapp.url}?text=${encodeURIComponent('Hola Iori Biker Shop, estoy buscando un producto de sus marcas oficiales.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[#F58220] text-black hover:bg-white px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#F58220]/20"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
