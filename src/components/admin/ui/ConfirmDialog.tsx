'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-zinc-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-full shrink-0 ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1.5 pt-0.5">
            <h3 className="font-heading font-bold text-16 text-zinc-900 leading-snug">
              {title}
            </h3>
            <p className="text-13 text-zinc-500 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-13 font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-13 font-bold rounded-lg transition shadow-sm cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#F58220] hover:bg-[#E07216] text-[#111111]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
