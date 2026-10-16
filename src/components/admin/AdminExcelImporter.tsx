'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileCheck, 
  RefreshCw 
} from 'lucide-react';
import { saveProduct } from '@/lib/services/admin-service';
import { formatPEN } from '@/utils/currency';

interface AdminExcelImporterProps {
  existingProducts: any[];
  categories: any[];
  brands: any[];
  onImportSuccess: () => void;
}

export function AdminExcelImporter({
  existingProducts,
  categories,
  brands,
  onImportSuccess,
}: AdminExcelImporterProps) {
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

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
      'SH-PRO-ESP01,Casco Shaft Pro Carbono,cascos,shaft,499.00,449.00,14,online,Casco integral de alta gama,ECE 22.06',
      'ALP-SMX1-V2,Guantes Alpinestars SMX-1,guantes,alpinstar,219.00,,18,online,Guantes urbanos de cuero y malla,CE Nivel 1',
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sampleRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'plantilla_iori_catalogo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Exportar Catálogo Actual a CSV
  const handleExportCatalog = () => {
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

    const rows = existingProducts.map((p) => {
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
        escape(p.descripcion_corta),
        escape(p.certificacion),
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
  };

  // 3. Procesar archivo CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrors([]);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setErrors(['El archivo no contiene filas de datos o está vacío.']);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const rows: any[] = [];
    const errList: string[] = [];

    const existingMap = new Map(existingProducts.map((p) => [p.sku?.toUpperCase(), p]));

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i];
      // Expresión regular para separar por comas respetando comillas
      const values = currentLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || currentLine.split(',');

      const rowObj: any = {};
      headers.forEach((h, idx) => {
        let val = values[idx] || '';
        val = val.trim().replace(/^"|"$/g, '');
        rowObj[h] = val;
      });

      const rowNum = i + 1;
      if (!rowObj.sku) {
        errList.push(`Fila ${rowNum}: El campo SKU es obligatorio.`);
        continue;
      }

      const skuUpper = rowObj.sku.toUpperCase();
      const existing = existingMap.get(skuUpper);

      const precioNum = parseFloat(rowObj.precio);
      if (isNaN(precioNum) || precioNum <= 0) {
        errList.push(`Fila ${rowNum} (${rowObj.sku}): Precio inválido "${rowObj.precio}".`);
      }

      const stockNum = parseInt(rowObj.stock, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        errList.push(`Fila ${rowNum} (${rowObj.sku}): Stock inválido "${rowObj.stock}".`);
      }

      rows.push({
        ...rowObj,
        precio: precioNum,
        precio_oferta: rowObj.precio_oferta ? parseFloat(rowObj.precio_oferta) : null,
        stock: isNaN(stockNum) ? 0 : stockNum,
        existing,
        isUpdate: Boolean(existing),
      });
    }

    setErrors(errList);
    setParsedRows(rows);
  };

  // 4. Confirmar e Importar
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);

    try {
      let count = 0;
      for (const row of parsedRows) {
        const cat = categories.find((c) => c.slug === row.categoria_slug) || categories[0];
        const marca = brands.find((m) => m.id === row.marca_id) || brands[0];

        await saveProduct({
          id: row.existing?.id,
          sku: row.sku,
          nombre: row.nombre || row.existing?.nombre || 'Producto sin nombre',
          slug: row.existing?.slug || row.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          categoria_slug: cat.slug,
          categoria_nombre: cat.nombre,
          marca_id: marca.id,
          marca_nombre: marca.nombre,
          precio: row.precio,
          precio_oferta: row.precio_oferta,
          stock: row.stock,
          modo_venta: row.modo_venta === 'cotizar' ? 'cotizar' : 'online',
          descripcion_corta: row.descripcion_corta || row.existing?.descripcion_corta,
          certificacion: row.certificacion || row.existing?.certificacion,
          activo: true,
        });
        count++;
      }

      setSuccessCount(count);
      setParsedRows([]);
      setFileName(null);
      onImportSuccess();
    } catch (err: any) {
      alert('Error durante la importación: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Acciones Principales */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider">
              Importador y Exportador de Catálogo Excel / CSV
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Actualiza precios y stock masivamente por SKU con vista previa comparativa antes de aplicar cambios en Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition"
            >
              <Download className="w-4 h-4 text-[#f58220]" />
              Descargar Plantilla
            </button>

            <button
              type="button"
              onClick={handleExportCatalog}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Exportar Catálogo Actual
            </button>
          </div>
        </div>

        {/* Zona de Arrastre / Carga de Archivo */}
        <div className="border-2 border-dashed border-zinc-300 hover:border-[#f58220] rounded-2xl p-8 text-center bg-zinc-50/50 hover:bg-orange-50/20 transition-colors">
          <UploadCloud className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-700">
            {fileName ? `Archivo seleccionado: ${fileName}` : 'Selecciona o arrastra tu archivo CSV o Excel'}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Formato CSV con delimitador de comas (guardado desde Excel o Google Sheets)
          </p>

          <label className="mt-4 inline-block bg-white border border-zinc-300 hover:border-black text-zinc-800 text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl cursor-pointer shadow-sm transition">
            Examinar Archivo
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Notificación de Éxito */}
        {successCount !== null && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ¡Se importaron y actualizaron exitosamente {successCount} productos en Supabase!
          </div>
        )}

        {/* Errores de Validación */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-700">
              <AlertTriangle className="w-4 h-4" /> Errores detectados en el archivo:
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-zinc-700">
              {errors.slice(0, 5).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {errors.length > 5 && <li>... y {errors.length - 5} errores más. Corrige el archivo y vuelve a cargarlo.</li>}
            </ul>
          </div>
        )}

        {/* Vista Previa de Cambios */}
        {parsedRows.length > 0 && errors.length === 0 && (
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wide">
                  Vista Previa de Cambios ({parsedRows.length} productos detectados)
                </h3>
                <p className="text-xs text-zinc-500">
                  Revisa los valores que serán actualizados en la base de datos de Supabase.
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing}
                className="bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Confirmar e Importar Cambios</span>
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[10px] tracking-wider border-b">
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Nombre</th>
                    <th className="py-2.5 px-3">Precio Anterior</th>
                    <th className="py-2.5 px-3">Nuevo Precio</th>
                    <th className="py-2.5 px-3">Stock Ant.</th>
                    <th className="py-2.5 px-3">Nuevo Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {parsedRows.slice(0, 10).map((row, idx) => {
                    const priceChanged = row.existing && Number(row.existing.precio) !== Number(row.precio);
                    const stockChanged = row.existing && Number(row.existing.stock) !== Number(row.stock);

                    return (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            row.isUpdate ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {row.isUpdate ? 'Actualización' : 'Nuevo'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-zinc-800">{row.sku}</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-900">{row.nombre}</td>
                        <td className="py-2.5 px-3 text-zinc-500">
                          {row.existing ? formatPEN(row.existing.precio) : '—'}
                        </td>
                        <td className={`py-2.5 px-3 font-bold ${priceChanged ? 'text-[#f58220]' : 'text-zinc-900'}`}>
                          {formatPEN(row.precio)}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-500">
                          {row.existing ? row.existing.stock : '—'}
                        </td>
                        <td className={`py-2.5 px-3 font-black ${stockChanged ? 'text-emerald-600' : 'text-zinc-900'}`}>
                          {row.stock}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedRows.length > 10 && (
                <div className="p-2.5 bg-zinc-50 text-center text-zinc-500 text-[11px] font-medium border-t">
                  Mostrando 10 de {parsedRows.length} filas a procesar.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
