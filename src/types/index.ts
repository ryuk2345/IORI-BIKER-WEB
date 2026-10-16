// Tipos alineados al negocio y futuro esquema de Supabase

export type CertificacionCasco = 'DOT' | 'ECE 22.05' | 'ECE 22.06' | 'SNELL' | 'N/A';

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  columna?: 'piloto' | 'moto' | 'general';
  imagen: string;
  descripcion?: string;
  subcategorias: Subcategoria[];
}

export interface Subcategoria {
  id: string;
  nombre: string;
  slug: string;
}

export interface Marca {
  id: string;
  nombre: string;
  slug: string;
  logo?: string;
  banner?: string;
  destacada?: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  categoriaSlug: string;
  subcategoriaSlug?: string;
  categoriaNombre: string;
  subcategoriaNombre?: string;
  marcaId: string;
  marcaNombre: string;
  precioOriginal?: number;
  precioAnterior?: number;
  precio: number;
  precio_oferta?: number;
  descuentoPorcentaje?: number;
  esOferta?: boolean;
  esNuevo?: boolean;
  esCombo?: boolean;
  esOutlet?: boolean;
  esIoriDeal?: boolean;
  modoVenta: 'online' | 'cotizar';
  modo_venta?: string;
  imagenes: string[];
  descripcionCorta: string;
  descripcionLarga: string;
  descripcion?: string;
  sku?: string;
  tallasDisponibles?: string[];
  coloresDisponibles?: { nombre: string; hex: string }[];
  certificacion?: CertificacionCasco | string;
  stock: number;
  especificaciones?: { [clave: string]: string };
  usosRecomendados?: string[];
}

export interface ItemCarrito {
  id: string;
  producto: Producto;
  cantidad: number;
  tallaSeleccionada?: string;
  colorSeleccionado?: string;
}

export interface HeroSlide {
  id: string;
  titulo: string;
  subtitulo?: string;
  textoBoton: string;
  enlace: string;
  imagenDesktop: string;
  imagenMobile: string;
  badge?: string;
  precioGancho?: string;
}

export interface DestacadoCard {
  id: string;
  tag: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  enlace: string;
}

export interface TiendaFisica {
  id: string;
  nombre: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  referencia: string;
  horario: string;
  telefonoWhatsApp: string;
  mapsUrl: string;
}

export interface ConsejoBiker {
  id: string;
  titulo: string;
  resumen: string;
  fecha: string;
  categoria: string;
  imagen: string;
  lecturaMinutos: number;
  slug: string;
}

export interface PromoEspecial {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string;
  vigencia: string;
  tipo: string;
  bannerDesktop: string;
  bannerMobile: string;
  descripcion: string;
  productos: Producto[];
}
