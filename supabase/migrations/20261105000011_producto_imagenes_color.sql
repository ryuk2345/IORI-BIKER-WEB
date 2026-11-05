-- Fotos por color: cada foto de un producto puede pertenecer a un color de sus variantes.
-- NULL = foto general (se muestra para cualquier color sin fotos propias).
-- Cambio aditivo: no modifica ni borra datos existentes.
ALTER TABLE public.producto_imagenes ADD COLUMN IF NOT EXISTS color TEXT;

CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto_color
  ON public.producto_imagenes (producto_id, color);
