'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { PRODUCTOS, CATEGORIAS, MARCAS } from '@/data/mock';
import { formatPEN } from '@/utils/currency';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = useCartStore((state) => state.getTotalCount());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cierra el dropdown si se clickea afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileSearchExpanded && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isMobileSearchExpanded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearchOpen(false);
      setIsMobileSearchExpanded(false);
      router.push(`/productos?buscar=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Filtrado reactivo en vivo
  const filteredProducts = searchTerm.trim().length >= 2
    ? PRODUCTOS.filter((p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoriaNombre.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredCategories = searchTerm.trim().length >= 2
    ? CATEGORIAS.filter((c) =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredBrands = searchTerm.trim().length >= 2
    ? MARCAS.filter((m) =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasResults =
    filteredProducts.length > 0 ||
    filteredCategories.length > 0 ||
    filteredBrands.length > 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#111111] text-white border-b border-zinc-800 transition-all duration-300">
      <div className="container-iori">
        {/* FILA PRINCIPAL: Compacta en scroll */}
        <div
          className={`flex items-center justify-between gap-3 md:gap-6 transition-all duration-300 ${
            isScrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'
          }`}
        >
          {/* MÓVIL: Botón Hamburguesa a la izquierda */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Logo oficial Iori Biker Shop */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3.5 shrink-0 group py-0.5">
            <Image
              src="/brand/iori-logo.png"
              alt="Iori Biker Shop Logo"
              width={260}
              height={125}
              priority
              className={`object-contain transition-all duration-300 drop-shadow-sm ${
                isScrolled ? 'h-10 md:h-13 w-auto' : 'h-12 sm:h-13 md:h-16 lg:h-17 w-auto'
              }`}
            />
            <div className="hidden md:flex flex-col justify-center select-none">
              <span className="font-heading font-black text-18 md:text-20 lg:text-22 uppercase tracking-wider text-white leading-tight">
                IORI <span className="text-[#F58220]">BIKER SHOP</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-bold tracking-widest uppercase">
                Tienda Biker Perú
              </span>
            </div>
          </Link>

          {/* DESKTOP: Buscador ancho con sugerencias en vivo */}
          <div ref={searchRef} className="relative flex-1 max-w-xl mx-2 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Buscar por casco, guantes, accesorios, marcas..."
                className="w-full bg-[#1C1C1F] text-white placeholder-zinc-400 text-14 rounded-[4px] pl-4 pr-24 py-2 border border-zinc-700 focus:outline-none focus:border-[#F58220] transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#F58220] hover:bg-[#E07216] text-[#111111] font-heading font-bold text-12 uppercase px-3 py-1.5 rounded-[2px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </form>

            {/* Dropdown de autocompletado en vivo */}
            {isSearchOpen && searchTerm.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C20] border border-zinc-700 rounded-[4px] shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
                {hasResults ? (
                  <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
                    {/* Productos sugeridos */}
                    {filteredProducts.length > 0 && (
                      <div>
                        <h4 className="text-12 font-heading font-bold text-zinc-400 uppercase tracking-wider mb-2">
                          Productos
                        </h4>
                        <div className="space-y-1.5">
                          {filteredProducts.map((prod) => (
                            <Link
                              key={prod.id}
                              href={`/producto/${prod.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3 p-2 rounded-[2px] hover:bg-zinc-800/80 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-white rounded-[2px] shrink-0 flex items-center justify-center overflow-hidden p-1">
                                <Image
                                  src={prod.imagenes[0]}
                                  alt={prod.nombre}
                                  width={40}
                                  height={40}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-12 text-zinc-200 group-hover:text-[#F58220] font-medium truncate">
                                  {prod.nombre}
                                </p>
                                <p className="text-12 text-zinc-400 font-bold">
                                  {formatPEN(prod.precio)}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categorías y Marcas */}
                    {(filteredCategories.length > 0 || filteredBrands.length > 0) && (
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-700/60">
                        {filteredCategories.length > 0 && (
                          <div>
                            <h4 className="text-12 font-heading font-bold text-zinc-400 uppercase tracking-wider mb-1">
                              Categorías
                            </h4>
                            <div className="space-y-1">
                              {filteredCategories.map((cat) => (
                                <Link
                                  key={cat.id}
                                  href={`/categoria/${cat.slug}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="block text-12 text-zinc-300 hover:text-[#F58220] py-0.5"
                                >
                                  {cat.nombre}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {filteredBrands.length > 0 && (
                          <div>
                            <h4 className="text-12 font-heading font-bold text-zinc-400 uppercase tracking-wider mb-1">
                              Marcas
                            </h4>
                            <div className="space-y-1">
                              {filteredBrands.map((brand) => (
                                <Link
                                  key={brand.id}
                                  href={`/marca/${brand.slug}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="block text-12 text-zinc-300 hover:text-[#F58220] py-0.5"
                                >
                                  {brand.nombre}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ver todos */}
                    <div className="pt-2 border-t border-zinc-700/60 text-center">
                      <Link
                        href={`/productos?buscar=${encodeURIComponent(searchTerm)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="inline-flex items-center gap-1.5 text-12 font-heading font-bold uppercase text-[#F58220] hover:underline"
                      >
                        <span>Ver todos los resultados</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-zinc-400">
                    <p className="text-14 font-semibold text-zinc-300">
                      No encontramos resultados para &quot;{searchTerm}&quot;
                    </p>
                    <p className="text-12 text-zinc-500 mt-1">
                      Intenta buscar por casco, guantes, indumentaria o marcas.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LADO DERECHO: Desktop (Ofertas, Mi Cuenta, Carrito con monto) | Móvil (Buscar, Carrito) */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Móvil: Botón de búsqueda */}
            <button
              type="button"
              onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
              className="p-1.5 text-zinc-300 hover:text-[#F58220] md:hidden cursor-pointer"
              aria-label="Abrir buscador"
            >
              {isMobileSearchExpanded ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Desktop: Botón naranja 'Ofertas' */}
            <Link
              href="/ofertas"
              className="hidden md:inline-flex bg-[#F58220] hover:bg-[#E07216] text-[#111111] font-heading font-bold text-14 uppercase px-4 py-2 rounded-[4px] tracking-wider transition-colors shrink-0"
            >
              Ofertas
            </Link>

            {/* Desktop: Mi cuenta */}
            <Link
              href="/mi-cuenta"
              className="hidden md:flex p-1.5 text-zinc-300 hover:text-[#F58220] transition-colors items-center gap-1.5"
              aria-label="Mi Cuenta"
            >
              <User className="w-5 h-5" />
              <span className="text-14 font-medium">Mi Cuenta</span>
            </Link>

            {/* Carrito con monto y contador */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-1.5 text-zinc-300 hover:text-[#F58220] transition-colors flex items-center gap-2 cursor-pointer"
              aria-label="Abrir carrito"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                {totalCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#F58220] text-[#111111] font-heading font-bold text-12 w-4 h-4 rounded-full flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-12 text-zinc-400 uppercase leading-none">Carrito</span>
                <span className="text-14 font-bold text-white leading-tight">
                  {formatPEN(totalPrice)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* MÓVIL: Buscador colapsable limpio */}
        {isMobileSearchExpanded && (
          <div className="md:hidden pb-3 pt-1 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={mobileInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar casco, accesorios, marcas..."
                className="w-full bg-[#1C1C1F] text-white placeholder-zinc-400 text-14 rounded-[4px] pl-3 pr-10 py-2 border border-zinc-700 focus:outline-none focus:border-[#F58220]"
              />
              <button
                type="submit"
                className="absolute right-2 text-[#F58220] p-1"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
