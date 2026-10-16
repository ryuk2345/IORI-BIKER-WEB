'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart,
  Phone,
  ShieldCheck,
  Check,
  ChevronRight,
  Star,
  Ruler,
  Info,
} from 'lucide-react';
import { Producto } from '@/types';
import { formatPEN } from '@/utils/currency';
import { useCartStore } from '@/store/useCartStore';
import { useTiendaSettings } from '@/context/TiendaSettingsContext';
import { ACuotazWidget } from '@/components/acuotaz/ACuotazWidget';
import { ProductCarousel } from '@/components/ui/ProductCarousel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { trackViewItem, trackAddToCart } from '@/lib/analytics';

interface ProductDetailViewProps {
  producto: Producto;
  relacionados?: Producto[];
}

export function ProductDetailView({ producto, relacionados = [] }: ProductDetailViewProps) {
  const { whatsapp } = useTiendaSettings();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTalla, setSelectedTalla] = useState<string | undefined>(
    producto.tallasDisponibles?.[0]
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    producto.coloresDisponibles?.[0]?.nombre
  );
  const [cantidad, setCantidad] = useState(1);
  const [activeTab, setActiveTab] = useState<'descripcion' | 'ficha' | 'tallas' | 'resenas'>('descripcion');
  const [isZoomed, setIsZoomed] = useState(false);

  // Analítica: view_item al cargar la ficha
  useEffect(() => {
    trackViewItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoriaNombre,
      marca: producto.marcaNombre,
    });
  }, [producto]);

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(producto, cantidad, selectedTalla, selectedColor);
    trackAddToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
      variante: [selectedTalla, selectedColor].filter(Boolean).join(' - ') || undefined,
      categoria: producto.categoriaNombre,
    });
  };

  const tieneOferta =
    (producto.precioOriginal && producto.precioOriginal > producto.precio) ||
    (producto.descuentoPorcentaje && producto.descuentoPorcentaje > 0);
  const porcentaje =
    producto.descuentoPorcentaje ||
    (producto.precioOriginal
      ? Math.round(((producto.precioOriginal - producto.precio) / producto.precioOriginal) * 100)
      : 0);

  const imagenes = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes
    : ['/images/products/prod_1.png'];

  const whatsappProductoUrl = `${whatsapp.url}?text=${encodeURIComponent(
    `Hola Iori Biker Shop, deseo cotizar el producto: ${producto.nombre} (SKU: ${producto.sku || producto.id})`
  )}`;

  return (
    <div className="section-py bg-white">
      <div className="container-iori">
        {/* 1. Breadcrumb oficial */}
        <nav aria-label="Breadcrumb" className="mb-6">
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
            {producto.categoriaSlug && (
              <>
                <li><ChevronRight className="w-3.5 h-3.5 text-zinc-400" /></li>
                <li>
                  <Link
                    href={`/categoria/${producto.categoriaSlug}`}
                    className="hover:text-black transition-colors"
                  >
                    {producto.categoriaNombre || 'Categoría'}
                  </Link>
                </li>
              </>
            )}
            <li><ChevronRight className="w-3.5 h-3.5 text-zinc-400" /></li>
            <li className="text-zinc-900 font-bold truncate max-w-xs" aria-current="page">
              {producto.nombre}
            </li>
          </ol>
        </nav>

        {/* 2. Sección Principal: Galería 1:1 a la izq, Info a la der */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-16">
          {/* COLUMNA IZQUIERDA: Galería 1:1 */}
          <div className="space-y-4">
            <div
              className="relative aspect-square w-full bg-white border border-zinc-200 rounded-[4px] p-6 flex items-center justify-center overflow-hidden cursor-crosshair"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {/* Badge de oferta o nuevo si aplica */}
              {tieneOferta && porcentaje > 0 ? (
                <div className="absolute top-3 left-3 z-10">
                  <span className="badge-offer">-{porcentaje}%</span>
                </div>
              ) : producto.esNuevo ? (
                <div className="absolute top-3 left-3 z-10">
                  <span className="badge-new">Nuevo</span>
                </div>
              ) : null}

              <div
                className={`relative w-full h-full transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
              >
                <Image
                  src={imagenes[selectedImage] || imagenes[0]}
                  alt={producto.nombre}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-2"
                />
              </div>

              <span className="absolute bottom-2 right-2 text-[10px] text-zinc-400 uppercase tracking-widest bg-white/80 px-1.5 py-0.5 rounded-[2px] pointer-events-none">
                {isZoomed ? 'Click para alejar' : 'Click para zoom'}
              </span>
            </div>

            {/* Miniaturas 1:1 */}
            {imagenes.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {imagenes.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(idx);
                      setIsZoomed(false);
                    }}
                    className={`relative w-20 h-20 aspect-square rounded-[4px] overflow-hidden border p-1 bg-white shrink-0 transition-all cursor-pointer ${
                      selectedImage === idx
                        ? 'border-zinc-950 ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${producto.nombre} - miniatura ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Información, Precio, aCuotaz y Selectores */}
          <div className="space-y-5">
            {/* Marca y SKU */}
            <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
              <span className="text-12 font-medium uppercase tracking-wider text-zinc-500">
                {producto.marcaNombre || 'IORI BIKER SHOP'}
              </span>
              {producto.sku && (
                <span className="text-12 text-zinc-400 font-mono">
                  SKU: {producto.sku}
                </span>
              )}
            </div>

            {/* Nombre del producto (Barlow Condensed 700) */}
            <h1 className="text-24 sm:text-32 font-heading font-bold uppercase tracking-tight text-zinc-950 leading-tight">
              {producto.nombre}
            </h1>

            {/* Calificación por estrellas */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-12 text-zinc-500 font-medium">(5.0) • Verificado</span>
            </div>

            {/* Precio: Normal, Oferta, Tachado y % de Ahorro */}
            <div className="pt-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className={`text-32 font-heading font-bold tracking-tight ${
                    tieneOferta ? 'text-[#F58220]' : 'text-zinc-950'
                  }`}
                >
                  {formatPEN(producto.precio)}
                </span>
                {tieneOferta && producto.precioOriginal && (
                  <>
                    <del className="text-16 text-zinc-400 font-normal">
                      {formatPEN(producto.precioOriginal)}
                    </del>
                    <span className="text-12 font-heading font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-[2px]">
                      Ahorras {formatPEN(producto.precioOriginal - producto.precio)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Widget Oficial de aCuotaz justo debajo del precio */}
            <ACuotazWidget amount={producto.precio} variant="product" />

            {/* Selector de Talla con botones */}
            {producto.tallasDisponibles && producto.tallasDisponibles.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-12 font-heading font-bold uppercase tracking-wider text-zinc-900">
                    Talla seleccionada: <span className="text-brand">{selectedTalla || 'Elige una talla'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tallas')}
                    className="inline-flex items-center gap-1 text-12 text-zinc-500 hover:text-black underline cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Guía de tallas</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {producto.tallasDisponibles.map((talla) => (
                    <button
                      key={talla}
                      type="button"
                      onClick={() => setSelectedTalla(talla)}
                      className={`min-w-[44px] h-10 px-3 text-12 font-heading font-bold uppercase rounded-[4px] border transition-colors cursor-pointer ${
                        selectedTalla === talla
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Color con muestras */}
            {producto.coloresDisponibles && producto.coloresDisponibles.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-12 font-heading font-bold uppercase tracking-wider text-zinc-900 block">
                  Color: <span className="text-zinc-600 font-normal">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {producto.coloresDisponibles.map((color) => (
                    <button
                      key={color.nombre}
                      type="button"
                      onClick={() => setSelectedColor(color.nombre)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-12 transition-colors cursor-pointer ${
                        selectedColor === color.nombre
                          ? 'border-zinc-950 bg-zinc-50 font-bold'
                          : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.nombre}</span>
                      {selectedColor === color.nombre && (
                        <Check className="w-3.5 h-3.5 text-zinc-950" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock y Selector de Cantidad */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-zinc-300 rounded-[4px]">
                <button
                  type="button"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-3 py-2 text-zinc-600 hover:text-black hover:bg-zinc-100 transition cursor-pointer"
                  disabled={cantidad <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 text-14 font-bold text-zinc-900">{cantidad}</span>
                <button
                  type="button"
                  onClick={() => setCantidad(cantidad + 1)}
                  className="px-3 py-2 text-zinc-600 hover:text-black hover:bg-zinc-100 transition cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Indicador de stock */}
              <div>
                {producto.stock > 0 ? (
                  <span className="text-12 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-[2px] inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {producto.stock <= 5 ? `¡Solo quedan ${producto.stock} unidades!` : 'En stock para entrega inmediata'}
                  </span>
                ) : (
                  <span className="text-12 font-medium text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-[2px]">
                    Agotado temporalmente
                  </span>
                )}
              </div>
            </div>

            {/* Botones de Acción (según modo de venta) */}
            <div className="space-y-2 pt-4">
              {producto.modoVenta !== 'cotizar' ? (
                <>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={producto.stock <= 0}
                    className="btn-primary w-full py-3.5 text-16 justify-center"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Agregar al Carrito</span>
                  </button>
                  <a
                    href={whatsappProductoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline w-full py-3 text-14 justify-center"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Cotizar o Consultar por WhatsApp</span>
                  </a>
                </>
              ) : (
                <a
                  href={whatsappProductoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full py-3.5 text-16 justify-center"
                >
                  <Phone className="w-5 h-5" />
                  <span>Cotizar por WhatsApp</span>
                </a>
              )}
            </div>

            {/* Compromiso Iori Biker Shop */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-200 text-12 text-zinc-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F58220]" />
                <span>Garantía oficial y cambio de talla</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#F58220]" />
                <span>Envíos a todo el Perú (Shalom/Mavisur)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Pestañas o Acordeones: Descripción, Ficha técnica, Guía de tallas y Reseñas */}
        <div className="pt-8 border-t border-zinc-200">
          <div className="flex items-center gap-2 border-b border-zinc-200 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'descripcion', label: 'Descripción' },
                { id: 'ficha', label: 'Ficha Técnica' },
                { id: 'tallas', label: 'Guía de Tallas' },
                { id: 'resenas', label: 'Reseñas' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-14 font-heading font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#F58220] text-zinc-950'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6 text-14 text-zinc-700 leading-relaxed max-w-4xl">
            {activeTab === 'descripcion' && (
              <div className="space-y-3">
                <p>{producto.descripcionLarga || producto.descripcionCorta || 'Sin descripción detallada disponible.'}</p>
                {producto.certificacion && (
                  <p className="font-semibold text-zinc-900">
                    Certificación de seguridad: <span className="text-[#F58220]">{producto.certificacion}</span>
                  </p>
                )}
              </div>
            )}

            {activeTab === 'ficha' && (
              <div className="space-y-4">
                {producto.especificaciones && Object.keys(producto.especificaciones).length > 0 ? (
                  <div className="border border-zinc-200 rounded-[4px] overflow-hidden">
                    <table className="w-full text-12 text-left">
                      <tbody>
                        {Object.entries(producto.especificaciones).map(([key, val], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? 'bg-[#F5F5F5]' : 'bg-white'}>
                            <td className="py-2.5 px-4 font-bold text-zinc-900 w-1/3 border-b border-zinc-200">{key}</td>
                            <td className="py-2.5 px-4 text-zinc-700 border-b border-zinc-200">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-zinc-500">Especificaciones detalladas disponibles en tienda o consulta por WhatsApp.</p>
                )}
              </div>
            )}

            {activeTab === 'tallas' && (
              <div className="space-y-3 bg-[#F5F5F5] p-6 rounded-[4px] border border-zinc-200">
                <h4 className="font-heading font-bold text-16 uppercase text-zinc-950">
                  ¿Cómo medir tu cabeza para cascos?
                </h4>
                <p className="text-12 text-zinc-600">
                  Usa una cinta métrica flexible alrededor de la parte más ancha de tu cabeza (aproximadamente 2 cm por encima de las cejas).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-12 font-medium">
                  <div className="bg-white p-2 border border-zinc-200 rounded-[2px] text-center">
                    <span className="block font-bold">M</span> 57 - 58 cm
                  </div>
                  <div className="bg-white p-2 border border-zinc-200 rounded-[2px] text-center">
                    <span className="block font-bold">L</span> 59 - 60 cm
                  </div>
                  <div className="bg-white p-2 border border-zinc-200 rounded-[2px] text-center">
                    <span className="block font-bold">XL</span> 61 - 62 cm
                  </div>
                  <div className="bg-white p-2 border border-zinc-200 rounded-[2px] text-center">
                    <span className="block font-bold">XXL</span> 63 - 64 cm
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resenas' && (
              <div className="space-y-3">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-[4px]">
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="font-bold text-12 text-zinc-900">Excelente calidad y ajuste perfecto</p>
                  <p className="text-12 text-zinc-600 mt-1">
                    Compré este producto en la tienda de Independencia y la atención fue de primera. Muy recomendado.
                  </p>
                  <span className="text-[11px] text-zinc-400 mt-2 block">Carlos M. • Comprador verificado</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. 'También te puede interesar' con ProductCarousel unificado */}
        {relacionados.length > 0 && (
          <div className="pt-10 border-t border-zinc-200">
            <SectionHeader
              titulo="TAMBIÉN TE PUEDE INTERESAR"
              bajada="Equípate con accesorios y productos compatibles seleccionados para ti."
              verTodoHref="/productos"
              verTodoTexto="Ver más productos"
            />
            <ProductCarousel productos={relacionados} />
          </div>
        )}
      </div>

      {/* 5. MÓVIL: Barra fija inferior con precio y 'Agregar al carrito' */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-zinc-200 p-3 z-40 lg:hidden flex items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 uppercase font-heading font-bold">Precio</span>
          <span className={`text-18 font-heading font-bold leading-none ${tieneOferta ? 'text-[#F58220]' : 'text-zinc-950'}`}>
            {formatPEN(producto.precio)}
          </span>
        </div>

        {producto.modoVenta !== 'cotizar' ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={producto.stock <= 0}
            className="btn-primary py-2 px-5 text-14 shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        ) : (
          <a
            href={whatsappProductoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary py-2 px-5 text-14 shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span>Cotizar</span>
          </a>
        )}
      </div>
    </div>
  );
}
