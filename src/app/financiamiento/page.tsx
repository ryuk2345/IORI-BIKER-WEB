'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  CheckCircle2, 
  MessageCircle, 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard 
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/utils/whatsappTemplates';

export default function FinanciamientoPage() {
  const wspUrl = `https://wa.me/51905445698?text=${encodeURIComponent('Hola, quiero comprar en cuotas con aCuotaz')}`;

  const pasos = [
    {
      paso: '01',
      icono: ShoppingBag,
      titulo: 'Eliges tus productos',
      descripcion: 'Explora nuestro catálogo y agrega los cascos, indumentaria o accesorios que necesitas a tu carrito de compras.',
    },
    {
      paso: '02',
      icono: CreditCard,
      titulo: 'En el carrito marcas "En cuotas con aCuotaz"',
      descripcion: 'En la sección de pago, selecciona aCuotaz. Verás la cuota quincenal estimada calculada para el total de tu pedido.',
    },
    {
      paso: '03',
      icono: MessageCircle,
      titulo: 'Envías tu pedido por WhatsApp',
      descripcion: 'Haz clic en "Enviar pedido por WhatsApp". Se registrará tu orden con código oficial (ej. IORI-000001) y nos llegará el detalle completo.',
    },
    {
      paso: '04',
      icono: FileText,
      titulo: 'Te mandamos el enlace de aCuotaz y solo necesitas tu DNI',
      descripcion: 'Atención al cliente te envía tu enlace directo de aCuotaz. Ingresas con tu DNI, recibes tu aprobación en segundos y coordinamos la entrega.',
    },
  ];

  const requisitos = [
    {
      titulo: 'DNI vigente',
      descripcion: 'Documento Nacional de Identidad peruano físico o electrónico en buen estado.',
      confirmar: true,
    },
    {
      titulo: 'No estar reportado en Infocorp',
      descripcion: 'Historial crediticio regular sin registros morosos graves en centrales de riesgo.',
      confirmar: true,
    },
    {
      titulo: 'Celular activo a tu nombre',
      descripcion: 'Línea telefónica activa para recibir los códigos de verificación por SMS o WhatsApp.',
      confirmar: false,
    },
    {
      titulo: 'Mayor de 18 años',
      descripcion: 'Contar con la mayoría de edad y capacidad legal de contratación en el Perú.',
      confirmar: false,
    },
  ];

  const faqs = [
    {
      pregunta: '¿Necesito tarjeta de crédito para comprar en cuotas?',
      respuesta: 'No. El financiamiento de aCuotaz no requiere tarjeta de crédito ni de débito bancaria; la evaluación se realiza exclusivamente con tu DNI vigente.',
    },
    {
      pregunta: '¿En cuántas cuotas puedo pagar?',
      respuesta: 'Puedes financiar tu compra en cuotas quincenales (habitualmente hasta 9 o 12 cuotas referenciales), adaptadas al monto total de tu pedido.',
    },
    {
      pregunta: '¿Cuál es el monto mínimo y máximo para financiar?',
      respuesta: 'El monto mínimo referencial es de S/ 100.00 y el máximo de S/ 2,000.00 por evaluación digital inmediata. Para montos superiores, nuestro equipo te asiste por WhatsApp.',
    },
    {
      pregunta: '¿Cuánto demora la aprobación de mi solicitud?',
      respuesta: 'La evaluación con aCuotaz es 100% digital e instantánea. En solo un par de minutos sabrás si tu financiamiento ha sido aprobado.',
    },
    {
      pregunta: '¿Dónde y cómo pago mis cuotas quincenales?',
      respuesta: 'aCuotaz te proporcionará los canales oficiales de recaudación para realizar tus abonos mediante banca móvil, agentes autorizados y billeteras digitales.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Header / Hero con Logo Oficial aCuotaz */}
      <section className="bg-zinc-950 text-white py-14 sm:py-20 border-b border-zinc-800">
        <div className="container-iori max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-[4px]">
            <Image
              src="/brand/acuotaz-white.svg"
              alt="aCuotaz"
              width={90}
              height={26}
              className="h-6 w-auto object-contain"
              priority
            />
            <span className="text-12 font-heading font-bold uppercase tracking-wider text-zinc-300 border-l border-zinc-700 pl-3">
              Financiamiento en Cuotas
            </span>
          </div>

          <h1 className="text-32 sm:text-40 font-heading font-bold uppercase tracking-tight text-white">
            COMPRA TU EQUIPAMIENTO MOTERO EN CUOTAS CON ACUOTAZ
          </h1>

          <p className="text-14 sm:text-16 text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Divide el pago de tus cascos certificados, casacas con protección y accesorios sin tarjeta de crédito. Todo el proceso es digital, transparente y se coordina de manera directa por WhatsApp.
          </p>

          <div className="pt-2 flex justify-center">
            <a
              href={wspUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#F58220] hover:bg-[#E07216] text-zinc-950 font-heading font-black text-14 uppercase tracking-wider px-6 py-3.5 rounded-[4px] shadow-lg transition active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Consultar financiamiento por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Cómo funciona en 4 pasos */}
      <section className="section-py border-b border-zinc-200">
        <div className="container-iori">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-12 font-heading font-bold uppercase tracking-wider text-[#F58220]">
              Proceso Simple y Rápido
            </span>
            <h2 className="text-24 sm:text-32 font-heading font-bold uppercase text-zinc-950">
              ¿CÓMO FUNCIONA EN 4 PASOS?
            </h2>
            <p className="text-14 text-zinc-600">
              Sin trámites bancarios complejos ni papeleos presenciales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pasos.map((p, idx) => {
              const IconComponent = p.icono;
              return (
                <div
                  key={idx}
                  className="p-6 bg-zinc-50 border border-zinc-200 rounded-[4px] flex flex-col justify-between space-y-4 hover:border-zinc-400 transition"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-24 font-heading font-black text-[#F58220]">
                        {p.paso}
                      </span>
                      <div className="w-10 h-10 bg-white border border-zinc-200 rounded-[4px] flex items-center justify-center text-zinc-900">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-16 font-heading font-bold uppercase text-zinc-950 leading-tight">
                      {p.titulo}
                    </h3>

                    <p className="text-13 text-zinc-600 leading-relaxed">
                      {p.descripcion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Requisitos */}
      <section className="section-py bg-[#F5F5F5] border-b border-zinc-200">
        <div className="container-iori max-w-4xl">
          <div className="text-center mb-10 space-y-2">
            <span className="text-12 font-heading font-bold uppercase tracking-wider text-[#F58220]">
              Condiciones de Evaluación
            </span>
            <h2 className="text-24 sm:text-32 font-heading font-bold uppercase text-zinc-950">
              REQUISITOS BÁSICOS
            </h2>
            <p className="text-14 text-zinc-600">
              Verifica que cumples con estos puntos para agilizar tu crédito inmediato.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requisitos.map((req, idx) => (
              <div
                key={idx}
                className="p-5 bg-white border border-zinc-200 rounded-[4px] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h3 className="font-heading font-bold text-14 uppercase text-zinc-950">
                      {req.titulo}
                    </h3>
                  </div>
                  {req.confirmar && (
                    <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-[2px]">
                      A confirmar con aCuotaz
                    </span>
                  )}
                </div>
                <p className="text-12 text-zinc-600 pl-7 leading-relaxed">
                  {req.descripcion}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-zinc-100 border border-zinc-300 rounded-[4px] text-12 text-zinc-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-zinc-800 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Aviso legal:</strong> Los montos y cuotas calculados en el sitio web son estrictamente referenciales. La aprobación final, línea de crédito y tasa aplicable corresponden de forma exclusiva a las políticas de riesgo de <strong>aCuotaz (Apurata)</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Preguntas Frecuentes */}
      <section className="section-py border-b border-zinc-200">
        <div className="container-iori max-w-3xl">
          <div className="text-center mb-10 space-y-2">
            <span className="text-12 font-heading font-bold uppercase tracking-wider text-[#F58220]">
              Resolvemos tus dudas
            </span>
            <h2 className="text-24 sm:text-32 font-heading font-bold uppercase text-zinc-950">
              PREGUNTAS FRECUENTES
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className="p-5 bg-zinc-50 border border-zinc-200 rounded-[4px] space-y-2"
              >
                <h3 className="text-14 font-heading font-bold uppercase text-zinc-950 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#F58220] shrink-0 mt-0.5" />
                  <span>{f.pregunta}</span>
                </h3>
                <p className="text-13 text-zinc-600 pl-6 leading-relaxed">
                  {f.respuesta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Final WhatsApp */}
      <section className="py-14 sm:py-16 bg-white text-center">
        <div className="container-iori max-w-2xl space-y-6">
          <h2 className="text-24 sm:text-32 font-heading font-bold uppercase text-zinc-950">
            ¿LISTO PARA RENOVAR TU EQUIPO BIKER?
          </h2>
          <p className="text-14 text-zinc-600">
            Conversa con uno de nuestros asesores técnicos por WhatsApp y te ayudaremos paso a paso con tu compra en cuotas.
          </p>
          <a
            href={wspUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#F58220] hover:bg-[#E07216] text-zinc-950 font-heading font-black text-14 uppercase tracking-wider px-8 py-4 rounded-[4px] shadow-lg transition active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Hola, quiero comprar en cuotas con aCuotaz</span>
          </a>
        </div>
      </section>
    </div>
  );
}
