'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Store, 
  CreditCard, 
  Truck, 
  Percent, 
  Layers, 
  FileSpreadsheet, 
  Camera, 
  ImageIcon, 
  Flame, 
  FileText, 
  Users, 
  Globe2,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  Package
} from 'lucide-react';
import { formatPEN } from '@/utils/currency';
import { ADMIN_ROUTES } from '@/lib/routes/admin-routes';

interface AdminDashboardHomeProps {
  products?: any[];
  categories?: any[];
  brands?: any[];
  banners?: any[];
  settings?: Record<string, any>;
  shipping?: any[];
  promos?: any[];
  coupons?: any[];
  teamMembers?: any[];
  invitedStaffCount?: number;
  inboxCounts?: Record<string, number>;
  onNavigateTab?: (tabId: string) => void;
}

export function AdminDashboardHome({
  products = [],
  categories = [],
  brands = [],
  banners = [],
  settings = {},
  shipping = [],
  promos = [],
  coupons = [],
  teamMembers = [],
  invitedStaffCount = 0,
  inboxCounts = {},
  onNavigateTab,
}: AdminDashboardHomeProps) {
  // Productos agotados o con stock bajo
  const outOfStockProducts = products.filter((p) => (p.stock || 0) <= 0);
  const lowStockProducts = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 3);

  // 12 Pasos de Configuración y Puesta en Marcha
  const isTiendaEnPreparacion = settings?.tienda_en_preparacion?.activo !== false;

  // Cálculo detallado de marcas con logo
  const totalBrands = brands.length;
  const brandsWithLogo = brands.filter((b: any) => Boolean(b.logo)).length;
  const allBrandsHaveLogo = totalBrands > 0 && brandsWithLogo === totalBrands;

  // Cálculo de productos con fotos
  const productsWithPhotos = products.filter((p: any) => {
    const imgs = p.producto_imagenes || p.imagenes || [];
    return imgs.length > 0;
  }).length;
  const allProductsHavePhotos = products.length > 0 && productsWithPhotos === products.length;

  // Banners válidos con versión desktop y móvil
  const hasActiveHeroBanner = banners.some((b: any) => 
    b.ubicacion === 'hero' && b.activo && (b.imagen_url || b.imagen_desktop)
  );

  // Promo Esparta configurada o marcada "No aplica"
  const promoEspartaNoAplica = Boolean(settings?.promo_esparta?.no_aplica);
  const promoEspartaConfigurada = promoEspartaNoAplica || promos.some((p: any) => 
    p.activo && (Number(p.precio_combo) > 0 || Number(p.valor) > 0)
  );

  // aCuotaz configurado comercialmente o desactivado intencionalmente
  const acuotazConfigurado = (
    settings?.acuotaz?.activo === false || 
    (settings?.acuotaz?.activo && !settings?.acuotaz?.esDemo && Number(settings?.acuotaz?.factor) > 0 && Number(settings?.acuotaz?.numeroCuotas) > 0) ||
    Boolean(settings?.acuotaz_config?.activo && !settings?.acuotaz_config?.esDemo)
  );

  // Políticas revisadas por el cliente
  const politicasRevisadas = Boolean(settings?.politicas_faqs_revisadas?.completado);

  const checklistItems = [
    {
      id: 1,
      titulo: '1. Datos del negocio',
      descripcion: 'Razón social, RUC, dirección fiscal y WhatsApp oficial de ventas.',
      icono: Store,
      completado: Boolean(settings?.empresa?.razon_social && settings?.empresa?.ruc && settings?.empresa?.whatsapp),
      href: ADMIN_ROUTES.AJUSTES_EMPRESA,
    },
    {
      id: 2,
      titulo: '2. Cuentas bancarias y medios de pago',
      descripcion: 'Cuentas BCP, BBVA, Interbank, Yape y Plin para los mensajes de confirmación.',
      icono: CreditCard,
      completado: (Array.isArray(settings?.datos_pago_plantillas?.bancos) && settings.datos_pago_plantillas.bancos.length > 0) || Boolean(settings?.datos_pago_plantillas?.numero_yape_plin),
      href: ADMIN_ROUTES.AJUSTES_PAGOS,
    },
    {
      id: 3,
      titulo: '3. Tarifas de despacho y envío',
      descripcion: 'Tarifas de delivery para Lima Metropolitana y provincias (Shalom/Mavisur).',
      icono: Truck,
      completado: (Array.isArray(shipping) && shipping.length > 0) || Boolean(settings?.envios_personalizados?.activo),
      href: ADMIN_ROUTES.AJUSTES_ENVIOS,
    },
    {
      id: 4,
      titulo: '4. Parámetros de aCuotaz',
      descripcion: 'Número de cuotas y factor quincenal obtenido del simulador comercial.',
      icono: Percent,
      completado: Boolean(acuotazConfigurado),
      href: ADMIN_ROUTES.AJUSTES_ACUOTAZ,
    },
    {
      id: 5,
      titulo: '5. Logos de marcas oficiales',
      descripcion: totalBrands > 0
        ? `Subir logotipos en PNG/SVG para las marcas (${brandsWithLogo}/${totalBrands} cargados).`
        : 'Subir logotipos en PNG/SVG para las marcas del catálogo.',
      icono: Layers,
      completado: Boolean(allBrandsHaveLogo),
      href: ADMIN_ROUTES.CATALOGO_MARCAS_SIN_LOGO,
    },
    {
      id: 6,
      titulo: '6. Catálogo de productos (Excel)',
      descripcion: products.length > 0
        ? `${products.length} producto(s) activos en el catálogo de la tienda.`
        : 'Importar la plantilla Excel con nombres, precios, SKUs, categorías y variantes.',
      icono: FileSpreadsheet,
      completado: Array.isArray(products) && products.length > 0,
      href: ADMIN_ROUTES.PRODUCTOS,
    },
    {
      id: 7,
      titulo: '7. Fotografías de productos',
      descripcion: products.length > 0
        ? `Fotos cuadradas 1:1 asignadas (${productsWithPhotos}/${products.length} con imagen).`
        : 'Subir fotos cuadradas 1:1 o carga masiva por SKU (SKU_1.jpg, SKU_2.jpg).',
      icono: Camera,
      completado: Boolean(allProductsHavePhotos),
      href: ADMIN_ROUTES.PRODUCTOS,
    },
    {
      id: 8,
      titulo: '8. Banners de portada (Hero Slider)',
      descripcion: 'Subir banners para escritorio (1920x820 o 21:9) y móvil (1080x1350 o 4:5).',
      icono: ImageIcon,
      completado: Boolean(hasActiveHeroBanner),
      href: ADMIN_ROUTES.BANNERS,
    },
    {
      id: 9,
      titulo: '9. Promoción Combo Esparta',
      descripcion: promoEspartaNoAplica 
        ? 'Marcada como "No aplica" por el cliente.' 
        : 'Configurar los 2 cascos del combo promocional y su precio especial.',
      icono: Flame,
      completado: Boolean(promoEspartaConfigurada),
      href: ADMIN_ROUTES.PROMOCIONES_ESPARTA,
    },
    {
      id: 10,
      titulo: '10. Políticas y preguntas frecuentes',
      descripcion: politicasRevisadas
        ? 'Términos, política de privacidad y cambios marcados como revisados.'
        : 'Revisar y marcar conformidad de términos, privacidad y preguntas frecuentes.',
      icono: FileText,
      completado: Boolean(politicasRevisadas),
      href: ADMIN_ROUTES.CONTENIDO_POLITICAS,
    },
    {
      id: 11,
      titulo: '11. Invitaciones al equipo',
      descripcion: invitedStaffCount > 0
        ? `${invitedStaffCount} invitación(es) enviada(s) a colaboradores del equipo.`
        : 'Asignar roles de administrador y asesor de atención por email.',
      icono: Users,
      completado: Boolean(invitedStaffCount > 0),
      href: ADMIN_ROUTES.AJUSTES_EQUIPO,
    },
    {
      id: 12,
      titulo: '12. Publicar tienda online',
      descripcion: !isTiendaEnPreparacion
        ? 'Tienda pública en línea recibiendo visitas y pedidos.'
        : 'Desactivar el modo "Tienda en preparación" para abrir al público.',
      icono: Globe2,
      completado: !isTiendaEnPreparacion,
      href: ADMIN_ROUTES.AJUSTES_PUBLICACION,
    },
  ];

  const pasosCompletados = checklistItems.filter((i) => i.completado).length;
  const porcentajeAvance = Math.round((pasosCompletados / checklistItems.length) * 100);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-22 sm:text-26 uppercase tracking-wider text-zinc-900 flex items-center gap-2.5">
            <span>Inicio • Resumen General</span>
            {isTiendaEnPreparacion && (
              <span className="text-[11px] font-bold font-sans bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full normal-case">
                En Preparación
              </span>
            )}
          </h1>
          <p className="text-12 text-zinc-500 font-medium">
            Métricas clave del día, checklist de puesta en marcha e incidencias operativas.
          </p>
        </div>

        {isTiendaEnPreparacion && (
          <Link
            href={ADMIN_ROUTES.AJUSTES_PUBLICACION}
            className="self-start sm:self-auto px-3.5 py-1.5 bg-[#F58220] hover:bg-[#e07116] text-white text-12 font-heading font-bold uppercase rounded-[4px] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Configurar lanzamiento</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* CHECKLIST DE PUESTA EN MARCHA (12 PASOS) */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-100 text-[#F58220]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="font-heading font-bold text-16 uppercase tracking-wider text-zinc-900">
                  Guía de Carga Inicial y Puesta en Marcha
                </h2>
              </div>
              <p className="text-12 text-zinc-500 mt-1">
                Completa estos 12 pasos para dejar la tienda 100% operativa antes de recibir clientes.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="font-heading font-black text-18 text-zinc-900">
                  {pasosCompletados}/12
                </span>
                <span className="text-11 text-zinc-500 block">
                  {porcentajeAvance}% completado
                </span>
              </div>
              <div className="w-24 sm:w-32 bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#F58220] h-full transition-all duration-500"
                  style={{ width: `${porcentajeAvance}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grilla interactiva de los 12 pasos: Cada tarjeta es 100% clicable a su ruta tipada */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {checklistItems.map((item) => {
            const Icon = item.icono;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between group ${
                  item.completado
                    ? 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300'
                    : 'bg-white border-zinc-200 hover:border-[#F58220] hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-[4px] ${
                        item.completado ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-[#F58220]'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-12 font-heading font-bold uppercase tracking-wide ${
                        item.completado ? 'text-zinc-600' : 'text-zinc-900'
                      }`}>
                        {item.titulo}
                      </span>
                    </div>

                    {item.completado ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[2px] shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Listo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-[2px] shrink-0">
                        <Circle className="w-3 h-3 text-amber-500" />
                        Pendiente
                      </span>
                    )}
                  </div>

                  <p className="text-11 text-zinc-500 mt-2 line-clamp-2">
                    {item.descripcion}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-medium">
                    {item.completado ? 'Configurado' : 'Pendiente'}
                  </span>
                  <span className="font-bold text-[#F58220] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    {item.completado ? 'Revisar' : 'Completar'} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4 Indicadores Oficiales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Indicador 1: Pedidos Nuevos */}
        <Link 
          href={ADMIN_ROUTES.PEDIDOS}
          className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-2xs hover:border-[#F58220] transition-colors cursor-pointer group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-11 font-bold text-zinc-500 uppercase tracking-wider">
              Pedidos Nuevos
            </span>
            <div className="p-2 rounded-lg bg-orange-50 text-[#F58220]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-black text-28 text-zinc-900">
              {inboxCounts.pedidos || 0}
            </span>
            <span className="text-11 text-zinc-500 font-medium">
              Por validar WhatsApp
            </span>
          </div>
        </Link>

        {/* Indicador 2: Pedidos por cobrar */}
        <Link 
          href={ADMIN_ROUTES.PEDIDOS}
          className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-2xs hover:border-[#F58220] transition-colors cursor-pointer group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-11 font-bold text-zinc-500 uppercase tracking-wider">
              Por Cobrar / Espera
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-black text-28 text-zinc-900">
              0
            </span>
            <span className="text-11 text-zinc-500 font-medium">
              Esperando comprobante
            </span>
          </div>
        </Link>

        {/* Indicador 3: Vendido Hoy */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-11 font-bold text-zinc-500 uppercase tracking-wider">
              Vendido Hoy
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-black text-24 sm:text-28 text-emerald-600">
              {formatPEN(0)}
            </span>
            <span className="text-11 text-zinc-400 font-medium">
              / En preparación
            </span>
          </div>
        </div>

        {/* Indicador 4: Productos Agotados */}
        <Link 
          href={ADMIN_ROUTES.PRODUCTOS}
          className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-2xs hover:border-red-300 transition-colors cursor-pointer group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-11 font-bold text-zinc-500 uppercase tracking-wider">
              Productos Agotados
            </span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-black text-28 text-zinc-900">
              {outOfStockProducts.length}
            </span>
            <span className="text-11 text-zinc-500 font-medium">
              Sin existencias
            </span>
          </div>
        </Link>
      </div>

      {/* Lista "Requiere Atención" */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              lowStockProducts.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`} />
            <h2 className="font-heading font-bold text-16 uppercase tracking-wider text-zinc-900">
              Atención Operativa
            </h2>
          </div>
          <span className="text-12 font-medium text-zinc-500">
            {lowStockProducts.length > 0 ? `${lowStockProducts.length} alertas activas` : 'Sin incidencias'}
          </span>
        </div>

        <div className="divide-y divide-zinc-100 text-13">
          {lowStockProducts.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 space-y-1">
              <p className="font-medium text-13 text-zinc-700">
                Todo al día. No hay incidencias pendientes ni pedidos sin atender.
              </p>
              <p className="text-11 text-zinc-400">
                Los nuevos pedidos y solicitudes de clientes aparecerán automáticamente aquí.
              </p>
            </div>
          ) : (
            <div className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F58220] flex items-center justify-center font-bold text-11">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-zinc-900 block">
                    {lowStockProducts.length} producto(s) con stock bajo (3 unidades o menos)
                  </span>
                  <span className="text-11 text-zinc-500">
                    {lowStockProducts.slice(0, 2).map((p) => p.nombre).join(', ')}...
                  </span>
                </div>
              </div>
              <Link
                href={ADMIN_ROUTES.PRODUCTOS}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-12 font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
              >
                <span>Reponer stock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
