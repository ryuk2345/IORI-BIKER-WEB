import { createClient } from '@/lib/supabase/server';
import { Producto, Categoria, Marca, HeroSlide, DestacadoCard, PromoEspecial } from '@/types';
import { 
  PRODUCTOS as MOCK_PRODUCTOS, 
  CATEGORIAS as MOCK_CATEGORIAS, 
  MARCAS as MOCK_MARCAS
} from '@/data/mock';

/**
 * Obtener todos los productos activos desde Supabase
 * Con fallback transparente a mock si no hay conexión
 */
function isDynamicServerError(err: any): boolean {
  return (
    err?.digest === 'DYNAMIC_SERVER_USAGE' ||
    Boolean(err?.message && String(err.message).includes('Dynamic server usage'))
  );
}

export async function getProductos(allowMockFallback: boolean = false): Promise<Producto[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_variantes (*),
        producto_imagenes (*)
      `)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener productos desde Supabase:', error);
      return allowMockFallback ? MOCK_PRODUCTOS : [];
    }

    if (!data || data.length === 0) {
      return allowMockFallback ? MOCK_PRODUCTOS : [];
    }

    return data.map((p) => {
      // Extraer tallas y colores desde variantes si existen
      const variantes = p.producto_variantes || [];
      const tallas = Array.from(new Set(variantes.map((v: any) => v.talla).filter(Boolean))) as string[];
      const coloresMap = new Map();
      variantes.forEach((v: any) => {
        if (v.color && !coloresMap.has(v.color)) {
          coloresMap.set(v.color, { nombre: v.color, hex: v.color_hex || '#000000' });
        }
      });
      const colores = Array.from(coloresMap.values());

      // Extraer imágenes
      const imagenesDb = (p.producto_imagenes || [])
        .sort((a: any, b: any) => a.orden - b.orden)
        .map((img: any) => img.url);
      const imagenes = imagenesDb.length > 0 ? imagenesDb : [];

      const precio = Number(p.precio) || 0;
      const precioOriginal = p.precio_original ? Number(p.precio_original) : undefined;
      const precioOferta = p.precio_oferta ? Number(p.precio_oferta) : undefined;

      return {
        id: p.id,
        nombre: p.nombre,
        slug: p.slug,
        categoriaSlug: p.categoria_slug,
        subcategoriaSlug: p.subcategoria_slug,
        categoriaNombre: p.categoria_nombre,
        subcategoriaNombre: p.subcategoria_nombre,
        marcaId: p.marca_id,
        marcaNombre: p.marca_nombre,
        precio: precioOferta && precioOferta < precio ? precioOferta : precio,
        precioOriginal: precioOriginal || (precioOferta && precioOferta < precio ? precio : undefined),
        descuentoPorcentaje: p.descuento_porcentaje || (precioOriginal ? Math.round(((precioOriginal - precio) / precioOriginal) * 100) : undefined),
        esOferta: Boolean(p.es_oferta || (precioOferta && precioOferta < precio)),
        esNuevo: Boolean(p.es_nuevo),
        esCombo: Boolean(p.es_combo),
        modoVenta: p.modo_venta || 'online',
        imagenes,
        descripcionCorta: p.descripcion_corta || '',
        descripcionLarga: p.descripcion_larga || '',
        sku: p.sku || '',
        tallasDisponibles: tallas.length > 0 ? tallas : (p.tallas || []),
        coloresDisponibles: colores.length > 0 ? colores : (p.colores || []),
        certificacion: p.certificacion || undefined,
        stock: p.stock || 0,
        especificaciones: p.ficha_tecnica || p.especificaciones || {},
      };
    });
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener productos desde Supabase:', err);
    return [];
  }
}

/**
 * Obtener un producto por su slug
 */
export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const productos = await getProductos();
  return productos.find((p) => p.slug === slug) || null;
}

/**
 * Obtener categorías activas y sus subcategorías
 */
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const supabase = await createClient();
    const { data: cats, error: catErr } = await supabase
      .from('categorias')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    const { data: subcats } = await supabase
      .from('subcategorias')
      .select('*')
      .order('orden', { ascending: true });

    if (catErr || !cats || cats.length === 0) {
      return MOCK_CATEGORIAS;
    }

    return cats.map((cat) => {
      const subs = (subcats || [])
        .filter((s: any) => s.categoria_id === cat.id)
        .map((s: any) => ({
          id: s.id,
          nombre: s.nombre,
          slug: s.slug,
        }));

      return {
        id: cat.id,
        nombre: cat.nombre,
        slug: cat.slug,
        columna: cat.columna as 'piloto' | 'moto' | 'general',
        imagen: cat.imagen || '/images/categories/cat_1.png',
        descripcion: cat.descripcion || '',
        subcategorias: subs,
      };
    });
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener categorías desde Supabase:', err);
    return MOCK_CATEGORIAS;
  }
}

/**
 * Obtener las 14 marcas oficiales activas
 */
export async function getMarcas(): Promise<Marca[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('marcas')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_MARCAS.map((m) => ({ ...m, logo: undefined }));
    }

    return data.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      slug: m.slug,
      logo: m.logo || undefined,
      destacada: Boolean(m.destacada),
    }));
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener marcas desde Supabase:', err);
    return MOCK_MARCAS.map((m) => ({ ...m, logo: undefined }));
  }
}

/**
 * Obtener los banners del Hero Slider
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('ubicacion', 'hero')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    // Hora actual en zona horaria de Lima (America/Lima, UTC-5)
    const nowIsoLima = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })).getTime();

    // Filtrar banners con imagen válida y vigentes según fecha de Lima
    const validSlides = data.filter((b) => {
      // Requerir al menos imagen_desktop
      if (!b.imagen_desktop || b.imagen_desktop.trim() === '') return false;

      // Validación de fecha inicio
      if (b.fecha_inicio) {
        const tInicio = new Date(b.fecha_inicio).getTime();
        if (!isNaN(tInicio) && nowIsoLima < tInicio) {
          return false;
        }
      }

      // Validación de fecha fin
      if (b.fecha_fin) {
        const tFin = new Date(b.fecha_fin).getTime();
        if (!isNaN(tFin) && nowIsoLima > tFin) {
          return false;
        }
      }

      return true;
    });

    return validSlides.map((b) => ({
      id: b.id,
      titulo: b.titulo || '',
      subtitulo: b.subtitulo || undefined,
      textoBoton: b.texto_boton || 'Ver Más',
      enlace: b.enlace || '/productos',
      imagenDesktop: b.imagen_desktop,
      imagenMobile: b.imagen_mobile || b.imagen_desktop, // Fallback si falta versión móvil
      badge: b.badge || undefined,
    }));
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener hero slides:', err);
    return [];
  }
}

/**
 * Obtener las 3 cards destacadas
 */
export async function getDestacadosCards(): Promise<DestacadoCard[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('ubicacion', 'destacado')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((d) => ({
      id: d.id,
      tag: d.badge || 'DESTACADO',
      titulo: d.titulo || '',
      descripcion: d.subtitulo || '',
      imagen: d.imagen_desktop,
      enlace: d.enlace || '/productos',
    }));
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener destacados cards:', err);
    return [];
  }
}

/**
 * Obtener las 2 promos laterales fijas del Hero Mosaico
 */
export async function getHeroLateralBanners(): Promise<any[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .in('ubicacion', ['mediano', 'hero_lateral'])
      .eq('activo', true)
      .order('orden', { ascending: true })
      .limit(2);

    if (error || !data || data.length === 0) {
      // Fallback a los 2 banners con las fotos oficiales v2
      return [
        {
          id: 'lateral-1',
          titulo: 'CASCOS CERTIFICADOS ECE',
          subtitulo: 'Homologación de alta velocidad y visor nocturno',
          badge: 'NOVEDAD',
          imagenDesktop: '/images-v2/hero-lateral-1.jpg',
          enlace: '/categoria/cascos',
          textoBoton: 'Ver modelos',
        },
        {
          id: 'lateral-2',
          titulo: 'COMBOS PILOTO & COPILOTO',
          subtitulo: 'Arma tu equipamiento desde S/ 249.90',
          badge: 'DESDE S/ 249.90',
          imagenDesktop: '/images-v2/bloque-arma-tu-equipo.jpg',
          enlace: '/combos',
          textoBoton: 'Armar equipo',
        },
      ];
    }

    return data.map((b) => ({
      id: b.id,
      titulo: b.titulo || '',
      subtitulo: b.subtitulo || undefined,
      badge: b.badge || undefined,
      imagenDesktop: b.imagen_desktop,
      imagenMobile: b.imagen_mobile || b.imagen_desktop,
      enlace: b.enlace || '/productos',
      textoBoton: b.texto_boton || 'Ver oferta',
    }));
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener hero lateral banners:', err);
    return [];
  }
}

/**
 * Obtener opiniones reales de clientes aprobadas
 */
export async function getCustomerReviews(): Promise<any[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('resenas')
      .select('*')
      .eq('estado', 'aprobada')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((r) => ({
      id: r.id,
      autor: r.autor,
      calificacion: r.calificacion,
      comentario: r.comentario,
      fuente: 'Compra Verificada',
      fecha: new Date(r.created_at).toLocaleDateString('es-PE'),
    }));
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener reseñas:', err);
    return [];
  }
}

/**
 * Obtener la campaña oficial Promo Esparta
 */
export async function getPromoEsparta(): Promise<PromoEspecial | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('promociones')
      .select('*')
      .eq('slug', 'esparta')
      .eq('activo', true)
      .single();

    if (error || !data || !data.activo) {
      return null;
    }

    const productos = await getProductos();
    const productosEsparta = productos.filter((p) => p.esCombo || p.categoriaSlug === 'cascos').slice(0, 4);

    return {
      id: data.id,
      slug: data.slug,
      titulo: data.titulo,
      subtitulo: data.subtitulo || '',
      vigencia: 'Válido desde ya y durante todo Octubre 2026',
      tipo: 'Precio Rebajado en Dúo de Cascos',
      bannerDesktop: data.banner_desktop || '/images/banners/banner_wide_1.png',
      bannerMobile: data.banner_mobile || '/images/hero/hero_mobile_1.png',
      descripcion: data.descripcion || '',
      productos: productosEsparta,
    };
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener promo esparta:', err);
    return null;
  }
}
