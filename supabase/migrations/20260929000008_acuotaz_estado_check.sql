-- ====================================================================
-- MIGRACIÓN 08: SOPORTE ESTADO EN_EVALUACION_ACUOTAZ EN PEDIDOS
-- ====================================================================

-- 1. Actualizar check constraint de pedidos.estado para incluir 'en_evaluacion_acuotaz'
ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;

ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_estado_check CHECK (
    estado IN (
        'nuevo', 
        'esperando_pago', 
        'en_evaluacion_acuotaz', 
        'pagado', 
        'en_preparacion', 
        'en_camino', 
        'listo_recojo', 
        'entregado', 
        'cancelado'
    )
);

-- 2. Asegurar columna metodo_pago
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS metodo_pago TEXT DEFAULT 'yape_plin_transferencia';
