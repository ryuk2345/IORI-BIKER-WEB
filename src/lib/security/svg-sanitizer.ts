/**
 * UTILIDAD DE SANITIZACIÓN DE SVG PARA LOGOS DE MARCA
 * 
 * Elimina scripts incrustados, atributos de eventos inline (onload, onerror, etc.)
 * y URIs sospechosas (javascript:, data:text/html) antes de almacenar o previsualizar SVGs.
 */

export function sanitizeSvgString(svgText: string): string {
  if (!svgText || typeof svgText !== 'string') return '';

  let sanitized = svgText;

  // 1. Eliminar etiquetas de script y objetos ejecutables
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

  // 2. Eliminar eventos inline (on*)
  sanitized = sanitized.replace(/\s+on[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Eliminar javascript: en atributos href, xlink:href, src, etc.
  sanitized = sanitized.replace(/(href|xlink:href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1=""');
  sanitized = sanitized.replace(/(href|xlink:href|src)\s*=\s*javascript:[^\s>]*/gi, '$1=""');

  // 4. Eliminar data URIs no seguras
  sanitized = sanitized.replace(/(href|xlink:href|src)\s*=\s*(['"])\s*data:(?!image\/)[^'"]*\2/gi, '$1=""');

  // 5. Verificar que contenga etiqueta svg válida
  if (!/<svg\b[^>]*>/i.test(sanitized)) {
    throw new Error('El archivo no contiene una estructura SVG válida.');
  }

  return sanitized.trim();
}

/**
 * Valida y sanitiza un archivo SVG antes de subirlo
 */
export async function sanitizeSvgFile(file: File): Promise<File> {
  const text = await file.text();
  const cleaned = sanitizeSvgString(text);
  return new File([cleaned], file.name, { type: 'image/svg+xml' });
}
