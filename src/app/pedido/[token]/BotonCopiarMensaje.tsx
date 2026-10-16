'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function BotonCopiarMensaje({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      // Fallback manual si clipboard API no está disponible
      const ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopiar}
      className="py-3 px-5 bg-zinc-800 hover:bg-zinc-700 text-white font-heading font-bold uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
    >
      {copiado ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" /> ¡Mensaje Copiado!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-zinc-400" /> Copiar Mensaje (Plan B)
        </>
      )}
    </button>
  );
}
