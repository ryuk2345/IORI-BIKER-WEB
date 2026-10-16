'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Truck, RotateCcw, Ruler, HelpCircle, PhoneCall, ArrowRight } from 'lucide-react';

const CARDS_AYUDA = [
  {
    id: 'pagos',
    titulo: 'Pagos y Métodos',
    descripcion: 'Yape, Plin, transferencias BCP/BBVA/Interbank y pagos con tarjeta o efectivo en sedes físicas.',
    icono: CreditCard,
    enlace: '/preguntas-frecuentes#pagos',
  },
  {
    id: 'envios',
    titulo: 'Envíos y Entregas',
    descripcion: 'Despachos diarios a todo el Perú por Shalom y Mavisur, y retiro gratuito en nuestras 2 tiendas de Lima.',
    icono: Truck,
    enlace: '/preguntas-frecuentes#envios',
  },
  {
    id: 'cambios',
    titulo: 'Cambios y Garantías',
    descripcion: 'Asistencia y soporte directo en caso de requerir cambio de talla de casco o indumentaria.',
    icono: RotateCcw,
    enlace: '/preguntas-frecuentes#cambios',
  },
  {
    id: 'tallas',
    titulo: 'Guía de Tallas',
    descripcion: 'Aprende a medir el contorno de tu cabeza y palma de mano para un ajuste perfecto de seguridad.',
    icono: Ruler,
    enlace: '/preguntas-frecuentes#tallas',
  },
  {
    id: 'faqs',
    titulo: 'Preguntas Frecuentes',
    descripcion: 'Respuestas inmediatas sobre stock, comprobantes, tiempos de viaje y asesoría técnica motera.',
    icono: HelpCircle,
    enlace: '/preguntas-frecuentes',
  },
  {
    id: 'contacto',
    titulo: 'Contáctanos',
    descripcion: 'Atención personalizada al 905445698 (+51 905 445 698) y visita nuestras sedes en Independencia y La Victoria.',
    icono: PhoneCall,
    enlace: '/contacto',
  },
];

export function HelpCards() {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand uppercase tracking-widest font-[family-name:var(--font-heading)]">
            SOPORTE Y ASISTENCIA BIKER
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold uppercase font-[family-name:var(--font-heading)] tracking-wider text-line text-line--center mt-1">
            ¿NECESITAS AYUDA CON TU COMPRA?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-normal">
            Te acompañamos antes, durante y después de tu compra para que ruedes tranquilo por cualquier ruta del Perú.
          </p>
        </div>

        {/* 6 Cards de Ayuda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS_AYUDA.map((card) => {
            const Icon = card.icono;
            return (
              <Link
                key={card.id}
                href={card.enlace}
                className="group p-6 bg-zinc-50 hover:bg-white rounded-2xl border border-zinc-200 hover:border-brand shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-orange-50 transition-transform">
                    <Icon className="w-7 h-7 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider text-zinc-900 group-hover:text-brand transition-colors font-[family-name:var(--font-heading)]">
                      {card.titulo}
                    </h3>
                    <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                      {card.descripcion}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-200 flex items-center justify-between text-xs font-bold text-brand group-hover:underline">
                  <span>Consultar</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/preguntas-frecuentes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-brand text-white hover:text-black font-heading font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
          >
            Ver Centro de Preguntas Frecuentes Completo &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
