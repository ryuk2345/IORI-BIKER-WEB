import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  CheckCircle2, Clock, MessageCircle, Copy, AlertTriangle, 
  MapPin, FileText, ShoppingBag, ShieldCheck, ArrowRight, 
  ExternalLink, Phone, CreditCard 
} from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPEN } from '@/utils/currency';
import { BotonCopiarMensaje } from './BotonCopiarMensaje';

interface PedidoPageProps {
  params: Promise<{
    token: string;
  }>;
}

export const revalidate = 0; // Siempre dinámico para ver estados en tiempo real

export async function generateMetadata({ params }: PedidoPageProps): Promise<Metadata> {
  const { token } = await params;
  return {
    title: `Detalle de Pedido | Iori Biker Shop`,
    description: `Seguimiento en línea de tu pedido registrado en Iori Biker Shop.`,
  };
}

async function getPedidoPorToken(token: string) {
  try {
    const supabase = createAdminClient();
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select('*, pedido_items(*)')
      .eq('token', token)
      .single();

    if (error || !pedido) return null;

    // Obtener datos de pago configurados en ajustes
    const { data: ajustesPago } = await supabase
      .from('ajustes_generales')
      .select('valor')
      .eq('clave', 'datos_pago_plantillas')
      .single();

    return {
      pedido,
      datosPago: ajustesPago?.valor || null,
    };
  } catch (err) {
    console.error('Error obteniendo pedido por token:', err);
    return null;
  }
}

// Función para comprobar si es fuera de horario de atención
function isFueraDeHorario(): boolean {
  // Hora de Lima (UTC-5)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const limaTime = new Date(utc - 5 * 3600000);
  const day = limaTime.getDay(); // 0: Dom, 1-6: Lun-Sáb
  const hour = limaTime.getHours();

  if (day === 0) {
    // Domingo: 11:00 am a 8:00 pm (20:00)
    return hour < 11 || hour >= 20;
  } else {
    // Lunes a Sábado: 9:00 am a 10:00 pm (22:00)
    return hour < 9 || hour >= 22;
  }
}

