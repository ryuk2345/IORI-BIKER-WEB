import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { Categoria, Producto } from '@/types';

interface CategoryCardsGridProps {
  categorias?: Categoria[];
  productos?: Producto[];
}

export function CategoryCardsGrid({ categorias = [], productos = [] }: CategoryCardsGridProps) {
  // Si no hay categorías en la base de datos, no renderizar sección vacía
  if (!categorias || categorias.length === 0) {
    return null;
  }

  const listaCategorias = categorias.slice(0, 8);

  return (
    <section className="section-py bg-white">
      <div className="container-iori">
        <SectionHeader
          titulo="COMPRA POR CATEGORÍA"
          bajada="Equípate con los mejores accesorios e indumentaria certificada para tu moto."
          verTodoHref="/productos"
          verTodoTexto="Ver catálogo completo"
        />

        {/* Grilla: 4 x 2 en desktop, 2 x 4 en móvil con proporción 4:5 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {listaCategorias.map((cat) => {
            const count = productos.filter(
              (p) => p.categoriaSlug === cat.slug || p.categoriaNombre?.toLowerCase().includes(cat.nombre.toLowerCase())
            ).length;

            return (
              <CategoryTile 
                key={cat.id} 
                categoria={cat} 
                totalProductos={count > 0 ? count : undefined} 
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
