'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Tag, 
  Sliders, 
  Sparkles, 
  Inbox, 
  BookOpen, 
  Settings, 
  Search, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X,
} from 'lucide-react';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';
import { GlobalSearchModal } from './GlobalSearchModal';

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface AdminLayoutShellProps {
  user: any;
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  products?: any[];
  newOrdersCount?: number;
  newMessagesCount?: number;
  onSelectProductFromSearch?: (product: any) => void;
}

export function AdminLayoutShell({
  user,
  activeTab: propActiveTab,
  onSelectTab,
  onLogout,
  children,
  products = [],
  newOrdersCount = 0,
  newMessagesCount = 0,
  onSelectProductFromSearch,
}: AdminLayoutShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const pathname = usePathname() || '/admin';
  const router = useRouter();

  const role = user?.profile?.rol || 'admin';
  const isAtencion = role === 'atencion';

  // Determinar la pestaña activa según la URL actual de Next.js
  const getActiveTabFromPath = (): string => {
    if (propActiveTab) return propActiveTab;
    if (pathname === '/admin' || pathname === ADMIN_ROUTES.INICIO) return 'inicio';
    if (pathname.startsWith('/admin/pedidos')) return 'pedidos';
    if (pathname.startsWith('/admin/productos')) return 'productos';
    if (pathname.startsWith('/admin/catalogo')) return 'catalogo';
    if (pathname.startsWith('/admin/banners')) return 'banners';
    if (pathname.startsWith('/admin/promociones')) return 'promos';
    if (pathname.startsWith('/admin/mensajes')) return 'mensajes';
    if (pathname.startsWith('/admin/contenido')) return 'contenido';
    if (pathname.startsWith('/admin/ajustes')) return 'ajustes';
    return 'inicio';
  };

  const currentTab = getActiveTabFromPath();

  // Lista completa de ítems de menú según la regla, con rutas estrictamente tipadas
  const allNavItems: AdminNavItem[] = [
    { id: 'inicio', label: 'Inicio', href: ADMIN_ROUTES.INICIO, icon: Home },
    { id: 'pedidos', label: 'Pedidos', href: ADMIN_ROUTES.PEDIDOS, icon: ShoppingCart, badge: newOrdersCount },
    { id: 'productos', label: 'Productos', href: ADMIN_ROUTES.PRODUCTOS, icon: Package },
    { id: 'catalogo', label: 'Categorías y marcas', href: ADMIN_ROUTES.CATALOGO, icon: Tag },
    { id: 'banners', label: 'Banners', href: ADMIN_ROUTES.BANNERS, icon: Sliders },
    { id: 'promos', label: 'Promociones', href: ADMIN_ROUTES.PROMOCIONES, icon: Sparkles },
    { id: 'mensajes', label: 'Mensajes', href: ADMIN_ROUTES.MENSAJES, icon: Inbox, badge: newMessagesCount },
    { id: 'contenido', label: 'Contenido', href: ADMIN_ROUTES.CONTENIDO, icon: BookOpen },
    { id: 'ajustes', label: 'Ajustes', href: ADMIN_ROUTES.AJUSTES('empresa'), icon: Settings },
  ];

  // Atención al cliente solo ve Inicio, Pedidos y Mensajes
  const visibleNavItems = isAtencion
    ? allNavItems.filter((i) => ['inicio', 'pedidos', 'mensajes'].includes(i.id))
    : allNavItems;

  const handleNavClick = (tabId: string) => {
    if (onSelectTab) onSelectTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* ======================================================== */}
      {/* 1. SIDEBAR DESKTOP FIJO (Ancho 260px)                     */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-zinc-200/90 select-none shrink-0 sticky top-0 h-screen">
        {/* Logo Iori Biker Shop */}
        <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
          <Image
            src="/brand/iori-logo.png"
            alt="Iori Biker Shop"
            width={160}
            height={70}
            className="h-10 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="font-heading font-black text-14 uppercase tracking-wider text-zinc-900 leading-tight">
              PANEL ADMIN
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              {isAtencion ? 'Atención al Cliente' : 'Administración'}
            </span>
          </div>
        </div>

        {/* Lista de Navegación con Rutas Reales */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-13 font-semibold transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F58220]' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-[#F58220] text-black'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar con Usuario */}
        <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-heading font-black text-12 flex items-center justify-center shrink-0">
                {(user?.profile?.nombre || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="block text-12 font-bold text-zinc-800 truncate leading-tight">
                  {user?.profile?.nombre || user?.email?.split('@')[0]}
                </span>
                <span className="block text-[10px] text-zinc-400 truncate">
                  {isAtencion ? 'Atención' : 'Administrador'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. DRAWER MÓVIL (< 1024px)                               */}
      {/* ======================================================== */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full flex flex-col shadow-2xl z-10 border-r border-zinc-200">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/brand/iori-logo.png"
                  alt="Iori Biker Shop"
                  width={140}
                  height={60}
                  className="h-9 w-auto object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-13 font-semibold transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F58220]' : 'text-zinc-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F58220] text-black">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50">
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-12 font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CONTENIDO PRINCIPAL Y BARRA SUPERIOR                  */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior con Buscador Global */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Botón menú móvil */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition cursor-pointer"
              aria-label="Abrir menú de administración"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Buscador Global (Shortcut ⌘K) */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/90 rounded-lg text-12 text-zinc-500 hover:text-zinc-800 transition w-48 sm:w-80 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">Buscar pedido o producto...</span>
              <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-zinc-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Enlaces y Acciones de la Barra Superior */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-12 font-bold text-zinc-700 flex items-center gap-1.5 transition shadow-2xs hover:border-zinc-300"
              title="Abrir tienda pública en nueva pestaña"
            >
              <span className="hidden sm:inline">Ver Tienda</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-200 text-12 font-medium text-zinc-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-800 font-bold truncate max-w-[120px]">
                {user?.profile?.nombre || user?.email?.split('@')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Área de Trabajo de las Páginas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Modal Buscador Global */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          if (onSelectProductFromSearch) {
            onSelectProductFromSearch(p);
          } else {
            router.push(ADMIN_ROUTES.PRODUCTO_EDITAR(p.id));
          }
        }}
        onSelectOrder={(codigo) => {
          router.push(ADMIN_ROUTES.PEDIDO_DETALLE(codigo));
        }}
        onSelectTab={(tab) => {
          const tabRoutes: Record<string, string> = {
            inicio: ADMIN_ROUTES.INICIO,
            pedidos: ADMIN_ROUTES.PEDIDOS,
            productos: ADMIN_ROUTES.PRODUCTOS,
            categorias_marcas: ADMIN_ROUTES.CATALOGO,
            banners: ADMIN_ROUTES.BANNERS,
            promos: ADMIN_ROUTES.PROMOCIONES,
            mensajes: ADMIN_ROUTES.MENSAJES,
            contenido: ADMIN_ROUTES.CONTENIDO,
            ajustes: ADMIN_ROUTES.AJUSTES('empresa'),
          };
          if (tabRoutes[tab]) {
            router.push(tabRoutes[tab]);
          }
        }}
      />
    </div>
  );
}
