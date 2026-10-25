-- ====================================================================
-- SKU PARCIALMENTE ÚNICO: Permitir NULL en productos con variantes
-- Un producto con variantes tiene sku = NULL, pero los productos simples
-- y las variantes con SKU no nulo deben ser únicos globalmente.
-- ====================================================================

-- 1. Limpiar strings vacíos a NULL en productos
UPDATE public.productos SET sku = NULL WHERE trim(sku) = '';

-- 2. Eliminar restricción UNIQUE estricta en productos si existe
ALTER TABLE public.productos DROP CONSTRAINT IF EXISTS productos_sku_key;
DROP INDEX IF EXISTS public.productos_sku_key;
DROP INDEX IF EXISTS public.idx_productos_sku_partial_unique;

-- 3. Crear índice único parcial en productos (solo cuando sku no es NULL)
CREATE UNIQUE INDEX idx_productos_sku_partial_unique 
ON public.productos (sku) 
WHERE sku IS NOT NULL;

-- 4. Limpiar strings vacíos a NULL en producto_variantes
UPDATE public.producto_variantes SET sku = NULL WHERE trim(sku) = '';

-- 5. Eliminar restricción UNIQUE estricta en variantes si existe
ALTER TABLE public.producto_variantes DROP CONSTRAINT IF EXISTS producto_variantes_sku_key;
DROP INDEX IF EXISTS public.producto_variantes_sku_key;
DROP INDEX IF EXISTS public.idx_producto_variantes_sku_partial_unique;

-- 6. Crear índice único parcial en producto_variantes (solo cuando sku no es NULL)
CREATE UNIQUE INDEX idx_producto_variantes_sku_partial_unique 
ON public.producto_variantes (sku) 
WHERE sku IS NOT NULL;
