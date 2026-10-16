import { createClient } from '@/lib/supabase/server';
import { 
  Producto, 
  Categoria, 
  Marca, 
  HeroSlide, 
  DestacadoCard, 
  PromoEspecial,
  AjustesNegocio,
  TiendaFisica
} from '@/types';

function isDynamicServerError(err: any): boolean {
  return (
    err?.digest === 'DYNAMIC_SERVER_USAGE' ||
    Boolean(err?.message && String(err.message).includes('Dynamic server usage'))
  );
}

/**
 * Obtener todos los productos activos desde Supabase.
 * Nunca usa datos mock ni fallbacks artificiales. Si la base está vacía, devuelve [].
 */
export async function getProductos(): Promise<Producto[]> {
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
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((p) => {
      const variantes = p.producto_variantes || [];
      const tallas = Array.from(new Set(variantes.map((v: any) => v.talla).filter(Boolean))) as string[];
      const coloresMap = new Map();
      variantes.forEach((v: any) => {
        if (v.color && !coloresMap.has(v.color)) {
          coloresMap.set(v.color, { nombre: v.color, hex: v.color_hex || '#000000' });
        }
      });
      const colores = Array.from(coloresMap.values());

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
 * Obtener un producto por su slug desde Supabase
 */
export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const productos = await getProductos();
  return productos.find((p) => p.slug === slug) || null;
}

/**
 * Obtener categorías activas y sus subcategorías desde Supabase
 */
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const supabase = await createClient();
    const { data: cats, error: catErr } = await supabase
      .from('categorias')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (catErr || !cats || cats.length === 0) {
      return [];
    }

    const { data: subcats } = await supabase
      .from('subcategorias')
      .select('*')
      .order('orden', { ascending: true });

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
    return [];
  }
}

/**
 * Obtener marcas activas desde Supabase
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
      return [];
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
    return [];
  }
}

/**
 * Obtener los banners del Hero Slider desde Supabase
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

    const nowIsoLima = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })).getTime();

    const validSlides = data.filter((b) => {
      if (!b.imagen_desktop || b.imagen_desktop.trim() === '') return false;

      if (b.fecha_inicio) {
        const tInicio = new Date(b.fecha_inicio).getTime();
        if (!isNaN(tInicio) && nowIsoLima < tInicio) return false;
      }

      if (b.fecha_fin) {
        const tFin = new Date(b.fecha_fin).getTime();
        if (!isNaN(tFin) && nowIsoLima > tFin) return false;
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
      imagenMobile: b.imagen_mobile || b.imagen_desktop,
      badge: b.badge || undefined,
    }));
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener hero slides:', err);
    return [];
  }
}

/**
 * Obtener las promos laterales fijas del Hero Mosaico desde Supabase
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
      return [];
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
 * Obtener opiniones reales de clientes aprobadas desde Supabase
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
 * Obtener la campaña oficial de promociones desde Supabase
 * Se oculta si no está activa o si la fecha de vigencia ya venció
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

    // Comprobar vigencia de la promoción en Lima
    if (data.fecha_fin) {
      const now = new Date().getTime();
      const fechaFin = new Date(data.fecha_fin).getTime();
      if (!isNaN(fechaFin) && now > fechaFin) {
        return null;
      }
    }

    const productos = await getProductos();
    const productosEsparta = productos.filter((p) => p.esCombo || p.categoriaSlug === 'cascos').slice(0, 4);

    return {
      id: data.id,
      slug: data.slug,
      titulo: data.titulo,
      subtitulo: data.subtitulo || '',
      vigencia: data.fecha_fin ? `Válido hasta el ${new Date(data.fecha_fin).toLocaleDateString('es-PE')}` : 'Válido por tiempo limitado',
      fechaFin: data.fecha_fin || undefined,
      tipo: 'Precio Rebajado en Dúo de Cascos',
      bannerDesktop: data.banner_desktop || '',
      bannerMobile: data.banner_mobile || '',
      descripcion: data.descripcion || '',
      productos: productosEsparta,
    };
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener promo esparta:', err);
    return null;
  }
}

/**
 * Obtener todos los ajustes del negocio desde la tabla 'ajustes_generales' en Supabase.
 * Permite que Horarios, WhatsApp, Direcciones de Tiendas y Redes sean 100% administrables.
 */
