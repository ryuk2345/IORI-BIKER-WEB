'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Phone, MessageCircle, Clock, Mail, Send, 
  CheckCircle2, AlertCircle, Loader2, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { DATOS_NEGOCIO } from '@/data/mock';

export default function ContactoPage() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    email: '',
    motivo: 'Consulta sobre cascos certificados',
    mensaje: '',
    acepta_privacidad: false,
    _hp: '', // honeypot antispam
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.acepta_privacidad) {
      setErrorMsg('Debes aceptar la política de privacidad para enviar tu mensaje.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Ocurrió un error al enviar tu mensaje');
      }

      setEnviado(true);
      setFormData({
        nombre: '',
        celular: '',
        email: '',
        motivo: 'Consulta sobre cascos certificados',
        mensaje: '',
        acepta_privacidad: false,
        _hp: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'No pudimos registrar tu mensaje. Inténtalo nuevamente o escríbenos a WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-16 bg-zinc-50 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Contacto</span>
        </nav>

        {/* Encabezado */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold text-brand uppercase tracking-widest bg-orange-100 text-brand px-3 py-1 rounded-full">
            Estamos para Asesorarte
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-wider text-black mt-3 mb-4">
            Contáctanos en Iori Biker Shop
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Visita nuestras 2 tiendas físicas en Lima o escríbenos directamente. Resolveremos tus dudas sobre compatibilidad de accesorios, tallas de cascos certificados, financiamiento y envíos asegurados a todo el Perú.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Las 2 Tiendas y Canales Directos */}
          <div className="lg:col-span-6 space-y-6">
            {/* WhatsApp Card Destacada */}
            <div className="bg-black text-white p-6 sm:p-8 rounded-2xl shadow-lg border-l-4 border-brand">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg uppercase tracking-wider">
                    WhatsApp Oficial de Ventas y Soporte
                  </h3>
                  <p className="text-xs text-zinc-400">Atención rápida y personalizada de lunes a domingo</p>
                </div>
              </div>
              <p className="text-sm text-zinc-300 mb-5 leading-relaxed">
                El canal más veloz para confirmar stock, pedir fotos reales y cotizar despachos a tu provincia con clave de retiro.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={DATOS_NEGOCIO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-heading font-bold uppercase text-xs tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  Escribir al {DATOS_NEGOCIO.whatsapp}
                </a>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Mail className="w-4 h-4 text-brand" />
                  <span>{DATOS_NEGOCIO.correo}</span>
                </div>
              </div>
            </div>

            {/* Sede 1: Tahuantisuyo (Independencia) */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-brand uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                    Tienda Principal • Lima Norte
                  </span>
                  <h3 className="font-heading font-bold text-xl uppercase text-zinc-900 mt-1">
                    Sede Tahuantisuyo (Independencia)
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="font-medium text-zinc-800">{DATOS_NEGOCIO.tiendaPrincipal.direccion}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900">Horarios de Atención:</span>
                    <p className="text-zinc-700 mt-0.5">{DATOS_NEGOCIO.tiendaPrincipal.horario}</p>
                  </div>
                </div>
              </div>

              {/* Mapa embebido Sede 1 */}
              <div className="w-full h-44 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 relative">
                <iframe
                  title="Mapa Sede Tahuantisuyo Independencia"
                  src="https://maps.google.com/maps?q=Av.+Contisuyo+418,+Independencia,+Lima,+Peru&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <a
                  href={DATOS_NEGOCIO.tiendaPrincipal.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir en Google Maps
                </a>
                <a
                  href={`https://wa.me/51905445698?text=${encodeURIComponent('Hola Iori Biker Shop, deseo consultar stock o atención en la Sede Tahuantisuyo (Independencia)')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-brand text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Consultar Sede
                </a>
              </div>
            </div>

            {/* Sede 2: La Victoria */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-brand uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                    Segunda Sede • La Victoria
                  </span>
                  <h3 className="font-heading font-bold text-xl uppercase text-zinc-900 mt-1">
                    Sede La Victoria (Nicolás Arriola)
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="font-medium text-zinc-800">{DATOS_NEGOCIO.tiendaSecundaria.direccion}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900">Horarios de Atención:</span>
                    <p className="text-zinc-700 mt-0.5">{DATOS_NEGOCIO.tiendaSecundaria.horario}</p>
                  </div>
                </div>
              </div>

              {/* Mapa embebido Sede 2 */}
              <div className="w-full h-44 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 relative">
                <iframe
                  title="Mapa Sede La Victoria"
                  src="https://maps.google.com/maps?q=Av.+Nicolás+Arriola+901,+La+Victoria,+Lima,+Peru&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <a
                  href={DATOS_NEGOCIO.tiendaSecundaria.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir en Google Maps
                </a>
                <a
                  href={`https://wa.me/51905445698?text=${encodeURIComponent('Hola Iori Biker Shop, deseo consultar stock o atención en la Sede La Victoria')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-brand text-xs font-bold uppercase rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Consultar Sede
                </a>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Contacto que guarda en Supabase */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm sticky top-24">
            <div className="mb-6">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                Bandeja Oficial
              </span>
              <h2 className="font-heading font-bold text-2xl uppercase tracking-wider text-black mt-1">
                Envíanos un Mensaje
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Tu mensaje llegará directamente al panel de atención de Iori Biker Shop para una respuesta prioritaria.
              </p>
            </div>

            {enviado ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-black text-xl uppercase text-emerald-950">
                  ¡Mensaje Enviado con Éxito!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                  Hemos registrado tu consulta en nuestro sistema central. Uno de nuestros asesores especializados te responderá al celular o correo brindado en breve.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setEnviado(false)}
                    className="px-5 py-2.5 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold uppercase rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Enviar otro mensaje
                  </button>
                  <a
                    href={DATOS_NEGOCIO.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#1EBE5D] transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" /> Escribir por WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot oculto contra robots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="_hp_contacto">No rellenar este campo</label>
                  <input
                    id="_hp_contacto"
                    type="text"
                    name="_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData._hp}
                    onChange={(e) => setFormData({ ...formData, _hp: e.target.value })}
                  />
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Nombre Completo <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez Quispe"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                      Celular / WhatsApp <span className="text-brand">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="987 654 321"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Motivo del Contacto
                  </label>
                  <select
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white"
                  >
                    <option value="Consulta sobre cascos certificados">Consulta sobre cascos certificados (ECE / DOT)</option>
                    <option value="Asesoría de tallas y medidas">Asesoría de tallas y medidas</option>
                    <option value="Costos y agencias para envíos a provincias">Costos y agencias para envíos a provincias (Shalom/Mavisur)</option>
                    <option value="Consulta de financiamiento propio">Consulta de financiamiento propio</option>
                    <option value="Ventas por mayor o convenios">Ventas corporativas o por mayor</option>
                    <option value="Atención posventa / Garantías">Atención posventa / Garantías</option>
                    <option value="Otro asunto">Otro asunto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Tu Mensaje o Consulta <span className="text-brand">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escribe aquí los modelos de tu interés o dudas específicas..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>

                {/* Checkbox obligatorio de política de privacidad */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acepta_privacidad}
                      onChange={(e) => setFormData({ ...formData, acepta_privacidad: e.target.checked })}
                      className="mt-0.5 rounded border-zinc-300 text-brand focus:ring-brand h-4 w-4"
                    />
                    <span className="text-xs text-zinc-600 leading-tight">
                      He leído y acepto la{' '}
                      <Link href="/politicas/privacidad" target="_blank" className="text-brand font-bold underline hover:text-black">
                        Política de Privacidad y Tratamiento de Datos
                      </Link>
                      . Autorizo el contacto para la resolución de mi consulta.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Registrando Consulta...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Enviar Mensaje a Iori Biker Shop
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
