'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Check, X, Loader2 } from 'lucide-react';
import { uploadImageToStorage } from '@/lib/services/admin-service';

interface BannerCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio: '16/9' | '4/5' | '21/9';
  title?: string;
  onClose: () => void;
  onCropComplete: (croppedUrl: string) => void;
}

export function BannerCropModal({
  isOpen,
  imageSrc,
  aspectRatio,
  title = 'Recortar Imagen',
  onClose,
  onCropComplete,
}: BannerCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dimensiones del canvas según proporción oficial
  const targetWidth = aspectRatio === '16/9' ? 1280 : aspectRatio === '21/9' ? 1260 : 640;
  const targetHeight = aspectRatio === '16/9' ? 720 : aspectRatio === '21/9' ? 540 : 800;

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

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calcular escala cover
      const scaleW = targetWidth / img.width;
      const scaleH = targetHeight / img.height;
      const baseScale = Math.max(scaleW, scaleH);
      const scale = baseScale * zoom;

      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const drawX = (targetWidth - drawWidth) / 2 + pan.x;
      const drawY = (targetHeight - drawHeight) / 2 + pan.y;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };
  }, [isOpen, imageSrc, zoom, pan, targetWidth, targetHeight]);

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
          const fileName = `banner_${aspectRatio.replace('/', '-')}_${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          const uploadedUrl = await uploadImageToStorage(file, 'banners');
          onCropComplete(uploadedUrl);
          onClose();
        } catch (err: any) {
          console.warn('Storage upload fallback to dataURL:', err);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          onCropComplete(dataUrl);
          onClose();
        } finally {
          setSaving(false);
        }
      }, 'image/jpeg', 0.92);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="font-heading font-black text-base uppercase tracking-wider text-zinc-900">
              {title}
            </h3>
            <p className="text-xs text-zinc-500">
              Proporción exacta: <span className="font-mono font-bold text-[#f58220]">{aspectRatio}</span>. Arrastra para encuadrar y ajusta el zoom.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lienzo Interactivo */}
        <div className="flex justify-center bg-zinc-950 p-4 rounded-2xl overflow-hidden border border-zinc-800">
          <div
            className={`relative overflow-hidden rounded-xl border border-zinc-700 cursor-move ${
              aspectRatio === '21/9' ? 'w-full max-w-3xl aspect-[21/9]' : 'w-64 sm:w-72 aspect-[4/5]'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              width={targetWidth}
              height={targetHeight}
              className="w-full h-full object-contain pointer-events-none"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-xs text-[10px] font-mono text-zinc-300 rounded flex items-center gap-1">
              <Move className="w-3 h-3 text-brand" />
              <span>Arrastra para mover</span>
            </div>
          </div>
        </div>

        {/* Controles de Zoom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
              className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-700 transition"
              title="Reducir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-40 sm:w-56 accent-[#f58220] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
              className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-700 transition"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-zinc-500 w-12">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
            >
              Restablecer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-[#f58220] hover:bg-[#d96b0e] text-black font-heading font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Aplicar Recorte</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
