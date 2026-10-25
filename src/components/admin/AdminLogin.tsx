'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        throw new Error(error.message === 'Invalid login credentials' 
          ? 'Correo o contraseña incorrectos. Verifica tus credenciales.' 
          : error.message);
      }

      if (data?.user) {
        // Verificar si es staff en profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('rol, nombre')
          .eq('id', data.user.id)
          .maybeSingle();

        const rol =
          profile?.rol ||
          data.user.app_metadata?.rol ||
          data.user.app_metadata?.role;

        if (rol !== 'admin' && rol !== 'atencion') {
          await supabase.auth.signOut();
          throw new Error('Esta cuenta no tiene permisos de Administrador o Atención al Cliente.');
        }

        onLoginSuccess({ ...data.user, profile: { ...profile, rol } });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Logo y Encabezado */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Image
              src="/brand/iori-logo.png"
              alt="Iori Biker Shop"
              width={200}
              height={96}
              className="h-14 w-auto object-contain brightness-110"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[#f58220]/10 border border-[#f58220]/30 text-[#f58220] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Acceso Administrativo Seguro
          </div>
          <h1 className="text-2xl font-black text-white font-[family-name:var(--font-heading)] uppercase tracking-wide">
            Panel de Control
          </h1>
          <p className="text-xs text-zinc-400">
            Ingresa tus credenciales autorizadas de Iori Biker Shop
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@ioribikershop.com"
                className="w-full pl-10 pr-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] placeholder:text-zinc-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white font-extrabold uppercase tracking-wider py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Botón DEMO para entorno de desarrollo y pruebas locales */}
          <button
            type="button"
            onClick={() => {
              onLoginSuccess({
                id: 'demo-admin-user',
                email: 'admin@ioribikershop.pe',
                profile: { rol: 'admin', nombre: 'Admin Iori (DEMO)' },
              });
            }}
            className="w-full py-2.5 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/60 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#f58220]" />
            <span>Acceso Rápido DEMO (Administrador)</span>
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-center text-[11px] text-zinc-500">
          Iori SAC • RUC 20610816089 • Acceso restringido para personal técnico y de ventas.
        </div>
      </div>
    </div>
  );
}