export async function getAjustesTienda(): Promise<AjustesNegocio> {
  const ajustesDefault: AjustesNegocio = {
    empresa: {
      razonSocial: 'IORI SAC',
      ruc: '20610816089',
      correo: 'ioribikershop@gmail.com',
      nombreComercial: 'IORI BIKER SHOP',
      direccionPrincipal: 'Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima',
      horarioPrincipal: 'Lunes a Sábado 9:00 am – 10:00 pm / Domingos o Feriados 11:00 am – 8:00 pm',
      telefono: '905445698',
      whatsapp: '+51 905 445 698',
    },
    whatsapp: {
      numero: '905445698',
      numeroCompleto: '+51 905 445 698',
      url: 'https://wa.me/51905445698',
    },
    tiendasFisicas: [
      {
        id: 'independencia',
        nombre: 'Sede Independencia (Principal)',
        direccion: 'Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima',
        horario: 'Lunes a Sábado 9:00 am – 10:00 pm / Domingos y Feriados 11:00 am – 8:00 pm',
        mapsUrl: 'https://maps.google.com/?q=Av.+Contisuyo+418,+Independencia,+Lima',
        telefonoWhatsApp: '+51 905 445 698',
      },
      {
        id: 'la-victoria',
        nombre: 'Sede La Victoria',
        direccion: 'Av. Nicolás Arriola 901, La Victoria, Lima',
        horario: 'Lunes a Sábado 9:00 am – 6:00 pm',
        mapsUrl: 'https://maps.google.com/?q=Av.+Nicolás+Arriola+901,+La+Victoria,+Lima',
        telefonoWhatsApp: '+51 905 445 698',
      },
    ],
    redes: {
      instagram: 'https://instagram.com/ioribikershop',
      tiktok: 'https://tiktok.com/@ioribikershop',
      facebook: 'https://facebook.com/ioribikershop',
    },
    barraSuperior: {
      texto: 'Envíos a todo el Perú • Atención personalizada por WhatsApp',
      enlace: '/contacto',
      activo: true,
    },
    tiendaEnPreparacion: {
      activo: false,
      mensaje: 'Estamos preparando nuestro nuevo catálogo digital. ¡Muy pronto disponible!',
      mostrar_tiendas: true,
      mostrar_whatsapp: true,
    },
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('ajustes_generales').select('*');

    if (error || !data || data.length === 0) {
      return ajustesDefault;
    }

    const map: Record<string, any> = {};
    data.forEach((row) => {
      map[row.clave] = row.valor;
    });

    const emp = map['empresa'] || {};
    const wsp = map['whatsapp'] || {};
    const redes = map['redes_sociales'] || {};
    const barra = map['barra_superior'] || {};
    const prep = map['tienda_en_preparacion'] || {};
    const tiendas = Array.isArray(map['tiendas_fisicas']) ? map['tiendas_fisicas'] : ajustesDefault.tiendasFisicas;

    return {
      empresa: {
        razonSocial: emp.razonSocial || emp.razon_social || ajustesDefault.empresa.razonSocial,
        ruc: emp.ruc || ajustesDefault.empresa.ruc,
        correo: emp.correo || ajustesDefault.empresa.correo,
        nombreComercial: emp.nombreComercial || emp.nombre_comercial || ajustesDefault.empresa.nombreComercial,
        direccionPrincipal: emp.direccion || emp.direccionPrincipal || ajustesDefault.empresa.direccionPrincipal,
        horarioPrincipal: emp.horario || emp.horarioPrincipal || ajustesDefault.empresa.horarioPrincipal,
        telefono: emp.telefono || ajustesDefault.empresa.telefono,
        whatsapp: emp.whatsapp || wsp.numeroCompleto || ajustesDefault.empresa.whatsapp,
      },
      whatsapp: {
        numero: wsp.numero || ajustesDefault.whatsapp.numero,
        numeroCompleto: wsp.numeroCompleto || (wsp.numero ? `+51 ${wsp.numero}` : ajustesDefault.whatsapp.numeroCompleto),
        url: wsp.url || (wsp.numero ? `https://wa.me/51${wsp.numero}` : ajustesDefault.whatsapp.url),
      },
      tiendasFisicas: tiendas.map((t: any) => ({
        id: t.id || 'tienda',
        nombre: t.nombre || '',
        direccion: t.direccion || '',
        distrito: t.distrito || '',
        ciudad: t.ciudad || 'Lima',
        referencia: t.referencia || '',
        horario: t.horario || '',
        telefonoWhatsApp: t.telefonoWhatsApp || t.telefono || wsp.numeroCompleto || '+51 905 445 698',
        mapsUrl: t.mapsUrl || t.maps_url || '',
      })),
      redes: {
        instagram: redes.instagram || ajustesDefault.redes.instagram,
        tiktok: redes.tiktok || ajustesDefault.redes.tiktok,
        facebook: redes.facebook || ajustesDefault.redes.facebook,
        youtube: redes.youtube,
      },
      barraSuperior: {
        texto: barra.texto || ajustesDefault.barraSuperior.texto,
        enlace: barra.enlace || ajustesDefault.barraSuperior.enlace,
        activo: Boolean(barra.activo ?? true),
      },
      tiendaEnPreparacion: {
        activo: Boolean(prep.activo),
        mensaje: prep.mensaje || ajustesDefault.tiendaEnPreparacion.mensaje,
        mostrar_tiendas: prep.mostrar_tiendas !== false,
        mostrar_whatsapp: prep.mostrar_whatsapp !== false,
      },
    };
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.error('Error al obtener ajustes desde Supabase:', err);
    return ajustesDefault;
  }
}
