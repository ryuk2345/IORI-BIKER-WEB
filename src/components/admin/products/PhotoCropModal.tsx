'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Check, X, RefreshCw } from 'lucide-react';
import { uploadImageToStorage } from '@/lib/services/admin-service';

interface PhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  sku?: string;
  onClose: () => void;
  onCropComplete: (croppedUrl: string) => void;
}

export function PhotoCropModal({
  isOpen,
  imageSrc,
  sku = 'PRODUCTO',
  onClose,
  onCropComplete,
}: PhotoCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redibujar en tiempo real
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Limpiar con blanco puro
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 800, 800);

      // Calcular proporción cuadrada
      const baseScale = 800 / Math.min(img.width, img.height);
      const scale = baseScale * zoom;
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const drawX = (800 - drawWidth) / 2 + pan.x;
      const drawY = (800 - drawHeight) / 2 + pan.y;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };
  }, [isOpen, imageSrc, zoom, pan]);

  if (!isOpen) return null;

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

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSaving(false);
          return;
        }

        try {
          const fileName = `${sku.replace(/[^a-zA-Z0-9_-]/g, '')}_${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          const uploadedUrl = await uploadImageToStorage(file, 'productos');
          onCropComplete(uploadedUrl);
          onClose();
        } catch (err: any) {
          console.warn('Storage upload fallback:', err);
          // Fallback seguro a dataURL si el storage no está conectado en pruebas
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          onCropComplete(dataUrl);
          onClose();
        } finally {
          setSaving(false);
        }
      }, 'image/jpeg', 0.92);
    } catch (e: any) {
      alert('Error al procesar el recorte: ' + e.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-zinc-200 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="font-heading font-bold text-16 uppercase text-zinc-900">
              Recorte Cuadrado 1:1 Oficial
            </h3>
            <p className="text-12 text-zinc-500">
              Arrastra para centrar el producto y usa el zoom para encuadrar.
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

        {/* Zona de Lienzo Interactivo 1:1 */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative w-72 h-72 sm:w-80 sm:h-80 border-2 border-dashed border-[#F58220] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-100 shadow-inner select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={800}
              className="w-full h-full object-cover"
            />
            {/* Guías de encuadre en cruz tenue */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-black/10">
              <div className="border-r border-b border-black/5" />
              <div className="border-r border-b border-black/5" />
              <div className="border-b border-black/5" />
              <div className="border-r border-b border-black/5" />
              <div className="border-r border-b border-black/5" />
              <div className="border-b border-black/5" />
              <div className="border-r border-black/5" />
              <div className="border-r border-black/5" />
              <div />
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
              <Move className="w-3 h-3" /> Arrastra para mover
            </div>
          </div>

          {/* Control de Zoom */}
          <div className="w-full max-w-sm flex items-center gap-3 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition cursor-pointer"
              title="Reducir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.6"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[#F58220] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition cursor-pointer"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-11 font-bold text-zinc-600 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-13 font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-13 font-heading font-bold uppercase tracking-wider text-[#111111] bg-[#F58220] hover:bg-[#E07216] rounded-lg transition-all shadow-md active:scale-98 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Aplicar Recorte 1:1</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
