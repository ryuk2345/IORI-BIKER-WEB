'use client';

import React from 'react';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';

interface StickySaveBarProps {
  isVisible: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  message?: string;
  saveLabel?: string;
}

export function StickySaveBar({
  isVisible,
  isSaving,
  onSave,
  onDiscard,
  message = 'Tienes cambios sin guardar en este producto',
  saveLabel = 'Guardar producto',
}: StickySaveBarProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9990] bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 text-white py-3.5 px-4 sm:px-8 pr-20 sm:pr-24 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-13 text-zinc-300 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F58220] animate-pulse shrink-0" />
          <span>{message}</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="flex-1 sm:flex-initial px-4 py-2 text-13 font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700 cursor-pointer disabled:opacity-50"
          >
            Descartar cambios
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 sm:flex-initial px-5 py-2 text-13 font-heading font-bold uppercase tracking-wider text-[#111111] bg-[#F58220] hover:bg-[#E07216] rounded-lg transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saveLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
