'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Ticket, Calendar, Check, Plus, Save, Flame, Ban, CheckCircle2 } from 'lucide-react';
import { saveAdminPromo, saveAdminCoupon, saveAdminSetting } from '@/lib/services/admin-service';
import { useToast } from './ui/Toast';

interface AdminPromosCouponsProps {
  promos: any[];
  coupons: any[];
  settings?: Record<string, any>;
  onRefresh: () => void;
}

export function AdminPromosCoupons({
  promos,
  coupons,
  settings = {},
  onRefresh,
}: AdminPromosCouponsProps) {
  const { showToast } = useToast();
  const espartaSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#seccion-promo-esparta') {
      espartaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const promoEsparta = promos.find((p) => p.slug === 'esparta' || p.tipo === 'combo') || {
    id: 'promo-esparta-2026',
    titulo: 'PROMO ESPARTA',
    slug: 'esparta',
    subtitulo: 'LLEVA 2 CASCOS A PRECIO REBAJADO PARA TI Y TU COPILOTO',
    fecha_fin: '2026-10-31T23:59:59Z',
    precio_combo: 429,
    activo: true,
  };

  const [espartaActiva, setEspartaActiva] = useState(Boolean(promoEsparta.activo));
  const [espartaPrecio, setEspartaPrecio] = useState(Number(promoEsparta.precio_combo || 429));
  const [espartaFechaFin, setEspartaFechaFin] = useState(
    promoEsparta.fecha_fin ? promoEsparta.fecha_fin.slice(0, 10) : '2026-10-31'
  );
  const [noAplicaPromo, setNoAplicaPromo] = useState(Boolean(settings?.promo_esparta?.no_aplica));
  const [savingPromo, setSavingPromo] = useState(false);

  // Cupones
  const [codigoCupon, setCodigoCupon] = useState('');
  const [descuentoValor, setDescuentoValor] = useState('');
  const [descuentoTipo, setDescuentoTipo] = useState<'porcentaje' | 'monto_fijo'>('porcentaje');

  const handleSavePromoEsparta = async () => {
    setSavingPromo(true);
    try {
      await saveAdminPromo({
        ...promoEsparta,
        activo: !noAplicaPromo && espartaActiva,
        precio_combo: espartaPrecio,
        fecha_fin: `${espartaFechaFin}T23:59:59Z`,
      });

      await saveAdminSetting('promo_esparta', {
        no_aplica: noAplicaPromo,
        activo: !noAplicaPromo && espartaActiva,
        precio_combo: espartaPrecio,
        updated_at: new Date().toISOString(),
      });

      showToast('¡Ajustes de Promo Esparta guardados exitosamente!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSavingPromo(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoCupon || !descuentoValor) return;

    try {
      await saveAdminCoupon({
        codigo: codigoCupon.trim().toUpperCase(),
        descuento_tipo: descuentoTipo,
        descuento_valor: parseFloat(descuentoValor),
        activo: true,
      });

      setCodigoCupon('');
      setDescuentoValor('');
      showToast('¡Cupón creado exitosamente!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Error creando cupón: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. CAMPAÑA OFICIAL: PROMO ESPARTA (Paso 9 de la Guía) */}
      <div 
        ref={espartaSectionRef}
        id="seccion-promo-esparta" 
        className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#f58220]/10 text-[#f58220] px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5" />
              Paso 9 • Campaña Oficial
            </div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
              Promoción Combo Esparta (Dúo de Cascos)
            </h2>
            <p className="text-xs text-zinc-500">
              Configura el combo promocional de 2 cascos a precio especial o marca la opción si no aplica a tu negocio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Opción No Aplica */}
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 cursor-pointer text-xs font-bold text-zinc-700 select-none">
              <input
                type="checkbox"
                checked={noAplicaPromo}
                onChange={(e) => setNoAplicaPromo(e.target.checked)}
                className="rounded accent-[#F58220] w-4 h-4"
              />
              <span>No aplica a mi tienda</span>
            </label>

            {!noAplicaPromo && (
              <button
                type="button"
                onClick={() => setEspartaActiva(!espartaActiva)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  espartaActiva
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {espartaActiva ? 'Activa en Tienda' : 'Pausada'}
              </button>
            )}
          </div>
        </div>

        {noAplicaPromo ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Has marcado esta promoción como <strong>&quot;No aplica&quot;</strong>. El paso 9 se considerará completado sin activar el banner en la tienda.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSavePromoEsparta}
              disabled={savingPromo}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-11 uppercase tracking-wider shrink-0 cursor-pointer"
            >
              {savingPromo ? 'Guardando...' : 'Confirmar Estado'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Precio Especial del Combo (S/.)</label>
              <input
                type="number"
                value={espartaPrecio}
                onChange={(e) => setEspartaPrecio(Number(e.target.value))}
                placeholder="429.00"
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-bold text-sm focus:outline-none focus:border-[#F58220]"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Precio final cobrado al cliente por los 2 cascos combinados.
              </span>
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Fecha de Finalización</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={espartaFechaFin}
                  onChange={(e) => setEspartaFechaFin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-bold text-sm focus:outline-none focus:border-[#F58220]"
                />
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Vigencia de la campaña especial de lanzamiento.
              </span>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSavePromoEsparta}
                disabled={savingPromo}
                className="w-full bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{savingPromo ? 'Guardando...' : 'Guardar Ajustes'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. CUPONES DE DESCUENTO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <Ticket className="w-3.5 h-3.5" />
              Medio de Fidelización
            </div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
              Cupones de Descuento
            </h2>
            <p className="text-xs text-zinc-500">
              Crea códigos promocionales para aplicar rebajas en el carrito de compras.
            </p>
          </div>
        </div>

        {/* Formulario de creación de cupón */}
        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs">
          <div>
            <label className="font-bold text-zinc-700 block mb-1">Código del Cupón</label>
            <input
              type="text"
              required
              placeholder="BIKER10"
              value={codigoCupon}
              onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-white font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Tipo de Descuento</label>
            <select
              value={descuentoTipo}
              onChange={(e: any) => setDescuentoTipo(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-white font-bold"
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto_fijo">Monto Fijo (S/.)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Valor del Descuento</label>
            <input
              type="number"
              required
              placeholder={descuentoTipo === 'porcentaje' ? '10' : '20'}
              value={descuentoValor}
              onChange={(e) => setDescuentoValor(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-white font-mono font-bold"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Cupón</span>
            </button>
          </div>
        </form>

        {/* Listado de Cupones */}
        <div className="divide-y divide-zinc-100">
          {coupons.length === 0 ? (
            <p className="text-center py-6 text-xs text-zinc-400">
              No hay cupones activos creados en la base de datos.
            </p>
          ) : (
            coupons.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold bg-zinc-100 border border-zinc-200 px-2 py-1 rounded text-zinc-900 text-sm">
                    {c.codigo}
                  </span>
                  <span className="text-zinc-600 font-medium">
                    {c.descuento_tipo === 'porcentaje' ? `${c.descuento_valor}% de descuento` : `S/. ${c.descuento_valor} de descuento`}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {c.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
