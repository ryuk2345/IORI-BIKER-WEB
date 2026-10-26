import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, Truck, RotateCcw, FileText, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

interface PoliticaPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60;

interface PoliticaItem {
  slug: string;
  titulo: string;
  subtitulo: string;
  contenido: string;
  updated_at: string;
}

// Slugs oficiales y alias
const ALIAS_MAP: Record<string, string> = {
  envios: 'envios-y-devoluciones',
  cambios: 'envios-y-devoluciones',
  devoluciones: 'envios-y-devoluciones',
  'cambios-y-devoluciones': 'envios-y-devoluciones',
  'politica-de-privacidad': 'privacidad',
  'politicas-de-privacidad': 'privacidad',
  'terminos-y-condiciones': 'terminos',
};

const NAVEGACION_POLITICAS = [
  { slug: 'envios-y-devoluciones', label: 'Envíos y Devoluciones' },
  { slug: 'privacidad', label: 'Política de Privacidad' },
  { slug: 'terminos', label: 'Términos y Condiciones' },
];

async function getPolitica(slug: string): Promise<PoliticaItem | null> {
  const targetSlug = ALIAS_MAP[slug] || slug;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('politicas')
      .select('*')
      .eq('slug', targetSlug)
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.error('Error al consultar politica en Supabase:', err);
  }

  // Fallback estático de seguridad
  const FALLBACKS: Record<string, PoliticaItem> = {
    'envios-y-devoluciones': {
      slug: 'envios-y-devoluciones',
      titulo: 'Políticas de Envíos, Entregas y Devoluciones',
      subtitulo: 'Condiciones de entrega a nivel nacional y lineamientos de cambios y devoluciones.',
      contenido: `## 1. Cobertura Nacional y Agencias
Iori Biker Shop realiza envíos a todos los departamentos del Perú principalmente a través de Shalom, Marvisur y Olva Courier.

### Plazos estimados:
- **Lima Metropolitana:** 24 a 48 horas hábiles tras la verificación de stock y pago por WhatsApp.
- **Provincias:** 48 a 96 horas hábiles según la agencia y localidad de destino.

---

## 2. Recojo Gratuito en Tiendas
Puedes retirar tus productos sin costo de flete en nuestras 2 sedes en Lima:
- Sede Tahuantisuyo (Independencia): Av. Contisuyo #418.
- Sede La Victoria: Av. Nicolás Arriola 901.

---

## 3. Cambios y Devoluciones
- Los cambios de talla de cascos o indumentaria deben solicitarse en un plazo de hasta 7 días calendario tras recibir el producto.
- El producto debe mantenerse nuevo, sin uso y con etiquetas originales.
- Las condiciones y coordinación de cambio o nota de crédito se gestionan directamente a través de nuestro canal oficial de WhatsApp.`,
      updated_at: '2026-09-29T00:00:00Z',
    },
    privacidad: {
      slug: 'privacidad',
      titulo: 'Política de Privacidad y Tratamiento de Datos',
      subtitulo: 'Conforme a la Ley N° 29733 (Ley de Protección de Datos Personales en el Perú).',
      contenido: `## 1. Responsable del Tratamiento
IORI SAC (RUC 20610816089), con nombre comercial IORI BIKER SHOP, protege rigurosamente la privacidad de sus clientes y usuarios.

## 2. Finalidad del Tratamiento
Los datos personales proporcionados son empleados exclusivamente para:
1. Coordinar y formalizar pedidos mediante nuestro canal oficial de WhatsApp (+51 905 445 698).
2. Emisión de comprobantes de pago autorizados (boletas y facturas electrónicas).
3. Envío y despacho de productos con las agencias seleccionadas.
4. Evaluación preliminar de financiamiento directo.

## 3. Confidencialidad
No transferimos ni comercializamos tus datos con terceras partes para fines publicitarios.`,
      updated_at: '2026-09-29T00:00:00Z',
    },
    terminos: {
      slug: 'terminos',
      titulo: 'Términos y Condiciones Generales de Compra',
      subtitulo: 'Condiciones de registro de pedidos y adquisición de productos en Iori Biker Shop.',
      contenido: `## 1. Naturaleza de la Plataforma y Flujo de Compra
> **Flujo Oficial de Registro y Confirmación de Pedidos:**
> 1. La plataforma web de Iori Biker Shop opera como un catálogo digital inteligente con carrito de compras y generador de pedidos correlativos.
> 2. **La web NO procesa pagos en línea de forma automática ni cobra directamente tarjetas en pasarelas.**
> 3. Al completar el carrito y presionar "Enviar pedido por WhatsApp", el sistema registra un pedido formal en nuestra base de datos con código correlativo único (ejemplo: IORI-000001) y abre automáticamente el canal oficial (+51 905 445 698).
> 4. **El pedido se considera confirmado únicamente cuando el equipo de atención al cliente valida la disponibilidad real de stock en almacén y confirma la recepción válida del comprobante de pago por WhatsApp.**
> 5. **El precio y las condiciones válidas son estrictamente las registradas en el pedido del sistema web al momento de su generación**, garantizando al cliente que no habrá sobrecostos arbitrarios y protegiendo a la empresa ante alteraciones del texto del mensaje en WhatsApp por parte del usuario.

---

## 2. Precios y Moneda
Todos los precios están expresados en Soles Peruanos (PEN / S/) e incluyen el Impuesto General a las Ventas (IGV).

---

## 3. Garantías y Condiciones Comerciales
Los productos cuentan con garantía de fábrica por defectos de fabricación, coordinada con la marca y sujeta a evaluación técnica previa.`,
      updated_at: '2026-09-29T00:00:00Z',
    },
  };

  return FALLBACKS[targetSlug] || null;
}

