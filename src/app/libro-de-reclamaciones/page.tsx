'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, AlertCircle, Send, Printer, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { DATOS_NEGOCIO } from '@/data/mock';

export default function LibroReclamacionesPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [resultado, setResultado] = useState<{
    codigo: string;
    fecha: string;
    datos_proveedor: {
      razon_social: string;
      nombre_comercial: string;
      ruc: string;
      direccion: string;
    };
    emailSent: boolean;
  } | null>(null);

  const [formData, setFormData] = useState({
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    domicilio: '',
    telefono: '',
    email: '',
    padreTutor: '',
    tipoBien: 'producto',
    montoReclamado: '',
    descripcionBien: '',
    tipoReclamacion: 'reclamo',
    detalle: '',
    pedido: '',
    declaroVerdad: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.declaroVerdad) {
      setErrorMsg('Debes confirmar la declaración de veracidad de la información.');
      return;
    }

    // Validar teléfono peruano básico
    if (formData.telefono.replace(/\D/g, '').length < 9) {
      setErrorMsg('Ingresa un número de teléfono/celular válido (mínimo 9 dígitos).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reclamaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al registrar la reclamación');
      }

      setResultado(data);
      setEnviado(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error de conexión al enviar el reclamo. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-14 bg-zinc-50 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-black">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Libro de Reclamaciones</span>
        </nav>

        {/* Encabezado oficial */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-zinc-200 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black text-[#f58220] rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wider text-black">
                  Libro de Reclamaciones Virtual
                </h1>
                <p className="text-xs text-zinc-500">
                  Iori Biker Shop • Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571)
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs text-zinc-500">
              <p className="font-bold text-zinc-900">Razón Social: IORI SAC</p>
              <p>RUC: 20610816089</p>
              <p>Dirección: Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">Definiciones conforme al D.S. N° 011-2011-PCM:</p>
            <p><b>• RECLAMO:</b> Disconformidad relacionada a los productos o servicios ofrecidos por el establecimiento comercial.</p>
            <p><b>• QUEJA:</b> Malestar o descontento respecto a la atención al público, no relacionada directamente al producto.</p>
            <p className="mt-1 text-[11px] text-amber-800">
              * El proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles improrrogables.
            </p>
          </div>
        </div>

        {enviado && resultado ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-zinc-200 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full uppercase tracking-wider">
                Registro Oficial Exitoso
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wider text-black mt-3">
                Hoja de Reclamación N° {resultado.codigo}
              </h2>
              <p className="text-sm text-zinc-600 max-w-lg mx-auto mt-2">
                Hemos registrado formalmente tu {formData.tipoReclamacion.toUpperCase()} en nuestro sistema. De acuerdo con la normativa peruana de Indecopi, te responderemos formalmente en un plazo máximo de 15 días hábiles.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-md mx-auto text-xs text-emerald-800 flex items-center gap-2.5 text-left">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Hemos enviado una copia detallada de esta hoja de reclamación a tu correo: <b>{formData.email}</b>.
              </span>
            </div>

            <div className="bg-zinc-50 p-5 rounded-2xl max-w-lg mx-auto text-left text-xs space-y-2 text-zinc-700 border border-zinc-200">
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <span className="font-bold text-zinc-900">Número Correlativo:</span>
                <span className="font-mono font-black text-black">{resultado.codigo}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <span className="font-bold text-zinc-900">Fecha y Hora:</span>
                <span>{new Date(resultado.fecha).toLocaleString('es-PE')}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <span className="font-bold text-zinc-900">Proveedor:</span>
                <span>{resultado.datos_proveedor.razon_social} (RUC {resultado.datos_proveedor.ruc})</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <span className="font-bold text-zinc-900">Consumidor:</span>
                <span>{formData.nombres} {formData.apellidos}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <span className="font-bold text-zinc-900">Documento:</span>
                <span>{formData.tipoDocumento} {formData.numeroDocumento}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2">
                <span className="font-bold text-zinc-900">Bien Reclamado:</span>
                <span>{formData.descripcionBien}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-zinc-900">Tipo de Incidencia:</span>
                <span className="font-black uppercase text-red-600">{formData.tipoReclamacion}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-black text-white rounded-xl font-heading font-black text-xs uppercase tracking-wider transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir Hoja Oficial
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white rounded-xl font-heading font-black text-xs uppercase tracking-wider transition"
              >
                Volver a la tienda
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-zinc-200 space-y-8">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sección 1: Datos del Consumidor */}
            <div>
              <h2 className="font-heading font-bold text-base uppercase tracking-wider text-black mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#f58220] text-black text-xs flex items-center justify-center font-mono font-black">1</span>
                Identificación del Consumidor Reclamante
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Tipo Documento *</label>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220] bg-white"
                  >
                    <option value="DNI">DNI (8 dígitos)</option>
                    <option value="CE">Carné de Extranjería (CE)</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="RUC">RUC (11 dígitos)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Número de Documento *</label>
                  <input
                    type="text"
                    name="numeroDocumento"
                    required
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    placeholder="Ej. 70123456"
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Teléfono / Celular *</label>
                  <input
                    type="tel"
                    name="telefono"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej. 905445698"
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    required
                    value={formData.nombres}
                    onChange={handleChange}
                    placeholder="Tus nombres"
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    required
                    value={formData.apellidos}
                    onChange={handleChange}
                    placeholder="Tus apellidos"
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Domicilio Completo *</label>
                  <input
                    type="text"
                    name="domicilio"
                    required
                    placeholder="Dirección, distrito, provincia y departamento"
                    value={formData.domicilio}
                    onChange={handleChange}
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Correo Electrónico (para notificación) *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="tucorreo@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Padre, Madre o Tutor (si el consumidor es menor de edad)</label>
                <input
                  type="text"
                  name="padreTutor"
                  placeholder="Nombre y DNI del representante legal (opcional)"
                  value={formData.padreTutor}
                  onChange={handleChange}
                  className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                />
              </div>
            </div>

            {/* Sección 2: Identificación del Bien Contratado */}
            <div>
              <h2 className="font-heading font-bold text-base uppercase tracking-wider text-black mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#f58220] text-black text-xs flex items-center justify-center font-mono font-black">2</span>
                Identificación del Bien Contratado
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Tipo de Bien *</label>
                  <select
                    name="tipoBien"
                    value={formData.tipoBien}
                    onChange={handleChange}
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220] bg-white"
                  >
                    <option value="producto">Producto (Casco, Guante, Accesorio, etc.)</option>
                    <option value="servicio">Servicio (Envío, Atención, etc.)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Monto Reclamado (PEN S/)</label>
                  <input
                    type="text"
                    name="montoReclamado"
                    placeholder="Ej. S/ 380.00"
                    value={formData.montoReclamado}
                    onChange={handleChange}
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Descripción del Producto o Servicio *</label>
                <input
                  type="text"
                  name="descripcionBien"
                  required
                  placeholder="Ej. Casco Shaft Pro Series Talla L Negro Mate / Pedido IORI-000001"
                  value={formData.descripcionBien}
                  onChange={handleChange}
                  className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                />
              </div>
            </div>

            {/* Sección 3: Detalle de la Reclamación */}
            <div>
              <h2 className="font-heading font-bold text-base uppercase tracking-wider text-black mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#f58220] text-black text-xs flex items-center justify-center font-mono font-black">3</span>
                Detalle de la Reclamación y Pedido
              </h2>

              <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-2">Tipo de Incidencia *</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="tipoReclamacion"
                      value="reclamo"
                      checked={formData.tipoReclamacion === 'reclamo'}
                      onChange={handleChange}
                      className="text-[#f58220] focus:ring-[#f58220]"
                    />
                    <span className="font-bold">Reclamo</span> (Disconformidad con el producto o servicio)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="tipoReclamacion"
                      value="queja"
                      checked={formData.tipoReclamacion === 'queja'}
                      onChange={handleChange}
                      className="text-[#f58220] focus:ring-[#f58220]"
                    />
                    <span className="font-bold">Queja</span> (Malestar o disconformidad en la atención)
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Detalle de los Hechos *</label>
                  <textarea
                    name="detalle"
                    required
                    rows={4}
                    placeholder="Describe de forma clara los hechos ocurridos..."
                    value={formData.detalle}
                    onChange={handleChange}
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Pedido Concreto del Consumidor *</label>
                  <textarea
                    name="pedido"
                    required
                    rows={2}
                    placeholder="¿Qué solución específica solicitas? (Ej. cambio de producto, revisión técnica, reposición, etc.)"
                    value={formData.pedido}
                    onChange={handleChange}
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#f58220]"
                  />
                </div>
              </div>
            </div>

            {/* Declaración legal */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-zinc-600">
                <input
                  type="checkbox"
                  name="declaroVerdad"
                  checked={formData.declaroVerdad}
                  onChange={handleChange}
                  className="mt-0.5 text-[#f58220] rounded focus:ring-[#f58220]"
                />
                <span>
                  Declaro ser el titular del servicio/producto y que los datos consignados en el presente formulario son verídicos, conforme a la Ley de Protección de Datos Personales (Ley N° 29733) y el Código de Protección al Consumidor.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white font-heading font-black text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registrando en Libro Oficial...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Registrar Hoja de Reclamación</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
