import React from 'react';
import { cookies } from 'next/headers';
import { HeroMosaic } from '@/components/home/HeroMosaic';
import { FeaturesBar } from '@/components/home/FeaturesBar';
import { CategoryCardsGrid } from '@/components/home/CategoryCardsGrid';
import { PromoEspartaSection } from '@/components/home/PromoEspartaSection';
import { CategoryRowSection } from '@/components/home/CategoryRowSection';
import { GearBuilderBlock } from '@/components/home/GearBuilderBlock';
import { BrandsGrid } from '@/components/home/BrandsGrid';
import { CustomerReviews } from '@/components/home/CustomerReviews';
import { StoresSection } from '@/components/home/StoresSection';
import { SocialFeed } from '@/components/home/SocialFeed';

import { 
  getProductos, 
  getHeroSlides, 
  getHeroLateralBanners,
  getCategorias, 
  getMarcas,
  getPromoEsparta,
  getCustomerReviews,
} from '@/lib/data/supabase-data';

// Revalidación rápida cada 10 segundos
export const revalidate = 10;

interface HomePageProps {
  searchParams?: Promise<{ demo?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('iori-demo-admin')?.value === 'admin';
  const isDemo = resolvedSearchParams.demo === '1' || resolvedSearchParams.demo === 'true' || isAdmin;

  // Carga paralela de todas las fuentes de datos
  const [
    productos, 
    heroSlides, 
    heroLateralPromos, 
    categorias, 
    marcas, 
    promoEsparta, 
    customerReviews
  ] = await Promise.all([
    getProductos(isDemo),
    getHeroSlides(),
    getHeroLateralBanners(),
    getCategorias(),
    getMarcas(),
    getPromoEsparta(),
    getCustomerReviews(),
  ]);

  // 4. Filtrado para Cascos (+200 modelos)
  const categoriaCascos = categorias.find((c) => c.slug === 'cascos');
  const productosCascos = productos.filter(
    (p) => p.categoriaSlug === 'cascos' || p.categoriaNombre?.toLowerCase().includes('casco')
  );

  // 6. Filtrado para Indumentaria
  const categoriaIndumentaria = categorias.find((c) => c.slug === 'indumentaria');
  const productosIndumentaria = productos.filter(
    (p) => p.categoriaSlug === 'indumentaria' || p.categoriaNombre?.toLowerCase().includes('indumentaria')
  );

  // 7. Filtrado para Accesorios para moto
  const categoriaAccesoriosMoto = categorias.find((c) => c.slug === 'accesorios-moto');
  const productosAccesoriosMoto = productos.filter(
    (p) => p.categoriaSlug === 'accesorios-moto' || p.categoriaNombre?.toLowerCase().includes('accesorios')
  );

  // 8. Filtrado para Nuevos Ingresos
  const nuevosIngresos = productos.filter((p) => p.esNuevo).length >= 4
    ? productos.filter((p) => p.esNuevo)
    : productos.slice(0, 8);

  return (
    <>
      {/* 1. Hero en mosaico: slider principal 2/3 (16:9 y 4:5) + promos fijas 1/3 (16:9) */}
      <HeroMosaic
        slides={heroSlides}
        lateralPromos={heroLateralPromos}
        isAdmin={isAdmin}
      />

      {/* 2. Beneficios: debajo del hero en fondo blanco con íconos naranjas */}
      <FeaturesBar />

      {/* 3. Compra por categoría: 8 categorías como tarjetas con foto (4:5) */}
      <CategoryCardsGrid
        categorias={categorias}
        productos={productos}
      />

      {/* 4. Promo Esparta destacada, si está activa */}
      {promoEsparta && (
        <PromoEspartaSection promo={promoEsparta} />
      )}

      {/* 5. Cascos: chips de subcategorías y fila de productos (solo si >= 4 productos) */}
      <CategoryRowSection
        titulo="CASCOS"
        bajada="Más de 200 modelos certificados con homologación DOT y ECE 22.06 para máxima seguridad."
        verTodoHref="/categoria/cascos"
        verTodoTexto="Ver todos los cascos"
        categoriaSlug="cascos"
        subcategorias={categoriaCascos?.subcategorias || []}
        productos={productosCascos}
        bgSubtle={false}
      />

      {/* 6. Arma tu equipo: banda oscura con foto de cuerpo entero y 5 puntos interactivos */}
      <GearBuilderBlock
        imagen="/images-v2/bloque-arma-tu-equipo.jpg"
        productos={productos}
      />

      {/* 7. Indumentaria: chips y fila de productos (solo si >= 4 productos) */}
      <CategoryRowSection
        titulo="INDUMENTARIA"
        bajada="Casacas con protecciones nivel 1 y 2, botas antitorsión e impermeables de alta resistencia."
        verTodoHref="/categoria/indumentaria"
        verTodoTexto="Ver toda la indumentaria"
        categoriaSlug="indumentaria"
        subcategorias={categoriaIndumentaria?.subcategorias || []}
        productos={productosIndumentaria}
        bgSubtle={true}
      />

      {/* 8. Accesorios para moto: chips y fila de productos (solo si >= 4 productos) */}
      <CategoryRowSection
        titulo="ACCESORIOS PARA MOTO"
        bajada="Porta celulares antivibración, manijas regulables, espejos deportivos y cajuelas reforzadas."
        verTodoHref="/categoria/accesorios-moto"
        verTodoTexto="Ver todos los accesorios"
        categoriaSlug="accesorios-moto"
        subcategorias={categoriaAccesoriosMoto?.subcategorias || []}
        productos={productosAccesoriosMoto}
        bgSubtle={false}
      />

      {/* 9. Nuevos ingresos: una fila de productos (solo si >= 4 productos) */}
      <CategoryRowSection
        titulo="NUEVOS INGRESOS"
        bajada="Lo último en ingresar a nuestras sedes de Independencia y La Victoria."
        verTodoHref="/lo-nuevo"
        verTodoTexto="Ver lanzamientos"
        productos={nuevosIngresos}
        bgSubtle={true}
      />

      {/* 10. Marcas: grilla fija de 14 logos en gris que toman color al pasar el mouse */}
      <BrandsGrid marcas={marcas} />

      {/* 11. Opiniones de clientes: solo opiniones reales cargadas del admin (oculto si vacío) */}
      <CustomerReviews reviews={customerReviews} />

      {/* 12. Visítanos: fotos reales de cada tienda (fachada e interior), mapa y cómo llegar */}
      <StoresSection />

      {/* 13. Síguenos: grilla de 6 imágenes con enlace a Instagram o TikTok (oculto si vacío) */}
      <SocialFeed />

      {/* 14. Footer: renderizado en LayoutShell */}
    </>
  );
}
