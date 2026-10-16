'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Crop, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  UploadCloud, 
  Check, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  Layers
} from 'lucide-react';
import { uploadImageToStorage, saveProduct } from '@/lib/services/admin-service';

interface AdminPhotoManagerProps {
  products: any[];
  onRefresh: () => void;
}

export function AdminPhotoManager({ products, onRefresh }: AdminPhotoManagerProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Recorte interactivo
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Carga masiva
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  // Subir imagen para recortar
  const handleSelectImageToCrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropImageSrc(url);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  // Manejar arrastre (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Guardar recorte en canvas y subir a Supabase Storage
  const handleSaveCrop = async () => {
    if (!cropImageSrc || !selectedProduct) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = cropImageSrc;
    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo blanco puro estándar de catálogo Iori
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 800);

    const scale = (800 / Math.min(img.width, img.height)) * zoom;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const drawX = (800 - drawWidth) / 2 + pan.x;
    const drawY = (800 - drawHeight) / 2 + pan.y;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const file = new File([blob], `${selectedProduct.sku}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const uploadedUrl = await uploadImageToStorage(file, 'productos');

        const currentImages = (selectedProduct.producto_imagenes || []).map((img: any) => ({
          url: img.url,
          orden: img.orden,
        }));

        currentImages.push({
          url: uploadedUrl,
          orden: currentImages.length + 1,
        });

        await saveProduct({
          ...selectedProduct,
          imagenes: currentImages,
        });

        setCropImageSrc(null);
        alert('¡Foto recortada 1:1 y vinculada con éxito!');
        onRefresh();
      } catch (err: any) {
        alert('Error al subir imagen recortada: ' + err.message);
      }
    }, 'image/jpeg', 0.92);
  };

  // Carga masiva por convención de nombre (ej. SH-PRO-001_1.jpg)
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setBulkFiles(files);
    setBulkStatus(`Subiendo y asociando ${files.length} archivos por SKU...`);

    let matched = 0;
    for (const file of files) {
      // Extracción del SKU antes del guión bajo o extensión
      const baseName = file.name.split('.')[0];
      const parts = baseName.split('_');
      const skuCandidate = parts[0].toUpperCase();

      const targetProduct = products.find((p) => p.sku?.toUpperCase() === skuCandidate);
      if (targetProduct) {
        try {
          const uploadedUrl = await uploadImageToStorage(file, 'productos');
          const currentImages = (targetProduct.producto_imagenes || []).map((img: any) => ({
            url: img.url,
            orden: img.orden,
          }));

          currentImages.push({
            url: uploadedUrl,
            orden: currentImages.length + 1,
          });

          await saveProduct({
            ...targetProduct,
            imagenes: currentImages,
          });
          matched++;
        } catch (err) {
          console.error(`Error asociando ${file.name}:`, err);
        }
      }
    }

    setBulkStatus(`¡Proceso completado! Se asociaron fotos a ${matched} productos.`);
    onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* 1. Selector de Producto y Vista de Galería */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div>
            <h2 className="text-xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider">
              Gestor de Fotografías de Producto (Recorte 1:1)
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Recorte interactivo 1:1 sobre fondo blanco con zoom y arrastre. Cumple con la regla de proporción de catálogo.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Galería actual del producto */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700">
                Imágenes Asignadas a {selectedProduct.nombre}
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {(selectedProduct.producto_imagenes?.length > 0 ? selectedProduct.producto_imagenes : []).map((img: any, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-2xl bg-zinc-50 border border-zinc-200 overflow-hidden group">
                    <Image
                      src={img.url}
                      alt={selectedProduct.nombre}
                      fill
                      className="object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón para cargar nueva imagen para recortar */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition shadow-md">
                  <Crop className="w-4 h-4" />
                  <span>Subir y Recortar Foto 1:1</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSelectImageToCrop}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Editor interactivo de recorte */}
            <div className="lg:col-span-6 bg-zinc-900 rounded-3xl p-6 text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-300">
                  Área de Recorte 1:1 Interactivo
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs"
                    title="Alejar"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-zinc-400">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs"
                    title="Acercar"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {cropImageSrc ? (
                <div className="space-y-4">
                  <div
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border-2 border-[#f58220]/60"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cropImageSrc}
                      alt="Para recortar"
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease',
                      }}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    />
                    <div className="absolute inset-0 pointer-events-none border border-black/10 grid grid-cols-3 grid-rows-3" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCropImageSrc(null)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCrop}
                      className="bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition"
                    >
                      Guardar y Aplicar Foto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-square border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-6 space-y-2">
                  <Move className="w-8 h-8 text-zinc-600 mb-1" />
                  <p className="font-semibold text-zinc-400">Ninguna foto en edición</p>
                  <p className="text-[11px] text-zinc-600">
                    Haz clic en &quot;Subir y Recortar Foto 1:1&quot; para cargar una imagen, hacerle zoom y centrarla.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Carga Masiva por Nombre de Archivo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-4">
        <h3 className="text-base font-black uppercase font-[family-name:var(--font-heading)] tracking-wider">
          Carga Masiva de Fotos por Código SKU
        </h3>
        <p className="text-xs text-zinc-500">
          Nombra tus archivos con el SKU del producto (ejemplo: <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">SH-PRO-ESP01_1.jpg</code>, <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">SH-PRO-ESP01_2.jpg</code>). El sistema las asociará automáticamente al producto correspondiente con recorte centrado.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <label className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Seleccionar Múltiples Fotos</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label>
        </div>

        {bulkStatus && (
          <div className="p-3 bg-zinc-100 text-zinc-800 text-xs font-bold rounded-xl">
            {bulkStatus}
          </div>
        )}
      </div>
    </div>
  );
}
