'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  Tag, 
  Layers, 
  UploadCloud, 
  Check, 
  Sun, 
  Moon, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  Filter,
  Pencil,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sanitizeSvgFile } from '@/lib/security/svg-sanitizer';
import { useToast } from './ui/Toast';

interface AdminCategoriesBrandsProps {
  categories: any[];
  brands: any[];
  onRefresh: () => void;
}

export function AdminCategoriesBrands({
  categories,
  brands,
  onRefresh,
}: AdminCategoriesBrandsProps) {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const tabParam = searchParams.get('tab');
  const filtroParam = searchParams.get('filtro');

  const [activeTab, setActiveTab] = useState<'marcas' | 'categorias'>(
    tabParam === 'categorias' ? 'categorias' : 'marcas'
  );

  const [filtroLogo, setFiltroLogo] = useState<'todos' | 'sin_logo' | 'con_logo'>(
    filtroParam === 'sin_logo' ? 'sin_logo' : 'todos'
  );

  // Previews de fondo: Record<brandId, 'light' | 'dark'>
  const [backgroundMode, setBackgroundMode] = useState<Record<string, 'light' | 'dark'>>({});

  // Subiendo logo
  const [uploadingBrandId, setUploadingBrandId] = useState<string | null>(null);

  // Edición de bajada/descripción de categoría
  const [editingCategory, setEditingCategory] = useState<{ id: string; nombre: string; descripcion: string } | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Ref para auto-scroll del ancla
  const marcasSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabParam === 'marcas' || tabParam === 'categorias') {
      setActiveTab(tabParam);
    }
    if (filtroParam === 'sin_logo') {
      setFiltroLogo('sin_logo');
    }
  }, [tabParam, filtroParam]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#seccion-marcas') {
      marcasSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Métricas de logos
  const totalMarcas = brands.length;
  const marcasConLogo = brands.filter((m) => Boolean(m.logo)).length;
  const porcentajeLogos = totalMarcas > 0 ? Math.round((marcasConLogo / totalMarcas) * 100) : 0;

  // Filtrado de marcas
  const marcasFiltradas = useMemo(() => {
    if (filtroLogo === 'sin_logo') {
      return brands.filter((m) => !m.logo);
    }
    if (filtroLogo === 'con_logo') {
      return brands.filter((m) => Boolean(m.logo));
    }
    return brands;
  }, [brands, filtroLogo]);

  const handleToggleBrandTop = async (marca: any) => {
    try {
      const supabase = createClient();
      await supabase
        .from('marcas')
        .update({ destacada: !marca.destacada })
        .eq('id', marca.id);
      showToast(`Marca ${marca.nombre} actualizada`);
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleToggleBrandActive = async (marca: any) => {
    try {
      const supabase = createClient();
      await supabase
        .from('marcas')
        .update({ activo: !marca.activo })
        .eq('id', marca.id);
      showToast(`Visibilidad de ${marca.nombre} actualizada`);
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleToggleCatActive = async (cat: any) => {
    try {
      const supabase = createClient();
      await supabase
        .from('categorias')
        .update({ activo: !cat.activo })
        .eq('id', cat.id);
      showToast(`Categoría ${cat.nombre} actualizada`);
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleSaveCategoryDescription = async () => {
    if (!editingCategory) return;
    setSavingCategory(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categorias')
        .update({ descripcion: editingCategory.descripcion.trim() || null })
        .eq('id', editingCategory.id);
      if (error) throw error;
      showToast(`Bajada de ${editingCategory.nombre} actualizada exitosamente`, 'success');
      setEditingCategory(null);
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleUploadLogo = async (marca: any, file: File) => {
    setUploadingBrandId(marca.id);
    try {
      let finalLogoUrl = '';

      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        // Sanitizar SVG en cliente antes de procesarlo
        const sanitizedFile = await sanitizeSvgFile(file);
        const sanitizedSvgText = await sanitizedFile.text();
        // Generar Data URL seguro o subir a storage
        finalLogoUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sanitizedSvgText)}`;
      } else {
        // PNG, JPG, WebP
        const reader = new FileReader();
        finalLogoUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const supabase = createClient();
      const { error } = await supabase
        .from('marcas')
        .update({ logo: finalLogoUrl })
        .eq('id', marca.id);

      if (error) {
        throw new Error(error.message);
      }

      showToast(`Logo de ${marca.nombre} guardado correctamente`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Error al subir logotipo: ' + err.message, 'error');
    } finally {
      setUploadingBrandId(null);
    }
  };

  const handleRemoveLogo = async (marca: any) => {
    if (!confirm(`¿Eliminar el logotipo de ${marca.nombre}?`)) return;
    try {
      const supabase = createClient();
      await supabase
        .from('marcas')
        .update({ logo: null })
        .eq('id', marca.id);
      showToast(`Logotipo de ${marca.nombre} eliminado`);
      onRefresh();
    } catch (err: any) {
      showToast('Error al eliminar logo: ' + err.message, 'error');
    }
  };

  const toggleBackgroundMode = (brandId: string) => {
    setBackgroundMode((prev) => ({
      ...prev,
      [brandId]: prev[brandId] === 'dark' ? 'light' : 'dark',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Selector de subpestaña */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('marcas')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'marcas'
              ? 'bg-zinc-900 text-[#F58220]'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          14 Marcas Oficiales ({marcasConLogo}/{totalMarcas} con logo)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categorias')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'categorias'
              ? 'bg-zinc-900 text-[#F58220]'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          8 Categorías Oficiales ({categories.length})
        </button>
      </div>

      {/* 1. SECCIÓN DE MARCAS Y GESTIÓN DE LOGOS (Paso 5 de la Guía) */}
      {activeTab === 'marcas' && (
        <div 
          ref={marcasSectionRef}
          id="seccion-marcas" 
          className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6 scroll-mt-20"
        >
          {/* Encabezado y Barra de Progreso de Logos */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-100 text-[#F58220]">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
                  Logotipos de las 14 Marcas Oficiales
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Soporte para PNG y SVG sanitizado. Verifica el contraste en fondo claro y oscuro para ambos temas.
              </p>
            </div>

            {/* Contador de progreso X/14 */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="font-heading font-black text-18 text-zinc-900">
                  {marcasConLogo}/{totalMarcas}
                </span>
                <span className="text-11 text-zinc-500 block">
                  {porcentajeLogos}% logos subidos
                </span>
              </div>
              <div className="w-24 bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#F58220] h-full transition-all duration-500"
                  style={{ width: `${porcentajeLogos}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filtros: Todos / Sin logo / Con logo */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-12 font-bold text-zinc-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </span>
            <button
              type="button"
              onClick={() => setFiltroLogo('todos')}
              className={`px-3 py-1.5 rounded-lg text-11 font-bold transition cursor-pointer ${
                filtroLogo === 'todos'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Todas ({totalMarcas})
            </button>
            <button
              type="button"
              onClick={() => setFiltroLogo('sin_logo')}
              className={`px-3 py-1.5 rounded-lg text-11 font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filtroLogo === 'sin_logo'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Sin logo ({totalMarcas - marcasConLogo})</span>
            </button>
            <button
              type="button"
              onClick={() => setFiltroLogo('con_logo')}
              className={`px-3 py-1.5 rounded-lg text-11 font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filtroLogo === 'con_logo'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Con logo ({marcasConLogo})</span>
            </button>
          </div>

          {/* Grilla de Marcas con Selector de Fondo Dual (Light / Dark) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {marcasFiltradas.map((m) => {
              const currentBg = backgroundMode[m.id] || 'light';
              const isDark = currentBg === 'dark';
              const isUploading = uploadingBrandId === m.id;

              return (
                <div
                  key={m.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-zinc-300 transition-all space-y-3"
                >
                  {/* Título de Marca y Badge de Destacada */}
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-13 uppercase tracking-wider text-zinc-900 truncate">
                      {m.nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleBrandTop(m)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                        m.destacada
                          ? 'bg-[#F58220] text-black font-extrabold'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                      }`}
                      title="Destacar en carrusel de marcas"
                    >
                      {m.destacada ? 'DESTACADA' : 'NORMAL'}
                    </button>
                  </div>

                  {/* Recuadro de Visualización del Logo con Toggle Claro / Oscuro */}
                  <div className="relative rounded-xl overflow-hidden border border-zinc-200">
                    <div
                      className={`h-24 flex items-center justify-center p-3 transition-colors ${
                        isDark ? 'bg-[#111111]' : 'bg-white'
                      }`}
                    >
                      {m.logo ? (
                        <img
                          src={m.logo}
                          alt={`Logo ${m.nombre}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <span className={`text-10 font-bold uppercase tracking-wider block ${
                            isDark ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                            Sin Logo
                          </span>
                          <span className={`text-[9px] block ${
                            isDark ? 'text-zinc-700' : 'text-zinc-400'
                          }`}>
                            PNG o SVG recomendado
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botón flotante para cambiar fondo de preview (Light #FFFFFF vs Dark #111111) */}
                    <button
                      type="button"
                      onClick={() => toggleBackgroundMode(m.id)}
                      className={`absolute top-1.5 right-1.5 p-1 rounded-md text-[10px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer ${
                        isDark 
                          ? 'bg-zinc-800 text-amber-300 hover:bg-zinc-700' 
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                      title={isDark ? 'Probar en fondo claro (#FFFFFF)' : 'Probar en fondo oscuro (#111111)'}
                    >
                      {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                      <span className="text-[9px]">{isDark ? 'Oscuro' : 'Claro'}</span>
                    </button>
                  </div>

                  {/* Botones de Carga de Logo */}
                  <div className="space-y-1.5">
                    <label className="w-full py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-11 font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{isUploading ? 'Procesando...' : m.logo ? 'Cambiar Logo' : 'Subir Logo'}</span>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg,.webp"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadLogo(m, file);
                        }}
                      />
                    </label>

                    {m.logo && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo(m)}
                        className="w-full py-1 text-10 font-bold text-red-600 hover:bg-red-50 rounded transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Quitar Logo</span>
                      </button>
                    )}
                  </div>

                  {/* Estado Activo */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px] text-zinc-500">
                    <span>Estado: {m.activo !== false ? 'Visible' : 'Oculta'}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleBrandActive(m)}
                      className="text-11 font-bold text-[#F58220] hover:underline cursor-pointer"
                    >
                      {m.activo !== false ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SECCIÓN DE CATEGORÍAS */}
      {activeTab === 'categorias' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-base font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
                Las 8 Categorías Oficiales
              </h3>
              <p className="text-xs text-zinc-500">
                Cascos, Guantes, Accesorios Casco, Indumentaria, Accesorios Moto, Iluminación, Limpieza y Motitos Escala.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3"
              >
                <div className="relative aspect-video rounded-xl bg-white border border-zinc-200 overflow-hidden">
                  <Image
                    src={c.imagen || '/images/categories/cat_1.png'}
                    alt={c.nombre}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-900">
                      {c.nombre}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ id: c.id, nombre: c.nombre, descripcion: c.descripcion || '' })}
                      className="p-1 text-zinc-400 hover:text-[#F58220] transition rounded hover:bg-zinc-200/60 cursor-pointer"
                      title="Editar bajada para la home"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                  {c.descripcion ? (
                    <p className="text-[11px] text-zinc-600 line-clamp-2">
                      {c.descripcion}
                    </p>
                  ) : (
                    <p className="text-[11px] text-zinc-400 italic">
                      Sin bajada (se ocultará en la home)
                    </p>
                  )}
                </div>
                <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 capitalize">Columna: {c.columna}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleCatActive(c)}
                    className="font-bold text-[#F58220] hover:underline cursor-pointer"
                  >
                    {c.activo !== false ? 'Activa' : 'Oculta'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal para editar bajada de categoría */}
          {editingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#F58220] block">
                      Bajada para la Home
                    </span>
                    <h3 className="text-base font-black text-zinc-900 uppercase">
                      {editingCategory.nombre}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Texto de la bajada (subtítulo que se muestra en la tienda):
                  </label>
                  <textarea
                    rows={3}
                    value={editingCategory.descripcion}
                    onChange={(e) => setEditingCategory({ ...editingCategory, descripcion: e.target.value })}
                    placeholder="Ej. Protección integral con certificación internacional para ruta y ciudad..."
                    className="w-full text-xs p-3 border border-zinc-300 rounded-xl focus:border-[#F58220] focus:ring-1 focus:ring-[#F58220] outline-hidden bg-zinc-50"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Si dejas este campo vacío, la sección de la categoría en la home no mostrará bajada.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    disabled={savingCategory}
                    className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCategoryDescription}
                    disabled={savingCategory}
                    className="px-5 py-2 text-xs font-bold bg-[#F58220] hover:bg-[#d96e14] text-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingCategory ? 'Guardando...' : 'Guardar Bajada'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
