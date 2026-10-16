'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Monitor, 
  Smartphone, 
  Plus, 
  Edit3, 
  Save, 
  Eye, 
  Check, 
  Layers,
  Calendar,
  Trash2,
  Copy,
  Power,
  Crop,
  Upload,
  Search,
  ArrowUp,
  ArrowDown,
  GripVertical,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { 
  saveBanner, 
  deleteBanner, 
  duplicateBanner, 
  reorderBanners, 
  toggleBannerActive,
  uploadImageToStorage 
} from '@/lib/services/admin-service';
import { BannerCropModal } from './banners/BannerCropModal';
import { LinkPickerModal } from './banners/LinkPickerModal';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface AdminBannersViewProps {
  banners: any[];
  categories?: any[];
  products?: any[];
  promos?: any[];
  onRefresh: () => void;
}

export function AdminBannersView({ 
  banners = [], 
  categories = [],
  products = [],
  promos = [],
  onRefresh 
}: AdminBannersViewProps) {
  const { showToast } = useToast();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(banners[0]?.id || null);
  
  // Estado del formulario (mostrar formulario en la misma página)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modales auxiliares
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'desktop' | 'mobile'>('desktop');
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);

  // Diálogo de confirmación para eliminar
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Campos del formulario
  const [formTitulo, setFormTitulo] = useState('');
  const [formSubtitulo, setFormSubtitulo] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formTextoBoton, setFormTextoBoton] = useState('');
  const [formEnlace, setFormEnlace] = useState('');
  const [formImgDesktop, setFormImgDesktop] = useState('');
  const [formImgMobile, setFormImgMobile] = useState('');
  const [formUbicacion, setFormUbicacion] = useState<'hero' | 'destacado' | 'ancho' | 'mediano'>('hero');
  const [formFechaInicio, setFormFechaInicio] = useState('');
  const [formFechaFin, setFormFechaFin] = useState('');
  const [formActivo, setFormActivo] = useState(true);

  // Drag & drop local state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const formSectionRef = useRef<HTMLDivElement>(null);

  const selectedBanner = banners.find((b) => b.id === selectedBannerId) || banners[0] || null;

  // Sincronizar selección si cambia banners
  useEffect(() => {
    if (banners.length > 0 && !selectedBannerId) {
      setSelectedBannerId(banners[0].id);
    }
  }, [banners, selectedBannerId]);

  // Cálculo de estado según la regla oficial (en hora de Lima UTC-5)
  const getBannerStatus = (banner: any) => {
    if (!banner.activo) {
      return { label: 'Inactivo', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' };
    }

    const nowLima = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })).getTime();

    if (banner.fecha_inicio) {
      const tIni = new Date(banner.fecha_inicio).getTime();
      if (!isNaN(tIni) && nowLima < tIni) {
        return { label: 'Programado', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      }
    }

    if (banner.fecha_fin) {
      const tFin = new Date(banner.fecha_fin).getTime();
      if (!isNaN(tFin) && nowLima > tFin) {
        return { label: 'Vencido', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      }
    }

    return { label: 'Activo', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const handleOpenCreate = () => {
    setEditingBannerId(null);
    setFormTitulo('');
    setFormSubtitulo('');
    setFormBadge('');
    setFormTextoBoton('Ver Catálogo');
    setFormEnlace('/productos');
    setFormImgDesktop('');
    setFormImgMobile('');
    setFormUbicacion('hero');
    setFormFechaInicio('');
    setFormFechaFin('2026-12-31T23:59:59');
    setFormActivo(true);
    setIsFormOpen(true);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpenEdit = (banner: any) => {
    setEditingBannerId(banner.id);
    setFormTitulo(banner.titulo || '');
    setFormSubtitulo(banner.subtitulo || '');
    setFormBadge(banner.badge || '');
    setFormTextoBoton(banner.texto_boton || '');
    setFormEnlace(banner.enlace || '');
    setFormImgDesktop(banner.imagen_desktop || '');
    setFormImgMobile(banner.imagen_mobile === banner.imagen_desktop ? '' : (banner.imagen_mobile || ''));
    setFormUbicacion(banner.ubicacion || 'hero');
    setFormFechaInicio(banner.fecha_inicio ? banner.fecha_inicio.slice(0, 19) : '');
    setFormFechaFin(banner.fecha_fin ? banner.fecha_fin.slice(0, 19) : '');
    setFormActivo(Boolean(banner.activo));
    setIsFormOpen(true);
    setSelectedBannerId(banner.id);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDuplicate = async (banner: any) => {
    try {
      await duplicateBanner(banner);
      showToast('Banner duplicado exitosamente', 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Error al duplicar: ' + err.message, 'error');
    }
  };

  const handleToggleActive = async (banner: any) => {
    try {
      await toggleBannerActive(banner.id, !banner.activo);
      showToast(`Banner ${!banner.activo ? 'activado' : 'desactivado'}`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteBanner(confirmDeleteId);
      showToast('Banner eliminado del sistema', 'success');
      if (selectedBannerId === confirmDeleteId) {
        setSelectedBannerId(null);
      }
      onRefresh();
    } catch (err: any) {
      showToast('Error al eliminar: ' + err.message, 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newOrder = [...banners];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const reorderPayload = newOrder.map((b, idx) => ({ id: b.id, orden: idx + 1 }));
    try {
      await reorderBanners(reorderPayload);
      onRefresh();
    } catch (err: any) {
      showToast('Error al reordenar: ' + err.message, 'error');
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImgDesktop) {
      showToast('Debes seleccionar o recortar una imagen desktop (21:9)', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        titulo: formTitulo.trim(),
        subtitulo: formSubtitulo.trim(),
        badge: formBadge.trim(),
        texto_boton: formTextoBoton.trim(),
        enlace: formEnlace.trim() || '/productos',
        imagen_desktop: formImgDesktop,
        // Si no hay imagen móvil, se usa desktop centrado
        imagen_mobile: formImgMobile || formImgDesktop,
        ubicacion: formUbicacion,
        fecha_inicio: formFechaInicio || null,
        fecha_fin: formFechaFin || null,
        activo: formActivo,
      };

      if (editingBannerId) {
        payload.id = editingBannerId;
      } else {
        payload.orden = banners.length + 1;
      }

      await saveBanner(payload);
      showToast(editingBannerId ? '¡Banner actualizado!' : '¡Banner creado exitosamente!', 'success');
      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast('Error guardando banner: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setCropTarget(target);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Previsualización activa
  const previewImg = previewMode === 'desktop' 
    ? (isFormOpen ? formImgDesktop : selectedBanner?.imagen_desktop)
    : (isFormOpen ? (formImgMobile || formImgDesktop) : (selectedBanner?.imagen_mobile || selectedBanner?.imagen_desktop));

  const isMissingMobile = isFormOpen 
    ? (!formImgMobile && Boolean(formImgDesktop))
    : (selectedBanner && (!selectedBanner.imagen_mobile || selectedBanner.imagen_mobile === selectedBanner.imagen_desktop));

  const previewBadge = isFormOpen ? formBadge : selectedBanner?.badge;
  const previewTitulo = isFormOpen ? formTitulo : selectedBanner?.titulo;
  const previewSubtitulo = isFormOpen ? formSubtitulo : selectedBanner?.subtitulo;
  const previewBoton = isFormOpen ? formTextoBoton : selectedBanner?.texto_boton;

  return (
    <div className="space-y-8">
      {/* 1. Previsualizador Dual y Cabecera Principal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#f58220]/10 text-[#f58220] px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              Sliders y Banners • Paso 8
            </div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider text-zinc-900">
              Control de Banners y Sliders
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Vista previa real en proporciones 21:9 (desktop) y 4:5 (móvil). Ordena con botones o arrastre.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Switch Desktop / Móvil */}
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  previewMode === 'desktop'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (21:9)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  previewMode === 'mobile'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Móvil (4:5)</span>
              </button>
            </div>

            {/* Botón Crear Banner */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-[#f58220] hover:bg-[#d96b0e] text-black font-heading font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Banner</span>
            </button>
          </div>
        </div>

        {/* Vista Previa Interactiva */}
        {previewImg ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
              <span>
                Visualizando: <strong className="text-zinc-900 font-bold">{previewTitulo || 'Banner sin texto superpuesto'}</strong>
              </span>
              {previewMode === 'mobile' && isMissingMobile && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Falta versión móvil (mostrando recorte centrado de desktop)
                </span>
              )}
            </div>

            <div className="flex justify-center bg-zinc-950 p-4 sm:p-6 rounded-3xl overflow-hidden border border-zinc-900">
              <div
                className={`relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-all ${
                  previewMode === 'desktop'
                    ? 'w-full max-w-4xl aspect-[21/9]'
                    : 'w-72 sm:w-80 aspect-[4/5]'
                }`}
              >
                <Image
                  src={previewImg}
                  alt="Banner preview"
                  fill
                  className="object-cover object-center"
                />

                {/* Filtro de lectura */}
                <div
                  className={`absolute inset-0 ${
                    previewTitulo
                      ? previewMode === 'desktop'
                        ? 'bg-gradient-to-r from-black/80 via-black/40 to-transparent'
                        : 'bg-gradient-to-t from-black/85 via-black/40 to-transparent'
                      : 'bg-black/15'
                  }`}
                />

                {/* Textos superpuestos */}
                {(previewBadge || previewTitulo || previewSubtitulo || previewBoton) && (
                  <div className="absolute inset-0 p-6 sm:p-8 flex items-end sm:items-center">
                    <div className="max-w-md space-y-2 text-white">
                      {previewBadge && (
                        <span className="inline-block bg-[#f58220] text-black text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                          {previewBadge}
                        </span>
                      )}
                      {previewTitulo && (
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight font-[family-name:var(--font-heading)]">
                          {previewTitulo}
                        </h3>
                      )}
                      {previewSubtitulo && (
                        <p className="text-[11px] sm:text-xs text-zinc-300 line-clamp-2">
                          {previewSubtitulo}
                        </p>
                      )}
                      {previewBoton && (
                        <div className="pt-2">
                          <span className="inline-block bg-[#f58220] text-black font-extrabold text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-lg shadow-xs">
                            {previewBoton}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400">
            <Layers className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="text-xs font-bold uppercase">No hay imagen cargada para la vista previa</p>
          </div>
        )}
      </div>

      {/* 2. Formulario de UNA sola página (Crear / Editar) */}
      {isFormOpen && (
        <div 
          ref={formSectionRef} 
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f58220]/40 shadow-md space-y-6 scroll-mt-20"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#f58220]/10 text-[#f58220] px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1">
                {editingBannerId ? 'Modo Edición' : 'Nuevo Registro'}
              </div>
              <h3 className="font-heading font-black text-lg uppercase tracking-wider text-zinc-900">
                {editingBannerId ? 'Editar Banner' : 'Crear Nuevo Banner'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200"
            >
              Cerrar Formulario
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-6">
            {/* Fila 1: Título y Ubicación */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Nombre o Título Principal
                </label>
                <input
                  type="text"
                  placeholder="Ej: PROMO ESPARTA (opcional si la imagen ya trae texto)"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-white"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Si tu banner ya tiene el texto impreso con IA o diseño gráfico, deja este campo vacío.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Ubicación
                </label>
                <select
                  value={formUbicacion}
                  onChange={(e) => setFormUbicacion(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-white font-bold"
                >
                  <option value="hero">Hero Slider Principal (16:9 desktop, 4:5 móvil)</option>
                  <option value="mediano">Hero Lateral Fijo (16:9)</option>
                  <option value="destacado">Banners Destacados</option>
                  <option value="ancho">Banner Ancho Intermedio</option>
                </select>
              </div>
            </div>

            {/* Fila 2: Imágenes con Recorte y Zoom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Imagen Desktop 21:9 */}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-zinc-800">
                    1. Imagen Desktop ({formUbicacion === 'hero' || formUbicacion === 'mediano' ? '16:9' : '21:9'}) <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">Requerido</span>
                </div>

                {formImgDesktop ? (
                  <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-zinc-300 bg-zinc-900 group">
                    <Image src={formImgDesktop} alt="Desktop" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCropImageSrc(formImgDesktop);
                          setCropTarget('desktop');
                          setCropModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-white text-zinc-900 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow cursor-pointer"
                      >
                        <Crop className="w-3.5 h-3.5 text-[#f58220]" />
                        <span>Ajustar Zoom / Recorte</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[21/9] rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center p-4 text-center">
                    <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                    <span className="text-[11px] font-bold text-zinc-600">Subir imagen 21:9</span>
                    <span className="text-[10px] text-zinc-400">JPG, PNG o WebP de alta resolución</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-xl text-center text-xs font-bold text-zinc-700 cursor-pointer transition">
                    <span>Seleccionar Archivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, 'desktop')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="O pega URL de imagen..."
                    value={formImgDesktop}
                    onChange={(e) => setFormImgDesktop(e.target.value)}
                    className="flex-1 text-[11px] px-3 py-2 border border-zinc-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              {/* Imagen Móvil 4:5 */}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-zinc-800">
                    2. Imagen Móvil (4:5)
                  </span>
                  {!formImgMobile && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      Falta versión móvil
                    </span>
                  )}
                </div>

                {formImgMobile ? (
                  <div className="relative aspect-[4/5] max-h-52 mx-auto rounded-xl overflow-hidden border border-zinc-300 bg-zinc-900 group">
                    <Image src={formImgMobile} alt="Móvil" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCropImageSrc(formImgMobile);
                          setCropTarget('mobile');
                          setCropModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-white text-zinc-900 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow cursor-pointer"
                      >
                        <Crop className="w-3.5 h-3.5 text-[#f58220]" />
                        <span>Ajustar Zoom / Recorte</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/5] max-h-52 mx-auto rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center p-4 text-center">
                    <Smartphone className="w-6 h-6 text-zinc-400 mb-1" />
                    <span className="text-[11px] font-bold text-zinc-600">Opcional: Subir 4:5</span>
                    <span className="text-[10px] text-zinc-400">Si no subes versión móvil, se usará la desktop centrada</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-xl text-center text-xs font-bold text-zinc-700 cursor-pointer transition">
                    <span>Seleccionar Archivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, 'mobile')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="O pega URL de imagen..."
                    value={formImgMobile}
                    onChange={(e) => setFormImgMobile(e.target.value)}
                    className="flex-1 text-[11px] px-3 py-2 border border-zinc-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Fila 3: Textos Opcionales y Destino */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Badge Superior
                </label>
                <input
                  type="text"
                  placeholder="Ej: CAMPAÑA OFICIAL"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-white uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Texto del Botón
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ver Promo Esparta"
                  value={formTextoBoton}
                  onChange={(e) => setFormTextoBoton(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase">
                    Enlace de Destino
                  </label>
                  <button
                    type="button"
                    onClick={() => setLinkPickerOpen(true)}
                    className="text-[11px] text-[#f58220] hover:text-[#d96b0e] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3 h-3" />
                    <span>Elegir destino...</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="/promo/esparta o /categoria/cascos"
                    value={formEnlace}
                    onChange={(e) => setFormEnlace(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-white font-mono"
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Subtítulo o Bajada de Texto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lleva 2 cascos a precio rebajado para ti y tu copiloto..."
                  value={formSubtitulo}
                  onChange={(e) => setFormSubtitulo(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Fila 4: Fechas y Estado Activo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-100">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Fecha y Hora de Inicio
                </label>
                <input
                  type="datetime-local"
                  value={formFechaInicio}
                  onChange={(e) => setFormFechaInicio(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                  Fecha y Hora de Fin
                </label>
                <input
                  type="datetime-local"
                  value={formFechaFin}
                  onChange={(e) => setFormFechaFin(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl bg-white"
                />
              </div>

              <div className="flex items-center sm:pt-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formActivo}
                    onChange={(e) => setFormActivo(e.target.checked)}
                    className="w-4 h-4 accent-[#f58220] rounded"
                  />
                  <span className="text-xs font-bold text-zinc-800">Banner publicado y activo</span>
                </label>
              </div>
            </div>

            {/* Acciones del Formulario */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#f58220] hover:bg-[#d96b0e] text-black font-heading font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Guardando...' : (editingBannerId ? 'Actualizar Banner' : 'Publicar Banner')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Lista de Banners con Miniaturas, Estado, Fechas y Drag & Drop */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h3 className="font-heading font-black text-lg uppercase tracking-wider text-zinc-900">
              Catálogo de Banners Registrados ({banners.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Reordena la secuencia con las flechas o arrastrando las filas. La primera posición se muestra al cargar la página.
            </p>
          </div>

          {banners.length > 0 && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="text-xs font-bold text-[#f58220] hover:text-[#d96b0e] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar otro</span>
            </button>
          )}
        </div>

        {banners.length === 0 ? (
          /* Estado Vacío Oficial con botón "Crear primer banner" */
          <div className="py-16 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-300 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-[#f58220] flex items-center justify-center mx-auto shadow-xs">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-heading font-black text-base uppercase text-zinc-900">
                Aún no tienes ningún banner activo
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                Configura los banners de campaña para el hero de la tienda en proporción 21:9 para desktop y 4:5 para móvil.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-6 py-3 bg-[#f58220] hover:bg-[#d96b0e] text-black font-heading font-black text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Crear primer banner</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((b, idx) => {
              const status = getBannerStatus(b);
              const isSelected = selectedBannerId === b.id;
              const missingMobile = !b.imagen_mobile || b.imagen_mobile === b.imagen_desktop;

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-[#f58220] bg-orange-50/20 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  {/* Lado izquierdo: Orden + Miniaturas 21:9 y 4:5 + Datos */}
                  <div className="flex items-center gap-4">
                    {/* Botones de Reordenar */}
                    <div className="flex flex-col items-center gap-1 text-zinc-400 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:text-black hover:bg-zinc-100 rounded disabled:opacity-30 cursor-pointer"
                        title="Subir orden"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[11px] font-bold text-zinc-600">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === banners.length - 1}
                        className="p-1 hover:text-black hover:bg-zinc-100 rounded disabled:opacity-30 cursor-pointer"
                        title="Bajar orden"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Miniaturas Desktop y Móvil */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Miniatura Desktop (21:9) */}
                      <div className="relative w-24 aspect-[21/9] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-900">
                        {b.imagen_desktop && (
                          <Image src={b.imagen_desktop} alt="Miniatura Desktop" fill className="object-cover" />
                        )}
                        <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 rounded font-mono">
                          21:9
                        </span>
                      </div>

                      {/* Miniatura Móvil (4:5) */}
                      <div className="relative w-10 aspect-[4/5] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-900">
                        {b.imagen_mobile && (
                          <Image src={b.imagen_mobile} alt="Miniatura Móvil" fill className="object-cover" />
                        )}
                        {missingMobile && (
                          <span className="absolute inset-0 bg-amber-500/20 border border-amber-500/40 flex items-center justify-center" title="Falta versión móvil">
                            <span className="text-[7px] text-amber-900 font-bold bg-amber-100 px-0.5 rounded">Auto</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Información */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-black text-sm uppercase text-zinc-900">
                          {b.titulo || 'Banner Sin Texto Superpuesto'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                          {b.ubicacion}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                        <span className="font-mono text-[11px] text-zinc-400">
                          Enlace: <strong className="text-zinc-700">{b.enlace || '/productos'}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {b.fecha_fin ? `Hasta: ${b.fecha_fin.slice(0, 10)}` : 'Permanente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lado derecho: Acciones */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBannerId(b.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl transition cursor-pointer"
                      title="Ver en previsualizador superior"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl transition cursor-pointer"
                      title="Editar banner"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(b)}
                      className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl transition cursor-pointer"
                      title="Duplicar banner"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(b)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        b.activo
                          ? 'text-emerald-700 hover:bg-emerald-50'
                          : 'text-zinc-400 hover:bg-zinc-100'
                      }`}
                      title={b.activo ? 'Desactivar banner' : 'Activar banner'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(b.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Eliminar banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Recorte y Zoom (16:9, 4:5 o 21:9) */}
      <BannerCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        aspectRatio={cropTarget === 'desktop' ? ((formUbicacion === 'hero' || formUbicacion === 'mediano') ? '16/9' : '21/9') : '4/5'}
        title={`Recortar Imagen ${cropTarget === 'desktop' ? (formUbicacion === 'hero' || formUbicacion === 'mediano' ? 'Desktop (16:9)' : 'Desktop (21:9)') : 'Móvil (4:5)'}`}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={(croppedUrl) => {
          if (cropTarget === 'desktop') {
            setFormImgDesktop(croppedUrl);
          } else {
            setFormImgMobile(croppedUrl);
          }
          showToast('Recorte aplicado exitosamente', 'success');
        }}
      />

      {/* Modal Selector de Enlaces (Categorías, Productos, Promos) */}
      <LinkPickerModal
        isOpen={linkPickerOpen}
        onClose={() => setLinkPickerOpen(false)}
        categories={categories}
        products={products}
        promos={promos}
        onSelectLink={(url, defaultTitle) => {
          setFormEnlace(url);
          if (!formTitulo && defaultTitle) {
            setFormTitulo(defaultTitle);
          }
          showToast(`Destino configurado: ${url}`, 'success');
        }}
      />

      {/* Confirmación para Eliminar */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        title="¿Eliminar este banner permanentemente?"
        message="Esta acción retirará el banner del hero y del carrusel de la tienda pública."
        confirmText="Sí, eliminar banner"
        cancelText="Conservar"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
