'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, Truck, CreditCard, RotateCcw, Ruler, Phone, 
  ChevronDown, MessageCircle, Store, ShoppingBag, ShieldCheck, 
  BadgePercent, AlertCircle, Loader2 
} from 'lucide-react';
import { DATOS_NEGOCIO } from '@/data/mock';
import { createClient } from '@/lib/supabase/client';

interface FaqItem {
  id: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
  orden: number;
  activo: boolean;
}

const CATEGORIAS_FAQS = [
  { id: 'todos', label: 'Todas las preguntas', icon: HelpCircle },
  { id: 'compra-whatsapp', label: 'Compra por WhatsApp', icon: ShoppingBag },
  { id: 'pagos', label: 'Métodos de Pago', icon: CreditCard },
  { id: 'envios', label: 'Envíos y Provincias', icon: Truck },
  { id: 'recojo', label: 'Recojo en Tiendas', icon: Store },
  { id: 'financiamiento', label: 'Financiamiento Propio', icon: BadgePercent },
  { id: 'garantia-cambios', label: 'Garantías y Cambios', icon: RotateCcw },
];

export default function PreguntasFrecuentesPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('preguntas_frecuentes')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (error || !data || data.length === 0) {
          // Fallback predeterminado
          setFaqs([
            {
              id: 'faq-1',
              categoria: 'compra-whatsapp',
              pregunta: '¿Cómo comprar por WhatsApp en Iori Biker Shop?',
              respuesta: '1) Agrega tus productos al carrito. 2) Ve a /carrito y haz clic en "Enviar pedido por WhatsApp". 3) El sistema registra tu código correlativo (ej. IORI-000001) y abre WhatsApp al +51 905 445 698. 4) Nuestro equipo valida stock en tiempo real y te envía las cuentas o QR de pago.',
              orden: 1,
              activo: true,
            },
            {
              id: 'faq-2',
              categoria: 'pagos',
              pregunta: '¿Cuáles son los métodos de pago disponibles?',
              respuesta: 'Aceptamos transferencias bancarias directas e interbancarias (BCP, BBVA, Interbank), billeteras digitales (Yape y Plin) y pago con tarjeta o efectivo en nuestras tiendas físicas de Independencia y La Victoria.',
              orden: 2,
              activo: true,
            },
            {
              id: 'faq-3',
              categoria: 'envios',
              pregunta: '¿Cómo funcionan los envíos a Lima y provincias?',
              respuesta: 'En Lima entregamos en 24 a 48 horas hábiles. Para provincias, despachamos con Shalom, Mavisur y Olva Courier con envío de guía de tracking y clave de recojo por WhatsApp.',
              orden: 3,
              activo: true,
            },
            {
              id: 'faq-4',
              categoria: 'recojo',
              pregunta: '¿Puedo recoger mi pedido personalmente en sus tiendas?',
              respuesta: '¡Sí, totalmente gratis! Contamos con sedes en Sede Independencia (Av. Contisuyo 418, Tahuantinsuyo) y Sede La Victoria (Av. Nicolás Arriola 901).',
              orden: 4,
              activo: true,
            },
          ]);
        } else {
          setFaqs(data);
        }
      } catch (err) {
        console.error('Error al cargar faqs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFaqs();
  }, []);

  const filteredFaqs = activeTab === 'todos' 
    ? faqs 
    : faqs.filter((f) => f.categoria === activeTab);

  return (
    <div className="py-8 sm:py-16 bg-zinc-50 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Preguntas Frecuentes</span>
        </nav>

        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand uppercase tracking-widest bg-orange-100 text-brand px-3 py-1 rounded-full">
            Centro de Respuestas Biker
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-wider text-black mt-3 mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            Resolvemos de forma transparente tus dudas sobre compras por WhatsApp, validación de stock, formas de pago (Yape/Plin/Transferencias), envíos a nivel nacional y recojo en tiendas.
          </p>
        </div>

        {/* Selector de Categorías Temáticas */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {CATEGORIAS_FAQS.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id);
                  setOpenIndex(0);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-md scale-105'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:border-brand hover:text-brand shadow-xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-zinc-500'}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Acordeón de FAQs */}
        <div className="max-w-3xl mx-auto mb-14">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
              <span className="text-xs font-bold uppercase">Cargando preguntas frecuentes...</span>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-zinc-200 text-center text-zinc-500 text-sm">
              No hay preguntas registradas en este tema por el momento.
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                const esPendiente = faq.respuesta.includes('[PENDIENTE');

                return (
                  <div
                    key={faq.id || idx}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                      isOpen ? 'border-brand/40 shadow-md ring-2 ring-brand/10' : 'border-zinc-200 shadow-xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 flex items-center justify-between text-left font-heading font-bold text-base sm:text-lg text-zinc-900 hover:text-brand cursor-pointer gap-4"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? 'text-brand' : 'text-zinc-400'}`} />
                        <span>{faq.pregunta}</span>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 transition-transform duration-300 shrink-0 ${
                          isOpen ? 'rotate-180 text-brand' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 bg-zinc-50/50 space-y-3 animate-in fade-in">
                        <p>{faq.respuesta.replace(/\[PENDIENTE.*?\]/gi, '').trim()}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Guía de Tallas para Cascos y Guantes */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200 shadow-xs mb-14">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
            <Ruler className="w-6 h-6 text-brand" />
            <div>
              <h2 className="font-heading font-black text-xl uppercase tracking-wider text-black">
                Guía Rápida de Medidas (Cascos y Guantes)
              </h2>
              <p className="text-xs text-zinc-500">
                Asegura tu comodidad y protección midiendo tu contorno con cinta métrica.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-800 mb-2.5">
                🪖 Cascos Certificados (Contorno de Cabeza)
              </h4>
              <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase">
                    <tr>
                      <th className="p-2.5 border-b">Talla</th>
                      <th className="p-2.5 border-b">Centímetros</th>
                      <th className="p-2.5 border-b">Ajuste recomendado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    <tr><td className="p-2.5 font-bold">S</td><td className="p-2.5">55 - 56 cm</td><td className="p-2.5 text-zinc-500">Muy ceñido</td></tr>
                    <tr className="bg-orange-50/50"><td className="p-2.5 font-bold text-brand">M</td><td className="p-2.5">57 - 58 cm</td><td className="p-2.5 text-zinc-500">Promedio Perú</td></tr>
                    <tr className="bg-orange-50/50"><td className="p-2.5 font-bold text-brand">L</td><td className="p-2.5">59 - 60 cm</td><td className="p-2.5 text-zinc-500">Promedio Perú</td></tr>
                    <tr><td className="p-2.5 font-bold">XL</td><td className="p-2.5">61 - 62 cm</td><td className="p-2.5 text-zinc-500">Holgado</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-800 mb-2.5">
                🧤 Guantes Biker (Ancho de Palma)
              </h4>
              <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase">
                    <tr>
                      <th className="p-2.5 border-b">Talla</th>
                      <th className="p-2.5 border-b">Ancho Palma</th>
                      <th className="p-2.5 border-b">Largo Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    <tr><td className="p-2.5 font-bold">M</td><td className="p-2.5">8.0 - 8.5 cm</td><td className="p-2.5">18 - 19 cm</td></tr>
                    <tr className="bg-orange-50/50"><td className="p-2.5 font-bold text-brand">L</td><td className="p-2.5">8.5 - 9.0 cm</td><td className="p-2.5">19 - 20 cm</td></tr>
                    <tr><td className="p-2.5 font-bold">XL</td><td className="p-2.5">9.0 - 9.5 cm</td><td className="p-2.5">20 - 21 cm</td></tr>
                    <tr><td className="p-2.5 font-bold">XXL</td><td className="p-2.5">&gt; 9.5 cm</td><td className="p-2.5">&gt; 21 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Card Final */}
        <div className="bg-black text-white rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl border-b-4 border-brand">
          <MessageCircle className="w-12 h-12 text-[#25D366] mx-auto mb-3" />
          <h3 className="font-heading font-bold text-2xl uppercase tracking-wider mb-2">
            ¿Tu pregunta no está aquí?
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm mb-6 leading-relaxed">
            Escríbenos directamente a nuestro WhatsApp oficial (+51 905 445 698). Un asesor motero te responderá en minutos con fotos y detalles.
          </p>
          <a
            href={DATOS_NEGOCIO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-heading font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg active:scale-95"
          >
            <Phone className="w-4 h-4" /> Escribir al WhatsApp (+51 905 445 698)
          </a>
        </div>
      </div>
    </div>
  );
}
