'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Edit2, Trash2, Save, RefreshCw, 
  HelpCircle, ShieldCheck, Check, AlertCircle, Eye, 
  Upload, Tag, Globe, CheckCircle2, Loader2, Sparkles, 
  BadgePercent, ArrowRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminContentManagerProps {
  settings?: Record<string, any>;
  onRefresh?: () => void;
}

export function AdminContentManager({ settings = {}, onRefresh }: AdminContentManagerProps = {}) {
  const [activeTab, setActiveTab] = useState<'blog' | 'faqs' | 'politicas' | 'financiamiento'>('blog');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [politicasRevisadas, setPoliticasRevisadas] = useState(
    Boolean(settings?.politicas_faqs_revisadas?.completado)
  );

  useEffect(() => {
    setPoliticasRevisadas(Boolean(settings?.politicas_faqs_revisadas?.completado));
  }, [settings]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#seccion-politicas') {
      setActiveTab('politicas');
      setTimeout(() => {
        document.getElementById('seccion-politicas')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, []);

  // -------------------------------------------------------------
  // ESTADO: BLOG
  // -------------------------------------------------------------
  const [articulos, setArticulos] = useState<any[]>([]);
  const [editingArticulo, setEditingArticulo] = useState<any | null>(null);
  const [isNewArticulo, setIsNewArticulo] = useState(false);

  // -------------------------------------------------------------
  // ESTADO: FAQS
  // -------------------------------------------------------------
  const [faqs, setFaqs] = useState<any[]>([]);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [isNewFaq, setIsNewFaq] = useState(false);

  // -------------------------------------------------------------
  // ESTADO: POLÍTICAS
  // -------------------------------------------------------------
  const [politicas, setPoliticas] = useState<any[]>([]);
  const [selectedPoliticaSlug, setSelectedPoliticaSlug] = useState<string>('envios-y-devoluciones');
  const [editingPolitica, setEditingPolitica] = useState<any>({
    slug: 'envios-y-devoluciones',
    titulo: '',
    subtitulo: '',
    contenido: '',
  });

  // -------------------------------------------------------------
  // ESTADO: CONDICIONES FINANCIAMIENTO
  // -------------------------------------------------------------
  const [condicionesFinanciamiento, setCondicionesFinanciamiento] = useState<any>({
    titulo: 'Financiamiento Directo Iori Biker',
    subtitulo: 'Llévate tu casco o accesorio en cómodas cuotas.',
    descripcion: '',
    requisitos: [],
    nota_legal: '',
  });

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Cargar datos según pestaña
  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      if (activeTab === 'blog') {
        const { data } = await supabase
          .from('blog')
          .select('*')
          .order('created_at', { ascending: false });
        setArticulos(data || []);
      } else if (activeTab === 'faqs') {
        const { data } = await supabase
          .from('preguntas_frecuentes')
          .select('*')
          .order('orden', { ascending: true });
        setFaqs(data || []);
      } else if (activeTab === 'politicas') {
        const { data } = await supabase
          .from('politicas')
          .select('*');
        setPoliticas(data || []);
        const found = data?.find((p) => p.slug === selectedPoliticaSlug);
        if (found) {
          setEditingPolitica(found);
        }
      } else if (activeTab === 'financiamiento') {
        const { data } = await supabase
          .from('ajustes_generales')
          .select('*')
          .eq('clave', 'financiamiento_condiciones')
          .single();
        if (data?.valor) {
          setCondicionesFinanciamiento(data.valor);
        }
      }
    } catch (err: any) {
      console.error('Error al cargar contenido en admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Sincronizar politica seleccionada
  useEffect(() => {
    const found = politicas.find((p) => p.slug === selectedPoliticaSlug);
    if (found) {
      setEditingPolitica(found);
    }
  }, [selectedPoliticaSlug, politicas]);

  // -------------------------------------------------------------
  // ACCIONES BLOG
  // -------------------------------------------------------------
  const handleSaveArticulo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticulo.titulo || !editingArticulo.slug) {
      showNotification('Título y Slug son obligatorios.', true);
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const payload = {
        titulo: editingArticulo.titulo.trim(),
        slug: editingArticulo.slug.trim(),
        resumen: editingArticulo.resumen?.trim() || '',
        contenido: editingArticulo.contenido?.trim() || '',
        imagen: editingArticulo.imagen?.trim() || '/images/banners/banner_mid_1.png',
        categoria: editingArticulo.categoria?.trim() || 'General',
        autor: editingArticulo.autor?.trim() || 'Iori Biker Team',
        fecha: editingArticulo.fecha || new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
        lectura_minutos: Number(editingArticulo.lectura_minutos || 3),
        publicado: Boolean(editingArticulo.publicado),
        meta_title: editingArticulo.meta_title?.trim() || null,
        meta_description: editingArticulo.meta_description?.trim() || null,
        keywords: editingArticulo.keywords?.trim() || null,
      };

      if (isNewArticulo) {
        const { error } = await supabase.from('blog').insert(payload);
        if (error) throw error;
        showNotification('¡Artículo de blog creado con éxito!');
      } else {
        const { error } = await supabase.from('blog').update(payload).eq('id', editingArticulo.id);
        if (error) throw error;
        showNotification('¡Artículo de blog actualizado!');
      }

      setEditingArticulo(null);
      setIsNewArticulo(false);
      loadData();
    } catch (err: any) {
      showNotification('Error al guardar artículo: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticulo = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('blog').delete().eq('id', id);
    if (error) {
      showNotification('No se pudo eliminar el artículo', true);
    } else {
      showNotification('Artículo eliminado correctamente.');
      loadData();
    }
  };

  // -------------------------------------------------------------
  // ACCIONES FAQS
  // -------------------------------------------------------------
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq.pregunta || !editingFaq.respuesta) {
      showNotification('Pregunta y respuesta son obligatorias.', true);
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const payload = {
        categoria: editingFaq.categoria,
        pregunta: editingFaq.pregunta.trim(),
        respuesta: editingFaq.respuesta.trim(),
        orden: Number(editingFaq.orden || 0),
        activo: Boolean(editingFaq.activo),
      };

      if (isNewFaq) {
        const { error } = await supabase.from('preguntas_frecuentes').insert(payload);
        if (error) throw error;
        showNotification('¡Pregunta frecuente agregada!');
      } else {
        const { error } = await supabase.from('preguntas_frecuentes').update(payload).eq('id', editingFaq.id);
        if (error) throw error;
        showNotification('¡Pregunta frecuente actualizada!');
      }

      setEditingFaq(null);
      setIsNewFaq(false);
      loadData();
    } catch (err: any) {
      showNotification('Error al guardar FAQ: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta frecuente?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('preguntas_frecuentes').delete().eq('id', id);
    if (!error) {
      showNotification('Pregunta eliminada.');
      loadData();
    }
  };

  // -------------------------------------------------------------
  // ACCIONES POLÍTICAS
  // -------------------------------------------------------------
  const handleSavePolitica = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('politicas')
        .upsert({
          slug: editingPolitica.slug,
          titulo: editingPolitica.titulo.trim(),
          subtitulo: editingPolitica.subtitulo?.trim() || '',
          contenido: editingPolitica.contenido.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      showNotification(`¡Política "${editingPolitica.titulo}" actualizada en la web!`);
      loadData();
    } catch (err: any) {
      showNotification('Error al guardar política: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------
  // ACCIONES FINANCIAMIENTO
  // -------------------------------------------------------------
  const handleSaveCondicionesFinanciamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('ajustes_generales')
        .upsert({
          clave: 'financiamiento_condiciones',
          valor: condicionesFinanciamiento,
          descripcion: 'Condiciones y requisitos editables para financiamiento',
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      showNotification('¡Condiciones de financiamiento actualizadas con éxito!');
    } catch (err: any) {
      showNotification('Error al guardar condiciones: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de Sección de Contenido */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => { setActiveTab('blog'); setEditingArticulo(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'blog'
              ? 'bg-zinc-900 text-brand shadow-md border-zinc-900'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Editor de Blog ({articulos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('faqs'); setEditingFaq(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'faqs'
              ? 'bg-zinc-900 text-brand shadow-md border-zinc-900'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Preguntas Frecuentes ({faqs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('politicas')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'politicas'
              ? 'bg-zinc-900 text-brand shadow-md border-zinc-900'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Políticas y Términos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financiamiento')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'financiamiento'
              ? 'bg-zinc-900 text-brand shadow-md border-zinc-900'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <BadgePercent className="w-4 h-4" />
          <span>Condiciones Financiamiento</span>
        </button>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* 1. SECCIÓN: BLOG */}
      {/* ============================================================= */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          {!editingArticulo ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-black text-xl uppercase tracking-wider text-black">
                    Artículos del Blog Biker
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Gestiona títulos, contenido enriquecido, portadas 16:9 y campos SEO.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingArticulo({
                      titulo: '',
                      slug: '',
                      resumen: '',
                      contenido: '',
                      imagen: '/images/banners/banner_mid_1.png',
                      categoria: 'Seguridad y Tallas',
                      autor: 'Iori Biker Team',
                      fecha: '29 Sep 2026',
                      lectura_minutos: 4,
                      publicado: false, // Borrador por defecto
                      meta_title: '',
                      meta_description: '',
                      keywords: '',
                    });
                    setIsNewArticulo(true);
                  }}
                  className="px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Nuevo Artículo
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-zinc-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand mb-2" />
                  <span className="text-xs font-bold uppercase">Cargando artículos...</span>
                </div>
              ) : articulos.length === 0 ? (
                <p className="text-xs text-zinc-500 py-8 text-center">No hay artículos creados.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articulos.map((art) => (
                    <div
                      key={art.id}
                      className="bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden flex flex-col justify-between p-4 space-y-3"
                    >
                      {/* Portada 16:9 Preview */}
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-zinc-900">
                        <img src={art.imagen} alt={art.titulo} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${
                            art.publicado ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}>
                            {art.publicado ? 'Publicado' : 'Borrador'}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-black/80 text-brand">
                            16:9 Portada
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-brand tracking-wider">
                          {art.categoria} • {art.lectura_minutos} min
                        </span>
                        <h4 className="font-heading font-bold text-sm uppercase text-zinc-900 line-clamp-2">
                          {art.titulo}
                        </h4>
                        <p className="text-xs text-zinc-500 line-clamp-2 font-normal">
                          {art.resumen}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-200/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-zinc-400 font-mono">
                          /{art.slug}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingArticulo(art);
                              setIsNewArticulo(false);
                            }}
                            className="p-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-xs transition cursor-pointer"
                            title="Editar artículo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteArticulo(art.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs transition cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Formulario de Creación / Edición de Artículo */
            <form onSubmit={handleSaveArticulo} className="bg-white rounded-3xl p-6 sm:p-9 border border-zinc-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <h3 className="font-heading font-black text-xl uppercase tracking-wider text-black">
                  {isNewArticulo ? 'Crear Nuevo Artículo' : 'Editar Artículo'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingArticulo(null)}
                  className="text-xs font-bold text-zinc-500 hover:text-black uppercase cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    Título del Artículo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArticulo.titulo}
                    onChange={(e) => {
                      const titulo = e.target.value;
                      const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setEditingArticulo({
                        ...editingArticulo,
                        titulo,
                        slug: isNewArticulo ? slug : editingArticulo.slug,
                      });
                    }}
                    placeholder="Ej. Guía para elegir tu casco ECE 22.06"
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    Slug URL (sin espacios) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArticulo.slug}
                    onChange={(e) => setEditingArticulo({ ...editingArticulo, slug: e.target.value })}
                    placeholder="guia-casco-ece-2206"
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={editingArticulo.categoria}
                    onChange={(e) => setEditingArticulo({ ...editingArticulo, categoria: e.target.value })}
                    placeholder="Seguridad y Tallas, Mecánica..."
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={editingArticulo.autor}
                    onChange={(e) => setEditingArticulo({ ...editingArticulo, autor: e.target.value })}
                    placeholder="Iori Biker Team"
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    Tiempo de lectura (min)
                  </label>
                  <input
                    type="number"
                    value={editingArticulo.lectura_minutos}
                    onChange={(e) => setEditingArticulo({ ...editingArticulo, lectura_minutos: Number(e.target.value) })}
                    className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Portada 16:9 con preview */}
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  URL de Imagen de Portada (Relación obligatoria 16:9)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={editingArticulo.imagen}
                    onChange={(e) => setEditingArticulo({ ...editingArticulo, imagen: e.target.value })}
                    placeholder="/images/banners/banner_mid_1.png o https://..."
                    className="flex-1 text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand font-mono"
                  />
                </div>
                {editingArticulo.imagen && (
                  <div className="mt-3 relative aspect-[16/9] w-full max-w-sm rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200">
                    <img src={editingArticulo.imagen} alt="Preview 16:9" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
                      Vista Previa 16:9
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Resumen Corto (Aparece en listados y SEO)
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingArticulo.resumen}
                  onChange={(e) => setEditingArticulo({ ...editingArticulo, resumen: e.target.value })}
                  placeholder="Extracto de 2 líneas describiendo el artículo..."
                  className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Contenido Enriquecido (Markdown con # Títulos, ## Secciones, &gt; Citas y - Listas)
                </label>
                <textarea
                  rows={10}
                  value={editingArticulo.contenido}
                  onChange={(e) => setEditingArticulo({ ...editingArticulo, contenido: e.target.value })}
                  placeholder="# Introducción&#10;&#10;Escribe aquí el contenido enriquecido..."
                  className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-brand font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Campos SEO */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold uppercase text-brand tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Optimización para Buscadores (SEO)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Meta Title (Google)
                    </label>
                    <input
                      type="text"
                      value={editingArticulo.meta_title || ''}
                      onChange={(e) => setEditingArticulo({ ...editingArticulo, meta_title: e.target.value })}
                      placeholder="Título optimizado para buscadores"
                      className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Keywords (Separadas por comas)
                    </label>
                    <input
                      type="text"
                      value={editingArticulo.keywords || ''}
                      onChange={(e) => setEditingArticulo({ ...editingArticulo, keywords: e.target.value })}
                      placeholder="cascos, seguridad, ece 22.06, iori biker"
                      className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    value={editingArticulo.meta_description || ''}
                    onChange={(e) => setEditingArticulo({ ...editingArticulo, meta_description: e.target.value })}
                    placeholder="Descripción que aparecerá en los resultados de Google"
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Switch de Publicación */}
              <div className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <input
                  type="checkbox"
                  id="publicado_check"
                  checked={editingArticulo.publicado}
                  onChange={(e) => setEditingArticulo({ ...editingArticulo, publicado: e.target.checked })}
                  className="w-4 h-4 text-brand rounded"
                />
                <label htmlFor="publicado_check" className="text-xs font-bold text-zinc-800 uppercase cursor-pointer">
                  Publicar artículo inmediatamente en la web (Desmarcar para guardar como Borrador)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingArticulo(null)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isNewArticulo ? 'Crear Artículo' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. SECCIÓN: PREGUNTAS FRECUENTES (FAQS) */}
      {/* ============================================================= */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-black text-xl uppercase tracking-wider text-black">
                Gestor de Preguntas Frecuentes
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Acordeones administrables para compra por WhatsApp, métodos de pago, envíos y recojo en tiendas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingFaq({
                  categoria: 'compra-whatsapp',
                  pregunta: '',
                  respuesta: '',
                  orden: faqs.length + 1,
                  activo: true,
                });
                setIsNewFaq(true);
              }}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nueva Pregunta
            </button>
          </div>

          {editingFaq && (
            <form onSubmit={handleSaveFaq} className="p-5 bg-zinc-50 border border-brand/40 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm uppercase text-black">
                {isNewFaq ? 'Agregar Pregunta Frecuente' : 'Editar Pregunta Frecuente'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Tema / Categoría
                  </label>
                  <select
                    value={editingFaq.categoria}
                    onChange={(e) => setEditingFaq({ ...editingFaq, categoria: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg bg-white"
                  >
                    <option value="compra-whatsapp">Compra por WhatsApp</option>
                    <option value="pagos">Métodos de Pago</option>
                    <option value="envios">Envíos y Provincias</option>
                    <option value="recojo">Recojo en Tiendas</option>
                    <option value="financiamiento">Financiamiento Propio</option>
                    <option value="garantia-cambios">Garantías y Cambios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={editingFaq.orden}
                    onChange={(e) => setEditingFaq({ ...editingFaq, orden: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="faq_activo"
                    checked={editingFaq.activo}
                    onChange={(e) => setEditingFaq({ ...editingFaq, activo: e.target.checked })}
                    className="w-4 h-4 text-brand rounded"
                  />
                  <label htmlFor="faq_activo" className="text-xs font-bold text-zinc-800 uppercase cursor-pointer">
                    Activa en la web
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Pregunta *
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.pregunta}
                  onChange={(e) => setEditingFaq({ ...editingFaq, pregunta: e.target.value })}
                  placeholder="¿Cómo comprar por WhatsApp?"
                  className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                  Respuesta detallada * (Usa [PENDIENTE] para condiciones por definir)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingFaq.respuesta}
                  onChange={(e) => setEditingFaq({ ...editingFaq, respuesta: e.target.value })}
                  placeholder="Escribe la respuesta..."
                  className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar FAQ
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 text-[10px] font-bold uppercase">
                      #{faq.orden} • {faq.categoria}
                    </span>
                    {!faq.activo && (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading font-bold text-sm uppercase text-zinc-900">
                    {faq.pregunta}
                  </h4>
                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {faq.respuesta}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => { setEditingFaq(faq); setIsNewFaq(false); }}
                    className="p-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. SECCIÓN: POLÍTICAS Y TÉRMINOS */}
      {/* ============================================================= */}
      {activeTab === 'politicas' && (
        <div id="seccion-politicas" className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6 scroll-mt-20">
          {/* Banner de Conformidad - Paso 10 de la Guía */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            politicasRevisadas
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                politicasRevisadas ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {politicasRevisadas ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-heading font-black text-13 uppercase tracking-wide block">
                  Paso 10 • Conformidad de Políticas y Preguntas Frecuentes
                </span>
                <p className="text-11 mt-0.5 text-zinc-600">
                  {politicasRevisadas
                    ? 'Términos y condiciones, política de privacidad, envíos y preguntas frecuentes certificadas como conformes.'
                    : 'Revisa la redacción de los documentos legales de tu tienda y marca la casilla para completar el Paso 10.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                const nextVal = !politicasRevisadas;
                setPoliticasRevisadas(nextVal);
                try {
                  const { saveAdminSetting } = await import('@/lib/services/admin-service');
                  await saveAdminSetting('politicas_faqs_revisadas', {
                    completado: nextVal,
                    fecha: new Date().toISOString(),
                  });
                  showNotification(nextVal ? 'Políticas marcadas como revisadas y conformes' : 'Estado de revisión reiniciado');
                  if (onRefresh) onRefresh();
                } catch (e: any) {
                  showNotification('Error al actualizar: ' + e.message, true);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                politicasRevisadas
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-[#F58220] hover:bg-[#E07216] text-black font-extrabold shadow-sm'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{politicasRevisadas ? 'Políticas Revisadas ✓' : 'Marcar como Revisado'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-black text-xl uppercase tracking-wider text-black">
                Editor de Políticas Institucionales
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Modifica los textos legales que se muestran en /politicas/[slug].
              </p>
            </div>

            {/* Selector de política */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-zinc-400">Documento:</span>
              <select
                value={selectedPoliticaSlug}
                onChange={(e) => setSelectedPoliticaSlug(e.target.value)}
                className="text-xs font-bold uppercase px-3 py-2 border border-zinc-300 rounded-xl bg-white"
              >
                <option value="envios-y-devoluciones">Envíos y Devoluciones</option>
                <option value="privacidad">Política de Privacidad</option>
                <option value="terminos">Términos y Condiciones</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSavePolitica} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Título del Documento *
              </label>
              <input
                type="text"
                required
                value={editingPolitica.titulo || ''}
                onChange={(e) => setEditingPolitica({ ...editingPolitica, titulo: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Subtítulo o Resumen
              </label>
              <input
                type="text"
                value={editingPolitica.subtitulo || ''}
                onChange={(e) => setEditingPolitica({ ...editingPolitica, subtitulo: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Contenido Markdown del Documento *
              </label>
              <textarea
                rows={14}
                required
                value={editingPolitica.contenido || ''}
                onChange={(e) => setEditingPolitica({ ...editingPolitica, contenido: e.target.value })}
                className="w-full text-xs font-mono px-4 py-3 border border-zinc-300 rounded-xl leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`/politicas/${selectedPoliticaSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
              >
                <Eye className="w-3.5 h-3.5" /> Ver en la web pública
              </a>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Política</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. SECCIÓN: CONDICIONES DE FINANCIAMIENTO */}
      {/* ============================================================= */}
      {activeTab === 'financiamiento' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-heading font-black text-xl uppercase tracking-wider text-black">
              Condiciones de Financiamiento Propio
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Configura los textos explicativos, requisitos y advertencias legales mostradas en /financiamiento.
            </p>
          </div>

          <form onSubmit={handleSaveCondicionesFinanciamiento} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Título Principal
                </label>
                <input
                  type="text"
                  value={condicionesFinanciamiento.titulo || ''}
                  onChange={(e) => setCondicionesFinanciamiento({ ...condicionesFinanciamiento, titulo: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={condicionesFinanciamiento.subtitulo || ''}
                  onChange={(e) => setCondicionesFinanciamiento({ ...condicionesFinanciamiento, subtitulo: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 border border-zinc-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Descripción del Beneficio
              </label>
              <textarea
                rows={3}
                value={condicionesFinanciamiento.descripcion || ''}
                onChange={(e) => setCondicionesFinanciamiento({ ...condicionesFinanciamiento, descripcion: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Nota Legal y Condiciones [PENDIENTE]
              </label>
              <textarea
                rows={3}
                value={condicionesFinanciamiento.nota_legal || ''}
                onChange={(e) => setCondicionesFinanciamiento({ ...condicionesFinanciamiento, nota_legal: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="/financiamiento"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
              >
                <Eye className="w-3.5 h-3.5" /> Abrir /financiamiento en vivo
              </a>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Condiciones</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
