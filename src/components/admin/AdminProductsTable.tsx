'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  Plus, 
  Save, 
  Trash2, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Edit3, 
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { formatPEN } from '@/utils/currency';
import { updateProductQuick, saveProduct, deleteProduct } from '@/lib/services/admin-service';

interface AdminProductsTableProps {
  products: any[];
  categories: any[];
  brands: any[];
  onRefresh: () => void;
}

export function AdminProductsTable({
  products,
  categories,
  brands,
  onRefresh,
}: AdminProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('');
  
  // Estado local para edición rápida inline: { [productId]: { precio, precio_oferta, stock } }
  const [quickEdits, setQuickEdits] = useState<Record<string, any>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  
  // Modal de producto completo
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Filtrado
  const filtered = products.filter((p) => {
    if (catFilter && p.categoria_slug !== catFilter) return false;
    if (marcaFilter && p.marca_id !== marcaFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (p.nombre || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  const handleQuickChange = (id: string, field: string, value: any) => {
    setQuickEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveQuick = async (product: any) => {
    const edit = quickEdits[product.id];
    if (!edit) return;

    setSavingId(product.id);
    try {
      const precioNum = edit.precio !== undefined ? Number(edit.precio) : Number(product.precio);
      const precioOfertaNum = edit.precio_oferta !== undefined 
        ? (edit.precio_oferta === '' || edit.precio_oferta === null ? null : Number(edit.precio_oferta))
        : (product.precio_oferta ? Number(product.precio_oferta) : null);
      const stockNum = edit.stock !== undefined ? parseInt(edit.stock, 10) : product.stock;

      await updateProductQuick(product.id, {
        precio: precioNum,
        precio_oferta: precioOfertaNum,
        stock: stockNum,
      });

      setSavedSuccessId(product.id);
      setTimeout(() => setSavedSuccessId(null), 2500);
      onRefresh();
    } catch (err: any) {
      alert('Error al guardar cambios: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      await updateProductQuick(product.id, { activo: !product.activo });
      onRefresh();
    } catch (err: any) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar permanentemente "${nombre}" de la base de datos de Supabase?`)) {
      try {
        await deleteProduct(id);
        onRefresh();
      } catch (err: any) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Acciones */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#f58220]"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 focus:outline-none"
          >
            <option value="">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.nombre}</option>
            ))}
          </select>

          <select
            value={marcaFilter}
            onChange={(e) => setMarcaFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 focus:outline-none"
          >
            <option value="">Todas las Marcas (14)</option>
            {brands.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition"
            title="Refrescar catálogo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Tabla de Productos con Edición Rápida */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900 text-white uppercase text-[10px] font-black tracking-wider border-b border-zinc-800">
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-3">SKU</th>
                <th className="py-3.5 px-3">Categoría / Marca</th>
                <th className="py-3.5 px-3 w-28">Precio (S/)</th>
                <th className="py-3.5 px-3 w-28">P. Oferta (S/)</th>
                <th className="py-3.5 px-3 w-24">Stock</th>
                <th className="py-3.5 px-3">Venta</th>
                <th className="py-3.5 px-3 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    No se encontraron productos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const edit = quickEdits[prod.id] || {};
                  const precioVal = edit.precio !== undefined ? edit.precio : prod.precio;
                  const ofertaVal = edit.precio_oferta !== undefined ? edit.precio_oferta : (prod.precio_oferta || '');
                  const stockVal = edit.stock !== undefined ? edit.stock : prod.stock;
                  const isModified = edit.precio !== undefined || edit.precio_oferta !== undefined || edit.stock !== undefined;
                  const isSaving = savingId === prod.id;
                  const isSaved = savedSuccessId === prod.id;

                  const imgSrc = prod.producto_imagenes?.[0]?.url || (prod.imagenes?.[0]) || '/images/products/prod_1.png';

                  return (
                    <tr key={prod.id} className="hover:bg-orange-50/30 transition-colors">
                      {/* Producto */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0">
                            <Image
                              src={imgSrc}
                              alt={prod.nombre}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-zinc-900 line-clamp-1 block">
                              {prod.nombre}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {prod.producto_variantes?.length > 0 
                                ? `${prod.producto_variantes.length} variantes (tallas/colores)`
                                : 'Sin variantes'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3 font-mono font-bold text-zinc-600 text-[11px]">
                        {prod.sku}
                      </td>

                      {/* Categoría / Marca */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-zinc-800 block text-[11px]">
                          {prod.categoria_nombre || prod.categoria_slug}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase font-black">
                          {prod.marca_nombre || prod.marca_id}
                        </span>
                      </td>

                      {/* Edición rápida: Precio */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step="0.10"
                          value={precioVal}
                          onChange={(e) => handleQuickChange(prod.id, 'precio', e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded font-bold text-zinc-900 text-xs focus:bg-white focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220]"
                        />
                      </td>

                      {/* Edición rápida: Precio Oferta */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step="0.10"
                          value={ofertaVal}
                          placeholder="Sin oferta"
                          onChange={(e) => handleQuickChange(prod.id, 'precio_oferta', e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded font-bold text-red-600 text-xs focus:bg-white focus:border-red-500 placeholder:text-zinc-300"
                        />
                      </td>

                      {/* Edición rápida: Stock */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={stockVal}
                          onChange={(e) => handleQuickChange(prod.id, 'stock', e.target.value)}
                          className={`w-full px-2 py-1 bg-zinc-50 border rounded font-black text-xs text-center focus:bg-white ${
                            stockVal <= 3 ? 'border-red-300 text-red-700 bg-red-50' : 'border-zinc-200 text-zinc-900'
                          }`}
                        />
                      </td>

                      {/* Modo Venta */}
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          prod.modo_venta === 'online' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {prod.modo_venta === 'online' ? 'Online' : 'Cotizar'}
                        </span>
                      </td>

                      {/* Activo / Inactivo */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(prod)}
                          className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                            prod.activo ? 'bg-[#f58220]' : 'bg-zinc-300'
                          }`}
                          title={prod.activo ? 'Producto visible en tienda' : 'Producto oculto'}
                        >
                          <span className={`block w-3 h-3 bg-white rounded-full transition-transform ${
                            prod.activo ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleSaveQuick(prod)}
                              disabled={isSaving}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm transition active:scale-95"
                              title="Guardar precio y stock"
                            >
                              {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                              <span>Guardar</span>
                            </button>
                          )}

                          {isSaved && (
                            <span className="text-emerald-600 flex items-center text-[10px] font-bold">
                              <Check className="w-3.5 h-3.5 mr-0.5" /> ¡Guardado!
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(prod);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-black transition"
                            title="Editar detalles y variantes"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(prod.id, prod.nombre)}
                            className="p-1.5 rounded hover:bg-red-50 text-zinc-400 hover:text-red-600 transition"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          brands={brands}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

/** Componente Modal de Edición Completa de Producto */
function ProductModal({
  product,
  categories,
  brands,
  onClose,
  onSaved,
}: {
  product: any | null;
  categories: any[];
  brands: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(product?.nombre || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [categoriaSlug, setCategoriaSlug] = useState(product?.categoria_slug || categories[0]?.slug || '');
  const [marcaId, setMarcaId] = useState(product?.marca_id || brands[0]?.id || '');
  const [precio, setPrecio] = useState(product?.precio || '');
  const [precioOferta, setPrecioOferta] = useState(product?.precio_oferta || '');
  const [stock, setStock] = useState(product?.stock || 0);
  const [modoVenta, setModoVenta] = useState<'online' | 'cotizar'>(product?.modo_venta || 'online');
  const [descripcionCorta, setDescripcionCorta] = useState(product?.descripcion_corta || '');
  const [descripcionLarga, setDescripcionLarga] = useState(product?.descripcion_larga || '');
  const [certificacion, setCertificacion] = useState(product?.certificacion || '');
  const [financiamiento, setFinanciamiento] = useState(Boolean(product?.financiamiento_disponible));
  
  // Variantes
  const [variantes, setVariantes] = useState<any[]>(product?.producto_variantes || []);
  const [saving, setSaving] = useState(false);

  const handleAddVariant = () => {
    setVariantes((prev) => [
      ...prev,
      { talla: 'M', color: 'Negro', color_hex: '#000000', stock: 5 },
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedCat = categories.find((c) => c.slug === categoriaSlug);
      const selectedMarca = brands.find((m) => m.id === marcaId);

      const slug = product?.slug || nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      await saveProduct({
        id: product?.id,
        nombre,
        slug,
        categoria_slug: categoriaSlug,
        categoria_nombre: selectedCat?.nombre || categoriaSlug,
        marca_id: marcaId,
        marca_nombre: selectedMarca?.nombre || marcaId,
        precio: Number(precio),
        precio_oferta: precioOferta ? Number(precioOferta) : undefined,
        stock: Number(stock),
        modo_venta: modoVenta,
        descripcion_corta: descripcionCorta,
        descripcion_larga: descripcionLarga,
        sku,
        certificacion,
        financiamiento_disponible: financiamiento,
        variantes,
      });

      onSaved();
    } catch (err: any) {
      alert('Error guardando producto: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider">
              {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
            <p className="text-xs text-zinc-500">
              Configura detalles, precios y stock sincronizados con Supabase.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-black">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-zinc-700 block mb-1">Nombre Comercial del Producto *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="Ej. Casco Shaft Pro Carbono"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">SKU Único *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                placeholder="SH-PRO-001"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Modo de Venta *</label>
              <select
                value={modoVenta}
                onChange={(e: any) => setModoVenta(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold"
              >
                <option value="online">Venta Online Directa (Carrito)</option>
                <option value="cotizar">Solo Cotizar por WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Categoría Oficial *</label>
              <select
                value={categoriaSlug}
                onChange={(e) => setCategoriaSlug(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Marca Oficial *</label>
              <select
                value={marcaId}
                onChange={(e) => setMarcaId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Precio Regular (S/) *</label>
              <input
                type="number"
                step="0.10"
                required
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Precio de Oferta (S/ - Opcional)</label>
              <input
                type="number"
                step="0.10"
                value={precioOferta}
                onChange={(e) => setPrecioOferta(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold text-red-600"
                placeholder="Dejar vacío si no aplica"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Stock Total *</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Certificación de Seguridad</label>
              <input
                type="text"
                value={certificacion}
                onChange={(e) => setCertificacion(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="ECE 22.06 / DOT"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-zinc-700 block mb-1">Descripción Breve</label>
              <textarea
                rows={2}
                value={descripcionCorta}
                onChange={(e) => setDescripcionCorta(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="fin"
                checked={financiamiento}
                onChange={(e) => setFinanciamiento(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="fin" className="font-bold text-zinc-700 cursor-pointer">
                Habilitar opción de Financiamiento Propio en cuotas para este producto
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-100 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white rounded-xl font-extrabold uppercase tracking-wider"
            >
              {saving ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
