'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  UploadCloud, 
  Crop, 
  Star, 
  Trash2, 
  Plus, 
  Check, 
  AlertCircle, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { FormSection } from '../ui/FormSection';
import { StickySaveBar } from '../ui/StickySaveBar';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { PhotoCropModal } from './PhotoCropModal';
import { useToast } from '../ui/Toast';
import { saveProduct, uploadImageToStorage } from '@/lib/services/admin-service';
import { calcularCuotaEstimada } from '@/lib/acuotaz-estimado';
import { formatPEN } from '@/utils/currency';
import { createClient } from '@/lib/supabase/client';
import {
  generateVariantSku,
  validateProductForm,
  resolveGeneralSku,
  assertNoInvisibleFieldErrors,
} from '@/utils/productValidation';

interface AdminProductFormProps {
  initialProduct: any | null;
  categories: any[];
  brands: any[];
  onBack: () => void;
  onSaved: () => void;
}

const COLORES_BASE: Record<string, string> = {
  'Negro Mate': '#1C1C1C',
  'Negro Brillo': '#000000',
  Blanco: '#FFFFFF',
  Titanio: '#8A8D8F',
  Rojo: '#D62828',
  Flúor: '#CCFF00',
};

export function AdminProductForm({
  initialProduct,
  categories,
  brands,
  onBack,
  onSaved,
}: AdminProductFormProps) {
  const { showToast } = useToast();
  const isEditing = Boolean(initialProduct?.id);

  // 1. Estados del formulario
  const [nombre, setNombre] = useState(initialProduct?.nombre || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  // Categoría y marca empiezan vacías y son obligatorias para no asignar valores por error
  const [categoriaSlug, setCategoriaSlug] = useState(
    initialProduct?.categoria_slug || ''
  );
  const [subcategoriaSlug, setSubcategoriaSlug] = useState(
    initialProduct?.subcategoria_slug || ''
  );
  const [marcaId, setMarcaId] = useState(
    initialProduct?.marca_id || ''
  );
  const [precio, setPrecio] = useState(initialProduct?.precio?.toString() || '');
  const [precioOferta, setPrecioOferta] = useState(
    initialProduct?.precio_oferta ? initialProduct.precio_oferta.toString() : ''
  );
  const [stock, setStock] = useState<number>(initialProduct?.stock || 0);
  const [modoVenta, setModoVenta] = useState<'online' | 'cotizar'>(
    initialProduct?.modo_venta || 'online'
  );
  const [activo, setActivo] = useState<boolean>(
    initialProduct?.activo !== undefined ? initialProduct.activo : true
  );
  const [etiqueta, setEtiqueta] = useState<string>(
    initialProduct?.es_nuevo ? 'nuevo' : initialProduct?.es_combo ? 'combo' : 'ninguna'
  );
  const [descripcionCorta, setDescripcionCorta] = useState(
    initialProduct?.descripcion_corta || ''
  );

  // Ficha técnica en pares { clave, valor }
  const [fichaTecnica, setFichaTecnica] = useState<{ clave: string; valor: string }[]>(() => {
    if (initialProduct?.ficha_tecnica && typeof initialProduct.ficha_tecnica === 'object') {
      return Object.entries(initialProduct.ficha_tecnica).map(([clave, valor]) => ({
        clave,
        valor: String(valor),
      }));
    }
    return [
      { clave: 'Certificación', valor: 'ECE 22.06 / DOT' },
      { clave: 'Material', valor: 'Policarbonato HPTT' },
      { clave: 'Peso', valor: '1450g ± 50g' },
    ];
  });

  // Fotos
  const [imagenes, setImagenes] = useState<{ url: string; orden: number }[]>(() => {
    if (initialProduct?.producto_imagenes && initialProduct.producto_imagenes.length > 0) {
      return [...initialProduct.producto_imagenes].sort((a, b) => a.orden - b.orden);
    }
    if (initialProduct?.imagenes && Array.isArray(initialProduct.imagenes)) {
      return initialProduct.imagenes.map((url: string, idx: number) => ({
        url,
        orden: idx + 1,
      }));
    }
    return [];
  });

  // Variantes
  const hasInitialVariants = Boolean(
    initialProduct?.producto_variantes && initialProduct.producto_variantes.length > 0
  );
  const [tieneVariantes, setTieneVariantes] = useState(hasInitialVariants);
  const [selectedTallas, setSelectedTallas] = useState<string[]>(() => {
    if (hasInitialVariants) {
      return Array.from(new Set(initialProduct.producto_variantes.map((v: any) => v.talla).filter(Boolean))) as string[];
    }
    return ['M', 'L', 'XL'];
  });
  const [selectedColores, setSelectedColores] = useState<string[]>(() => {
    if (hasInitialVariants) {
      return Array.from(new Set(initialProduct.producto_variantes.map((v: any) => v.color).filter(Boolean))) as string[];
    }
    return ['Negro Mate'];
  });
  // Color de la muestra (swatch) que ve el cliente en la ficha del producto
  const [colorHex, setColorHex] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = { ...COLORES_BASE };
    if (hasInitialVariants) {
      initialProduct.producto_variantes.forEach((v: any) => {
        if (v.color && v.color_hex) map[v.color] = v.color_hex;
      });
    }
    return map;
  });
  const [nuevoColor, setNuevoColor] = useState('');
  const [nuevoColorHex, setNuevoColorHex] = useState('#F4A6C0');
  const [variantes, setVariantes] = useState<any[]>(() => {
    if (hasInitialVariants) {
      return initialProduct.producto_variantes.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        talla: v.talla,
        color: v.color,
        color_hex: v.color_hex || '#000000',
        stock: v.stock || 0,
        precio_ajuste: v.precio_ajuste || 0,
      }));
    }
    return [];
  });

  // Estado del modal de recorte y nueva marca
  const [cropModalSrc, setCropModalSrc] = useState<string | null>(null);
  const [cropTargetIdx, setCropTargetIdx] = useState<number | null>(null);
  const [newBrandModalOpen, setNewBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState<string>('5');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detección de cambios sin guardar (Dirty state)
  const [isDirty, setIsDirty] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setIsDirty(true);
  }, [
    nombre,
    sku,
    categoriaSlug,
    subcategoriaSlug,
    marcaId,
    precio,
    precioOferta,
    stock,
    modoVenta,
    activo,
    etiqueta,
    descripcionCorta,
    fichaTecnica,
    imagenes,
    tieneVariantes,
    variantes,
  ]);

  // Alerta nativa al salir de la pestaña con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Subcategorías según la categoría seleccionada
  const selectedCategoryObj = categories.find((c) => c.slug === categoriaSlug);
  const subcategoriasList = selectedCategoryObj?.subcategorias || [];

  // Cálculo del porcentaje de descuento
  const numPrecio = parseFloat(precio) || 0;
  const numPrecioOferta = parseFloat(precioOferta) || 0;
  const descuentoInfo = useMemo(() => {
    if (numPrecio > 0 && numPrecioOferta > 0 && numPrecioOferta < numPrecio) {
      const porcentaje = Math.round(((numPrecio - numPrecioOferta) / numPrecio) * 100);
      const ahorro = numPrecio - numPrecioOferta;
      return { porcentaje, ahorro };
    }
    return null;
  }, [numPrecio, numPrecioOferta]);

  // Estimado de cuotas aCuotaz
  const precioEfectivo = numPrecioOferta > 0 && numPrecioOferta < numPrecio ? numPrecioOferta : numPrecio;
  const cuotaInfo = useMemo(() => {
    if (precioEfectivo >= 100) {
      return calcularCuotaEstimada(precioEfectivo);
    }
    return null;
  }, [precioEfectivo]);

  // Sincronización automática de la matriz de variantes cuando cambian los chips
  useEffect(() => {
    if (!tieneVariantes) return;

    const tallas = selectedTallas.length > 0 ? selectedTallas : ['Única'];
    const colores = selectedColores.length > 0 ? selectedColores : ['Estándar'];

    setVariantes((prev) => {
      const currentMap = new Map(
        prev.map((v) => [`${v.talla}-${v.color}`, v])
      );

      const next: any[] = [];
      tallas.forEach((t) => {
        colores.forEach((c) => {
          const key = `${t}-${c}`;
          const existing = currentMap.get(key);
          const color_hex = colorHex[c] || existing?.color_hex || '#000000';
          if (existing) {
            existing.color_hex = color_hex;
            // Si la variante existente no tiene SKU, generarle uno editable
            if (!existing.sku || !existing.sku.trim()) {
              existing.sku = (sku ? `${sku}-${t}-${c.replace(/\s+/g, '')}` : generateVariantSku(nombre, t, c)).toUpperCase();
            }
            next.push(existing);
          } else {
            const cleanSku = (sku ? `${sku}-${t}-${c.replace(/\s+/g, '')}` : generateVariantSku(nombre, t, c)).toUpperCase();
            next.push({
              talla: t,
              color: c,
              color_hex,
              sku: cleanSku,
              stock: 5,
              precio_ajuste: 0,
            });
          }
        });
      });
      return next;
    });
  }, [tieneVariantes, selectedTallas, selectedColores, colorHex, sku, nombre]);

  const agregarColor = () => {
    const nombreColor = nuevoColor.trim().replace(/\s+/g, ' ');
    if (!nombreColor) return;
    const existente = Object.keys(colorHex).find((c) => c.toLowerCase() === nombreColor.toLowerCase()) || nombreColor;
    if (existente === nombreColor) setColorHex({ ...colorHex, [nombreColor]: nuevoColorHex });
    if (!selectedColores.includes(existente)) setSelectedColores([...selectedColores, existente]);
    setNuevoColor('');
  };

  // Manejo de fotos
  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const uploadedUrl = await uploadImageToStorage(file, 'productos');
        setImagenes((prev) => [
          ...prev,
          { url: uploadedUrl, orden: prev.length + 1 },
        ]);
        showToast(`Imagen ${file.name} subida con éxito`);
      } catch (err: any) {
        // Fallback a objeto local en entorno de pruebas
        const localUrl = URL.createObjectURL(file);
        setImagenes((prev) => [
          ...prev,
          { url: localUrl, orden: prev.length + 1 },
        ]);
      }
    }
  };

  const setAsCover = (index: number) => {
    setImagenes((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next.map((img, i) => ({ ...img, orden: i + 1 }));
    });
    showToast('Foto de portada actualizada');
  };

  const removeImage = (index: number) => {
    setImagenes((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((img, i) => ({ ...img, orden: i + 1 }));
    });
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setImagenes((prev) => {
      const next = [...prev];
      const target = direction === 'left' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next.map((img, i) => ({ ...img, orden: i + 1 }));
    });
  };

  // Manejo de Ficha Técnica
  const addFichaRow = () => {
    setFichaTecnica((prev) => [...prev, { clave: '', valor: '' }]);
  };

  const updateFichaRow = (index: number, field: 'clave' | 'valor', text: string) => {
    setFichaTecnica((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: text };
      return next;
    });
  };

  const removeFichaRow = (index: number) => {
    setFichaTecnica((prev) => prev.filter((_, i) => i !== index));
  };

  // Aplicar stock a todas las variantes
  const handleApplyBulkStock = () => {
    const val = parseInt(bulkStockValue, 10);
    if (isNaN(val) || val < 0) return;
    setVariantes((prev) => prev.map((v) => ({ ...v, stock: val })));
    showToast(`Stock de ${val} aplicado a todas las variantes`);
  };

  // Validación y guardado
  const validateForm = async () => {
    // 1. Auto-generar SKU para cualquier variante que no tenga uno si el nombre está presente
    if (tieneVariantes && variantes.length > 0) {
      let changed = false;
      const nextVariantes = variantes.map((v) => {
        let vSku = v.sku ? v.sku.trim().toUpperCase() : '';
        if (!vSku && nombre.trim()) {
          vSku = generateVariantSku(nombre, v.talla, v.color);
          changed = true;
          return { ...v, sku: vSku };
        }
        return v;
      });
      if (changed) {
        setVariantes(nextVariantes);
      }
    }

    // 2. Validación síncrona de campos obligatorios e invariantes
    const newErrors = validateProductForm({
      nombre,
      precio,
      precioOferta,
      categoriaSlug,
      marcaId,
      sku,
      tieneVariantes,
      variantes,
    });

    // Comprobación de duplicados contra la base de datos (otros productos y variantes)
    try {
      const supabase = createClient();
      const currentId = initialProduct?.id || 'none';

      if (!tieneVariantes && sku.trim()) {
        const cleanSku = sku.trim().toUpperCase();
        const [{ data: pMatch }, { data: vMatch }] = await Promise.all([
          supabase.from('productos').select('id, nombre').eq('sku', cleanSku).neq('id', currentId).maybeSingle(),
          supabase.from('producto_variantes').select('id, sku').eq('sku', cleanSku).neq('producto_id', currentId).maybeSingle(),
        ]);
        if (pMatch || vMatch) {
          newErrors.sku = `El SKU "${cleanSku}" ya pertenece a otro producto o variante del catálogo.`;
        }
      }

      if (tieneVariantes && variantes.length > 0) {
        const skusToCheck = variantes.map((v) => v.sku?.trim()?.toUpperCase()).filter(Boolean);
        if (skusToCheck.length > 0) {
          const [{ data: pMatches }, { data: vMatches }] = await Promise.all([
            supabase.from('productos').select('id, sku').in('sku', skusToCheck).neq('id', currentId),
            supabase.from('producto_variantes').select('id, sku, producto_id').in('sku', skusToCheck).neq('producto_id', currentId),
          ]);

          const takenSet = new Set<string>();
          pMatches?.forEach((p) => takenSet.add(p.sku));
          vMatches?.forEach((v) => takenSet.add(v.sku));

          variantes.forEach((v, idx) => {
            const vSku = v.sku?.trim()?.toUpperCase();
            if (vSku && takenSet.has(vSku) && !newErrors[`variante_${idx}_sku`]) {
              newErrors[`variante_${idx}_sku`] = `El SKU "${vSku}" ya existe en otro producto del catálogo.`;
            }
          });
        }
      }
    } catch (e) {
      console.warn('Verificación de duplicados en cliente falló, el servidor validará:', e);
    }

    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const friendlyLabels: Record<string, string> = {
        nombre: 'Nombre del producto',
        categoria: 'Categoría principal',
        marca: 'Marca oficial',
        sku: 'Código SKU',
        precio: 'Precio normal',
        precioOferta: 'Precio de oferta',
        variantes: 'Variantes del producto',
      };

      const errorNames = errorKeys.map((k) => {
        if (k.startsWith('variante_')) {
          const idx = parseInt(k.split('_')[1], 10) + 1;
          return `SKU de Variante #${idx}`;
        }
        return friendlyLabels[k] || k;
      });

      // Llevar al primer campo con error
      const firstKey = errorKeys[0];
      setTimeout(() => {
        const el = document.getElementById(`field-${firstKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (typeof el.focus === 'function') el.focus();
        }
      }, 100);

      showToast(`Corrige los siguientes campos: ${errorNames.join(', ')}`, 'error');
      return false;
    }

    return true;
  };

  const handleSaveProduct = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSaving(true);
    try {
      const generatedSlug = slug.trim()
        ? slug.trim()
        : nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const selectedCat = categories.find((c) => c.slug === categoriaSlug);
      const selectedMarca = brands.find((m) => m.id === marcaId);

      // Convertir ficha técnica a JSON
      const fichaObj: Record<string, string> = {};
      fichaTecnica.forEach((row) => {
        if (row.clave.trim() && row.valor.trim()) {
          fichaObj[row.clave.trim()] = row.valor.trim();
        }
      });

      // Cálculo del stock total si tiene variantes
      const calculatedStock = tieneVariantes
        ? variantes.reduce((acc, v) => acc + (parseInt(v.stock, 10) || 0), 0)
        : stock;

      const payload: any = {
        id: initialProduct?.id,
        nombre: nombre.trim(),
        slug: generatedSlug,
        // Con variantes, se guarda NULL en el SKU general (nunca copiar de variante)
        sku: resolveGeneralSku(tieneVariantes, sku),
        categoria_slug: categoriaSlug,
        categoria_nombre: selectedCat?.nombre || categoriaSlug,
        subcategoria_slug: subcategoriaSlug,
        subcategoria_nombre: subcategoriasList.find((s: any) => s.slug === subcategoriaSlug)?.nombre || '',
        marca_id: marcaId,
        marca_nombre: selectedMarca?.nombre || marcaId,
        precio: numPrecio,
        precio_oferta: numPrecioOferta > 0 ? numPrecioOferta : undefined,
        descuento_porcentaje: descuentoInfo ? descuentoInfo.porcentaje : undefined,
        es_oferta: Boolean(descuentoInfo),
        es_nuevo: etiqueta === 'nuevo',
        es_combo: etiqueta === 'combo',
        modo_venta: modoVenta,
        activo,
        stock: calculatedStock,
        descripcion_corta: descripcionCorta.trim(),
        ficha_tecnica: fichaObj,
        imagenes: imagenes.map((img, idx) => ({ url: img.url, orden: idx + 1 })),
        variantes: tieneVariantes ? variantes : [],
      };

      await saveProduct(payload);
      setIsDirty(false);
      showToast('¡Producto guardado exitosamente en el catálogo!', 'success');
      onSaved();
    } catch (err: any) {
      console.error('Error guardando producto:', err);
      showToast('Error al guardar: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackClick = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Barra superior con volver y título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 transition cursor-pointer"
            title="Volver a la lista de productos"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-11 font-bold text-zinc-500 uppercase tracking-wider">
                Productos / {isEditing ? 'Editar producto' : 'Nuevo producto'}
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  activo
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {activo ? 'Publicado' : 'Borrador'}
              </span>
            </div>
            <h1 className="font-heading font-black text-20 sm:text-24 uppercase text-zinc-900 leading-tight">
              {nombre || 'Nuevo Producto para la Tienda'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <Link
              href={`/producto/${slug || initialProduct?.slug}`}
              target="_blank"
              className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg text-12 font-bold text-zinc-700 flex items-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver en tienda</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleSaveProduct}
            disabled={isSaving}
            className="px-5 py-2 bg-[#F58220] hover:bg-[#E07216] text-[#111111] font-heading font-bold text-13 uppercase rounded-lg transition-all shadow-sm active:scale-98 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Producto</span>
          </button>
        </div>
      </div>

      {/* Resumen de errores de validación visible al inicio */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3 text-red-900 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1 text-xs">
            <h4 className="font-bold text-13 uppercase tracking-wider text-red-900">
              Corrige los siguientes campos para guardar ({Object.keys(errors).length}):
            </h4>
            <ul className="list-disc list-inside space-y-1 font-medium text-red-800">
              {Object.entries(errors).map(([key, msg]) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`field-${key}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        if (typeof el.focus === 'function') el.focus();
                      }
                    }}
                    className="underline hover:text-red-950 font-bold cursor-pointer text-left"
                  >
                    {msg}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Cuadrícula Principal de 2 Columnas (Estilo Shopify / Filament) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* COLUMNA PRINCIPAL (8 columnas)                           */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. INFORMACIÓN BÁSICA */}
          <FormSection
            title="1. Información del Producto"
            description="Nombre principal, descripción y ficha técnica para la tienda."
          >
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 flex items-center justify-between">
                <span>Nombre del Producto <span className="text-red-500">*</span></span>
                <span className="text-11 text-zinc-400 font-normal">Recomendado: Marca + Modelo + Color</span>
              </label>
              <input
                id="field-nombre"
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errors.nombre) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.nombre;
                      return next;
                    });
                  }
                }}
                placeholder="Casco LS2 FF800 Storm negro mate"
                className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-lg text-13 text-zinc-900 focus:bg-white focus:outline-none transition-colors ${
                  errors.nombre ? 'border-red-500 bg-red-50/20' : 'border-zinc-300 focus:border-[#F58220]'
                }`}
              />
              {errors.nombre && (
                <p className="text-11 text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.nombre}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                Descripción Detallada
              </label>
              <textarea
                rows={4}
                value={descripcionCorta}
                onChange={(e) => setDescripcionCorta(e.target.value)}
                placeholder="Describe las características principales, ventilación, visor solar, tipo de cierre y para qué tipo de uso o cilindraje está recomendado..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-13 text-zinc-900 focus:bg-white focus:outline-none focus:border-[#F58220] transition-colors leading-relaxed"
              />
            </div>

            {/* Ficha Técnica dinámica */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <label className="text-12 font-bold uppercase tracking-wider text-zinc-700">
                  Ficha Técnica (Filas Clave : Valor)
                </label>
                <button
                  type="button"
                  onClick={addFichaRow}
                  className="text-11 font-bold text-[#F58220] hover:text-[#E07216] flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar característica</span>
                </button>
              </div>

              <div className="space-y-2">
                {fichaTecnica.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row.clave}
                      onChange={(e) => updateFichaRow(idx, 'clave', e.target.value)}
                      placeholder="Ej. Certificación"
                      className="w-1/3 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-12 text-zinc-800 focus:bg-white focus:border-[#F58220] focus:outline-none font-medium"
                    />
                    <span className="text-zinc-400">:</span>
                    <input
                      type="text"
                      value={row.valor}
                      onChange={(e) => updateFichaRow(idx, 'valor', e.target.value)}
                      placeholder="Ej. ECE 22.06 / DOT"
                      className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-12 text-zinc-800 focus:bg-white focus:border-[#F58220] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeFichaRow(idx)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-zinc-100 transition cursor-pointer"
                      title="Eliminar fila"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </FormSection>

          {/* 2. FOTOS Y MULTIMEDIA CON RECORTE 1:1 */}
          <FormSection
            title="2. Fotos del Producto"
            description="La primera imagen con la estrella dorada es la portada del catálogo. Cada imagen puede recortarse en formato 1:1."
          >
            {/* Zona de subida */}
            <div className="border-2 border-dashed border-zinc-300 hover:border-[#F58220] rounded-xl p-6 text-center transition-colors bg-zinc-50/50 hover:bg-orange-50/10">
              <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <label className="cursor-pointer block">
                <span className="text-13 font-bold text-[#F58220] hover:underline">
                  Sube nuevas fotos
                </span>
                <span className="text-13 text-zinc-500"> o arrastra aquí</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadImages}
                  className="hidden"
                />
              </label>
              <p className="text-11 text-zinc-400 mt-1">
                Formatos recomendados: JPG, PNG o WebP en alta resolución.
              </p>
            </div>

            {/* Cuadrícula de fotos cargadas */}
            {imagenes.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                {imagenes.map((img, idx) => {
                  const isCover = idx === 0;

                  return (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-xl border-2 overflow-hidden group bg-white shadow-xs transition-all ${
                        isCover ? 'border-[#F58220] ring-2 ring-orange-200/50' : 'border-zinc-200'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`Foto ${idx + 1}`}
                        fill
                        className="object-contain p-2"
                      />

                      {/* Insignia de Portada */}
                      {isCover && (
                        <div className="absolute top-2 left-2 bg-[#F58220] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1 select-none">
                          <Star className="w-3 h-3 fill-black" />
                          <span>Portada</span>
                        </div>
                      )}

                      {/* Botones de acción flotantes en hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex items-center justify-between">
                          {!isCover ? (
                            <button
                              type="button"
                              onClick={() => setAsCover(idx)}
                              className="p-1 rounded bg-black/60 text-white hover:text-amber-300 transition cursor-pointer"
                              title="Convertir en foto de portada"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          ) : <div />}

                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1 rounded bg-black/60 text-white hover:text-red-400 transition cursor-pointer"
                            title="Eliminar imagen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Botón de Recorte 1:1 y Reordenar */}
                        <div className="flex items-center justify-between gap-1 bg-black/70 p-1 rounded-lg backdrop-blur-xs">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'left')}
                            disabled={idx === 0}
                            className="p-1 text-white hover:text-[#F58220] disabled:opacity-30 cursor-pointer"
                            title="Mover a la izquierda"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCropModalSrc(img.url);
                              setCropTargetIdx(idx);
                            }}
                            className="px-2 py-1 text-[11px] font-bold text-white hover:text-[#F58220] flex items-center gap-1 transition cursor-pointer"
                            title="Abrir recorte 1:1"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            <span>Recortar 1:1</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'right')}
                            disabled={idx === imagenes.length - 1}
                            className="p-1 text-white hover:text-[#F58220] disabled:opacity-30 cursor-pointer"
                            title="Mover a la derecha"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </FormSection>

          {/* 3. PRECIO Y aCuotaz */}
          <FormSection
            title="3. Precios y Cuotas"
            description="Precio regular de venta, precio de oferta promocional y simulación de aCuotaz."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Precio Normal */}
              <div className="space-y-1.5">
                <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                  Precio Normal (S/) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-13 font-bold text-zinc-500">
                    S/
                  </span>
                  <input
                    id="field-precio"
                    type="number"
                    step="0.10"
                    min="0"
                    value={precio}
                    onChange={(e) => {
                      setPrecio(e.target.value);
                      if (errors.precio) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.precio;
                          return next;
                        });
                      }
                    }}
                    placeholder="450.00"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border rounded-lg text-14 font-bold text-zinc-900 focus:bg-white focus:outline-none transition-colors ${
                      errors.precio ? 'border-red-500 bg-red-50/20' : 'border-zinc-300 focus:border-[#F58220]'
                    }`}
                  />
                </div>
                {errors.precio && (
                  <p className="text-11 text-red-500 font-medium">{errors.precio}</p>
                )}
              </div>

              {/* Precio Oferta */}
              <div className="space-y-1.5">
                <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 flex items-center justify-between">
                  <span>Precio de Oferta (Opcional)</span>
                  {descuentoInfo && (
                    <span className="text-11 font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      -{descuentoInfo.porcentaje}% AHORRO
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-13 font-bold text-zinc-500">
                    S/
                  </span>
                  <input
                    id="field-precioOferta"
                    type="number"
                    step="0.10"
                    min="0"
                    value={precioOferta}
                    onChange={(e) => {
                      setPrecioOferta(e.target.value);
                      if (errors.precioOferta) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.precioOferta;
                          return next;
                        });
                      }
                    }}
                    placeholder="389.00"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border rounded-lg text-14 font-bold text-zinc-900 focus:bg-white focus:outline-none transition-colors ${
                      errors.precioOferta ? 'border-red-500 bg-red-50/20' : 'border-zinc-300 focus:border-[#F58220]'
                    }`}
                  />
                </div>
                {errors.precioOferta && (
                  <p className="text-11 text-red-500 font-medium">{errors.precioOferta}</p>
                )}
              </div>
            </div>

            {/* Vista previa de Cuotas aCuotaz */}
            <div className="mt-2 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-12">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-orange-500 text-white rounded flex items-center justify-center font-black text-13 shrink-0">
                  a
                </div>
                <div>
                  <span className="font-bold text-zinc-800 block">
                    Financiamiento referencial aCuotaz:
                  </span>
                  <span className="text-zinc-600">
                    {cuotaInfo !== null ? (
                      <>
                        Hasta <strong className="text-zinc-900">9 cuotas</strong> de{' '}
                        <strong className="text-[#F58220]">{formatPEN(cuotaInfo)}</strong> quincenales.
                      </>
                    ) : (
                      'El monto no alcanza el rango de S/ 100 a S/ 2,000 para financiamiento en cuotas.'
                    )}
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-bold text-zinc-500 bg-white px-2.5 py-1 rounded border border-zinc-200 shrink-0 self-start sm:self-auto">
                Sin tarjeta • Solo DNI
              </div>
            </div>
          </FormSection>

          {/* 4. STOCK Y VARIANTES (TALLAS / COLORES) */}
          <FormSection
            title="4. Stock e Inventario"
            description="Gestiona el SKU y las existencias generales o por combinación de talla y color."
          >
            {/* Toggle de variantes */}
            <div
              id="field-variantes"
              tabIndex={-1}
              className={`p-3 bg-zinc-50 rounded-lg border transition-colors ${
                errors.variantes ? 'border-red-500 bg-red-50/20' : 'border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-13 text-zinc-800 block">
                    ¿Este producto tiene tallas o colores diferentes?
                  </span>
                  <span className="text-11 text-zinc-500">
                    Activa para generar variantes independientes con SKU y stock individual.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTieneVariantes(!tieneVariantes)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    tieneVariantes ? 'bg-[#F58220]' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      tieneVariantes ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              {errors.variantes && (
                <p className="text-11 text-red-500 font-medium flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.variantes}</span>
                </p>
              )}
            </div>

            {/* CASO A: PRODUCTO SIMPLE SIN VARIANTES */}
            {!tieneVariantes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                    Código SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="field-sku"
                    type="text"
                    value={sku}
                    onChange={(e) => {
                      setSku(e.target.value.toUpperCase());
                      if (errors.sku) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.sku;
                          return next;
                        });
                      }
                    }}
                    placeholder="CAS-LS2-FF800-NM"
                    className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-lg text-13 font-mono font-bold text-zinc-900 focus:bg-white focus:outline-none transition-colors ${
                      errors.sku ? 'border-red-500 bg-red-50/20' : 'border-zinc-300 focus:border-[#F58220]'
                    }`}
                  />
                  {errors.sku && (
                    <p className="text-11 text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.sku}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                    Stock Disponible en Tienda
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-13 font-bold text-zinc-900 focus:bg-white focus:outline-none focus:border-[#F58220] transition-colors"
                  />
                </div>
              </div>
            ) : (
              /* CASO B: PRODUCTO CON VARIANTES (TALLAS / COLORES) */
              <div className="space-y-5 pt-1">
                {/* Selector de Chips de Tallas */}
                <div className="space-y-2">
                  <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                    Tallas Disponibles:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((talla) => {
                      const isSel = selectedTallas.includes(talla);
                      return (
                        <button
                          key={talla}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              if (selectedTallas.length > 1) {
                                setSelectedTallas(selectedTallas.filter((t) => t !== talla));
                              }
                            } else {
                              setSelectedTallas([...selectedTallas, talla]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-12 font-bold transition-all cursor-pointer border ${
                            isSel
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                              : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-400'
                          }`}
                        >
                          {talla}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selector de Chips de Colores */}
                <div className="space-y-2">
                  <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                    Colores Disponibles:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set([...Object.keys(COLORES_BASE), ...selectedColores])).map((color) => {
                      const isSel = selectedColores.includes(color);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              if (selectedColores.length > 1) {
                                setSelectedColores(selectedColores.filter((c) => c !== color));
                              }
                            } else {
                              setSelectedColores([...selectedColores, color]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-12 font-bold transition-all cursor-pointer border ${
                            isSel
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                              : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-400'
                          }`}
                        >
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-zinc-300 mr-1.5 align-middle"
                            style={{ backgroundColor: colorHex[color] || '#000000' }}
                          />
                          {color}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={nuevoColorHex}
                      onChange={(e) => setNuevoColorHex(e.target.value)}
                      aria-label="Tono del nuevo color"
                      className="w-9 h-9 p-0.5 bg-white border border-zinc-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={nuevoColor}
                      onChange={(e) => setNuevoColor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          agregarColor();
                        }
                      }}
                      placeholder="Otro color (ej. Rosado)"
                      className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-lg text-12 text-zinc-900 focus:outline-none focus:border-[#F58220]"
                    />
                    <button
                      type="button"
                      onClick={agregarColor}
                      className="px-3 py-2 bg-zinc-900 text-white rounded-lg text-12 font-bold cursor-pointer hover:bg-zinc-800"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Herramienta rápida de asignación masiva de stock */}
                <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-lg flex items-center justify-between gap-3 text-12">
                  <span className="font-medium text-orange-950">
                    Asignar mismo stock a todas las variantes:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={bulkStockValue}
                      onChange={(e) => setBulkStockValue(e.target.value)}
                      className="w-16 px-2 py-1 bg-white border border-orange-300 rounded text-center font-bold text-12 text-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={handleApplyBulkStock}
                      className="px-3 py-1 bg-[#F58220] hover:bg-[#E07216] text-[#111111] font-heading font-bold uppercase rounded text-11 transition cursor-pointer"
                    >
                      Aplicar a todas
                    </button>
                  </div>
                </div>

                {/* Tabla de Variantes */}
                <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-12">
                    <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 font-heading font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Variante</th>
                        <th className="py-2.5 px-3">SKU Individual</th>
                        <th className="py-2.5 px-3 w-24">Stock</th>
                        <th className="py-2.5 px-3 w-28">Precio Extra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {variantes.map((v, vIdx) => {
                        const rowError = errors[`variante_${vIdx}_sku`];
                        return (
                          <tr key={vIdx} className={rowError ? 'bg-red-50/60 transition-colors' : 'hover:bg-zinc-50/60'}>
                            <td className="py-2.5 px-3 font-bold text-zinc-800">
                              <span className="block">{v.talla} / {v.color}</span>
                              <span className="text-[10px] text-zinc-400 font-normal">Fila #{vIdx + 1}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                id={`field-variante_${vIdx}_sku`}
                                type="text"
                                value={v.sku}
                                onChange={(e) => {
                                  const next = [...variantes];
                                  next[vIdx].sku = e.target.value.toUpperCase();
                                  setVariantes(next);
                                  if (errors[`variante_${vIdx}_sku`]) {
                                    setErrors((prev) => {
                                      const n = { ...prev };
                                      delete n[`variante_${vIdx}_sku`];
                                      return n;
                                    });
                                  }
                                }}
                                placeholder="SKU de la variante"
                                className={`w-full px-2 py-1.5 bg-zinc-50 border rounded font-mono text-11 text-zinc-900 transition-colors ${
                                  rowError ? 'border-red-500 bg-red-50/30 ring-1 ring-red-400' : 'border-zinc-200 focus:border-[#F58220]'
                                }`}
                              />
                              {rowError && (
                                <p className="text-[10px] text-red-600 font-bold mt-1 leading-tight flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 shrink-0" />
                                  <span>{rowError}</span>
                                </p>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => {
                                  const next = [...variantes];
                                  next[vIdx].stock = parseInt(e.target.value, 10) || 0;
                                  setVariantes(next);
                                }}
                                className="w-20 px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded font-bold text-12 text-zinc-900 focus:border-[#F58220]"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                step="1"
                                value={v.precio_ajuste || 0}
                                onChange={(e) => {
                                  const next = [...variantes];
                                  next[vIdx].precio_ajuste = parseFloat(e.target.value) || 0;
                                  setVariantes(next);
                                }}
                                placeholder="0"
                                className="w-20 px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-12 text-zinc-800 focus:border-[#F58220]"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </FormSection>
        </div>

        {/* ======================================================== */}
        {/* COLUMNA LATERAL (4 columnas)                             */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Visibilidad y Modo de Venta */}
          <FormSection
            title="Visibilidad y Venta"
            description="Controla si el producto está visible en la web y el método de compra."
          >
            {/* Switch Activo / Borrador */}
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <div>
                <span className="font-bold text-12 uppercase text-zinc-800 block">
                  ¿Mostrar en la web?
                </span>
                <span className="text-11 text-zinc-500">
                  {activo ? 'Visible para los clientes' : 'Oculto como borrador'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivo(!activo)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  activo ? 'bg-emerald-500' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    activo ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Modo de Venta */}
            <div className="space-y-2 pt-2">
              <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                Modo de Venta
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition">
                  <input
                    type="radio"
                    name="modo_venta"
                    value="online"
                    checked={modoVenta === 'online'}
                    onChange={() => setModoVenta('online')}
                    className="text-[#F58220] focus:ring-[#F58220]"
                  />
                  <div>
                    <span className="font-bold text-12 text-zinc-800 block">Online (Carrito y WhatsApp)</span>
                    <span className="text-11 text-zinc-500">El cliente puede añadirlo al carrito o cotizar.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition">
                  <input
                    type="radio"
                    name="modo_venta"
                    value="cotizar"
                    checked={modoVenta === 'cotizar'}
                    onChange={() => setModoVenta('cotizar')}
                    className="text-[#F58220] focus:ring-[#F58220]"
                  />
                  <div>
                    <span className="font-bold text-12 text-zinc-800 block">Solo Cotizar por WhatsApp</span>
                    <span className="text-11 text-zinc-500">Muestra botón directo de WhatsApp sin carrito.</span>
                  </div>
                </label>
              </div>
            </div>
          </FormSection>

          {/* Card: Organización y Categorías */}
          <FormSection
            title="Organización del Catálogo"
            description="Asigna la categoría, subcategoría y marca del producto."
          >
            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                Categoría Principal <span className="text-red-500">*</span>
              </label>
              <select
                id="field-categoria"
                value={categoriaSlug}
                onChange={(e) => {
                  setCategoriaSlug(e.target.value);
                  setSubcategoriaSlug('');
                  if (errors.categoria) {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n.categoria;
                      return n;
                    });
                  }
                }}
                className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-lg text-13 font-medium text-zinc-800 focus:bg-white focus:outline-none cursor-pointer transition-colors ${
                  errors.categoria ? 'border-red-500 bg-red-50/20' : 'border-zinc-300 focus:border-[#F58220]'
                }`}
              >
                <option value="">-- Seleccionar categoría obligatoria --</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-11 text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.categoria}</span>
                </p>
              )}
            </div>

            {/* Subcategoría dependiente */}
            <div className="space-y-1.5">
              <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                Subcategoría
              </label>
              <select
                value={subcategoriaSlug}
                onChange={(e) => setSubcategoriaSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-13 font-medium text-zinc-800 focus:bg-white focus:outline-none focus:border-[#F58220] cursor-pointer"
              >
                <option value="">Seleccionar subcategoría...</option>
                {subcategoriasList.map((sub: any) => (
                  <option key={sub.slug} value={sub.slug}>
                    {sub.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Marca con creación rápida */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-12 font-bold uppercase tracking-wider text-zinc-700">
                  Marca Oficial <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setNewBrandModalOpen(true)}
                  className="text-11 font-bold text-[#F58220] hover:underline cursor-pointer"
                >
                  + Nueva marca
                </button>
              </div>
              <select
                id="field-marca"
                value={marcaId}
                onChange={(e) => {
                  setMarcaId(e.target.value);
                  if (errors.marca) {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n.marca;
                      return n;
                    });
                  }
                }}
                className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-lg text-13 font-medium text-zinc-800 focus:bg-white focus:outline-none cursor-pointer transition-colors ${
                  errors.marca ? 'border-red-500 bg-red-50/20' : 'border-zinc-300 focus:border-[#F58220]'
                }`}
              >
                <option value="">-- Seleccionar marca obligatoria --</option>
                {brands.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              {errors.marca && (
                <p className="text-11 text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.marca}</span>
                </p>
              )}
            </div>

            {/* Etiqueta Destacada */}
            <div className="space-y-1.5 pt-1">
              <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                Etiqueta Especial
              </label>
              <select
                value={etiqueta}
                onChange={(e) => setEtiqueta(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-13 font-medium text-zinc-800 focus:bg-white focus:outline-none focus:border-[#F58220] cursor-pointer"
              >
                <option value="ninguna">Sin etiqueta especial</option>
                <option value="nuevo">Nuevo Ingreso</option>
                <option value="mas_vendido">Más Vendido</option>
                <option value="combo">Combo / Pack Promocional</option>
              </select>
            </div>
          </FormSection>

          {/* Card: URL Slug y Enlace a la Tienda */}
          <FormSection
            title="Enlace y URL"
            description="Identificador único del producto en el catálogo web."
          >
            <div className="space-y-1.5">
              <label className="text-12 font-bold uppercase tracking-wider text-zinc-700 block">
                Slug URL
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                placeholder="casco-ls2-ff800-storm-negro-mate"
                className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-12 font-mono text-zinc-700 focus:bg-white focus:outline-none"
              />
              <p className="text-[11px] text-zinc-400">
                Se autogenera del nombre si se deja vacío.
              </p>
            </div>

            {isEditing && (
              <div className="pt-2 border-t border-zinc-100">
                <Link
                  href={`/producto/${slug || initialProduct?.slug}`}
                  target="_blank"
                  className="text-12 font-bold text-[#F58220] hover:text-[#E07216] flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver ficha en ioribikershop.pe</span>
                </Link>
              </div>
            )}
          </FormSection>
        </div>
      </div>

      {/* BARRA FIJA DE GUARDAR (Shopify style) */}
      <StickySaveBar
        isVisible={isDirty}
        isSaving={isSaving}
        onSave={handleSaveProduct}
        onDiscard={() => {
          if (confirm('¿Descartar todos los cambios realizados en este producto?')) {
            onBack();
          }
        }}
        message="Tienes cambios sin guardar en este producto"
        saveLabel="Guardar producto"
      />

      {/* Modal de Recorte Cuadrado 1:1 */}
      {cropModalSrc && (
        <PhotoCropModal
          isOpen={Boolean(cropModalSrc)}
          imageSrc={cropModalSrc}
          sku={sku}
          onClose={() => {
            setCropModalSrc(null);
            setCropTargetIdx(null);
          }}
          onCropComplete={(croppedUrl) => {
            if (cropTargetIdx !== null) {
              setImagenes((prev) => {
                const next = [...prev];
                next[cropTargetIdx] = { ...next[cropTargetIdx], url: croppedUrl };
                return next;
              });
              showToast('Recorte 1:1 aplicado correctamente');
            }
          }}
        />
      )}

      {/* Confirmación al salir con cambios */}
      <ConfirmDialog
        isOpen={confirmDiscardOpen}
        title="Cambios sin guardar"
        message="Tienes modificaciones en este producto que no se han guardado. ¿Estás seguro de salir y descartar los cambios?"
        confirmText="Descartar y Salir"
        cancelText="Continuar editando"
        isDestructive={true}
        onConfirm={() => {
          setConfirmDiscardOpen(false);
          setIsDirty(false);
          onBack();
        }}
        onCancel={() => setConfirmDiscardOpen(false)}
      />

      {/* Modal Rápido: Nueva Marca */}
      {newBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
            onClick={() => setNewBrandModalOpen(false)} 
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-zinc-200 z-10 space-y-4">
            <h3 className="font-heading font-bold text-16 uppercase text-zinc-900">
              Registrar Nueva Marca
            </h3>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Ej. Nolan, Arai, Shiro..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-13 focus:outline-none focus:border-[#F58220]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewBrandModalOpen(false)}
                className="px-3.5 py-1.5 text-12 font-medium text-zinc-600 bg-zinc-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newBrandName.trim()) {
                    const id = newBrandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    brands.push({ id, nombre: newBrandName.trim() });
                    setMarcaId(id);
                    setNewBrandModalOpen(false);
                    setNewBrandName('');
                    showToast(`Marca "${newBrandName}" agregada`);
                  }
                }}
                className="px-4 py-1.5 text-12 font-heading font-bold uppercase bg-[#F58220] hover:bg-[#E07216] text-[#111111] rounded-lg"
              >
                Crear Marca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