export async function generateMetadata({ params }: PoliticaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const targetSlug = ALIAS_MAP[slug] || slug;
  const politica = await getPolitica(targetSlug);

  if (!politica) {
    return { title: 'Página no encontrada | Iori Biker Shop' };
  }
  return {
    title: `${politica.titulo} | Iori Biker Shop`,
    description: politica.subtitulo,
  };
}

export default async function PoliticaPage({ params }: PoliticaPageProps) {
  const { slug } = await params;

  // Si es un alias conocido como envios o cambios, redirigir a la URL limpia envios-y-devoluciones
  if (ALIAS_MAP[slug] && ALIAS_MAP[slug] !== slug) {
    redirect(`/politicas/${ALIAS_MAP[slug]}`);
  }

  const politica = await getPolitica(slug);

  if (!politica) {
    notFound();
  }

  // Renderizador simple de Markdown enriquecido para políticas
  const renderPoliticaContent = (rawText: string) => {
    const lineas = rawText.split('\n');
    return lineas.map((linea, idx) => {
      const l = linea.trim();
      if (!l) return <div key={idx} className="h-3" />;

      if (l.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-heading font-black text-xl sm:text-2xl uppercase tracking-wider text-black mt-8 mb-3 pb-2 border-b border-zinc-200">
            {l.replace('## ', '')}
          </h2>
        );
      }
      if (l.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-heading font-bold text-lg sm:text-xl uppercase text-zinc-900 mt-5 mb-2">
            {l.replace('### ', '')}
          </h3>
        );
      }
      if (l.startsWith('> ')) {
        const text = l.replace('> ', '');
        const isBorrador = text.includes('[BORRADOR PENDIENTE');
        return (
          <div
            key={idx}
            className={`p-4 sm:p-5 my-4 rounded-xl border-l-4 text-xs sm:text-sm leading-relaxed ${
              isBorrador
                ? 'bg-amber-50 border-amber-500 text-amber-950 font-medium'
                : 'bg-zinc-100 border-zinc-500 text-zinc-800'
            }`}
          >
            {isBorrador && (
              <div className="flex items-center gap-2 font-bold text-amber-800 uppercase tracking-wider mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Borrador en Revisión por el Cliente</span>
              </div>
            )}
            <p>{text.replace('**[BORRADOR PENDIENTE DE VALIDACIÓN POR CLIENTE]**', '')}</p>
          </div>
        );
      }
      if (l.startsWith('- ') || l.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-sm sm:text-base text-zinc-700 my-1 leading-relaxed">
            {l.slice(2)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(l)) {
        return (
          <li key={idx} className="ml-5 list-decimal text-sm sm:text-base text-zinc-700 my-1 leading-relaxed">
            {l.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (l === '---') {
        return <hr key={idx} className="my-6 border-zinc-200" />;
      }

      const hasPendiente = l.includes('[PENDIENTE');

      return (
        <p key={idx} className={`text-sm sm:text-base text-zinc-700 leading-relaxed my-2.5 ${hasPendiente ? 'bg-amber-50/50 p-2 rounded border border-amber-100' : ''}`}>
          {l}
        </p>
      );
    });
  };

  const fechaFormateada = new Date(politica.updated_at).toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="py-8 sm:py-16 bg-zinc-50 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-500">Centro Legal</span>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">{politica.titulo}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navegación lateral de políticas */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200 shadow-sm sticky top-28">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
              <FileText className="w-5 h-5 text-brand" />
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-black">
                Políticas y Términos Legales
              </h3>
            </div>

            <ul className="mt-4 space-y-2">
              {NAVEGACION_POLITICAS.map((it) => {
                const isActive = it.slug === slug || (ALIAS_MAP[slug] === it.slug);
                return (
                  <li key={it.slug}>
                    <Link
                      href={`/politicas/${it.slug}`}
                      className={`block px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-black text-white shadow-md border-l-4 border-brand'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
                      }`}
                    >
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 pt-6 border-t border-zinc-100 space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Canal de Soporte Legal
              </span>
              <p className="text-xs text-zinc-600">
                ¿Tienes dudas sobre alguna cláusula o necesitas copia de tus comprobantes de pago?
              </p>
              <a
                href="https://wa.me/51905445698?text=Hola%20Iori%20Biker%20Shop%2C%20tengo%20una%20consulta%20sobre%20sus%20pol%C3%ADticas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold uppercase rounded-xl transition-colors"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </aside>

          {/* Contenido principal */}
          <article className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-12 border border-zinc-200 shadow-sm">
            <span className="text-xs font-bold text-brand uppercase tracking-widest bg-orange-100 text-brand px-3 py-1 rounded-full">
              Iori Biker Shop • Marco Institucional
            </span>

            <h1 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-wider text-black mt-4 mb-3">
              {politica.titulo}
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 font-medium leading-relaxed mb-6">
              {politica.subtitulo}
            </p>

            <div className="flex items-center gap-2 text-xs text-zinc-400 pb-6 border-b border-zinc-100">
              <Clock className="w-3.5 h-3.5 text-brand" />
              <span>Última revisión: {fechaFormateada}</span>
            </div>

            <div className="pt-6">
              {renderPoliticaContent(politica.contenido)}
            </div>

            {/* Nota de validez legal */}
            <div className="mt-12 p-5 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-start gap-3.5 text-xs text-zinc-600">
              <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Este documento rige para todas las operaciones comerciales, compras y pedidos coordinados a través de nuestro canal oficial de WhatsApp y tiendas físicas de IORI SAC (RUC 20610816089).
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
