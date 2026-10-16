-- ====================================================================
-- PERMITIR SUBCATEGORÍA NULA O VACÍA EN PRODUCTOS
-- Permite que los productos puedan crearse sin forzar subcategoría
-- ====================================================================

ALTER TABLE public.productos ALTER COLUMN subcategoria_slug DROP NOT NULL;
ALTER TABLE public.productos ALTER COLUMN subcategoria_nombre DROP NOT NULL;
ALTER TABLE public.productos ALTER COLUMN subcategoria_slug SET DEFAULT '';
ALTER TABLE public.productos ALTER COLUMN subcategoria_nombre SET DEFAULT '';
