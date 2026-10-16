'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, ShieldAlert } from 'lucide-react';
import { DATOS_NEGOCIO, TIENDAS_FISICAS } from '@/data/mock';

export function Footer() {
  return (
    <footer className="w-full bg-[#111111] text-zinc-300 border-t border-zinc-800">
      <div className="container-iori pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Columna 1: Identidad Corporativa y RUC */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/brand/iori-logo.png"
                alt="Iori Biker Shop Logo"
                width={200}
                height={96}
                className="object-contain h-14 md:h-16 w-auto"
              />
            </Link>
            <p className="text-12 text-zinc-400 leading-relaxed font-normal">
              Tienda de accesorios para moto e indumentaria biker desde 2023. Envíos garantizados a todo el Perú por Shalom y Mavisur.
            </p>
            <div className="text-12 space-y-1 text-zinc-400 pt-1">
              <p><strong className="text-zinc-200">Razón Social:</strong> {DATOS_NEGOCIO.razonSocial}</p>
              <p><strong className="text-zinc-200">RUC:</strong> {DATOS_NEGOCIO.ruc}</p>
              <p><strong className="text-zinc-200">WhatsApp:</strong> +51 905 445 698</p>
              <p><strong className="text-zinc-200">Correo:</strong> {DATOS_NEGOCIO.correo}</p>
            </div>
            {/* Redes Sociales Oficiales */}
            <div className="pt-2 text-12 space-y-1">
              <span className="block font-heading font-bold text-zinc-200 uppercase tracking-wider text-12">
                Síguenos:
              </span>
              <div className="flex flex-wrap gap-2 text-12 font-medium">
                <a
                  href={DATOS_NEGOCIO.redes.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-brand transition-colors"
                >
                  Instagram
                </a>
                <span>•</span>
                <a
                  href={DATOS_NEGOCIO.redes.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-brand transition-colors"
                >
                  TikTok
                </a>
                <span>•</span>
                <a
                  href={DATOS_NEGOCIO.redes.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-brand transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Columna 2: Tienda / Catálogo */}
          <div className="space-y-3">
            <h4 className="text-14 font-heading font-bold uppercase tracking-wider text-[#f58220]">
              Tienda
            </h4>
            <ul className="space-y-2 text-12">
              <li>
                <Link href="/productos" className="hover:text-[#f58220] transition-colors">
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link href="/categoria/cascos" className="hover:text-[#f58220] transition-colors">
                  Cascos certificados (+200)
                </Link>
              </li>
              <li>
                <Link href="/categoria/indumentaria" className="hover:text-[#f58220] transition-colors">
                  Indumentaria biker
                </Link>
              </li>
              <li>
                <Link href="/categoria/accesorios-moto" className="hover:text-[#f58220] transition-colors">
                  Accesorios para moto
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="hover:text-[#f58220] transition-colors text-[#f58220] font-bold">
                  Ofertas especiales
                </Link>
              </li>
              <li>
                <Link href="/combos" className="hover:text-[#f58220] transition-colors">
                  Combos y packs
                </Link>
              </li>
              <li>
                <Link href="/outlet" className="hover:text-[#f58220] transition-colors">
                  Outlet / Liquidación
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Ayuda & Servicio */}
          <div className="space-y-3">
            <h4 className="text-14 font-heading font-bold uppercase tracking-wider text-[#f58220]">
              Ayuda
            </h4>
            <ul className="space-y-2 text-12">
              <li>
                <Link href="/preguntas-frecuentes" className="hover:text-[#f58220] transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/politicas/envios-y-devoluciones" className="hover:text-[#f58220] transition-colors">
                  Envíos y devoluciones
                </Link>
              </li>
              <li>
                <Link href="/financiamiento" className="hover:text-[#f58220] transition-colors font-bold text-white">
                  Financiamiento con aCuotaz
                </Link>
              </li>
              <li>
                <Link href="/trabaja-con-nosotros" className="hover:text-[#f58220] transition-colors">
                  Trabaja con nosotros
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#f58220] transition-colors">
                  Blog &amp; Consejos Biker
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-[#f58220] transition-colors">
                  Contacto y ubicación
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Políticas Legales */}
          <div className="space-y-3">
            <h4 className="text-14 font-heading font-bold uppercase tracking-wider text-[#f58220]">
              Políticas Legales
            </h4>
            <ul className="space-y-2 text-12">
              <li>
                <Link href="/politicas/envios-y-devoluciones" className="hover:text-[#f58220] transition-colors">
                  Políticas de envío
                </Link>
              </li>
              <li>
                <Link href="/politicas/privacidad" className="hover:text-[#f58220] transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/politicas/terminos" className="hover:text-[#f58220] transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/marcas" className="hover:text-[#f58220] transition-colors">
                  Marcas representadas
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 5: Sedes en Lima con Horarios */}
          <div className="space-y-3">
            <h4 className="text-14 font-heading font-bold uppercase tracking-wider text-[#f58220]">
              Tiendas Físicas
            </h4>
            <div className="space-y-4 text-12">
              {TIENDAS_FISICAS.map((t) => (
                <div key={t.id} className="space-y-1 border-l-2 border-[#f58220] pl-3">
                  <p className="font-bold text-zinc-100">{t.nombre}</p>
                  <p className="text-zinc-400 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#f58220] mt-0.5" />
                    <span>{t.direccion}</span>
                  </p>
                  <p className="text-zinc-400 flex items-start gap-1">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-500 mt-0.5" />
                    <span>{t.horario}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección Libro de Reclamaciones & Medios de Pago */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Libro de reclamaciones obligatorio */}
            <Link
              href="/libro-de-reclamaciones"
              className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-[4px] hover:border-[#f58220] transition-colors group cursor-pointer"
            >
              <div className="w-9 h-9 bg-zinc-800 rounded-[2px] flex items-center justify-center text-[#f58220] group-hover:bg-[#f58220] group-hover:text-black transition">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-12 font-heading font-bold text-zinc-100 uppercase tracking-wide">
                  Libro de Reclamaciones
                </span>
                <span className="text-[10px] text-zinc-400">
                  RUC: 20610816089 • IORI S.A.C.
                </span>
              </div>
            </Link>

            {/* Medios de pago con aCuotaz */}
            <div className="text-12 text-zinc-400 bg-zinc-900 p-2.5 px-4 rounded-[4px] border border-zinc-800 flex items-center gap-3.5">
              <Image
                src="/brand/acuotaz-white.svg"
                alt="aCuotaz"
                width={72}
                height={20}
                className="h-4 sm:h-5 w-auto object-contain shrink-0"
              />
              <div>
                <span className="font-heading font-bold text-zinc-200 block mb-0.5 uppercase tracking-wider text-12">
                  Medios de pago:
                </span>
                <span className="text-12 text-zinc-300">
                  aCuotaz (cuotas sin tarjeta con DNI), Yape, Plin y Transferencias bancarias.
                </span>
              </div>
            </div>
          </div>

          <div className="text-center md:text-right text-12 text-zinc-500 space-y-1">
            <p>© {new Date().getFullYear()} IORI S.A.C. • RUC 20610816089. Todos los derechos reservados.</p>
            <p className="text-[11px] text-zinc-500">
              Independencia &amp; La Victoria, Lima - Perú.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
