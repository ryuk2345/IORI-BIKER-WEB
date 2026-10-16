'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2 } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!aceptoTerminos) {
      setError('Debes aceptar los términos y condiciones para suscribirte.');
      return;
    }

    setError('');
    setIsSubmitted(true);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#16161a] text-white border-t border-zinc-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div>
            <span className="text-xs font-black uppercase text-amber-500 tracking-widest block mb-2 font-[family-name:var(--font-heading)]">
              COMUNIDAD IORI BIKER
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line text-line--center">
              ¡SUSCRÍBETE A NUESTRO NEWSLETTER!
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400">
              Recibe antes que nadie promociones relámpago, cupones de descuento y novedades de cascos certificados.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 bg-zinc-900/90 rounded-2xl border border-emerald-500/50 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <p className="text-sm font-bold text-white">¡Gracias por unirte a la ruta!</p>
              <p className="text-xs text-zinc-400">
                Te hemos enviado un correo de bienvenida con tu primer beneficio exclusivo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="newsletter-email" className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Correo Electrónico <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full bg-[#202026] border border-zinc-700 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="newsletter-phone" className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Teléfono celular (opcional)
                  </label>
                  <input
                    id="newsletter-phone"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+51 900 000 000"
                    className="w-full bg-[#202026] border border-zinc-700 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Checkbox de Términos */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="acepto-terminos"
                  type="checkbox"
                  checked={aceptoTerminos}
                  onChange={(e) => setAceptoTerminos(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="acepto-terminos" className="text-[11px] text-zinc-400">
                  Acepto los{' '}
                  <Link href="/politicas/terminos" className="text-amber-400 hover:underline">
                    Términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link href="/politicas/privacidad" className="text-amber-400 hover:underline">
                    Política de privacidad
                  </Link>
                  .
                </label>
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-400">{error}</p>
              )}

              <div className="text-center pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <Send className="w-4 h-4" />
                  <span>SUSCRIBIRME</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
