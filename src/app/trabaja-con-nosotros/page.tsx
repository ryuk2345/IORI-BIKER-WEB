'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Briefcase, Upload, FileText, CheckCircle2, AlertCircle, 
  Loader2, ShieldCheck, HeartHandshake, Zap, Award, Users 
} from 'lucide-react';

const PUESTOS_DISPONIBLES = [
  'Asesor de Ventas Presencial (Sede Tahuantisuyo - Independencia)',
  'Asesor de Ventas Presencial (Sede La Victoria)',
  'Especialista en Ventas y Asesoría por WhatsApp',
  'Técnico Instalador de Intercomunicadores y Accesorios',
  'Encargado de Almacén, Control de Stock y Despachos',
  'Creador de Contenido y Fotógrafo Biker',
  'Postulación Espontánea / Talento General',
];

export default function TrabajaConNosotrosPage() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    puesto: PUESTOS_DISPONIBLES[0],
    nombre: '',
    celular: '',
    email: '',
    mensaje: '',
    acepta_privacidad: false,
    _hp: '', // Honeypot
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('El archivo debe ser un documento PDF (.pdf).');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('El archivo no debe superar los 5 MB de tamaño.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedFile) {
      setErrorMsg('Por favor selecciona y adjunta tu Curriculum Vitae en formato PDF.');
      return;
    }

    if (!formData.acepta_privacidad) {
      setErrorMsg('Debes aceptar la política de privacidad para procesar tu postulación.');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('puesto', formData.puesto);
      dataToSend.append('nombre', formData.nombre);
      dataToSend.append('celular', formData.celular);
      dataToSend.append('email', formData.email);
      dataToSend.append('mensaje', formData.mensaje);
      dataToSend.append('acepta_privacidad', formData.acepta_privacidad ? 'true' : 'false');
      dataToSend.append('_hp', formData._hp);
      dataToSend.append('cv', selectedFile);

      const res = await fetch('/api/postulaciones', {
        method: 'POST',
        body: dataToSend,
      });

      const resData = await res.json();

      if (!res.ok || resData.error) {
        throw new Error(resData.error || 'Ocurrió un error al enviar tu postulación');
      }

      setEnviado(true);
      setFormData({
        puesto: PUESTOS_DISPONIBLES[0],
        nombre: '',
        celular: '',
        email: '',
        mensaje: '',
        acepta_privacidad: false,
        _hp: '',
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el archivo. Inténtalo nuevamente.');
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
          <span className="text-zinc-900 font-semibold">Trabaja con Nosotros</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-black text-white rounded-3xl p-8 sm:p-12 mb-12 shadow-xl border-t-4 border-brand relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <span className="text-xs font-bold text-brand uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              Cultura Biker • Empleo
            </span>
            <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-wider text-white mt-4 mb-4">
              Únete al Equipo de Iori Biker Shop
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              ¿Vives la pasión por las dos ruedas y te apasiona brindar la mejor asesoría en cascos e indumentaria certificada? Estamos en constante búsqueda de talentos comprometidos con la seguridad y la satisfacción del motociclista peruano.
            </p>
          </div>

          {/* Grilla de Beneficios */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-zinc-800/80 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm uppercase text-white">Ambiente Motero</h4>
                <p className="text-xs text-zinc-400 mt-1">Cultura de camaradería, rutas y respeto mutuo.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm uppercase text-white">Línea de Carrera</h4>
                <p className="text-xs text-zinc-400 mt-1">Capacitaciones continuas en marcas líderes internacionales.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm uppercase text-white">Descuentos Especiales</h4>
                <p className="text-xs text-zinc-400 mt-1">Beneficios exclusivos en equipamiento para tu moto.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario y Detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Información de Sedes y Requisitos */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs">
              <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-black mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand" /> Sedes de Trabajo
              </h3>
              <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                Nuestras operaciones presenciales se concentran en las dos tiendas de Lima:
              </p>
              <ul className="space-y-3 text-xs text-zinc-700">
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="font-bold text-zinc-900 block">Sede Independencia (Lima Norte):</span>
                  Av. Contisuyo #418, Tahuantinsuyo.
                </li>
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="font-bold text-zinc-900 block">Sede La Victoria (Lima Centro):</span>
                  Av. Nicolás Arriola 901.
                </li>
              </ul>
            </div>

            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-6 sm:p-7 text-xs text-orange-900 space-y-3">
              <div className="flex items-center gap-2 font-bold uppercase text-brand tracking-wider">
                <ShieldCheck className="w-5 h-5" /> Confidencialidad y Seguridad
              </div>
              <p className="leading-relaxed">
                Tu Curriculum Vitae será almacenado en un repositorio seguro y privado de Iori Biker Shop. Solo el equipo directivo y de Recursos Humanos tendrá acceso a tu información para fines exclusivos de selección de personal.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Postulación con subida de PDF */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-9 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                Convocatoria Abierta
              </span>
              <h2 className="font-heading font-bold text-2xl uppercase tracking-wider text-black mt-1">
                Formulario de Postulación
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Completa tus datos personales y adjunta tu CV en formato PDF (máximo 5 MB).
              </p>
            </div>

            {enviado ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-black text-xl uppercase text-emerald-950">
                  ¡Postulación Registrada!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Gracias por tu interés en formar parte de Iori Biker Shop. Nuestro equipo evaluará tu perfil y te contactará por celular o correo si tu postulación calza con los requerimientos del puesto.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setEnviado(false)}
                    className="px-6 py-2.5 bg-emerald-700 text-white text-xs font-bold uppercase rounded-xl hover:bg-emerald-800 transition-colors shadow-xs"
                  >
                    Enviar otra postulación
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot oculto contra robots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="_hp_postulacion">No rellenar este campo</label>
                  <input
                    id="_hp_postulacion"
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
                    Puesto de Interés <span className="text-brand">*</span>
                  </label>
                  <select
                    value={formData.puesto}
                    onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white"
                  >
                    {PUESTOS_DISPONIBLES.map((puesto) => (
                      <option key={puesto} value={puesto}>{puesto}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Nombre Completo <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza Vargas"
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
                      Correo Electrónico <span className="text-brand">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="carlos@correo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                    />
                  </div>
                </div>

                {/* Subida de Archivo CV (PDF hasta 5 MB) */}
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Curriculum Vitae (PDF hasta 5 MB) <span className="text-brand">*</span>
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      selectedFile 
                        ? 'border-emerald-400 bg-emerald-50/40' 
                        : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-brand'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 text-emerald-600" />
                        <span className="text-sm font-bold text-zinc-900 break-all">{selectedFile.name}</span>
                        <span className="text-xs text-zinc-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Clic para cambiar archivo
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-zinc-400" />
                        <span className="text-sm font-bold text-zinc-800">
                          Selecciona o arrastra tu archivo CV en formato PDF
                        </span>
                        <span className="text-xs text-zinc-400">
                          Solo archivos PDF (.pdf) con un peso no mayor a 5 MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Carta de Presentación o Experiencia Previa (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Cuéntanos brevemente sobre tu experiencia en motos, ventas o servicio al cliente..."
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
                      . Autorizo el almacenamiento seguro de mi CV para fines de evaluación laboral.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Subiendo CV y Registrando Postulación...
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-5 h-5" /> Postular a Iori Biker Shop
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
