'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Plus, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  MoreVertical, 
  Edit3, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Layers, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { DataTable, Column, BulkAction } from '../ui/DataTable';
import { AdminProductForm } from './AdminProductForm';
import { ExcelModal } from './ExcelModal';
import { BulkPhotoModal } from './BulkPhotoModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import { updateProductQuick, deleteProduct, saveProduct } from '@/lib/services/admin-service';
import { formatPEN } from '@/utils/currency';

import { useRouter } from 'next/navigation';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

interface AdminProductsViewProps {
  products: any[];
  categories: any[];
  brands: any[];
  onRefresh: () => void;
  initialMode?: 'list' | 'create' | 'edit';
  initialProductId?: string;
}

export function AdminProductsView({
  products,
  categories,
  brands,
  onRefresh,
  initialMode = 'list',
  initialProductId,
}: AdminProductsViewProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Modos de vista: 'list' o 'form'
  const [viewMode, setViewMode] = useState<'list' | 'form'>(
    initialMode === 'create' || initialMode === 'edit' ? 'form' : 'list'
  );
  const [editingProduct, setEditingProduct] = useState<any | null>(() => {
    if (initialMode === 'edit' && initialProductId) {
      return products.find((p) => p.id === initialProductId) || null;
    }
    return null;
  });

  // Sincronizar si cambia initialProductId o se cargan los productos
  React.useEffect(() => {
    if (initialMode === 'edit' && initialProductId && products.length > 0) {
      const found = products.find((p) => p.id === initialProductId);
      if (found) {
        setEditingProduct(found);
        setViewMode('form');
      }
    } else if (initialMode === 'create') {
      setEditingProduct(null);
      setViewMode('form');
    } else if (initialMode === 'list') {
      setViewMode('list');
      setEditingProduct(null);
    }
  }, [initialMode, initialProductId, products]);

  // Modales adicionales
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [bulkPhotoModalOpen, setBulkPhotoModalOpen] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; nombre: string } | null>(null);

  // Popover de stock de variantes en línea
  const [variantPopoverProd, setVariantPopoverProd] = useState<any | null>(null);

  // Edición rápida inline en la tabla: { [id]: { precio, stock } }
  const [inlineEdits, setInlineEdits] = useState<Record<string, { precio?: number; stock?: number }>>({});
  const [savingInlineId, setSavingInlineId] = useState<string | null>(null);

  // Filtros
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // 1. Manejo de duplicación de producto
  const handleDuplicate = (prod: any) => {
    const duplicated: any = {
      ...prod,
      id: undefined, // nuevo id al guardar
      nombre: `[Copia] ${prod.nombre}`,
      sku: `${prod.sku}-CP`,
      slug: `${prod.slug}-copia-${Date.now().toString().slice(-4)}`,
      activo: false, // duplicado inicia como borrador
      created_at: undefined,
      updated_at: undefined,
    };

    if (prod.producto_variantes) {
      duplicated.producto_variantes = prod.producto_variantes.map((v: any) => ({
        ...v,
        id: undefined,
        sku: `${v.sku}-CP`,
      }));
    }

    setEditingProduct(duplicated);
    setViewMode('form');
    showToast(`Borrador duplicado de "${prod.nombre}" listo para revisar.`);
  };

  // 2. Guardado rápido inline de precio y stock
  const handleSaveInline = async (prod: any) => {
    const edit = inlineEdits[prod.id];
    if (!edit) return;

    setSavingInlineId(prod.id);
    try {
      await updateProductQuick(prod.id, {
        precio: edit.precio !== undefined ? edit.precio : prod.precio,
        stock: edit.stock !== undefined ? edit.stock : prod.stock,
      });

      // Limpiar estado de edición para esta fila
      setInlineEdits((prev) => {
        const next = { ...prev };
        delete next[prod.id];
        return next;
      });

      showToast(`Producto ${prod.sku} actualizado`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Error al actualizar: ' + err.message, 'error');
    } finally {
      setSavingInlineId(null);
    }
  };

  // 3. Toggle de visibilidad (Publicado / Borrador)
  const handleToggleActive = async (prod: any) => {
    try {
      await updateProductQuick(prod.id, { activo: !prod.activo });
      showToast(`Producto ${!prod.activo ? 'publicado' : 'cambiado a borrador'}`);
      onRefresh();
    } catch (err: any) {
      showToast('Error al cambiar visibilidad: ' + err.message, 'error');
    }
  };

  // 4. Eliminación de producto
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    try {
      await deleteProduct(deleteConfirmTarget.id);
      showToast(`Producto "${deleteConfirmTarget.nombre}" eliminado`);
      setDeleteConfirmTarget(null);
      onRefresh();
    } catch (err: any) {
      showToast('Error al eliminar: ' + err.message, 'error');
    }
  };

  // 5. Exportar CSV
  const handleExportCSV = () => {
    const headers = [
      'sku',
      'nombre',
      'categoria_slug',
      'marca_id',
      'precio',
      'precio_oferta',
      'stock',
      'modo_venta',
      'activo'
    ];

    const rows = products.map((p) => {
      const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
      return [
        escape(p.sku),
        escape(p.nombre),
        escape(p.categoria_slug),
        escape(p.marca_id),
        p.precio,
        p.precio_oferta || '',
        p.stock,
        escape(p.modo_venta),
        p.activo ? 'si' : 'no'
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `catalogo_iori_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Catálogo exportado en archivo CSV');
  };

  // 6. Filtrado de datos para la tabla
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter && p.categoria_slug !== categoryFilter) return false;
      if (brandFilter && p.marca_id !== brandFilter) return false;
      if (statusFilter === 'publicado' && !p.activo) return false;
      if (statusFilter === 'borrador' && p.activo) return false;

      if (stockFilter === 'agotado' && (p.stock || 0) > 0) return false;
      if (stockFilter === 'bajo' && ((p.stock || 0) <= 0 || (p.stock || 0) > 3)) return false;
      if (stockFilter === 'disponible' && (p.stock || 0) <= 0) return false;

      return true;
    });
  }, [products, categoryFilter, brandFilter, statusFilter, stockFilter]);

  // 7. Acciones masivas
  const bulkActions: BulkAction<any>[] = [
    {
      label: 'Publicar',
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: async (selected) => {
        try {
          for (const item of selected) {
            await updateProductQuick(item.id, { activo: true });
          }
          showToast(`${selected.length} producto(s) publicados`);
          onRefresh();
        } catch (e: any) {
          showToast('Error en acción masiva: ' + e.message, 'error');
        }
      },
    },
    {
      label: 'Ocultar (Borrador)',
      icon: <EyeOff className="w-3.5 h-3.5" />,
      onClick: async (selected) => {
        try {
          for (const item of selected) {
            await updateProductQuick(item.id, { activo: false });
          }
          showToast(`${selected.length} producto(s) ocultados`);
          onRefresh();
        } catch (e: any) {
          showToast('Error en acción masiva: ' + e.message, 'error');
        }
      },
    },
    {
      label: 'Eliminar seleccionados',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      isDestructive: true,
      onClick: async (selected) => {
        if (confirm(`¿Estás seguro de eliminar permanentemente ${selected.length} productos?`)) {
          try {
            for (const item of selected) {
              await deleteProduct(item.id);
            }
            showToast(`${selected.length} producto(s) eliminados`);
            onRefresh();
          } catch (e: any) {
            showToast('Error al eliminar masivo: ' + e.message, 'error');
          }
        }
      },
    },
  ];

  // 8. Definición de columnas de la tabla según la regla
  const columns: Column<any>[] = [
    {
      header: 'Foto',
      cell: (row) => {
        const coverImg =
          row.producto_imagenes?.[0]?.url ||
          (Array.isArray(row.imagenes) ? row.imagenes[0] : null) ||
          '/brand/iori-logo.png';

        return (
          <div className="w-11 h-11 rounded-lg border border-zinc-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            <Image
              src={coverImg}
              alt={row.nombre}
              width={40}
              height={40}
              className="object-contain max-h-full"
            />
          </div>
        );
      },
    },
    {
      header: 'Producto',
      accessorKey: 'nombre',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              setEditingProduct(row);
              setViewMode('form');
            }}
            className="font-bold text-zinc-900 hover:text-[#F58220] transition-colors text-left block line-clamp-1 cursor-pointer"
          >
            {row.nombre}
          </button>
          <div className="flex items-center gap-2 text-11 text-zinc-500 font-medium">
            <span>{row.marca_nombre || row.marca_id}</span>
            <span>•</span>
            <span>{row.categoria_nombre || row.categoria_slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'SKU',
      accessorKey: 'sku',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-11 font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
          {row.sku}
        </span>
      ),
    },
    {
      header: 'Precio (S/)',
      accessorKey: 'precio',
      sortable: true,
      cell: (row) => {
        const isEditingInline = inlineEdits[row.id]?.precio !== undefined;
        const currentVal = isEditingInline ? inlineEdits[row.id].precio : row.precio;

        return (
          <div className="flex items-center gap-1.5">
            <span className="text-11 text-zinc-400 font-bold">S/</span>
            <input
              type="number"
              step="0.10"
              value={currentVal || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setInlineEdits((prev) => ({
                  ...prev,
                  [row.id]: { ...(prev[row.id] || {}), precio: isNaN(val) ? 0 : val },
                }));
              }}
              className="w-20 px-2 py-1 bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-[#F58220] rounded font-bold text-12 text-zinc-900 text-right transition"
            />
          </div>
        );
      },
    },
    {
      header: 'Stock',
      accessorKey: 'stock',
      sortable: true,
      cell: (row) => {
        const hasVariants = row.producto_variantes && row.producto_variantes.length > 0;
        const isEditingInline = inlineEdits[row.id]?.stock !== undefined;
        const currentStock = isEditingInline ? inlineEdits[row.id].stock : row.stock;

        return (
          <div className="relative flex items-center gap-2">
            {!hasVariants ? (
              <input
                type="number"
                min="0"
                value={currentStock ?? ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setInlineEdits((prev) => ({
                    ...prev,
                    [row.id]: { ...(prev[row.id] || {}), stock: isNaN(val) ? 0 : val },
                  }));
                }}
                className={`w-16 px-2 py-1 bg-zinc-50 hover:bg-white focus:bg-white border rounded font-bold text-12 text-right transition ${
                  (currentStock || 0) <= 0
                    ? 'border-red-300 text-red-600 bg-red-50/30'
                    : (currentStock || 0) <= 3
                    ? 'border-amber-300 text-amber-700 bg-amber-50/30'
                    : 'border-zinc-200 text-zinc-900'
                }`}
              />
            ) : (
              <button
                type="button"
                onClick={() => setVariantPopoverProd(variantPopoverProd?.id === row.id ? null : row)}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md text-11 font-bold flex items-center gap-1.5 transition cursor-pointer border border-zinc-200"
                title="Ver stock por variante"
              >
                <Layers className="w-3 h-3 text-[#F58220]" />
                <span>{row.stock} ({row.producto_variantes.length} var)</span>
              </button>
            )}

            {/* Popover de Variantes */}
            {variantPopoverProd?.id === row.id && (
              <div className="absolute top-full left-0 mt-2 z-30 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 w-64 text-11 space-y-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 font-bold text-zinc-800">
                  <span>Stock por Variante</span>
                  <button
                    type="button"
                    onClick={() => setVariantPopoverProd(null)}
                    className="text-zinc-400 hover:text-black"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-zinc-50">
                  {row.producto_variantes.map((v: any, vIdx: number) => (
                    <div key={vIdx} className="flex items-center justify-between pt-1">
                      <span className="font-medium text-zinc-700">
                        {v.talla} / {v.color}
                      </span>
                      <span className="font-mono font-bold bg-zinc-100 px-2 py-0.5 rounded text-zinc-900">
                        {v.stock} un.
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-1 border-t border-zinc-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setVariantPopoverProd(null);
                      setEditingProduct(row);
                      setViewMode('form');
                    }}
                    className="text-[11px] font-bold text-[#F58220] hover:underline cursor-pointer"
                  >
                    Editar variantes en formulario →
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Estado',
      accessorKey: 'activo',
      sortable: true,
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleToggleActive(row)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-11 font-bold transition-all cursor-pointer ${
            row.activo
              ? 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
          title="Click para cambiar estado"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.activo ? 'bg-emerald-500' : 'bg-zinc-400'
            }`}
          />
          <span>{row.activo ? 'Publicado' : 'Borrador'}</span>
        </button>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      cell: (row) => {
        const hasPendingSave = inlineEdits[row.id] !== undefined;
        const isSaving = savingInlineId === row.id;

        return (
          <div className="flex items-center justify-end gap-1.5">
            {hasPendingSave && (
              <button
                type="button"
                onClick={() => handleSaveInline(row)}
                disabled={isSaving}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold uppercase transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                title="Guardar cambios de precio/stock"
              >
                {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                <span>Guardar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setEditingProduct(row);
                setViewMode('form');
              }}
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-black transition cursor-pointer"
              title="Editar producto completo"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleDuplicate(row)}
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-black transition cursor-pointer"
              title="Duplicar producto"
            >
              <Copy className="w-4 h-4" />
            </button>

            <Link
              href={`/producto/${row.slug}`}
              target="_blank"
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-black transition"
              title="Ver en la tienda web"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => setDeleteConfirmTarget({ id: row.id, nombre: row.nombre })}
              className="p-1.5 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-600 transition cursor-pointer"
              title="Eliminar producto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  // Si estamos en modo formulario, renderizamos la pantalla única de edición/creación
  if (viewMode === 'form') {
    return (
      <AdminProductForm
        initialProduct={editingProduct}
        categories={categories}
        brands={brands}
        onBack={() => {
          setViewMode('list');
          setEditingProduct(null);
          router.push(ADMIN_ROUTES.PRODUCTOS);
        }}
        onSaved={() => {
          setViewMode('list');
          setEditingProduct(null);
          onRefresh();
          router.push(ADMIN_ROUTES.PRODUCTOS);
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Encabezado Superior con Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-22 sm:text-26 uppercase tracking-wider text-zinc-900">
            Productos y Catálogo
          </h1>
          <p className="text-12 text-zinc-500 font-medium">
            {products.length} productos registrados • Precios, variantes y stock sincronizados.
          </p>
        </div>

        {/* Botones de acción según la regla: Nuevo, Importar Excel, Exportar, Subir fotos por SKU */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setBulkPhotoModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-12 font-bold rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Carga masiva de fotos por SKU"
          >
            <UploadCloud className="w-3.5 h-3.5 text-zinc-500" />
            <span>Subir fotos por SKU</span>
          </button>

          <button
            type="button"
            onClick={() => setExcelModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-12 font-bold rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Actualización masiva de precios y stock con Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Importar Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-12 font-bold rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Descargar lista completa en CSV"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Exportar</span>
          </button>

          <Link
            href={ADMIN_ROUTES.PRODUCTO_NUEVO}
            className="px-4 py-2 bg-[#F58220] hover:bg-[#E07216] text-[#111111] font-heading font-bold text-13 uppercase rounded-lg transition-all shadow-sm active:scale-98 flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Link>
        </div>
      </div>

      {/* Tabla DataTable Reutilizable */}
      <DataTable
        data={filteredProducts}
        columns={columns}
        keyField="id"
        searchPlaceholder="Buscar por nombre o código SKU..."
        bulkActions={bulkActions}
        pageSize={12}
        filters={[
          {
            key: 'categoria',
            label: 'Categoría',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categories.map((c) => ({ label: c.nombre, value: c.slug })),
          },
          {
            key: 'marca',
            label: 'Marca',
            value: brandFilter,
            onChange: setBrandFilter,
            options: brands.map((m) => ({ label: m.nombre, value: m.id })),
          },
          {
            key: 'estado',
            label: 'Estado',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Publicados', value: 'publicado' },
              { label: 'Borradores', value: 'borrador' },
            ],
          },
          {
            key: 'stock',
            label: 'Stock',
            value: stockFilter,
            onChange: setStockFilter,
            options: [
              { label: 'En stock disponible', value: 'disponible' },
              { label: 'Stock bajo (1 a 3)', value: 'bajo' },
              { label: 'Agotados (0)', value: 'agotado' },
            ],
          },
        ]}
        emptyState={{
          title: 'No se encontraron productos',
          description: 'No hay productos que coincidan con la búsqueda o filtros aplicados.',
          actionLabel: 'Crear nuevo producto',
          onAction: () => {
            setEditingProduct(null);
            setViewMode('form');
          },
        }}
      />

      {/* Modal: Importar Excel */}
      <ExcelModal
        isOpen={excelModalOpen}
        existingProducts={products}
        categories={categories}
        brands={brands}
        onClose={() => setExcelModalOpen(false)}
        onSuccess={() => {
          setExcelModalOpen(false);
          onRefresh();
        }}
      />

      {/* Modal: Subir fotos por SKU */}
      <BulkPhotoModal
        isOpen={bulkPhotoModalOpen}
        products={products}
        onClose={() => setBulkPhotoModalOpen(false)}
        onSuccess={() => {
          setBulkPhotoModalOpen(false);
          onRefresh();
        }}
      />

      {/* Confirmación para Eliminar */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmTarget)}
        title="¿Eliminar producto definitivamente?"
        message={`Estás a punto de borrar "${deleteConfirmTarget?.nombre}". Esta acción eliminará el producto y sus fotos asociadas de la base de datos.`}
        confirmText="Sí, eliminar producto"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
}
