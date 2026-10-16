'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw 
} from 'lucide-react';
import { saveProduct } from '@/lib/services/admin-service';

interface ExcelModalProps {
  isOpen: boolean;
  existingProducts: any[];
  categories: any[];
  brands: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ExcelModal({
  isOpen,
  existingProducts,
  categories,
  brands,
  onClose,
  onSuccess,
}: ExcelModalProps) {
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // 1. Descargar Plantilla Oficial
  const handleDownloadTemplate = () => {
    const headers = [
      'sku',
      'nombre',
      'categoria_slug',
      'marca_id',
      'precio',
      'precio_oferta',
      'stock',
      'modo_venta',
      'descripcion_corta',
      'certificacion'
    ];
    
    const sampleRows = [
      'CAS-LS2-FF800-NM,Casco LS2 FF800 Storm negro mate,cascos,ls2,450.00,389.00,10,online,Casco integral con visor solar y pinlock incluido,ECE 22.06',
      'GUA-ALP-SMX1-BK,Guantes Alpinestars SMX-1 V2 negro,guantes,alpinestars,220.00,,15,online,Guantes cortos urbanos de cuero y malla,CE Nivel 1',
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...sampleRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'plantilla_iori_catalogo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Parsear CSV cargado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrors([]);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setErrors(['El archivo CSV debe contener una fila de encabezados y al menos un producto.']);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const required = ['sku', 'nombre', 'precio', 'stock'];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
      setErrors([`Faltan encabezados obligatorios: ${missing.join(', ')}`]);
      return;
    }

    const rows: any[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const rawCols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const cols = rawCols.map((c) => c.trim().replace(/^["']|["']$/g, ''));

      if (cols.length < headers.length) continue;

      const rowObj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = cols[idx] || '';
      });

      const precioNum = parseFloat(rowObj.precio);
      const stockNum = parseInt(rowObj.stock, 10);

      if (!rowObj.sku || !rowObj.nombre) {
        parseErrors.push(`Línea ${i + 1}: SKU y Nombre son obligatorios.`);
      } else if (isNaN(precioNum) || precioNum <= 0) {
        parseErrors.push(`Línea ${i + 1} (${rowObj.sku}): Precio inválido.`);
      } else if (isNaN(stockNum) || stockNum < 0) {
        parseErrors.push(`Línea ${i + 1} (${rowObj.sku}): Stock inválido.`);
      } else {
        rows.push({
          sku: rowObj.sku.toUpperCase(),
          nombre: rowObj.nombre,
          categoria_slug: rowObj.categoria_slug || 'accesorios',
          marca_id: rowObj.marca_id || '',
          precio: precioNum,
          precio_oferta: rowObj.precio_oferta ? parseFloat(rowObj.precio_oferta) : undefined,
          stock: stockNum,
          modo_venta: rowObj.modo_venta === 'cotizar' ? 'cotizar' : 'online',
          descripcion_corta: rowObj.descripcion_corta || '',
          certificacion: rowObj.certificacion || '',
        });
      }
    }

    if (parseErrors.length > 0) {
      setErrors(parseErrors.slice(0, 5));
    }
    setParsedRows(rows);
  };

  // 3. Ejecutar Importación
  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;

    setImporting(true);
    let count = 0;

    try {
      for (const row of parsedRows) {
        const existing = existingProducts.find((p) => p.sku?.toUpperCase() === row.sku.toUpperCase());
        const selectedCat = categories.find((c) => c.slug === row.categoria_slug) || categories[0];
        const selectedMarca = brands.find((m) => m.id === row.marca_id) || brands[0];

        await saveProduct({
          id: existing?.id,
          nombre: row.nombre,
          slug: existing?.slug || row.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          categoria_slug: selectedCat?.slug || 'cascos',
          categoria_nombre: selectedCat?.nombre || 'Cascos',
          marca_id: selectedMarca?.id || '',
          marca_nombre: selectedMarca?.nombre || '',
          precio: row.precio,
          precio_oferta: row.precio_oferta,
          stock: row.stock,
          modo_venta: row.modo_venta,
          descripcion_corta: row.descripcion_corta,
          sku: row.sku,
          certificacion: row.certificacion,
          activo: existing ? existing.activo : true,
        });

        count++;
      }

      setSuccessCount(count);
      onSuccess();
    } catch (err: any) {
      setErrors(['Error al sincronizar con la base de datos: ' + err.message]);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-zinc-200 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-16 uppercase text-zinc-900">
                Importar Productos desde Excel / CSV
              </h3>
              <p className="text-12 text-zinc-500">
                Actualiza precios y stock masivamente usando el código SKU.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paso 1: Descargar Plantilla */}
        <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3">
          <div>
            <h4 className="text-13 font-bold text-zinc-800">
              1. Descarga la plantilla oficial
            </h4>
            <p className="text-11 text-zinc-500">
              Contiene las columnas necesarias y productos de ejemplo.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg text-12 font-bold text-zinc-700 flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>
        </div>

        {/* Paso 2: Subir Archivo */}
        <div className="space-y-2">
          <label className="text-13 font-bold text-zinc-800 block">
            2. Carga tu archivo con los cambios
          </label>
          <div className="border-2 border-dashed border-zinc-300 hover:border-[#F58220] rounded-xl p-5 text-center transition-colors bg-zinc-50 hover:bg-orange-50/20">
            <UploadCloud className="w-7 h-7 text-zinc-400 mx-auto mb-1.5" />
            <label className="cursor-pointer block">
              <span className="text-13 font-bold text-[#F58220] hover:underline">
                {fileName || 'Elegir archivo CSV'}
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-11 text-zinc-400 mt-1">Formato CSV delimitado por comas</p>
          </div>
        </div>

        {/* Errores */}
        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-12 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Se encontraron problemas en el archivo:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-11">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Éxito */}
        {successCount !== null && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-12 flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡{successCount} producto(s) importados y actualizados con éxito!</span>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 text-13 font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            {successCount !== null ? 'Cerrar' : 'Cancelar'}
          </button>
          {successCount === null && (
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={importing || parsedRows.length === 0}
              className="px-5 py-2 text-13 font-heading font-bold uppercase tracking-wider text-[#111111] bg-[#F58220] hover:bg-[#E07216] rounded-lg transition-all shadow-md active:scale-98 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Importar {parsedRows.length > 0 ? `(${parsedRows.length})` : ''}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
