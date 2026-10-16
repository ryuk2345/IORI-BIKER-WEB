'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Truck, 
  CreditCard, 
  Save, 
  Plus, 
  Check, 
  Store,
  Layers,
  Users,
  Globe2,
  Percent,
  Mail,
  ShieldCheck,
  UserCheck,
  Send,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { saveAdminSetting, saveAdminShipping } from '@/lib/services/admin-service';
import { formatPEN } from '@/utils/currency';
import { ADMIN_ROUTES, AdminAjustesSeccion } from '@/lib/routes/admin-routes';
import { useToast } from './ui/Toast';

interface AdminSettingsShippingProps {
  settings: Record<string, any>;
  shipping: any[];
  teamMembers?: any[];
  initialSection?: AdminAjustesSeccion;
  onRefresh: () => void;
}

export function AdminSettingsShipping({
  settings,
  shipping,
  teamMembers = [],
  initialSection = 'empresa',
  onRefresh,
}: AdminSettingsShippingProps) {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<AdminAjustesSeccion>(initialSection);

  // Referencias para auto-scroll según el ancla
  const sectionRefs = {
    empresa: useRef<HTMLDivElement>(null),
    pagos: useRef<HTMLDivElement>(null),
    envios: useRef<HTMLDivElement>(null),
    acuotaz: useRef<HTMLDivElement>(null),
    equipo: useRef<HTMLDivElement>(null),
    publicacion: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#seccion-', '') as AdminAjustesSeccion;
      if (['empresa', 'pagos', 'envios', 'acuotaz', 'equipo', 'publicacion'].includes(hash)) {
        setActiveSection(hash);
        setTimeout(() => {
          sectionRefs[hash]?.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  // -------------------------------------------------------------
  // 0. Modo Tienda en Preparación
  // -------------------------------------------------------------
  const modoPrep = settings.tienda_en_preparacion || {
    activo: true,
    mensaje: 'Estamos preparando nuestro nuevo catálogo digital. ¡Muy pronto disponible!',
    mostrar_whatsapp: true,
    mostrar_tiendas: true,
  };
  const [prepActivo, setPrepActivo] = useState(Boolean(modoPrep.activo ?? true));
  const [prepMensaje, setPrepMensaje] = useState(modoPrep.mensaje || 'Estamos preparando nuestro nuevo catálogo digital. ¡Muy pronto disponible!');
  const [savingPrep, setSavingPrep] = useState(false);

  // -------------------------------------------------------------
  // 1. Datos del Negocio & Barra Superior
  // -------------------------------------------------------------
  const empresaData = settings.empresa || {
    razon_social: 'IORI SAC',
    ruc: '20610816089',
    direccion: 'Av. Gerardo Unger 4489, Independencia, Lima',
    telefono: '905445698',
    whatsapp: '905445698',
    horario: 'Lunes a Sábado de 10:00 a.m. a 8:00 p.m.',
  };
  const [razonSocial, setRazonSocial] = useState(empresaData.razon_social);
  const [ruc, setRuc] = useState(empresaData.ruc);
  const [direccion, setDireccion] = useState(empresaData.direccion);
  const [wspNumero, setWspNumero] = useState(empresaData.whatsapp || '905445698');
  const [horario, setHorario] = useState(empresaData.horario || 'Lunes a Sábado de 10:00 a.m. a 8:00 p.m.');

  const barraSup = settings.barra_superior || {
    texto: '¡PROMO ESPARTA ACTIVA! Lleva 2 cascos certificados a precio rebajado todo Octubre.',
    enlace: '/promo/esparta',
    activo: true,
  };
  const [barraTexto, setBarraTexto] = useState(barraSup.texto);
  const [barraEnlace, setBarraEnlace] = useState(barraSup.enlace);
  const [barraActivo, setBarraActivo] = useState(Boolean(barraSup.activo));

  // -------------------------------------------------------------
  // 2. Datos de Pago
  // -------------------------------------------------------------
  const datosPago = settings.datos_pago_plantillas || {
    titular: 'Kiara Balarezo Berttea / IORI SAC',
    numero_yape_plin: '905 445 698',
    bancos: [
      { banco: 'BCP', cuenta: '191-94820158-0-44', cci: '002-191009482015804452', moneda: 'Soles' },
      { banco: 'BBVA', cuenta: '0011-0175-0200849201', cci: '011-175-000200849201-19', moneda: 'Soles' },
      { banco: 'Interbank', cuenta: '200-3001849281', cci: '003-200-003001849281-34', moneda: 'Soles' },
    ],
  };
  const [titularPago, setTitularPago] = useState(datosPago.titular);
  const [yapePlin, setYapePlin] = useState(datosPago.numero_yape_plin);
  const [bancos, setBancos] = useState<any[]>(datosPago.bancos || []);

  // -------------------------------------------------------------
  // 3. aCuotaz Estimado
  // -------------------------------------------------------------
  const acuotazSetting = settings.acuotaz || {
    activo: true,
    numeroCuotas: 9,
    factor: 1.23,
    montoMinimo: 100,
    montoMaximo: 2000,
    textoFranja: 'Divide tu pago en hasta {n} cuotas',
    textoRecuadro: 'Llévatelo en {n} cuotas quincenales de {cuota}',
    avisoLegal: 'Monto referencial, sujeto a evaluación y condiciones de aCuotaz.',
    esDemo: true,
  };
  const [acuotazActivo, setAcuotazActivo] = useState(Boolean(acuotazSetting.activo ?? true));
  const [acuotazCuotas, setAcuotazCuotas] = useState<number>(acuotazSetting.numeroCuotas ?? 9);
  const [acuotazFactor, setAcuotazFactor] = useState<number>(acuotazSetting.factor ?? 1.23);
  const [acuotazMin, setAcuotazMin] = useState<number>(acuotazSetting.montoMinimo ?? 100);
  const [acuotazMax, setAcuotazMax] = useState<number>(acuotazSetting.montoMaximo ?? 2000);
  const [acuotazTextoFranja, setAcuotazTextoFranja] = useState<string>(acuotazSetting.textoFranja ?? 'Divide tu pago en hasta {n} cuotas');
  const [acuotazTextoRecuadro, setAcuotazTextoRecuadro] = useState<string>(acuotazSetting.textoRecuadro ?? 'Llévatelo en {n} cuotas quincenales de {cuota}');
  const [acuotazAvisoLegal, setAcuotazAvisoLegal] = useState<string>(acuotazSetting.avisoLegal ?? 'Monto referencial, sujeto a evaluación y condiciones de aCuotaz.');
  const [savingAcuotaz, setSavingAcuotaz] = useState(false);

  // -------------------------------------------------------------
  // 4. Equipo e Invitaciones (Paso 11)
  // -------------------------------------------------------------
  const [nuevoMiembroEmail, setNuevoMiembroEmail] = useState('');
  const [nuevoMiembroNombre, setNuevoMiembroNombre] = useState('');
  const [nuevoMiembroRol, setNuevoMiembroRol] = useState<'admin' | 'atencion'>('atencion');
  const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);

  // -------------------------------------------------------------
  // 5. Tarifas de Envío
  // -------------------------------------------------------------
  const [enviosList, setEnviosList] = useState<any[]>(shipping || []);
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Guardar Datos Empresa & Barra
  const handleSaveEmpresa = async () => {
    setSavingGeneral(true);
    try {
      await saveAdminSetting('empresa', {
        razon_social: razonSocial,
        ruc,
        direccion,
        telefono: wspNumero,
        whatsapp: wspNumero,
        horario,
      });

      await saveAdminSetting('barra_superior', {
        texto: barraTexto,
        enlace: barraEnlace,
        activo: barraActivo,
      });

      await saveAdminSetting('whatsapp', {
        numero: wspNumero,
        numeroCompleto: `+51 ${wspNumero}`,
        url: `https://wa.me/51${wspNumero}`,
      });

      showToast('Datos del negocio actualizados exitosamente', 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSavingGeneral(false);
    }
  };

  // Guardar Pagos
  const handleSavePagos = async () => {
    setSavingGeneral(true);
    try {
      await saveAdminSetting('datos_pago_plantillas', {
        titular: titularPago,
        numero_yape_plin: yapePlin,
        bancos,
      });
      showToast('Cuentas y medios de pago guardados exitosamente', 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSavingGeneral(false);
    }
  };

  // Guardar aCuotaz
  const handleSaveAcuotaz = async () => {
    setSavingAcuotaz(true);
    try {
      await saveAdminSetting('acuotaz', {
        activo: acuotazActivo,
        numeroCuotas: Number(acuotazCuotas),
        factor: Number(acuotazFactor),
        montoMinimo: Number(acuotazMin),
        montoMaximo: Number(acuotazMax),
        textoFranja: acuotazTextoFranja,
        textoRecuadro: acuotazTextoRecuadro,
        avisoLegal: acuotazAvisoLegal,
        esDemo: false, // Guardado real del cliente
      });
      showToast('Ajustes de aCuotaz guardados exitosamente', 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSavingAcuotaz(false);
    }
  };

  // Guardar Estado de Publicación (Tienda en Preparación)
  const handleTogglePrep = async () => {
    setSavingPrep(true);
    try {
      const nuevoEstado = !prepActivo;
      setPrepActivo(nuevoEstado);
      await saveAdminSetting('tienda_en_preparacion', {
        activo: nuevoEstado,
        mensaje: prepMensaje,
        mostrar_whatsapp: true,
        mostrar_tiendas: true,
      });
      showToast(
        nuevoEstado
          ? 'Modo Tienda en Preparación activado (público ve "Muy pronto")'
          : '¡Tienda publicada y abierta al público exitosamente!',
        'success'
      );
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSavingPrep(false);
    }
  };

  // Enviar invitación de equipo (Paso 11)
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMiembroEmail) return;

    setEnviandoInvitacion(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite',
          email: nuevoMiembroEmail,
          nombre: nuevoMiembroNombre,
          rol: nuevoMiembroRol,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar invitación');

      showToast(data.message || 'Invitación enviada exitosamente', 'success');
      setNuevoMiembroEmail('');
      setNuevoMiembroNombre('');
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setEnviandoInvitacion(false);
    }
  };

  const navItems = [
    { id: 'empresa', label: '1. Datos de Empresa', href: ADMIN_ROUTES.AJUSTES('empresa'), icon: Store },
    { id: 'pagos', label: '2. Cuentas y Pagos', href: ADMIN_ROUTES.AJUSTES('pagos'), icon: CreditCard },
    { id: 'envios', label: '3. Tarifas de Envío', href: ADMIN_ROUTES.AJUSTES('envios'), icon: Truck },
    { id: 'acuotaz', label: '4. Parámetros aCuotaz', href: ADMIN_ROUTES.AJUSTES('acuotaz'), icon: Percent },
    { id: 'equipo', label: '11. Equipo y Roles', href: ADMIN_ROUTES.AJUSTES('equipo'), icon: Users },
    { id: 'publicacion', label: '12. Publicar Tienda', href: ADMIN_ROUTES.AJUSTES('publicacion'), icon: Globe2 },
  ];

  return (
    <div className="space-y-8">
      {/* Selector de subsección tipo Tabs superiores */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveSection(item.id as AdminAjustesSeccion)}
              className={`px-3.5 py-2 rounded-xl text-12 font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-[#F58220] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN 12: PUBLICACIÓN & TIENDA EN PREPARACIÓN          */}
      {/* ======================================================== */}
      <div
        ref={sectionRefs.publicacion}
        id="seccion-publicacion"
        className={`rounded-3xl p-6 sm:p-8 border shadow-xs transition-all scroll-mt-20 ${
          prepActivo 
            ? 'bg-amber-50/70 border-amber-300' 
            : 'bg-emerald-50/70 border-emerald-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                prepActivo 
                  ? 'bg-amber-500 text-black' 
                  : 'bg-emerald-600 text-white'
              }`}>
                {prepActivo ? '🟡 Modo Preparación Activo' : '🟢 Tienda Pública Abierta'}
              </span>
              <h2 className="text-lg font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
                Paso 12 • Publicación Oficial de la Tienda
              </h2>
            </div>
            <p className="text-xs text-zinc-600">
              {prepActivo
                ? 'El público general ve la pantalla "Muy Pronto" con enlaces a WhatsApp y a las tiendas de Independencia y Surquillo. Desactiva este modo para abrir al público.'
                : 'La tienda está activa y abierta al público general para compras online.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleTogglePrep}
            disabled={savingPrep}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-sm ${
              prepActivo
                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {prepActivo ? 'Desactivar Modo Preparación (Publicar Tienda)' : 'Activar Modo Preparación'}
          </button>
        </div>

        <div className="pt-4 space-y-2">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
            Mensaje para visitantes en la pantalla &quot;Muy Pronto&quot;:
          </label>
          <input
            type="text"
            value={prepMensaje}
            onChange={(e) => setPrepMensaje(e.target.value)}
            disabled={!prepActivo}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-900 focus:outline-none focus:border-[#f58220]"
            placeholder="Estamos preparando nuestro nuevo catálogo digital..."
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN 1: DATOS DE LA EMPRESA                           */}
      {/* ======================================================== */}
      <div
        ref={sectionRefs.empresa}
        id="seccion-empresa"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#F58220] px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <Store className="w-3.5 h-3.5" />
              Paso 1 • Identidad Fiscal y Comercial
            </div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
              Datos del Negocio y Canales Oficiales
            </h2>
            <p className="text-xs text-zinc-500">
              Razón social, RUC, canal oficial de WhatsApp y horario de atención.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveEmpresa}
            disabled={savingGeneral}
            className="bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{savingGeneral ? 'Guardando...' : 'Guardar Datos de Empresa'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-zinc-700 block mb-1">Razón Social *</label>
            <input
              type="text"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">RUC *</label>
            <input
              type="text"
              value={ruc}
              onChange={(e) => setRuc(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">WhatsApp Oficial de Ventas *</label>
            <input
              type="text"
              value={wspNumero}
              onChange={(e) => setWspNumero(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-zinc-700 block mb-1">Dirección Fiscal / Tienda Principal *</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Horario de Atención</label>
            <input
              type="text"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50"
            />
          </div>
        </div>

        {/* Anuncio Superior */}
        <div className="pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-zinc-800">
              Franja de Anuncio Superior (Header)
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-600">
              <input
                type="checkbox"
                checked={barraActivo}
                onChange={(e) => setBarraActivo(e.target.checked)}
                className="rounded accent-[#F58220] w-4 h-4"
              />
              <span>Mostrar Franja Superior</span>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={barraTexto}
                onChange={(e) => setBarraTexto(e.target.value)}
                placeholder="Texto del anuncio superior..."
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50"
              />
            </div>
            <div>
              <input
                type="text"
                value={barraEnlace}
                onChange={(e) => setBarraEnlace(e.target.value)}
                placeholder="/promo/esparta"
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN 2: MEDIOS DE PAGO Y CUENTAS BANCARIAS            */}
      {/* ======================================================== */}
      <div
        ref={sectionRefs.pagos}
        id="seccion-pagos"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#F58220] px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              Paso 2 • Datos de Pago
            </div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
              Cuentas Bancarias y Billeteras Digitales
            </h2>
            <p className="text-xs text-zinc-500">
              Cuentas que se envían al cliente en el mensaje automático de WhatsApp al comprar.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSavePagos}
            disabled={savingGeneral}
            className="bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{savingGeneral ? 'Guardando...' : 'Guardar Medios de Pago'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-zinc-700 block mb-1">Titular de las Cuentas *</label>
            <input
              type="text"
              value={titularPago}
              onChange={(e) => setTitularPago(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Número para Yape / Plin *</label>
            <input
              type="text"
              value={yapePlin}
              onChange={(e) => setYapePlin(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-bold"
            />
          </div>
        </div>

        {/* Lista de Bancos */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-zinc-800">
              Cuentas Bancarias Configuradas ({bancos.length})
            </span>
            <button
              type="button"
              onClick={() => {
                setBancos([...bancos, { banco: 'Nuevo Banco', cuenta: '', cci: '', moneda: 'Soles' }]);
              }}
              className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-11 font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Banco</span>
            </button>
          </div>

          <div className="space-y-2">
            {bancos.map((b, idx) => (
              <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs items-center">
                <input
                  type="text"
                  value={b.banco}
                  onChange={(e) => {
                    const next = [...bancos];
                    next[idx].banco = e.target.value;
                    setBancos(next);
                  }}
                  placeholder="Banco (ej. BCP)"
                  className="px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white font-bold"
                />
                <input
                  type="text"
                  value={b.cuenta}
                  onChange={(e) => {
                    const next = [...bancos];
                    next[idx].cuenta = e.target.value;
                    setBancos(next);
                  }}
                  placeholder="Número de cuenta"
                  className="px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white font-mono"
                />
                <input
                  type="text"
                  value={b.cci}
                  onChange={(e) => {
                    const next = [...bancos];
                    next[idx].cci = e.target.value;
                    setBancos(next);
                  }}
                  placeholder="Código Interbancario (CCI)"
                  className="px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white font-mono"
                />
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-bold text-[11px] shrink-0">{b.moneda}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBancos(bancos.filter((_, i) => i !== idx));
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition ml-auto cursor-pointer"
                    title="Eliminar cuenta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN 3: TARIFAS DE ENVÍO                              */}
      {/* ======================================================== */}
      <div
        ref={sectionRefs.envios}
        id="seccion-envios"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#F58220] px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <Truck className="w-3.5 h-3.5" />
              Paso 3 • Logística y Despacho
            </div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
              Tarifas de Entrega y Agencias de Envío
            </h2>
            <p className="text-xs text-zinc-500">
              Configura costos de delivery local y agencias para envíos a provincia (Shalom y Mavisur).
            </p>
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {shipping.map((tarifa) => (
            <div key={tarifa.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-zinc-900 block">{tarifa.nombre || tarifa.zona}</span>
                <span className="text-[11px] text-zinc-500">{tarifa.descripcion || 'Entrega estándar'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm bg-zinc-100 px-3 py-1 rounded-lg">
                  {formatPEN(tarifa.precio || tarifa.tarifa || 0)}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  tarifa.activo !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {tarifa.activo !== false ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN 4: PARÁMETROS ACUOTAZ                            */}
      {/* ======================================================== */}
      <div
        ref={sectionRefs.acuotaz}
        id="seccion-acuotaz"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#F58220] px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <Percent className="w-3.5 h-3.5" />
              Paso 4 • Financiamiento Visual
            </div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
              Parámetros de Cuotas aCuotaz
            </h2>
            <p className="text-xs text-zinc-500">
              Información visual de cuotas estimadas. El financiamiento se coordina 100% por WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveAcuotaz}
            disabled={savingAcuotaz}
            className="bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{savingAcuotaz ? 'Guardando...' : 'Guardar Parámetros aCuotaz'}</span>
          </button>
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Asegúrate de ingresar el <strong>número de cuotas</strong> y el <strong>factor</strong> exacto otorgado por el simulador comercial de aCuotaz antes de la apertura oficial.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-bold text-zinc-700 block mb-1">Número de Cuotas (n) *</label>
            <input
              type="number"
              value={acuotazCuotas}
              onChange={(e) => setAcuotazCuotas(Number(e.target.value))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Factor Financiero *</label>
            <input
              type="number"
              step="0.01"
              value={acuotazFactor}
              onChange={(e) => setAcuotazFactor(Number(e.target.value))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Monto Mínimo (S/.)</label>
            <input
              type="number"
              value={acuotazMin}
              onChange={(e) => setAcuotazMin(Number(e.target.value))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Monto Máximo (S/.)</label>
            <input
              type="number"
              value={acuotazMax}
              onChange={(e) => setAcuotazMax(Number(e.target.value))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 font-mono"
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN 11: EQUIPO Y ROLES DE ACCESO                     */}
      {/* ======================================================== */}
      <div
        ref={sectionRefs.equipo}
        id="seccion-equipo"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#F58220] px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <Users className="w-3.5 h-3.5" />
              Paso 11 • Invitaciones al Equipo
            </div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
              Miembros del Equipo y Roles Autorizados
            </h2>
            <p className="text-xs text-zinc-500">
              El dueño está identificado con el distintivo de Propietario. Invita a administradores y asesores de atención.
            </p>
          </div>
        </div>

        {/* Formulario de Invitación */}
        <form onSubmit={handleInviteUser} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-zinc-700 block mb-1">Correo Electrónico *</label>
            <input
              type="email"
              required
              placeholder="asesor@ioribikershop.pe"
              value={nuevoMiembroEmail}
              onChange={(e) => setNuevoMiembroEmail(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Nombre Completo</label>
            <input
              type="text"
              placeholder="Nombre del colaborador"
              value={nuevoMiembroNombre}
              onChange={(e) => setNuevoMiembroNombre(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Rol en el Panel *</label>
            <select
              value={nuevoMiembroRol}
              onChange={(e: any) => setNuevoMiembroRol(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-white font-bold"
            >
              <option value="atencion">Atención al Cliente (Solo Pedidos/Mensajes)</option>
              <option value="admin">Administrador (Acceso Completo)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={enviandoInvitacion}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{enviandoInvitacion ? 'Invitando...' : 'Enviar Invitación'}</span>
            </button>
          </div>
        </form>

        {/* Lista de Miembros Actuales */}
        <div className="space-y-2">
          <span className="font-bold text-xs uppercase tracking-wider text-zinc-800 block">
            Miembros Registrados ({teamMembers.length})
          </span>
          <div className="divide-y divide-zinc-100">
            {teamMembers.map((m: any, idx: number) => {
              const isOwner = Boolean(m.is_owner || idx === 0);
              return (
                <div key={m.id || idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                      {(m.nombre || m.email || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 block">{m.nombre || m.email}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">{m.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#F58220] border border-orange-200">
                        Propietario (Dueño)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                        {m.rol === 'admin' ? 'Administrador' : 'Atención al Cliente'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
