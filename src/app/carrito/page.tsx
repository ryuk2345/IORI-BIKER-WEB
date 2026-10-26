'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, 
  Truck, MessageCircle, Store, Tag, AlertCircle, CheckCircle2, 
  Loader2, CreditCard, Clock, FileText, Check 
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPEN } from '@/utils/currency';
import { createClient } from '@/lib/supabase/client';
import { trackBeginCheckout, trackGenerateLead } from '@/lib/analytics';
import { ACuotazWidget } from '@/components/acuotaz/ACuotazWidget';
import { calcularCuotaEstimada, getAcuotazConfig } from '@/lib/acuotaz-estimado';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getSubtotal, 
    getDescuento, 
    getTotalPrice, 
    getTotalItems,
    cupon,
    setCupon 
  } = useCartStore();

  const subtotal = getSubtotal();
  const descuento = getDescuento();
  const totalItems = getTotalItems();

  // Método de pago: Yape/Plin o aCuotaz
  const [metodoPago, setMetodoPago] = useState<'yape_plin_transferencia' | 'acuotaz'>('yape_plin_transferencia');

  // Analítica: begin_checkout al empezar a interactuar con el formulario
  const hasTrackedCheckoutRef = React.useRef(false);
  const handleFormInteraction = () => {
    if (!hasTrackedCheckoutRef.current && items.length > 0) {
      hasTrackedCheckoutRef.current = true;
      trackBeginCheckout(subtotal - descuento, items.length);
    }
  };

  // Estados de Formulario de Envío y Facturación
  const [tipoComprobante, setTipoComprobante] = useState<'boleta' | 'factura'>('boleta');
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');

  // Entrega
  const [metodoEntrega, setMetodoEntrega] = useState<'recojo' | 'lima_delivery' | 'provincia'>('recojo');
  const [sedeRecojo, setSedeRecojo] = useState<'independencia' | 'la-victoria'>('independencia');
  const [distrito, setDistrito] = useState('Lima');
  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [departamento, setDepartamento] = useState('Arequipa');
  const [ciudad, setCiudad] = useState('');
  const [agencia, setAgencia] = useState<'Shalom' | 'Marvisur'>('Shalom');
  const [notas, setNotas] = useState('');
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // Cupones
  const [inputCupon, setInputCupon] = useState('');
  const [loadingCupon, setLoadingCupon] = useState(false);
  const [cuponError, setCuponError] = useState<string | null>(null);

  // Estados de proceso y carga
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Tarifas de envío desde BD (null indica que no hay tarifa configurada y se coordina por WhatsApp)
  const [tarifaLima, setTarifaLima] = useState<number | null>(null);
  const [tarifaProvincia, setTarifaProvincia] = useState<number | null>(null);

  // Métodos de pago configurados en ajustes del admin
  const [metodosPagoTexto, setMetodosPagoTexto] = useState<string[]>(['Yape', 'Plin', 'Transferencia BCP', 'BBVA', 'Interbank', 'Efectivo en Tienda']);

  // 1. Cargar sesión de usuario para autocompletar datos
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          if (user.email) setEmail(user.email);

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.nombre) setNombre(profile.nombre);
            if (profile.telefono) setCelular(profile.telefono);
            if (profile.dni) {
              setDni(profile.dni);
              setTipoComprobante('boleta');
            }
            if (profile.direccion) setDireccion(profile.direccion);
          }
        }

        // Cargar tarifas y ajustes
        const { data: tarifas } = await supabase.from('envios_tarifas').select('*');
        if (tarifas && tarifas.length > 0) {
          const tL = tarifas.find((t) => t.zona === 'Lima' && t.activo);
          if (tL) setTarifaLima(Number(tL.tarifa));
          const tP = tarifas.find((t) => t.zona === 'Provincias' && t.activo);
          if (tP) setTarifaProvincia(Number(tP.tarifa));
        }

        const { data: ajustesPago } = await supabase
          .from('ajustes_generales')
          .select('valor')
          .eq('clave', 'metodos_pago_visibles')
          .single();
        if (ajustesPago?.valor && Array.isArray(ajustesPago.valor)) {
          setMetodosPagoTexto(ajustesPago.valor);
        }
      } catch (err) {
        console.error('Error cargando datos para carrito:', err);
      }
    }
    loadUser();
  }, []);

  // Costo de envío según método seleccionado
  const costoEnvio = 
    metodoEntrega === 'recojo' ? 0 : 
    metodoEntrega === 'lima_delivery' ? (tarifaLima ?? 0) : 
    (tarifaProvincia ?? 0);

  const totalCalculado = Math.max(0, subtotal - descuento + costoEnvio);

  // Aplicar cupón contra Supabase
  const handleAplicarCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCupon.trim()) return;
    setLoadingCupon(true);
    setCuponError(null);

    try {
      const supabase = createClient();
      const { data: cup, error } = await supabase
        .from('cupones')
        .select('*')
        .ilike('codigo', inputCupon.trim())
        .eq('activo', true)
        .single();

      if (error || !cup) {
        setCuponError('El cupón ingresado no es válido o ha expirado.');
        return;
      }

      const ahora = new Date().toISOString();
      if (cup.fecha_fin && cup.fecha_fin < ahora) {
        setCuponError('Este cupón ya expiró.');
        return;
      }

      if (cup.minimo_compra && subtotal < Number(cup.minimo_compra)) {
        setCuponError(`El monto mínimo para este cupón es de ${formatPEN(Number(cup.minimo_compra))}.`);
        return;
      }

      let descMonto = 0;
      if (cup.tipo === 'porcentaje') {
        descMonto = Math.round(((subtotal * Number(cup.valor)) / 100) * 100) / 100;
      } else {
        descMonto = Math.min(subtotal, Number(cup.valor));
      }

      setCupon({
        codigo: cup.codigo,
        tipo: cup.tipo,
        valor: Number(cup.valor),
        descuento: descMonto,
        minimo_compra: cup.minimo_compra ? Number(cup.minimo_compra) : undefined,
      });

      setInputCupon('');
    } catch {
      setCuponError('Error al validar el cupón.');
    } finally {
      setLoadingCupon(false);
    }
  };

  // Enviar pedido por WhatsApp
  const handleEnviarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError('Tu carrito está vacío.');
      return;
    }

    if (!aceptaPrivacidad) {
      setSubmitError('Debes aceptar la política de privacidad para enviar tu pedido.');
      return;
    }

    // Validaciones de cliente
    const cleanCel = celular.replace(/\D/g, '');
    if (!/^9\d{8}$/.test(cleanCel)) {
      setSubmitError('Ingresa un celular peruano válido (9 dígitos que empiece con 9).');
      return;
    }

    if (tipoComprobante === 'boleta') {
      const cleanDni = dni.replace(/\D/g, '');
      if (!/^\d{8}$/.test(cleanDni)) {
        setSubmitError('Ingresa un DNI válido de 8 dígitos para la boleta.');
        return;
      }
    } else {
      const cleanRuc = ruc.replace(/\D/g, '');
      if (!/^(10|20)\d{9}$/.test(cleanRuc)) {
        setSubmitError('Ingresa un RUC válido de 11 dígitos que empiece con 10 o 20.');
        return;
      }
      if (!razonSocial.trim()) {
        setSubmitError('Ingresa la Razón Social para la factura.');
        return;
      }
    }

    if (metodoEntrega === 'lima_delivery') {
      if (!distrito.trim() || !direccion.trim()) {
        setSubmitError('Ingresa el distrito y dirección exacta para el delivery.');
        return;
      }
    } else if (metodoEntrega === 'provincia') {
      if (!departamento.trim() || !ciudad.trim()) {
        setSubmitError('Ingresa departamento y ciudad para el envío a provincia.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          codigo_cupon: cupon?.codigo || null,
          tipo_comprobante: tipoComprobante,
          nombre,
          celular: cleanCel,
          email,
          dni,
          ruc,
          razon_social: razonSocial,
          metodo_entrega: metodoEntrega,
          distrito,
          direccion,
          referencia,
          departamento,
          ciudad,
          agencia,
          sede_recojo: sedeRecojo,
          notas,
          acepta_privacidad: aceptaPrivacidad,
          user_id: currentUser?.id || null,
          metodo_pago: metodoPago,
          _hp: honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al registrar el pedido');
      }

      // Vaciar el carrito solo después de crear el pedido con éxito
      clearCart();

      // Analítica: Lead generado exitosamente al enviar pedido
      trackGenerateLead(data.codigo, data.total);

      // Abrir WhatsApp con el pedido oficial
      if (data.wspUrl) {
        window.open(data.wspUrl, '_blank');
      }

      // Redirigir a la pantalla pública /pedido/[token]
      router.push(`/pedido/${data.token}`);
    } catch (err: any) {
      setSubmitError(err.message || 'No se pudo crear el pedido. Inténtalo nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-py bg-white min-h-screen">
      <div className="container-iori">
        {/* Breadcrumb */}
        <nav className="text-12 text-zinc-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-900 font-bold">Carrito de Compras</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 mb-6 border-b border-zinc-200">
          <div>
            <h1 className="font-heading font-bold text-32 md:text-40 uppercase tracking-tight text-zinc-950">
              Tu Carrito de Compras
            </h1>
            <p className="text-14 text-zinc-600 mt-1">
              Revisa tus productos, ingresa tus datos de entrega y coordina tu pedido oficial.
            </p>
          </div>
          {items.length > 0 && (
            <span className="text-12 font-heading font-bold uppercase text-zinc-500">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-[#F5F5F5] rounded-[4px] p-8 sm:p-14 text-center max-w-lg mx-auto border border-zinc-200 space-y-5">
            <div className="w-16 h-16 bg-white border border-zinc-200 rounded-[4px] flex items-center justify-center mx-auto text-zinc-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-24 uppercase tracking-tight text-zinc-950">
                Tu Carrito está Vacío
              </h2>
              <p className="text-14 text-zinc-600 leading-relaxed">
                Aún no has agregado cascos ni accesorios a tu pedido. Explora nuestro catálogo con marcas líderes.
              </p>
            </div>
            <Link
              href="/productos"
              className="btn-primary"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form 
            onSubmit={handleEnviarPedido} 
            onFocusCapture={handleFormInteraction} 
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Honeypot invisible */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Columna Izquierda: Resumen Editable + Formulario Todo en Uno */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. RESUMEN EDITABLE DE PRODUCTOS */}
              <div className="bg-white rounded-[4px] border border-zinc-200 overflow-hidden">
                <div className="p-4 bg-[#F5F5F5] border-b border-zinc-200 flex items-center justify-between">
                  <span className="font-heading font-bold text-14 uppercase tracking-wider text-zinc-950">
                    Artículos en tu Pedido ({totalItems})
                  </span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-12 text-zinc-500 hover:text-red-600 font-heading font-bold uppercase transition-colors cursor-pointer"
                  >
                    Vaciar Carrito
                  </button>
                </div>

                <div className="divide-y divide-zinc-100 p-2 sm:p-4">
                  {items.map((item) => {
                    const precioUnit = item.producto.precio_oferta || item.producto.precio;
                    const subtotalItem = precioUnit * item.cantidad;

                    return (
                      <div key={item.id} className="p-3 sm:p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-[2px] overflow-hidden shrink-0 border border-zinc-200 p-1">
                            {item.producto.imagenes?.[0] ? (
                              <img
                                src={item.producto.imagenes[0]}
                                alt={item.producto.nombre}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <ShoppingBag className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <span className="text-12 font-medium uppercase tracking-wider text-zinc-500">
                              {item.producto.categoriaNombre || 'Accesorio'}
                            </span>
                            <h3 className="font-semibold text-14 text-zinc-900 truncate">
                              <Link href={`/producto/${item.producto.slug}`} className="hover:text-brand transition-colors">
                                {item.producto.nombre}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap gap-2 text-12 text-zinc-500">
                              {item.tallaSeleccionada && (
                                <span className="bg-zinc-100 px-2 py-0.5 rounded-[2px] font-medium border border-zinc-200">
                                  Talla: <b className="text-zinc-800">{item.tallaSeleccionada}</b>
                                </span>
                              )}
                              {item.colorSeleccionado && (
                                <span className="bg-zinc-100 px-2 py-0.5 rounded-[2px] font-medium border border-zinc-200">
                                  Color: <b className="text-zinc-800">{item.colorSeleccionado}</b>
                                </span>
                              )}
                            </div>
                            <div className="sm:hidden text-14 font-bold text-zinc-900 pt-1">
                              {formatPEN(subtotalItem)}
                            </div>
                          </div>
                        </div>

                        {/* Controles de Cantidad y Quitar */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100">
                          <div className="flex items-center border border-zinc-300 rounded-[4px] overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.cantidad - 1, item.tallaSeleccionada, item.colorSeleccionado)}
                              className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                              aria-label="Disminuir"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-9 text-center font-bold text-12 text-zinc-900">
                              {item.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.cantidad + 1, item.tallaSeleccionada, item.colorSeleccionado)}
                              className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                              aria-label="Aumentar"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="hidden sm:block text-right min-w-[100px]">
                            <div className="font-heading font-bold text-16 text-zinc-950">
                              {formatPEN(subtotalItem)}
                            </div>
                            <div className="text-12 text-zinc-400">
                              {formatPEN(precioUnit)} c/u
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id, item.tallaSeleccionada, item.colorSeleccionado)}
                            className="p-2 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Quitar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. FORMULARIO DE COMPRADOR Y FACTURACIÓN */}
              <div className="bg-white rounded-[4px] p-6 border border-zinc-200 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <h2 className="font-heading font-bold text-18 uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-[2px] bg-[#111111] text-white text-12 flex items-center justify-center font-heading font-bold">1</span>
                    Datos de Contacto y Comprobante
                  </h2>
                  {currentUser && (
                    <span className="text-12 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200">
                      Datos de tu cuenta
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                      Nombre Completo <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez Quispe"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                      Celular / WhatsApp (9 dígitos) <span className="text-brand">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={9}
                      placeholder="987654321"
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Tipo de Comprobante: Boleta o Factura */}
                <div className="space-y-3 pt-2">
                  <label className="block text-12 font-heading font-bold uppercase text-zinc-700">
                    Tipo de Comprobante <span className="text-brand">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoComprobante('boleta')}
                      className={`p-3 rounded-[4px] border text-center font-heading font-bold text-12 uppercase transition-all cursor-pointer ${
                        tipoComprobante === 'boleta'
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      Boleta de Venta
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoComprobante('factura')}
                      className={`p-3 rounded-[4px] border text-center font-heading font-bold text-12 uppercase transition-all cursor-pointer ${
                        tipoComprobante === 'factura'
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      Factura con RUC
                    </button>
                  </div>

                  {tipoComprobante === 'boleta' ? (
                    <div>
                      <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                        DNI del Comprador (8 dígitos) <span className="text-brand">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={8}
                        placeholder="8 dígitos"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] focus:outline-none focus:border-brand font-mono"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                          RUC (11 dígitos) <span className="text-brand">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          placeholder="20610816089"
                          value={ruc}
                          onChange={(e) => setRuc(e.target.value)}
                          className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] focus:outline-none focus:border-brand font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                          Razón Social <span className="text-brand">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Mi Empresa SAC"
                          value={razonSocial}
                          onChange={(e) => setRazonSocial(e.target.value)}
                          className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] focus:outline-none focus:border-brand"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. MÉTODO DE ENTREGA */}
              <div className="bg-white rounded-[4px] p-6 border border-zinc-200 space-y-5">
                <div className="pb-3 border-b border-zinc-200">
                  <h2 className="font-heading font-bold text-18 uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-[2px] bg-[#111111] text-white text-12 flex items-center justify-center font-heading font-bold">2</span>
                    Modalidad de Entrega
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMetodoEntrega('recojo')}
                    className={`p-3.5 rounded-[4px] border text-left transition-all cursor-pointer ${
                      metodoEntrega === 'recojo'
                        ? 'border-zinc-950 bg-zinc-50 ring-1 ring-zinc-950'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <Store className="w-5 h-5 text-brand mb-2" />
                    <div className="font-heading font-bold text-sm uppercase text-black">Retiro en Tienda</div>
                    <div className="text-xs text-emerald-600 font-bold mt-0.5">GRATIS</div>
                    <div className="text-[11px] text-zinc-500 mt-1">Independencia o La Victoria</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoEntrega('lima_delivery')}
                    className={`p-3.5 rounded-[4px] border text-left transition-all cursor-pointer ${
                      metodoEntrega === 'lima_delivery'
                        ? 'border-zinc-950 bg-zinc-50 ring-1 ring-zinc-950'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-brand mb-1" />
                    <div className="font-heading font-bold text-12 uppercase text-zinc-950">Delivery Lima</div>
                    {tarifaLima !== null ? (
                      <>
                        <div className="text-12 text-zinc-900 font-bold mt-0.5">S/ {tarifaLima.toFixed(2)}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">A domicilio</div>
                      </>
                    ) : (
                      <>
                        <div className="text-12 text-zinc-900 font-bold mt-0.5">Por coordinar</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Se coordina por WhatsApp</div>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoEntrega('provincia')}
                    className={`p-3.5 rounded-[4px] border text-left transition-all cursor-pointer ${
                      metodoEntrega === 'provincia'
                        ? 'border-zinc-950 bg-zinc-50 ring-1 ring-zinc-950'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-brand mb-1" />
                    <div className="font-heading font-bold text-12 uppercase text-zinc-950">A Provincias</div>
                    {tarifaProvincia !== null ? (
                      <>
                        <div className="text-12 text-zinc-900 font-bold mt-0.5">S/ {tarifaProvincia.toFixed(2)} base</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Shalom o Marvisur</div>
                      </>
                    ) : (
                      <>
                        <div className="text-12 text-zinc-900 font-bold mt-0.5">Por coordinar</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Se coordina por WhatsApp</div>
                      </>
                    )}
                  </button>
                </div>

                {/* Sub-opciones de Entrega */}
                {metodoEntrega === 'recojo' && (
                  <div className="p-4 bg-[#F5F5F5] rounded-[4px] space-y-3 border border-zinc-200">
                    <span className="text-12 font-heading font-bold uppercase text-zinc-700 block">
                      Selecciona la tienda para tu recojo:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`p-3.5 rounded-[4px] border cursor-pointer transition flex items-start gap-2.5 ${
                        sedeRecojo === 'independencia' ? 'bg-white border-zinc-950 ring-1 ring-zinc-950' : 'bg-white border-zinc-200'
                      }`}>
                        <input
                          type="radio"
                          name="sede_recojo"
                          value="independencia"
                          checked={sedeRecojo === 'independencia'}
                          onChange={() => setSedeRecojo('independencia')}
                          className="mt-1 text-brand"
                        />
                        <div className="text-12">
                          <span className="font-bold text-zinc-900 block">Sede Independencia (Principal)</span>
                          <span className="text-zinc-500 block">Av. Contisuyo 418, Tahuantinsuyo</span>
                          <span className="text-emerald-700 font-medium text-[11px]">Lun-Sáb 9am-10pm / Dom 11am-8pm</span>
                        </div>
                      </label>

                      <label className={`p-3.5 rounded-[4px] border cursor-pointer transition flex items-start gap-2.5 ${
                        sedeRecojo === 'la-victoria' ? 'bg-white border-zinc-950 ring-1 ring-zinc-950' : 'bg-white border-zinc-200'
                      }`}>
                        <input
                          type="radio"
                          name="sede_recojo"
                          value="la-victoria"
                          checked={sedeRecojo === 'la-victoria'}
                          onChange={() => setSedeRecojo('la-victoria')}
                          className="mt-1 text-brand"
                        />
                        <div className="text-12">
                          <span className="font-bold text-zinc-900 block">Sede La Victoria</span>
                          <span className="text-zinc-500 block">Av. Nicolás Arriola 901</span>
                          <span className="text-emerald-700 font-medium text-[11px]">Lun-Sáb 9am-6pm</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {metodoEntrega === 'lima_delivery' && (
                  <div className="space-y-4 p-4 bg-[#F5F5F5] rounded-[4px] border border-zinc-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                          Distrito de Lima <span className="text-brand">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. San Miguel, Los Olivos, Miraflores..."
                          value={distrito}
                          onChange={(e) => setDistrito(e.target.value)}
                          className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] bg-white focus:outline-none focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                          Dirección Exacta <span className="text-brand">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Av., calle, número, dpto."
                          value={direccion}
                          onChange={(e) => setDireccion(e.target.value)}
                          className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] bg-white focus:outline-none focus:border-brand"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                        Referencia de Entrega
                      </label>
                      <input
                        type="text"
                        placeholder="Frente a parque, portón blanco, etc."
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                        className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] bg-white focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                )}

                {metodoEntrega === 'provincia' && (
                  <div className="space-y-4 p-4 bg-[#F5F5F5] rounded-[4px] border border-zinc-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                          Departamento <span className="text-brand">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Arequipa, Cusco, Piura..."
                          value={departamento}
                          onChange={(e) => setDepartamento(e.target.value)}
                          className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] bg-white focus:outline-none focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                          Ciudad / Destino <span className="text-brand">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Trujillo centro, Chiclayo..."
                          value={ciudad}
                          onChange={(e) => setCiudad(e.target.value)}
                          className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] bg-white focus:outline-none focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                          Agencia de Transporte <span className="text-brand">*</span>
                        </label>
                        <select
                          value={agencia}
                          onChange={(e) => setAgencia(e.target.value as any)}
                          className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] bg-white font-bold focus:outline-none focus:border-brand"
                        >
                          <option value="Shalom">Agencia Shalom</option>
                          <option value="Marvisur">Transportes Marvisur</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                        Agencia específica o Dirección
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Shalom Av. Dolores o entrega a domicilio si aplica"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] bg-white focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-12 font-heading font-bold uppercase text-zinc-700 mb-1">
                    Notas adicionales para el despacho (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Instrucciones especiales para el asesor o empaque..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full text-14 px-3 py-2 border border-zinc-300 rounded-[4px] focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha: Resumen de Totales, Aviso de WhatsApp y Botón */}
            <div className="lg:col-span-4 space-y-5 sticky top-24">
              {/* Cupón de Descuento */}
              <div className="bg-white rounded-[4px] p-5 border border-zinc-200 space-y-3">
                <span className="text-12 font-heading font-bold uppercase text-zinc-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand" /> Cupón de Descuento
                </span>

                {cupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center justify-between text-12">
                    <div>
                      <span className="font-bold text-emerald-900 block font-mono">
                        {cupon.codigo}
                      </span>
                      <span className="text-emerald-700">
                        Descuento de {formatPEN(descuento)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCupon(null)}
                      className="text-12 font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ingresa código"
                        value={inputCupon}
                        onChange={(e) => setInputCupon(e.target.value)}
                        className="flex-1 text-12 px-3 py-2 border border-zinc-300 rounded-[4px] uppercase font-mono focus:outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={handleAplicarCupon}
                        disabled={loadingCupon || !inputCupon.trim()}
                        className="px-4 py-2 bg-zinc-950 hover:bg-black text-white rounded-[4px] text-12 font-heading font-bold uppercase disabled:opacity-50 cursor-pointer"
                      >
                        {loadingCupon ? '...' : 'Aplicar'}
                      </button>
                    </div>
                    {cuponError && (
                      <p className="text-[11px] text-red-600 font-medium mt-1.5">{cuponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Resumen de Totales */}
              <div className="bg-white rounded-[4px] p-5 border border-zinc-200 space-y-4">
                <h3 className="font-heading font-bold text-16 uppercase tracking-wider text-zinc-950 pb-2 border-b border-zinc-200">
                  Resumen Económico
                </h3>

                <div className="space-y-2 text-12 text-zinc-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-zinc-900">{formatPEN(subtotal)}</span>
                  </div>

                  {descuento > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Descuento cupón</span>
                      <span>-{formatPEN(descuento)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Costo de Envío</span>
                    <span className="font-bold text-zinc-900">
                      {metodoEntrega === 'recojo' ? (
                        <span className="text-emerald-600 font-bold">GRATIS</span>
                      ) : (metodoEntrega === 'lima_delivery' && tarifaLima === null) ||
                        (metodoEntrega === 'provincia' && tarifaProvincia === null) ? (
                        <span className="text-amber-600 font-bold text-xs">Se coordina por WhatsApp</span>
                      ) : costoEnvio === 0 ? (
                        <span className="text-emerald-600 font-bold">GRATIS</span>
                      ) : (
                        formatPEN(costoEnvio)
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
                    <span className="font-heading font-bold text-14 uppercase text-zinc-950">Total a Pagar</span>
                    <span className="font-heading font-bold text-24 text-[#F58220]">{formatPEN(totalCalculado)}</span>
                  </div>
                </div>

                {/* WIDGET OFICIAL DE ACUOTAZ CON EL TOTAL */}
                <ACuotazWidget amount={totalCalculado} variant="cart" />

                {/* SELECTOR DE MÉTODO DE PAGO SEGÚN REGLA DE NEGOCIO */}
                <div className="p-3.5 bg-[#F5F5F5] border border-zinc-200 rounded-[4px] space-y-2.5">
                  <span className="block text-12 font-heading font-bold uppercase text-zinc-900 tracking-wider">
                    Método de Pago:
                  </span>

                  {/* Opción A: Yape / Plin / Transferencia */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-[4px] border cursor-pointer transition-colors ${
                      metodoPago === 'yape_plin_transferencia'
                        ? 'border-brand bg-white shadow-sm'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodo_pago"
                      value="yape_plin_transferencia"
                      checked={metodoPago === 'yape_plin_transferencia'}
                      onChange={() => setMetodoPago('yape_plin_transferencia')}
                      className="mt-1 text-brand focus:ring-brand h-4 w-4"
                    />
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-zinc-900">
                        Yape, Plin o Transferencia bancaria
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-snug">
                        Registra el pedido y coordina directamente con un asesor por WhatsApp. El stock se descuenta al confirmar el pago.
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {metodosPagoTexto.map((m, idx) => (
                          <span key={idx} className="bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-[2px] text-[10px] font-semibold text-zinc-700">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>

                  {/* Opción B: aCuotaz (Cuotas sin tarjeta coordinado por WhatsApp) */}
                  {(() => {
                    const acuotazConfig = getAcuotazConfig();
                    const cuotaEstimadaTotal = calcularCuotaEstimada(totalCalculado);
                    const faltaParaMinimo = totalCalculado < acuotazConfig.montoMinimo ? acuotazConfig.montoMinimo - totalCalculado : 0;
                    const fueraDeMaximo = totalCalculado > acuotazConfig.montoMaximo;

                    return (
                      <label
                        className={`flex items-start gap-3 p-3 rounded-[4px] border transition-colors ${
                          faltaParaMinimo > 0 || fueraDeMaximo
                            ? 'border-zinc-200 bg-zinc-50 opacity-80 cursor-not-allowed'
                            : metodoPago === 'acuotaz'
                            ? 'border-brand bg-white shadow-sm cursor-pointer'
                            : 'border-zinc-200 bg-zinc-50 hover:bg-white cursor-pointer'
                        }`}
                      >
                        <input
                          type="radio"
                          name="metodo_pago"
                          value="acuotaz"
                          disabled={faltaParaMinimo > 0 || fueraDeMaximo}
                          checked={metodoPago === 'acuotaz'}
                          onChange={() => {
                            if (faltaParaMinimo === 0 && !fueraDeMaximo) {
                              setMetodoPago('acuotaz');
                            }
                          }}
                          className="mt-1 text-brand focus:ring-brand h-4 w-4"
                        />
                        <div className="text-xs space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-zinc-900">
                              En cuotas con aCuotaz (se coordina por WhatsApp)
                            </span>
                            <span className="bg-[#111111] text-white font-bold text-[10px] px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide">
                              SOLO CON DNI
                            </span>
                          </div>

                          {faltaParaMinimo > 0 ? (
                            <p className="text-[11px] text-amber-700 font-bold bg-amber-50 p-2 rounded-[2px] border border-amber-200">
                              Agrega S/ {faltaParaMinimo.toFixed(2)} más para pagar en cuotas
                            </p>
                          ) : fueraDeMaximo ? (
                            <p className="text-[11px] text-zinc-500 bg-zinc-100 p-2 rounded-[2px]">
                              Para pedidos mayores a S/ {acuotazConfig.montoMaximo.toFixed(2)}, la coordinación se realiza directamente con un asesor por WhatsApp.
                            </p>
                          ) : cuotaEstimadaTotal !== null ? (
                            <p className="text-[12px] text-zinc-700 leading-snug">
                              Llévatelo en <strong className="font-bold text-zinc-950">{acuotazConfig.numeroCuotas}</strong> cuotas quincenales de{' '}
                              <strong className="text-[#F58220] font-black text-13">S/ {cuotaEstimadaTotal.toFixed(2)}</strong>.
                              <span className="text-[11px] text-zinc-500 ml-1">Sin tarjeta de crédito.</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-zinc-600 leading-snug">
                              Paga en cuotas sin tarjeta, solo con tu DNI.
                            </p>
                          )}

                          <p className="text-[11px] text-zinc-500 leading-snug">
                            Atención al cliente le envía el enlace de aCuotaz y coordina todo por WhatsApp.
                          </p>
                        </div>
                      </label>
                    );
                  })()}
                </div>

                {/* Checkbox Obligatorio de Política de Privacidad */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={aceptaPrivacidad}
                      onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                      className="mt-0.5 rounded-[2px] border-zinc-300 text-brand focus:ring-brand h-4 w-4"
                    />
                    <span className="text-[11px] text-zinc-600 leading-tight">
                      Acepto la{' '}
                      <Link href="/politicas/privacidad" target="_blank" className="text-brand font-bold underline hover:text-black">
                        Política de Privacidad
                      </Link>{' '}
                      y los{' '}
                      <Link href="/politicas/terminos" target="_blank" className="text-brand font-bold underline hover:text-black">
                        Términos de Compra
                      </Link>
                      . El precio válido es el registrado en el pedido.
                    </span>
                  </label>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* BOTÓN OFICIAL SEGÚN MÉTODO DE PAGO */}
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className={`w-full py-4 font-heading font-black text-sm uppercase tracking-wider rounded-[4px] transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer ${
                    metodoPago === 'acuotaz'
                      ? 'bg-[#F58220] hover:bg-[#E07216] text-zinc-950'
                      : 'bg-[#25D366] hover:bg-[#1EBE5D] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Registrando y coordinando...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      <span>
                        {metodoPago === 'acuotaz'
                          ? 'Enviar pedido por WhatsApp (Cuotas aCuotaz)'
                          : 'Enviar pedido por WhatsApp'}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-zinc-400 text-center leading-normal">
                  {metodoPago === 'acuotaz'
                    ? 'Se generará tu pedido y te contactaremos por WhatsApp con el enlace de aCuotaz para iniciar tu evaluación con DNI.'
                    : 'Se generará tu código correlativo (ej. IORI-000001) y serás dirigido a WhatsApp con el detalle completo listo.'}
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
