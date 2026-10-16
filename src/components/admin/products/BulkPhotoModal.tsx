'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, RefreshCw, FileImage } from 'lucide-react';
import { uploadImageToStorage, saveProduct } from '@/lib/services/admin-service';

interface BulkPhotoModalProps {
  isOpen: boolean;
  products: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkPhotoModal({
  isOpen,
  products,
  onClose,
  onSuccess,
}: BulkPhotoModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [report, setReport] = useState<{ matched: number; unmatched: string[] } | null>(null);

  if (!isOpen) return null;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setReport(null);
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus(`Procesando ${selectedFiles.length} imágenes...`);

    let matched = 0;
    const unmatched: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadStatus(`Subiendo imagen ${i + 1} de ${selectedFiles.length} (${file.name})...`);

        // SKU se extrae antes del primer guión bajo o punto (ej. FF800_1.jpg -> FF800)
        const baseName = file.name.split('.')[0];
        const skuPrefix = baseName.split('_')[0].trim().toUpperCase();

        const target = products.find((p) => (p.sku || '').toUpperCase() === skuPrefix);
        if (!target) {
          unmatched.push(file.name);
          continue;
        }

        try {
          const uploadedUrl = await uploadImageToStorage(file, 'productos');
          const currentImages = (target.producto_imagenes || []).map((img: any) => ({
            url: img.url,
            orden: img.orden,
          }));

          currentImages.push({
            url: uploadedUrl,
            orden: currentImages.length + 1,
          });

          await saveProduct({
            ...target,
            imagenes: currentImages,
          });
          matched++;
        } catch (err) {
          console.error(`Error asociando ${file.name}:`, err);
          unmatched.push(file.name);
        }
      }

      setReport({ matched, unmatched });
      onSuccess();
    } catch (err: any) {
      alert('Error durante la carga masiva: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
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
          <div>
            <h3 className="font-heading font-bold text-16 uppercase text-zinc-900">
              Subir Fotos Masivas por SKU
            </h3>
            <p className="text-12 text-zinc-500">
              Asocia fotos automáticamente según el código SKU del archivo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guía de nomenclatura */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-12 text-zinc-600 space-y-1">
          <p className="font-bold text-zinc-800">Regla de nombres de archivos:</p>
          <p>Nombra tus fotos con el SKU seguido de guión bajo y número:</p>
          <div className="font-mono text-11 bg-white p-2 rounded border border-zinc-200 text-zinc-800">
            CAS-LS2-01_1.jpg (portada)<br />
            CAS-LS2-01_2.jpg (segunda foto)
          </div>
        </div>

        {/* Selector de Archivos */}
        <div className="border-2 border-dashed border-zinc-300 hover:border-[#F58220] rounded-xl p-6 text-center transition-colors bg-zinc-50 hover:bg-orange-50/20">
          <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <label className="cursor-pointer block">
            <span className="text-13 font-bold text-[#F58220] hover:underline">
              Seleccionar imágenes
            </span>
            <span className="text-13 text-zinc-500"> o arrastra aquí</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFiles}
              className="hidden"
            />
          </label>
          <p className="text-11 text-zinc-400 mt-1">Formatos JPG, PNG o WebP</p>
        </div>

        {/* Resumen de archivos seleccionados */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-12 font-medium text-zinc-700">
              <span>{selectedFiles.length} archivo(s) listo(s) para procesar</span>
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="text-11 text-red-500 hover:underline cursor-pointer"
              >
                Limpiar lista
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto border border-zinc-200 rounded-lg p-2 bg-zinc-50 text-11 font-mono space-y-1 divide-y divide-zinc-100">
              {selectedFiles.slice(0, 15).map((f, i) => (
                <div key={i} className="flex items-center justify-between py-1 text-zinc-600">
                  <span className="truncate max-w-[280px]">{f.name}</span>
                  <span className="text-zinc-400">{(f.size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
              {selectedFiles.length > 15 && (
                <div className="text-center py-1 text-zinc-400 text-10 font-sans">
                  ... y {selectedFiles.length - 15} archivos más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estado / Reporte de Carga */}
        {uploadStatus && (
          <div className="p-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg text-12 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#F58220] shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {report && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-12 text-emerald-800 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{report.matched} foto(s) asociadas correctamente.</span>
            </div>
            {report.unmatched.length > 0 && (
              <p className="text-amber-800 text-11 pt-1">
                {report.unmatched.length} foto(s) no coincidieron con ningún SKU en la tienda.
              </p>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-13 font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            {report ? 'Cerrar' : 'Cancelar'}
          </button>
          {!report && (
            <button
              type="button"
              onClick={handleProcess}
              disabled={isUploading || selectedFiles.length === 0}
              className="px-5 py-2 text-13 font-heading font-bold uppercase tracking-wider text-[#111111] bg-[#F58220] hover:bg-[#E07216] rounded-lg transition-all shadow-md active:scale-98 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Iniciar Carga Masiva</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