export default async function PedidoTokenPage({ params }: PedidoPageProps) {
  const { token } = await params;
  const data = await getPedidoPorToken(token);

  if (!data || !data.pedido) {
    notFound();
  }

  const { pedido, datosPago } = data;
  const fueraDeHorario = isFueraDeHorario();

  // Reconstruir mensaje de WhatsApp para el Plan B (reintentar / copiar)
  const itemsLista = (pedido.pedido_items || pedido.items || [])
    .map(
      (it: any) =>
        `• ${it.cantidad} x ${it.producto_nombre} ${it.variante_nombre ? `(${it.variante_nombre})` : ''} · SKU ${it.sku || 'N/A'} · ${formatPEN(it.subtotal || it.precio_unitario * it.cantidad)}`
    )
    .join('\n');

  const comprobanteStr =
    pedido.tipo_comprobante === 'factura'
      ? `Factura (RUC: ${pedido.dni_ruc} - ${pedido.razon_social || ''})`
      : `Boleta (DNI: ${pedido.dni_ruc || '-'})`;

  const entregaStr = pedido.direccion_entrega || pedido.metodo_entrega;

  const wspMensaje = `Hola, Iori Biker Shop 👋 Quiero hacer este pedido:

*Pedido ${pedido.codigo}*
${itemsLista}

Subtotal: ${formatPEN(pedido.subtotal)}
Descuento: ${formatPEN(pedido.descuento)}
Envío: ${pedido.envio === 0 ? 'Gratis' : formatPEN(pedido.envio)}
*Total: ${formatPEN(pedido.total)}*

*Mis datos*
${pedido.cliente_nombre} · ${pedido.cliente_celular}
Comprobante: ${comprobanteStr}
Entrega: ${entregaStr}
Notas: ${pedido.notas || 'Ninguna'}

¿Me confirman stock y cómo pagar? 🙌`;

  const wspUrl = `https://wa.me/51905445698?text=${encodeURIComponent(wspMensaje)}`;

  return (
    <div className="py-8 sm:py-16 bg-zinc-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Banner de Éxito y Código */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200 shadow-sm text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-brand uppercase tracking-widest bg-orange-100 text-brand px-3 py-1 rounded-full">
              Pedido Registrado en el Sistema
            </span>
            <h1 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-wider text-black mt-3">
              ¡Pedido {pedido.codigo}!
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Fecha de registro: {new Date(pedido.created_at).toLocaleString('es-PE')}
            </p>
          </div>

          {/* Aviso Fuera de Horario (si aplica) */}
          {fueraDeHorario && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-left text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Atención en Horario Especial</span>
              </div>
              <p>
                Has registrado tu pedido fuera del horario de atención en vivo de nuestras sedes (Lun-Sáb 9:00 am a 10:00 pm / Dom 11:00 am a 8:00 pm). Tu pedido ya está guardado en el sistema con stock reservado temporalmente y será atendido a primera hora al abrir nuestra tienda.
              </p>
            </div>
          )}

          {/* PLAN B: Acciones de WhatsApp */}
          <div className="bg-zinc-950 text-white rounded-2xl p-6 text-left space-y-4 shadow-lg border-l-4 border-brand">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-6 h-6 text-[#25D366] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading font-bold text-base uppercase tracking-wider text-white">
                  Paso Crucial: Enviar detalle por WhatsApp
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                  Para que nuestro asesor confirme stock y te envíe las cuentas de abono, debes enviar el mensaje a nuestra línea oficial (+51 905 445 698).
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={wspUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-heading font-bold uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <MessageCircle className="w-4 h-4" /> Reintentar Abrir WhatsApp
              </a>

              <BotonCopiarMensaje texto={wspMensaje} />
            </div>
          </div>
        </div>

        {/* Resumen Detallado del Pedido */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6 mb-8">
          <h2 className="font-heading font-black text-xl uppercase tracking-wider text-black pb-3 border-b border-zinc-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand" /> Resumen de Compra
          </h2>

          <div className="divide-y divide-zinc-100">
            {(pedido.pedido_items || pedido.items || []).map((it: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-bold text-zinc-900 text-sm">{it.producto_nombre}</p>
                  <p className="text-zinc-500 mt-0.5">
                    {it.variante_nombre ? `${it.variante_nombre} • ` : ''}SKU: {it.sku || 'N/A'} • Cantidad: {it.cantidad}
                  </p>
                </div>
                <span className="font-heading font-bold text-sm text-zinc-900">
                  {formatPEN(it.subtotal || it.precio_unitario * it.cantidad)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-200 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-bold text-zinc-900">{formatPEN(pedido.subtotal)}</span>
            </div>
            {pedido.descuento > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Descuento aplicado</span>
                <span>-{formatPEN(pedido.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Costo de Envío</span>
              <span className="font-bold text-zinc-900">
                {pedido.envio === 0 ? <span className="text-emerald-600">GRATIS</span> : formatPEN(pedido.envio)}
              </span>
            </div>
            <div className="pt-2 border-t border-zinc-200 flex justify-between items-baseline">
              <span className="font-heading font-bold text-base uppercase text-black">Total del Pedido</span>
              <span className="font-heading font-black text-2xl text-brand">{formatPEN(pedido.total)}</span>
            </div>
          </div>
        </div>

        {/* Datos del Cliente y Entrega */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-4 mb-8">
          <h2 className="font-heading font-black text-lg uppercase tracking-wider text-black pb-2 border-b border-zinc-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand" /> Datos de Envío y Facturación
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-600">
            <div>
              <span className="font-bold text-zinc-900 block mb-1">Destinatario:</span>
              <p>{pedido.cliente_nombre}</p>
              <p>Celular: {pedido.cliente_celular}</p>
              {pedido.cliente_email && <p>Email: {pedido.cliente_email}</p>}
            </div>

            <div>
              <span className="font-bold text-zinc-900 block mb-1">Comprobante Solicitado:</span>
              <p className="capitalize">{comprobanteStr}</p>
            </div>

            <div className="sm:col-span-2">
              <span className="font-bold text-zinc-900 block mb-1">Dirección de Entrega:</span>
              <p>{entregaStr}</p>
            </div>

            {pedido.notas && (
              <div className="sm:col-span-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 block mb-0.5">Notas del Cliente:</span>
                <p>{pedido.notas}</p>
              </div>
            )}
          </div>
        </div>

        {/* Métodos de Pago Oficiales para Transferencia */}
        {datosPago && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-4 mb-8">
            <h2 className="font-heading font-black text-lg uppercase tracking-wider text-black pb-2 border-b border-zinc-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand" /> Cuentas para Pago por Transferencia o Billetera
            </h2>
            <p className="text-xs text-zinc-500">
              Una vez confirmado el stock por WhatsApp, puedes realizar tu abono a nombre de: <b className="text-zinc-800">{datosPago.titular}</b>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {datosPago.numero_yape_plin && (
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
                  <span className="font-bold text-purple-900 block">Yape / Plin:</span>
                  <span className="text-base font-black text-purple-950 font-mono">{datosPago.numero_yape_plin}</span>
                </div>
              )}

              {datosPago.bancos?.map((b: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <span className="font-bold text-zinc-900 block">{b.banco} ({b.moneda}):</span>
                  <p className="font-mono text-zinc-800">Cta: {b.cuenta}</p>
                  <p className="font-mono text-[11px] text-zinc-500">CCI: {b.cci}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black transition"
          >
            ← Volver al catálogo de productos
          </Link>
        </div>
      </div>
    </div>
  );
}
