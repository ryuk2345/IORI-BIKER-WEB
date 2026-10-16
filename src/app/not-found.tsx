import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, ShoppingBag, MessageCircle, Home, ShieldAlert } from 'lucide-react';
import { MENSAJE_BOTON_FLOTANTE, buildWhatsAppUrl } from '@/utils/whatsappTemplates';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white relative overflow-hidden">
      {/* Fondo estético con brillo sutil de marca */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/40 via-zinc-950 to-black pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        {/* Badge 404 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-950/80 border border-[#f58220]/50 text-[#f58220] text-xs font-black uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4" /> Error 404 • Ruta No Encontrada
        </div>

        {/* Título de impacto */}
        <div className="space-y-3">
          <h1 className="font-heading font-black text-6xl sm:text-8xl tracking-tight text-white uppercase">
            ¡CURVA <span className="text-[#f58220]">EQUIVOCADA!</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
            Parece que te saliste de la pista. La página que estás buscando no existe, ha cambiado de lugar o fue dada de baja temporalmente.
          </p>
        </div>

        {/* Accesos Rápidos */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white font-heading font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Volver a la Pista (Inicio)
          </Link>

          <Link
            href="/productos"
            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-heading font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" /> Ver Catálogo Completo
          </Link>
        </div>

        {/* Categorías populares de rescate */}
        <div className="pt-8 border-t border-zinc-800/80 space-y-3">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">
            ¿Buscabas alguno de estos productos?
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Cascos Certificados', href: '/categoria/cascos' },
              { label: 'Guantes', href: '/categoria/guantes' },
              { label: 'Casacas Moteras', href: '/categoria/casacas' },
              { label: 'Intercomunicadores', href: '/categoria/intercomunicadores' },
              { label: 'Ofertas Esparta', href: '/promo/esparta' },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Botón de auxilio por WhatsApp */}
        <div className="pt-4 text-xs text-zinc-500">
          ¿Problemas para encontrar un repuesto o talla?{' '}
          <a
            href={buildWhatsAppUrl(MENSAJE_BOTON_FLOTANTE)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f58220] hover:underline font-bold inline-flex items-center gap-1 ml-1"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Escríbenos a WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
