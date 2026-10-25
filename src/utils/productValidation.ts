/**
 * Módulo de validación y utilidades para productos y variantes en Iori Biker Shop.
 * Implementa las reglas de negocio estrictas:
 * 1. SKU general:
 *    - Con variantes: se guarda NULL en el producto padre y NUNCA se copia el SKU de una variante.
 *    - Sin variantes: SKU general es obligatorio.
 * 2. Variantes:
 *    - Cada variante necesita SKU. Si queda vacío, se auto-genera uno editable a partir de nombre, talla y color.
 *    - Se validan duplicados dentro del producto marcando la fila exacta (variante_${idx}_sku).
 * 3. Categoría y Marca:
 *    - Empiezan vacías y son obligatorias, con mensajes de error visibles.
 * 4. Visibilidad de errores:
 *    - Ningún error puede pertenecer a un campo no visible en el DOM.
 */

export interface VariantItem {
  id?: string;
  sku?: string;
  talla: string;
  color: string;
  color_hex?: string;
  stock?: number;
  precio_ajuste?: number;
}

export interface ProductFormData {
  nombre: string;
  precio: string | number;
  precioOferta?: string | number;
  categoriaSlug: string;
  marcaId: string;
  sku: string;
  tieneVariantes: boolean;
  variantes: VariantItem[];
}

export type ValidationErrorMap = Record<string, string>;

/**
 * Generador de SKU editable para variantes a partir del nombre, talla y color.
 * Ejemplo: "Casco LS2 FF800 Storm", "M", "Negro Mate" -> "CASCO-LS2-FF800-NEGRO-M"
 */
export function generateVariantSku(productName: string, talla: string, color: string): string {
  const cleanName = (productName || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join('-');

  const cleanColor = (color || 'STD')
    .trim()
    .toUpperCase()
    .split(/\s+/)[0]
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);

  const cleanTalla = (talla || 'STD')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const base = cleanName || 'PROD';
  return `${base}-${cleanColor}-${cleanTalla}`.toUpperCase();
}

/**
 * Validador síncrono del formulario de productos.
 * Retorna un mapa clave-valor con los errores visibles en pantalla.
 */
export function validateProductForm(data: ProductFormData): ValidationErrorMap {
  const errors: ValidationErrorMap = {};

  // 1. Nombre obligatorio
  if (!data.nombre || !data.nombre.trim()) {
    errors.nombre = 'El nombre del producto es obligatorio.';
  }

  // 2. Categoría y Marca obligatorias (empiezan vacías)
  if (!data.categoriaSlug || !data.categoriaSlug.trim()) {
    errors.categoria = 'Debes seleccionar una categoría obligatoria.';
  }
  if (!data.marcaId || !data.marcaId.trim()) {
    errors.marca = 'Debes seleccionar una marca oficial obligatoria.';
  }

  // 3. Validación de precios
  const numPrecio = typeof data.precio === 'number' ? data.precio : parseFloat(String(data.precio || '0'));
  const numPrecioOferta = typeof data.precioOferta === 'number' ? data.precioOferta : parseFloat(String(data.precioOferta || '0'));

  if (isNaN(numPrecio) || numPrecio <= 0) {
    errors.precio = 'El precio normal debe ser un monto mayor a 0.';
  }
  if (data.precioOferta && (isNaN(numPrecioOferta) || numPrecioOferta <= 0)) {
    errors.precioOferta = 'El precio de oferta debe ser un número válido.';
  } else if (numPrecioOferta >= numPrecio && numPrecioOferta > 0) {
    errors.precioOferta = 'El precio de oferta debe ser menor al precio normal.';
  }

  // 4. SKU General vs Variantes
  if (!data.tieneVariantes) {
    // Sin variantes: SKU general obligatorio
    if (!data.sku || !data.sku.trim()) {
      errors.sku = 'El código SKU es obligatorio para productos sin variantes.';
    }
  } else {
    // Con variantes: el SKU general NUNCA debe validarse aquí porque está oculto en pantalla.
    if (!data.variantes || data.variantes.length === 0) {
      errors.variantes = 'Debes configurar al menos una combinación de variante (talla y color).';
    } else {
      const seenSkus = new Map<string, number>();
      data.variantes.forEach((v, idx) => {
        const vSku = v.sku ? v.sku.trim().toUpperCase() : '';
        if (!vSku) {
          errors[`variante_${idx}_sku`] = 'El SKU de esta variante es obligatorio.';
        } else if (seenSkus.has(vSku)) {
          const firstRow = seenSkus.get(vSku)! + 1;
          errors[`variante_${idx}_sku`] = `SKU duplicado con la fila #${firstRow}.`;
        } else {
          seenSkus.set(vSku, idx);
        }
      });
    }
  }

  // 5. Verificación de invariante de campos invisibles
  assertNoInvisibleFieldErrors(errors, data.tieneVariantes);

  return errors;
}

/**
 * Validador de invariante: si un error corresponde a un campo que no está
 * en pantalla (como SKU general cuando tieneVariantes=true), arroja un error explícito.
 */
export function assertNoInvisibleFieldErrors(errors: ValidationErrorMap, tieneVariantes: boolean): void {
  if (tieneVariantes && errors.sku) {
    throw new Error(
      `BUG DETECTADO: Se generó el error "${errors.sku}" en un campo no visible en pantalla (SKU general) cuando tieneVariantes=true.`
    );
  }
}

/**
 * Determina el SKU general que se debe persistir:
 * Con variantes: siempre NULL (nunca copia de una variante).
 * Sin variantes: el SKU limpio en mayúsculas.
 */
export function resolveGeneralSku(tieneVariantes: boolean, sku: string): string | null {
  if (tieneVariantes) {
    return null;
  }
  return sku && sku.trim() ? sku.trim().toUpperCase() : null;
}
