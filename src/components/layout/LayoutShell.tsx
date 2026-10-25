'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Eye, ArrowLeft } from 'lucide-react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { ACuotazHeaderStrip } from '../acuotaz/ACuotazHeaderStrip';
import { MobileNav } from './MobileNav';
import { CartDrawer } from './CartDrawer';
import { Footer } from './Footer';
import { WhatsAppFloating } from './WhatsAppFloating';
import { TiendaEnPreparacion } from '../common/TiendaEnPreparacion';
import { createClient } from '@/lib/supabase/client';
import { TiendaSettingsProvider } from '@/context/TiendaSettingsContext';

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [enPreparacion, setEnPreparacion] = useState<boolean>(false);
  const [prepMensaje, setPrepMensaje] = useState<string>('Estamos preparando nuestro nuevo catálogo digital. ¡Muy pronto disponible!');
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAdminPath = pathname?.startsWith('/admin');

  useEffect(() => {
    async function checkPrepAndAuth() {
      try {
        const supabase = createClient();
        
        // 1. Obtener ajuste de tienda en preparación desde Supabase
        const { data: setting } = await supabase
          .from('ajustes_generales')
          .select('valor')
          .eq('clave', 'tienda_en_preparacion')
          .single();

        if (setting && setting.valor) {
          setEnPreparacion(Boolean(setting.valor.activo));
          if (setting.valor.mensaje) {
            setPrepMensaje(setting.valor.mensaje);
          }
        }

        // 2. Verificar rol exclusivamente contra la sesión real de Supabase Auth
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', authData.user.id)
            .maybeSingle();

          const rol =
            prof?.rol ||
            authData.user.app_metadata?.rol ||
            authData.user.app_metadata?.role ||
            'cliente';
          if (rol === 'admin' || rol === 'atencion') {
            setIsAdminUser(true);
          }
        }
      } catch (err) {
        console.error('Error comprobando estado de tienda:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkPrepAndAuth();
  }, [pathname]);

  // Si estamos en rutas de administración, renderizar panel de admin
  if (isAdminPath) {
    return <main className="min-h-screen w-full bg-zinc-50">{children}</main>;
  }

  // Si la tienda está en preparación y el visitante NO es administrador autenticado
  if (!isLoading && enPreparacion && !isAdminUser) {
    return <TiendaEnPreparacion mensaje={prepMensaje} />;
  }

  return (
    <TiendaSettingsProvider>
      <div className="flex flex-col min-h-screen bg-white text-zinc-900 selection:bg-[#F58220] selection:text-black">
        {/* Barra de Vista Previa para Administradores cuando Tienda en Preparación está activa */}
        {enPreparacion && isAdminUser && (
          <div className="bg-amber-500 text-black px-4 py-2 text-xs font-bold flex items-center justify-between z-50 sticky top-0 shadow-md">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>MODO VISTA PREVIA ADMINISTRADOR — La tienda está en preparación para el público.</span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white hover:bg-zinc-800 text-[11px] uppercase tracking-wider rounded font-black transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Admin
            </Link>
          </div>
        )}

        {/* 1. Header principal negro */}
        <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />

        {/* 2. Navegación Desktop (segunda fila con 8 categorías y marcas) */}
        <Navigation />

        {/* 3. Franja de aCuotaz justo debajo del header en todas las páginas */}
        <ACuotazHeaderStrip maxCuotas={undefined} />

        {/* Menú móvil desplegable con acordeones */}
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        />

        {/* Carrito Offcanvas Drawer */}
        <CartDrawer />

        {/* Contenido principal */}
        <main className="flex-1 w-full">{children}</main>

        {/* Footer oficial de Iori */}
        <Footer />

        {/* Botón flotante oficial de WhatsApp */}
        <WhatsAppFloating />
      </div>
    </TiendaSettingsProvider>
  );
}
