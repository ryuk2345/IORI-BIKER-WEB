'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronRight } from 'lucide-react';
import { PRODUCTOS, CATEGORIAS, MARCAS } from '@/data/mock';
import { ProductCard } from '@/components/product/ProductCard';
import { Producto, Categoria, Marca } from '@/types';

interface CatalogViewProps {
  initialTitle?: string;
  initialDescription?: string;
  forcedCatSlug?: string;
  forcedSubSlug?: string;
  forcedMarcaSlug?: string;
  isOnlyOffers?: boolean;
  isOnlyNew?: boolean;
  isOnlyCombos?: boolean;
  isOnlyOutlet?: boolean;
  initialProductos?: Producto[];
  initialCategorias?: Categoria[];
  initialMarcas?: Marca[];
}

export function CatalogView({
  initialTitle = 'Todos los Productos',
  initialDescription = 'Explora nuestro catálogo completo de accesorios moteros, cascos certificados e indumentaria.',
  forcedCatSlug,
  forcedSubSlug,
  forcedMarcaSlug,
  isOnlyOffers = false,
  isOnlyNew = false,
  isOnlyCombos = false,
  isOnlyOutlet = false,
  initialProductos,
  initialCategorias,
  initialMarcas,
}: CatalogViewProps) {
  const productosList = initialProductos && initialProductos.length > 0 ? initialProductos : PRODUCTOS;
  const categoriasList = initialCategorias && initialCategorias.length > 0 ? initialCategorias : CATEGORIAS;
  const marcasList = initialMarcas && initialMarcas.length > 0 ? initialMarcas : MARCAS;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados de filtros desde query params
  const catParam = forcedCatSlug || searchParams.get('cat') || '';
  const subParam = forcedSubSlug || searchParams.get('sub') || '';
  const marcaParam = forcedMarcaSlug || searchParams.get('marca') || '';
  const buscarParam = searchParams.get('buscar') || '';
  const ordenParam = searchParams.get('orden') || 'relevancia';
  const tallaParam = searchParams.get('talla') || '';
  const colorParam = searchParams.get('color') || '';
  const stockParam = searchParams.get('stock') || '';
  const ofertaParam = searchParams.get('oferta') === 'true' || isOnlyOffers;
  const precioMinQuery = Number(searchParams.get('precio_min')) || 0;
  const precioMaxQuery = Number(searchParams.get('precio_max')) || 3000;
  const currentPage = Number(searchParams.get('page')) || 1;

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [precioMin, setPrecioMin] = useState<number>(precioMinQuery);
  const [precioMax, setPrecioMax] = useState<number>(precioMaxQuery);

  // Categoría actual para chips de subcategorías y breadcrumb
  const currentCategory = useMemo(() => {
    return categoriasList.find((c) => c.slug === catParam);
  }, [categoriasList, catParam]);

  const currentSubcategory = useMemo(() => {
    if (!currentCategory) return null;
    return currentCategory.subcategorias?.find((s) => s.slug === subParam);
  }, [currentCategory, subParam]);

  const currentMarca = useMemo(() => {
    return marcasList.find((m) => m.slug === marcaParam || m.id === marcaParam);
  }, [marcasList, marcaParam]);

  // Actualizar URL con query params
  const updateParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    // Resetear a página 1 al cambiar filtros
    if (!('page' in newParams)) {
      params.delete('page');
    }
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const currentPath = window.location.pathname;
    router.push(currentPath);
    setPrecioMin(0);
    setPrecioMax(3000);
  };

  // 1. Filtrado de productos
  const filteredProducts = useMemo(() => {
    return productosList.filter((p) => {
      if (isOnlyOffers && !p.esOferta) return false;
      if (ofertaParam && !p.esOferta) return false;
      if (isOnlyNew && !p.esNuevo) return false;
      if (isOnlyCombos && !p.esCombo) return false;
      if (isOnlyOutlet && !p.esOutlet) return false;

      if (catParam && p.categoriaSlug !== catParam) return false;
      if (subParam && p.subcategoriaSlug !== subParam) return false;
      if (marcaParam && p.marcaId !== marcaParam && p.marcaNombre?.toLowerCase() !== marcaParam.toLowerCase()) return false;
      if (p.precio < precioMin || p.precio > precioMax) return false;

      if (tallaParam && p.tallasDisponibles && !p.tallasDisponibles.includes(tallaParam)) return false;
      if (colorParam && p.coloresDisponibles && !p.coloresDisponibles.some((c) => c.nombre.toLowerCase() === colorParam.toLowerCase())) return false;
      if (stockParam === 'in_stock' && p.stock <= 0) return false;
      if (stockParam === 'out_of_stock' && p.stock > 0) return false;

      if (buscarParam) {
        const query = buscarParam.toLowerCase();
        const matchName = p.nombre.toLowerCase().includes(query);
        const matchCat = p.categoriaNombre.toLowerCase().includes(query);
        const matchMarca = p.marcaNombre?.toLowerCase().includes(query);
        if (!matchName && !matchCat && !matchMarca) return false;
      }

      return true;
    }).sort((a, b) => {
      if (ordenParam === 'precio_min') return a.precio - b.precio;
      if (ordenParam === 'precio_max') return b.precio - a.precio;
      if (ordenParam === 'recientes') return (b.esNuevo ? 1 : 0) - (a.esNuevo ? 1 : 0);
      if (ordenParam === 'nombre_asc') return a.nombre.localeCompare(b.nombre);
      return 0; // relevancia por defecto
    });
  }, [
    productosList,
    catParam,
    subParam,
    marcaParam,
    buscarParam,
    ordenParam,
    tallaParam,
    colorParam,
    stockParam,
    ofertaParam,
    precioMin,
    precioMax,
    isOnlyOffers,
    isOnlyNew,
    isOnlyCombos,
    isOnlyOutlet,
  ]);

  // Contadores dinámicos por opción (Patrón Kawasaki)
  const counts = useMemo(() => {
    const subMap: Record<string, number> = {};
    const marcaMap: Record<string, number> = {};
    const tallaMap: Record<string, number> = {};
    let inStockCount = 0;
    let outStockCount = 0;
    let offerCount = 0;

    productosList.forEach((p) => {
      // Si hay categoría activa, contamos subcategorías de esa categoría
      if (!catParam || p.categoriaSlug === catParam) {
        if (p.subcategoriaSlug) {
          subMap[p.subcategoriaSlug] = (subMap[p.subcategoriaSlug] || 0) + 1;
        }
      }
      if (p.marcaId) {
        marcaMap[p.marcaId] = (marcaMap[p.marcaId] || 0) + 1;
      }
      p.tallasDisponibles?.forEach((t) => {
        tallaMap[t] = (tallaMap[t] || 0) + 1;
      });
      if (p.stock > 0) inStockCount++;
      else outStockCount++;
      if (p.esOferta) offerCount++;
    });

    return { subMap, marcaMap, tallaMap, inStockCount, outStockCount, offerCount };
  }, [productosList, catParam]);

  // Paginación numerada (12 por página)
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const activeFiltersCount = [
    catParam && !forcedCatSlug,
    subParam && !forcedSubSlug,
    marcaParam && !forcedMarcaSlug,
    tallaParam,
    colorParam,
    stockParam,
    ofertaParam && !isOnlyOffers,
    precioMin > 0 || precioMax < 3000,
  ].filter(Boolean).length;

  return (
    <div className="section-py bg-white">
      <div className="container-iori">
        {/* 1. Breadcrumb estricto */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-12 text-zinc-500 flex-wrap">
            <li>
              <Link href="/" className="hover:text-black transition-colors">
                Inicio
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5 text-zinc-400" /></li>
            <li>
              <Link href="/productos" className="hover:text-black transition-colors">
                Productos
              </Link>
            </li>
            {currentCategory && (
              <>
                <li><ChevronRight className="w-3.5 h-3.5 text-zinc-400" /></li>
                <li>
                  <Link
                    href={`/categoria/${currentCategory.slug}`}
                    className={!currentSubcategory ? 'text-zinc-900 font-bold' : 'hover:text-black transition-colors'}
                  >
                    {currentCategory.nombre}
                  </Link>
                </li>
              </>
            )}
            {currentSubcategory && (
              <>
                <li><ChevronRight className="w-3.5 h-3.5 text-zinc-400" /></li>
                <li className="text-zinc-900 font-bold" aria-current="page">
                  {currentSubcategory.nombre}
                </li>
              </>
            )}
            {currentMarca && !currentCategory && (
              <>
                <li><ChevronRight className="w-3.5 h-3.5 text-zinc-400" /></li>
                <li className="text-zinc-900 font-bold" aria-current="page">
                  {currentMarca.nombre}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* 2. Título principal en mayúsculas con número de productos */}
        <div className="pb-4 mb-6 border-b border-zinc-200">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-32 md:text-40 font-heading font-bold uppercase text-zinc-950 tracking-tight leading-none">
              {currentSubcategory?.nombre || currentCategory?.nombre || currentMarca?.nombre || initialTitle}
            </h1>
            <span className="text-16 md:text-18 font-heading font-bold text-zinc-500">
              ({filteredProducts.length})
            </span>
          </div>
          {initialDescription && (
            <p className="mt-1 text-14 text-zinc-600 max-w-3xl">
              {initialDescription}
            </p>
          )}

          {/* Chips de subcategorías arriba */}
          {currentCategory && currentCategory.subcategorias && currentCategory.subcategorias.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
              <Link
                href={`/categoria/${currentCategory.slug}`}
                className={`shrink-0 text-12 font-heading uppercase font-bold tracking-wider px-3 py-1.5 rounded-[2px] border transition-colors ${
                  !subParam
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white border-zinc-300 text-zinc-700 hover:border-[#F58220] hover:text-[#F58220]'
                }`}
              >
                Todos
              </Link>
              {currentCategory.subcategorias.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categoria/${currentCategory.slug}/${sub.slug}`}
                  className={`shrink-0 text-12 font-heading uppercase font-bold tracking-wider px-3 py-1.5 rounded-[2px] border transition-colors ${
                    subParam === sub.slug
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white border-zinc-300 text-zinc-700 hover:border-[#F58220] hover:text-[#F58220]'
                  }`}
                >
                  {sub.nombre} ({counts.subMap[sub.slug] || 0})
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 3. Barra de herramientas: Botón Filtros móvil + Total de resultados + Barra con orden */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            {/* Botón Filtros en móvil */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-[4px] border border-zinc-300 text-12 font-heading font-bold uppercase tracking-wider text-zinc-900 bg-white hover:bg-zinc-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            <span className="text-12 text-zinc-500 font-medium">
              Mostrando <strong className="text-zinc-900">{filteredProducts.length}</strong> resultados
            </span>
          </div>

          {/* Barra con orden (Relevancia, Menor precio, Mayor precio, Más recientes, Nombre A-Z) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label htmlFor="orden" className="text-12 text-zinc-500 font-semibold uppercase tracking-wider">
              Ordenar por:
            </label>
            <select
              id="orden"
              value={ordenParam}
              onChange={(e) => updateParams({ orden: e.target.value })}
              className="text-12 font-heading font-bold uppercase tracking-wider border border-zinc-300 rounded-[4px] px-3 py-1.5 bg-white text-zinc-900 focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio_min">Menor precio</option>
              <option value="precio_max">Mayor precio</option>
              <option value="recientes">Más recientes</option>
              <option value="nombre_asc">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {/* Chips de filtros activos y 'Limpiar todo' */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-4 mb-4 border-b border-zinc-100">
            <span className="text-12 font-heading font-bold uppercase text-zinc-500">Filtros activos:</span>
            {catParam && !forcedCatSlug && (
              <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 text-12 font-medium px-2 py-0.5 rounded-[2px] border border-zinc-200">
                Cat: {currentCategory?.nombre || catParam}
                <button type="button" onClick={() => updateParams({ cat: null, sub: null })} className="cursor-pointer hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {subParam && !forcedSubSlug && (
              <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 text-12 font-medium px-2 py-0.5 rounded-[2px] border border-zinc-200">
                Sub: {currentSubcategory?.nombre || subParam}
                <button type="button" onClick={() => updateParams({ sub: null })} className="cursor-pointer hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {marcaParam && !forcedMarcaSlug && (
              <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 text-12 font-medium px-2 py-0.5 rounded-[2px] border border-zinc-200">
                Marca: {currentMarca?.nombre || marcaParam}
                <button type="button" onClick={() => updateParams({ marca: null })} className="cursor-pointer hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {tallaParam && (
              <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 text-12 font-medium px-2 py-0.5 rounded-[2px] border border-zinc-200">
                Talla: {tallaParam}
                <button type="button" onClick={() => updateParams({ talla: null })} className="cursor-pointer hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {ofertaParam && !isOnlyOffers && (
              <span className="inline-flex items-center gap-1 bg-[#F58220]/10 text-zinc-900 text-12 font-medium px-2 py-0.5 rounded-[2px] border border-[#F58220]/30">
                En oferta
                <button type="button" onClick={() => updateParams({ oferta: null })} className="cursor-pointer hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-12 font-heading font-bold uppercase text-[#F58220] hover:underline ml-2 cursor-pointer"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* 4. Estructura principal: Sidebar Desktop + Grilla */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR DE FILTROS DESKTOP CON CONTADORES EXACTOS (KAWASAKI) */}
          <aside className="hidden lg:block space-y-6">
            {/* Categorías */}
            <div className="pb-4 border-b border-zinc-200">
              <h3 className="text-14 font-heading font-bold uppercase tracking-wider text-zinc-950 mb-2">
                Categoría
              </h3>
              <ul className="space-y-1 text-12">
                {categoriasList.slice(0, 8).map((cat) => {
                  const isSelected = cat.slug === catParam;
                  const count = productosList.filter((p) => p.categoriaSlug === cat.slug).length;
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onClick={() => updateParams({ cat: isSelected ? null : cat.slug, sub: null })}
                        className={`w-full text-left py-1 px-2 rounded-[2px] flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-zinc-950 text-white font-bold' : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <span>{cat.nombre}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-brand' : 'text-zinc-400'}`}>
                          ({count})
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Marcas con contador (Patrón Kawasaki) */}
            <div className="pb-4 border-b border-zinc-200">
              <h3 className="text-14 font-heading font-bold uppercase tracking-wider text-zinc-950 mb-2">
                Marca
              </h3>
              <ul className="space-y-1 text-12 max-h-48 overflow-y-auto pr-1">
                {marcasList.map((m) => {
                  const isSelected = m.slug === marcaParam || m.id === marcaParam;
                  const count = counts.marcaMap[m.id] || 0;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => updateParams({ marca: isSelected ? null : m.slug })}
                        className={`w-full text-left py-1 px-2 rounded-[2px] flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-zinc-950 text-white font-bold' : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <span>{m.nombre}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-brand' : 'text-zinc-400'}`}>
                          ({count})
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Precio Desde / Hasta */}
            <div className="pb-4 border-b border-zinc-200">
              <h3 className="text-14 font-heading font-bold uppercase tracking-wider text-zinc-950 mb-2">
                Precio (S/)
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Desde"
                  value={precioMin || ''}
                  onChange={(e) => setPrecioMin(Number(e.target.value))}
                  onBlur={() => updateParams({ precio_min: precioMin || null })}
                  className="w-1/2 px-2 py-1 text-12 border border-zinc-300 rounded-[2px] focus:outline-none focus:border-brand"
                />
                <span className="text-zinc-400">-</span>
                <input
                  type="number"
                  placeholder="Hasta"
                  value={precioMax || ''}
                  onChange={(e) => setPrecioMax(Number(e.target.value))}
                  onBlur={() => updateParams({ precio_max: precioMax < 3000 ? precioMax : null })}
                  className="w-1/2 px-2 py-1 text-12 border border-zinc-300 rounded-[2px] focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Tallas con contador */}
            {Object.keys(counts.tallaMap).length > 0 && (
              <div className="pb-4 border-b border-zinc-200">
                <h3 className="text-14 font-heading font-bold uppercase tracking-wider text-zinc-950 mb-2">
                  Talla
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(counts.tallaMap).map(([talla, count]) => {
                    const isSelected = tallaParam === talla;
                    return (
                      <button
                        key={talla}
                        type="button"
                        onClick={() => updateParams({ talla: isSelected ? null : talla })}
                        className={`text-12 font-heading font-bold px-2.5 py-1 rounded-[2px] border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-950 text-white border-zinc-950'
                            : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        {talla} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* En Oferta */}
            <div className="pb-4 border-b border-zinc-200">
              <label className="flex items-center justify-between text-12 font-medium text-zinc-800 cursor-pointer">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ofertaParam}
                    onChange={(e) => updateParams({ oferta: e.target.checked ? 'true' : null })}
                    className="accent-brand rounded-[2px]"
                  />
                  <span>Solo en oferta</span>
                </span>
                <span className="text-12 text-zinc-400 font-bold">({counts.offerCount})</span>
              </label>
            </div>
          </aside>

          {/* GRILLA DE PRODUCTCARD (3 columnas desktop, 2 móvil) */}
          <main className="lg:col-span-3">
            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {paginatedProducts.map((producto) => (
                    <ProductCard key={producto.id} producto={producto} />
                  ))}
                </div>

                {/* Paginación numerada */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 pt-10 border-t border-zinc-200 mt-10">
                    {Array.from({ length: totalPages }, (_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => updateParams({ page: pageNum })}
                          className={`w-9 h-9 text-12 font-heading font-bold rounded-[2px] border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (initialProductos?.length || 0) === 0 ? (
              /* Estado cuando el catálogo general está vacío en preparación */
              <div className="py-16 text-center border border-zinc-200 rounded-[4px] p-8 bg-zinc-50 space-y-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-[#F58220] flex items-center justify-center mx-auto">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-20 sm:text-24 font-heading font-bold uppercase text-zinc-950 mb-1">
                    Catálogo en preparación
                  </h3>
                  <p className="text-13 text-zinc-600 max-w-md mx-auto">
                    Estamos actualizando el inventario oficial de cascos, accesorios e indumentaria. Puedes consultar disponibilidad inmediata por WhatsApp.
                  </p>
                </div>
                <a
                  href="https://wa.me/51905445698?text=Hola,%20Iori%20Biker%20Shop%20👋%20Quisiera%20consultar%20por%20un%20producto%20de%20su%20catálogo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-12 font-heading font-bold uppercase tracking-wider rounded-[4px] shadow-sm transition"
                >
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>
            ) : (
              /* Estado vacío cuando los filtros no arrojan resultados */
              <div className="py-16 text-center border border-zinc-200 rounded-[4px] p-8 bg-[#F5F5F5]">
                <h3 className="text-24 font-heading font-bold uppercase text-zinc-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-14 text-zinc-600 max-w-md mx-auto mb-6">
                  Prueba ajustando los filtros seleccionados o realiza una búsqueda con otros términos.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-primary"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* DRAWER MÓVIL DE FILTROS */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full flex flex-col shadow-2xl z-10 p-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
              <span className="font-heading font-bold text-16 uppercase tracking-wider text-zinc-950">
                Filtros
              </span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-zinc-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorías en móvil */}
            <div className="mb-4 pb-4 border-b border-zinc-100">
              <h4 className="text-12 font-heading font-bold uppercase text-zinc-800 mb-2">Categorías</h4>
              <div className="space-y-1 text-12">
                {categoriasList.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      updateParams({ cat: cat.slug === catParam ? null : cat.slug, sub: null });
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded-[2px] flex justify-between ${
                      cat.slug === catParam ? 'bg-zinc-950 text-white font-bold' : 'text-zinc-700'
                    }`}
                  >
                    <span>{cat.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Marcas en móvil */}
            <div className="mb-4 pb-4 border-b border-zinc-100">
              <h4 className="text-12 font-heading font-bold uppercase text-zinc-800 mb-2">Marcas</h4>
              <div className="space-y-1 text-12 max-h-40 overflow-y-auto">
                {marcasList.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      updateParams({ marca: m.slug === marcaParam ? null : m.slug });
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded-[2px] flex justify-between ${
                      m.slug === marcaParam ? 'bg-zinc-950 text-white font-bold' : 'text-zinc-700'
                    }`}
                  >
                    <span>{m.nombre}</span>
                    <span className="text-zinc-400">({counts.marcaMap[m.id] || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-primary w-full justify-center"
              >
                Ver resultados ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
