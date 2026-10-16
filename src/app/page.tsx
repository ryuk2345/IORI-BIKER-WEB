import React from 'react';
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
  getAjustesTienda,
} from '@/lib/data/supabase-data';

// Revalidación rápida cada 10 segundos
export const revalidate = 10;

export default async function HomePage() {
  // Carga paralela de todas las fuentes de datos reales desde Supabase
  const [
    productos, 
    heroSlides, 
    heroLateralPromos, 
    categorias, 
    marcas, 
    promoEsparta, 
    customerReviews,
    ajustes,
  ] = await Promise.all([
    getProductos(),
    getHeroSlides(),
    getHeroLateralBanners(),
    getCategorias(),
    getMarcas(),
    getPromoEsparta(),
    getCustomerReviews(),
    getAjustesTienda(),
  ]);

  // Filtrado para Cascos
  const categoriaCascos = categorias.find((c) => c.slug === 'cascos');
  const productosCascos = productos.filter(
    (p) => p.categoriaSlug === 'cascos' || p.categoriaNombre?.toLowerCase().includes('casco')
  );

  // Filtrado para Indumentaria
  const categoriaIndumentaria = categorias.find((c) => c.slug === 'indumentaria');
  const productosIndumentaria = productos.filter(
    (p) => p.categoriaSlug === 'indumentaria' || p.categoriaNombre?.toLowerCase().includes('indumentaria')
  );

  // Filtrado para Accesorios para moto
  const categoriaAccesoriosMoto = categorias.find((c) => c.slug === 'accesorios-moto');
  const productosAccesoriosMoto = productos.filter(
    (p) => p.categoriaSlug === 'accesorios-moto' || p.categoriaNombre?.toLowerCase().includes('accesorios')
  );

  // Filtrado para Nuevos Ingresos
  const nuevosIngresos = productos.filter((p) => p.esNuevo).length >= 4
    ? productos.filter((p) => p.esNuevo)
    : productos.slice(0, 8);

  return (
    <>
      {/* 1. Hero en mosaico: slider principal 2/3 + promos fijas 1/3 */}
      <HeroMosaic
        slides={heroSlides}
        lateralPromos={heroLateralPromos}
        isAdmin={false}
      />

      {/* 2. Beneficios: debajo del hero en fondo blanco con íconos naranjas */}
      <FeaturesBar />

      {/* 3. Compra por categoría: categorías reales como tarjetas con foto (4:5) */}
      <CategoryCardsGrid
        categorias={categorias}
        productos={productos}
      />

      {/* 4. Promo Esparta destacada: solo si está activa en la base de datos y vigente */}
      {promoEsparta && (
        <PromoEspartaSection promo={promoEsparta} />
      )}

      {/* 5. Cascos: bajada sale de categoria.descripcion en Supabase (oculta si vacía) */}
      <CategoryRowSection
        titulo="CASCOS"
        bajada={categoriaCascos?.descripcion || undefined}
        verTodoHref="/categoria/cascos"
        verTodoTexto="Ver todos los cascos"
        categoriaSlug="cascos"
        subcategorias={categoriaCascos?.subcategorias || []}
        productos={productosCascos}
        bgSubtle={false}
      />

      {/* 6. Arma tu equipo: foto de cuerpo entero y puntos interactivos (oculto si 0 productos) */}
      <GearBuilderBlock
        imagen="/images-v2/bloque-arma-tu-equipo.jpg"
        productos={productos}
      />

      {/* 7. Indumentaria: bajada de la categoría en Supabase */}
      <CategoryRowSection
        titulo="INDUMENTARIA"
        bajada={categoriaIndumentaria?.descripcion || undefined}
        verTodoHref="/categoria/indumentaria"
        verTodoTexto="Ver toda la indumentaria"
        categoriaSlug="indumentaria"
        subcategorias={categoriaIndumentaria?.subcategorias || []}
        productos={productosIndumentaria}
        bgSubtle={true}
      />

      {/* 8. Accesorios para moto: bajada de la categoría en Supabase */}
      <CategoryRowSection
        titulo="ACCESORIOS PARA MOTO"
        bajada={categoriaAccesoriosMoto?.descripcion || undefined}
        verTodoHref="/categoria/accesorios-moto"
        verTodoTexto="Ver todos los accesorios"
        categoriaSlug="accesorios-moto"
        subcategorias={categoriaAccesoriosMoto?.subcategorias || []}
        productos={productosAccesoriosMoto}
        bgSubtle={false}
      />

      {/* 9. Nuevos ingresos: solo si >= 4 productos */}
      <CategoryRowSection
        titulo="NUEVOS INGRESOS"
        bajada={undefined}
        verTodoHref="/lo-nuevo"
        verTodoTexto="Ver lanzamientos"
        productos={nuevosIngresos}
        bgSubtle={true}
      />

      {/* 10. Marcas: grilla de marcas oficiales (oculto si vacío) */}
      <BrandsGrid marcas={marcas} />

      {/* 11. Opiniones de clientes: solo opiniones reales desde Supabase (oculto si vacío) */}
      <CustomerReviews reviews={customerReviews} />

      {/* 12. Visítanos: sedes leídas de ajustes_generales en Supabase (oculto si vacío) */}
      <StoresSection tiendas={ajustes.tiendasFisicas} />

      {/* 13. Síguenos: enlaces leídos de ajustes_generales en Supabase (oculto si vacío) */}
      <SocialFeed redes={ajustes.redes} />
    </>
  );
}
