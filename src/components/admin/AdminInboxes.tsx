'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, ShoppingCart, CreditCard, FileText, MessageSquare, 
  BookOpen, Clock, ExternalLink, CheckCircle2, 
  AlertCircle, Download, RefreshCw, Phone, Mail, Calendar, 
  User, Check, X, Eye, Loader2, ArrowRight, Send, MessageCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AdminOrdersManager } from '@/components/admin/AdminOrdersManager';

interface AdminInboxesProps {
  counts: {
    pedidos: number;
    financiamiento: number;
    postulaciones: number;
    contacto: number;
    resenas: number;
    reclamaciones: number;
  };
  onRefresh?: () => void;
}

export function AdminInboxes({ counts, onRefresh }: AdminInboxesProps) {
  const [activeInbox, setActiveInbox] = useState<
    'pedidos' | 'financiamiento' | 'postulaciones' | 'contacto' | 'reclamaciones'
  >('pedidos');

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Estados para respuesta de Libro de Reclamaciones
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [savingResponse, setSavingResponse] = useState(false);

  const inboxes = [
    { id: 'pedidos', label: 'Pedidos WhatsApp', count: counts.pedidos, icon: ShoppingCart, desc: 'Gestión integral de pedidos, validación de stock, plantillas de atención y exportación.' },
    { id: 'financiamiento', label: 'Financiamiento', count: counts.financiamiento, icon: CreditCard, desc: 'Solicitudes en cuotas con evaluación de DNI y producto de interés.' },
    { id: 'postulaciones', label: 'Trabaja con Nosotros', count: counts.postulaciones, icon: FileText, desc: 'Postulaciones con CV en PDF almacenado en bucket privado.' },
    { id: 'contacto', label: 'Mensajes de Contacto', count: counts.contacto, icon: MessageSquare, desc: 'Consultas generales y solicitudes de atención desde la web.' },
    { id: 'reclamaciones', label: 'Reclamaciones', count: counts.reclamaciones, icon: BookOpen, desc: 'Reclamaciones y quejas formales con correlativo oficial y registro de respuesta.' },
  ];

  // Cargar datos de la bandeja activa
  const fetchInboxData = async (inboxType: string) => {
    if (inboxType === 'pedidos') {
      // AdminOrdersManager maneja su propio estado optimizado
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (inboxType === 'financiamiento') {
        const { data } = await supabase
          .from('solicitudes_financiamiento')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        setItems(data || []);
      } else if (inboxType === 'postulaciones') {
        const { data } = await supabase
          .from('postulaciones')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        setItems(data || []);
      } else if (inboxType === 'contacto') {
        const { data } = await supabase
          .from('mensajes_contacto')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        setItems(data || []);
      } else if (inboxType === 'reclamaciones') {
        const { data } = await supabase
          .from('libro_reclamaciones')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        setItems(data || []);
      }
    } catch (err) {
      console.error('Error cargando inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboxData(activeInbox);
  }, [activeInbox]);

  // Actualizar estado genérico
  const handleUpdateStatus = async (table: string, id: string, field: string, value: any) => {
    setUpdatingId(id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from(table)
        .update({ [field]: value })
        .eq('id', id);

      if (!error) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error actualizando estado:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Guardar respuesta oficial de Libro de Reclamaciones
  const handleSaveResponse = async (reclamacionId: string) => {
    if (!responseText.trim()) {
      alert('Por favor ingresa el texto de la respuesta formal antes de guardar.');
      return;
    }

    setSavingResponse(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('libro_reclamaciones')
        .update({
          respuesta: responseText.trim(),
          estado: 'atendido',
        })
        .eq('id', reclamacionId);

      if (error) {
        alert('Error al guardar la respuesta: ' + error.message);
      } else {
        setItems((prev) =>
          prev.map((it) =>
            it.id === reclamacionId
              ? { ...it, respuesta: responseText.trim(), estado: 'atendido' }
              : it
          )
        );
        setEditingResponseId(null);
        setResponseText('');
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      console.error('Error:', err);
      alert('Error de conexión al guardar.');
    } finally {
      setSavingResponse(false);
    }
  };

  const current = inboxes.find((i) => i.id === activeInbox)!;

  return (
    <div className="space-y-6">
      {/* Selector de Bandeja */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {inboxes.map((item) => {
          const Icon = item.icon;
          const isActive = activeInbox === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveInbox(item.id as any)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#f58220]' : 'text-zinc-500'}`} />
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-[#f58220] text-black' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {item.count}
                </span>
              </div>
              <span className="font-extrabold text-xs uppercase tracking-wider block">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenido Principal de la Bandeja */}
      {activeInbox === 'pedidos' ? (
        <AdminOrdersManager />
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f58220]" />
                <h3 className="text-xl font-heading font-black uppercase tracking-wider text-zinc-900">
                  Bandeja: {current.label} ({items.length})
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{current.desc}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchInboxData(activeInbox)}
              disabled={loading}
              className="self-start sm:self-auto px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#f58220]" />
              <span className="text-xs font-bold uppercase">Cargando registros de Supabase...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 space-y-2">
              <Inbox className="w-12 h-12 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-600">No hay registros en esta bandeja</p>
              <p className="text-xs text-zinc-400">Los nuevos envíos desde la web aparecerán automáticamente aquí.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 1. VISTA DE FINANCIAMIENTO */}
              {activeInbox === 'financiamiento' && (
                <div className="space-y-4">
                  {items.map((fin) => {
                    const nombreCliente = fin.cliente_nombre || fin.nombre || 'Cliente';
                    const celularCliente = fin.cliente_celular || fin.celular || '';
                    const dniCliente = fin.cliente_dni || fin.dni || '-';
                    const emailCliente = fin.cliente_email || fin.email || '-';

                    const waText = `¡Hola ${nombreCliente}! Te saludamos de Iori Biker Shop. Hemos recibido tu solicitud de financiamiento *${fin.codigo}* para ${fin.producto_nombre || 'tu producto'}. Quedamos a tu disposición para los requisitos.`;
                    const waUrl = `https://wa.me/51${celularCliente.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;

                    return (
                      <div key={fin.id} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 bg-black text-[#f58220] font-heading font-black text-xs uppercase rounded-lg">
                              {fin.codigo}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {new Date(fin.created_at).toLocaleString('es-PE')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={fin.estado}
                              disabled={updatingId === fin.id}
                              onChange={(e) => handleUpdateStatus('solicitudes_financiamiento', fin.id, 'estado', e.target.value)}
                              className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg border border-zinc-300 bg-white"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_revision">En Revisión</option>
                              <option value="aprobado">Aprobado</option>
                              <option value="rechazado">Rechazado</option>
                            </select>

                            {celularCliente && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-lg transition"
                              >
                                <Phone className="w-3.5 h-3.5" /> WhatsApp
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-zinc-600 bg-white p-3.5 rounded-xl border border-zinc-100">
                          <div>
                            <span className="font-bold text-zinc-900 block">Solicitante:</span>
                            {nombreCliente} • DNI: {dniCliente}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">Contacto:</span>
                            {celularCliente} • {emailCliente}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">Producto de Interés:</span>
                            <span className="font-bold text-black">{fin.producto_nombre || 'No especificado'}</span>
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">Plan Solicitado:</span>
                            <span>{fin.cuotas_deseadas ? `${fin.cuotas_deseadas} Cuotas` : 'Por evaluar'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. VISTA DE POSTULACIONES */}
              {activeInbox === 'postulaciones' && (
                <div className="space-y-4">
                  {items.map((post) => {
                    const waText = `¡Hola ${post.nombre}! Te saludamos de Recursos Humanos de Iori Biker Shop respecto a tu postulación para ${post.puesto_interes || 'el puesto'}.`;
                    const waUrl = `https://wa.me/51${post.celular?.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;

                    return (
                      <div key={post.id} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 bg-zinc-800 text-white font-heading font-black text-xs uppercase rounded-lg">
                              {post.puesto_interes || 'Postulación'}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {new Date(post.created_at).toLocaleString('es-PE')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={post.estado}
                              disabled={updatingId === post.id}
                              onChange={(e) => handleUpdateStatus('postulaciones', post.id, 'estado', e.target.value)}
                              className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg border border-zinc-300 bg-white"
                            >
                              <option value="recibido">Recibido</option>
                              <option value="en_evaluacion">En Evaluación</option>
                              <option value="contactado">Contactado</option>
                              <option value="descartado">Descartado</option>
                            </select>

                            {post.cv_url && (
                              <a
                                href={post.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Ver CV
                              </a>
                            )}

                            {post.celular && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-lg transition"
                              >
                                <Phone className="w-3.5 h-3.5" /> WhatsApp
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600 bg-white p-3.5 rounded-xl border border-zinc-100">
                          <div>
                            <span className="font-bold text-zinc-900 block">Candidato:</span>
                            {post.nombre} • DNI: {post.dni || '-'}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">Contacto:</span>
                            {post.celular} • {post.email || '-'}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">Sede de Preferencia:</span>
                            {post.sede_preferencia || 'Independencia / La Victoria'}
                          </div>
                        </div>

                        {post.experiencia && (
                          <div className="text-xs text-zinc-700 bg-white p-3.5 rounded-xl border border-zinc-200">
                            <span className="font-bold text-zinc-900 block mb-1">Resumen de Experiencia:</span>
                            {post.experiencia}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. VISTA DE CONTACTO */}
              {activeInbox === 'contacto' && (
                <div className="space-y-4">
                  {items.map((msg) => {
                    const waText = `¡Hola ${msg.nombre}! Te saludamos de Iori Biker Shop. Recibimos tu consulta desde nuestra web. ¿En qué podemos ayudarte?`;
                    const waUrl = `https://wa.me/51${msg.celular?.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;

                    return (
                      <div key={msg.id} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 bg-amber-500 text-black font-heading font-black text-xs uppercase rounded-lg">
                              {msg.motivo || 'Consulta Web'}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {new Date(msg.created_at).toLocaleString('es-PE')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={updatingId === msg.id}
                              onClick={() => handleUpdateStatus('mensajes_contacto', msg.id, 'leido', !msg.leido)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                msg.leido 
                                  ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300' 
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {msg.leido ? 'Marcar no leído' : 'Marcar como leído'}
                            </button>

                            {msg.celular && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-lg transition"
                              >
                                <Phone className="w-3.5 h-3.5" /> Responder WhatsApp
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600 bg-white p-3.5 rounded-xl border border-zinc-100">
                          <div>
                            <span className="font-bold text-zinc-900 block">De:</span>
                            {msg.nombre}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">Celular:</span>
                            {msg.celular}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">Email:</span>
                            {msg.email || '-'}
                          </div>
                        </div>

                        <div className="text-xs text-zinc-700 bg-white p-4 rounded-xl border border-zinc-200 leading-relaxed font-normal">
                          <span className="font-bold text-zinc-900 block mb-1">Mensaje:</span>
                          {msg.mensaje}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 4. VISTA DE LIBRO DE RECLAMACIONES (CON REGISTRO DE RESPUESTA) */}
              {activeInbox === 'reclamaciones' && (
                <div className="space-y-4">
                  {items.map((rec) => {
                    const consumidor = rec.datos_consumidor || {};
                    const bien = rec.bien_contratado || {};
                    const detalle = rec.detalle_reclamacion || {};
                    const isEditing = editingResponseId === rec.id;

                    const waText = `Estimado(a) ${consumidor.nombres || 'Consumidor'}: Te saludamos de Iori Biker Shop respecto a tu ${detalle.tipo || 'reclamación'} N° *${rec.codigo}*.\n\nRespuesta formal:\n${rec.respuesta || 'Hemos tomado conocimiento de tu caso y lo estamos evaluando para darte respuesta inmediata.'}`;
                    const waUrl = consumidor.telefono ? `https://wa.me/51${consumidor.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}` : null;

                    return (
                      <div key={rec.id} className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl hover:border-zinc-300 transition space-y-4 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-3 py-1 bg-red-600 text-white font-heading font-black text-xs uppercase rounded-lg tracking-wider">
                              Hoja Oficial: {rec.codigo}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {new Date(rec.created_at).toLocaleString('es-PE')}
                            </span>
                            {rec.respuesta && (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase rounded-full">
                                Respuesta Registrada
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={rec.estado}
                              disabled={updatingId === rec.id}
                              onChange={(e) => handleUpdateStatus('libro_reclamaciones', rec.id, 'estado', e.target.value)}
                              className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg border border-zinc-300 bg-white"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En Proceso</option>
                              <option value="atendido">Atendido</option>
                            </select>

                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-lg transition"
                              >
                                <Phone className="w-3.5 h-3.5" /> WhatsApp Consumidor
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Ficha Resumen */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-700 bg-white p-4 rounded-2xl border border-zinc-200">
                          <div>
                            <span className="font-bold text-zinc-900 block mb-0.5">Consumidor:</span>
                            <p className="font-medium text-black">{consumidor.nombres} {consumidor.apellidos}</p>
                            <p className="text-zinc-500">{consumidor.tipo_documento || 'DNI'}: {consumidor.numero_documento || '-'}</p>
                            <p className="text-zinc-500">Domicilio: {consumidor.domicilio || '-'}</p>
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block mb-0.5">Contacto:</span>
                            <p className="font-medium text-black">{consumidor.telefono || '-'}</p>
                            <p className="text-zinc-500">{consumidor.email || '-'}</p>
                            {consumidor.padre_tutor && <p className="text-amber-800">Tutor: {consumidor.padre_tutor}</p>}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block mb-0.5">Bien Contratado:</span>
                            <span className="font-black uppercase text-red-600 block">{detalle.tipo || 'Reclamo'}</span>
                            <p className="font-medium text-black">{bien.descripcion || 'Producto'}</p>
                            <p className="text-zinc-500">Monto: {bien.monto ? `S/ ${bien.monto}` : 'No especificado'}</p>
                          </div>
                        </div>

                        {/* Detalle y Solución solicitada */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-white p-4 rounded-xl border border-zinc-200">
                            <span className="font-bold text-zinc-900 block mb-1">Detalle de los Hechos:</span>
                            <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">{detalle.detalle}</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-zinc-200">
                            <span className="font-bold text-zinc-900 block mb-1">Pedido Concreto del Consumidor:</span>
                            <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">{detalle.pedido}</p>
                          </div>
                        </div>

                        {/* Sección de Respuesta Formal de la Empresa */}
                        <div className="bg-zinc-100/80 p-4 rounded-2xl border border-zinc-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Respuesta Oficial del Proveedor (IORI SAC)
                            </span>
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingResponseId(rec.id);
                                  setResponseText(rec.respuesta || '');
                                }}
                                className="text-xs font-bold text-[#f58220] hover:underline cursor-pointer"
                              >
                                {rec.respuesta ? 'Editar Respuesta' : '+ Registrar Respuesta Formal'}
                              </button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                rows={3}
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Escribe aquí la respuesta formal que se registrará para esta reclamación..."
                                className="w-full text-xs p-3 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#f58220]"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={savingResponse}
                                  onClick={() => {
                                    setEditingResponseId(null);
                                    setResponseText('');
                                  }}
                                  className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold rounded-lg cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  disabled={savingResponse}
                                  onClick={() => handleSaveResponse(rec.id)}
                                  className="px-4 py-1.5 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white text-xs font-black uppercase rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  {savingResponse ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                  <span>Guardar y Marcar Atendido</span>
                                </button>
                              </div>
                            </div>
                          ) : rec.respuesta ? (
                            <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-zinc-800">
                              <p className="whitespace-pre-wrap">{rec.respuesta}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-500 italic">
                              Pendiente de respuesta. Haz clic en "Registrar Respuesta Formal" para redactar y cerrar el reclamo conforme a ley.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
