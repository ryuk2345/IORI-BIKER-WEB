/**
 * Utilidades de enlaces (slugs) de productos.
 *
 * El nombre de un producto puede repetirse (mismo modelo con otro color o diseño),
 * pero el enlace de la ficha debe ser único. Estas funciones son puras para poder
 * probarlas sin base de datos.
 */

/** Convierte un texto en un slug: minúsculas, sin tildes y con guiones. */
export function slugify(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/g, '');
}

/**
 * Devuelve el primer enlace libre a partir del nombre:
 * 1. el nombre tal cual,
 * 2. el nombre + el color (si el producto tiene un solo color y el nombre no lo incluye),
 * 3. el nombre (o nombre + color) con -2, -3, …
 *
 * @param taken enlaces que ya usan OTROS productos
 */
export function buildUniqueSlug(nombre: string, taken: Iterable<string>, color?: string | null): string {
  const used = new Set(taken);
  const base = slugify(nombre) || 'producto';
  if (!used.has(base)) return base;

  const colorSlug = color ? slugify(color) : '';
  const withColor = colorSlug && !base.includes(colorSlug) ? `${base}-${colorSlug}` : base;
  if (!used.has(withColor)) return withColor;

  for (let n = 2; n < 1000; n++) {
    const candidate = `${withColor}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${withColor}-${Date.now()}`;
}
