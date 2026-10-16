import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const BASE_URL = 'https://ioribikershop.pe';

export const revalidate = 3600; // Revalida cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/marcas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/financiamiento`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/preguntas-frecuentes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/trabaja-con-nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/libro-de-reclamaciones`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/politicas/terminos-y-condiciones`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/politicas/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/politicas/envios-y-devoluciones`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/politicas/garantias`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    const supabase = createAdminClient();

    // 1. Productos activos
    const { data: productos } = await supabase
      .from('productos')
      .select('slug, updated_at, created_at')
      .eq('activo', true);

    if (productos && productos.length > 0) {
      productos.forEach((p) => {
        if (p.slug) {
          routes.push({
            url: `${BASE_URL}/producto/${p.slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : new Date(p.created_at || Date.now()),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      });
    }

    // 2. Categorías
    const { data: categorias } = await supabase
      .from('categorias')
      .select('slug, updated_at');

    if (categorias && categorias.length > 0) {
      categorias.forEach((c) => {
        if (c.slug) {
          routes.push({
            url: `${BASE_URL}/categoria/${c.slug}`,
            lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }

    // 3. Marcas
    const { data: marcas } = await supabase
      .from('marcas')
      .select('slug, updated_at');

    if (marcas && marcas.length > 0) {
      marcas.forEach((m) => {
        if (m.slug) {
          routes.push({
            url: `${BASE_URL}/marca/${m.slug}`,
            lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }

    // 4. Artículos de Blog publicados
    const { data: articulos } = await supabase
      .from('blog')
      .select('slug, updated_at, created_at')
      .eq('publicado', true);

    if (articulos && articulos.length > 0) {
      articulos.forEach((b) => {
        if (b.slug) {
          routes.push({
            url: `${BASE_URL}/blog/${b.slug}`,
            lastModified: b.updated_at ? new Date(b.updated_at) : new Date(b.created_at || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error generando sitemap dinámico:', error);
  }

  return routes;
}
