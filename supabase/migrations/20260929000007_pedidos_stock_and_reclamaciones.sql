-- ====================================================================
-- MIGRACIÓN 07: PEDIDOS, CONTROL DE PAGO/STOCK, RECLAMACIONES Y PLANTILLAS
-- ====================================================================

-- 1. CAMPOS ADICIONALES EN PEDIDOS
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS cliente_email TEXT;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS metodo_pago TEXT;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS numero_operacion TEXT;

-- 2. CORRELATIVO Y DATOS DE PROVEEDOR EN LIBRO DE RECLAMACIONES
CREATE SEQUENCE IF NOT EXISTS libro_reclamaciones_seq START 1;

ALTER TABLE public.libro_reclamaciones 
ADD COLUMN IF NOT EXISTS datos_proveedor JSONB DEFAULT '{
    "razon_social": "IORI SAC",
    "nombre_comercial": "IORI BIKER SHOP",
    "ruc": "20610816089",
    "direccion": "Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima"
}'::jsonb;

CREATE OR REPLACE FUNCTION generar_codigo_reclamacion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        NEW.codigo := 'REC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('libro_reclamaciones_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_codigo_reclamacion ON public.libro_reclamaciones;
CREATE TRIGGER trigger_codigo_reclamacion
BEFORE INSERT ON public.libro_reclamaciones
FOR EACH ROW
EXECUTE FUNCTION generar_codigo_reclamacion();

-- 3. POLÍTICAS RLS PARA PEDIDOS, ITEMS Y RECLAMACIONES
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.libro_reclamaciones ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'pedidos_insert_public'
    ) THEN
        CREATE POLICY pedidos_insert_public ON public.pedidos FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'pedidos_select_public'
    ) THEN
        CREATE POLICY pedidos_select_public ON public.pedidos FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'pedidos_admin_all'
    ) THEN
        CREATE POLICY pedidos_admin_all ON public.pedidos FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pedido_items' AND policyname = 'pedido_items_insert_public'
    ) THEN
        CREATE POLICY pedido_items_insert_public ON public.pedido_items FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pedido_items' AND policyname = 'pedido_items_select_public'
    ) THEN
        CREATE POLICY pedido_items_select_public ON public.pedido_items FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pedido_items' AND policyname = 'pedido_items_admin_all'
    ) THEN
        CREATE POLICY pedido_items_admin_all ON public.pedido_items FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'libro_reclamaciones' AND policyname = 'reclamaciones_insert_public'
    ) THEN
        CREATE POLICY reclamaciones_insert_public ON public.libro_reclamaciones FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'libro_reclamaciones' AND policyname = 'reclamaciones_admin_all'
    ) THEN
        CREATE POLICY reclamaciones_admin_all ON public.libro_reclamaciones FOR ALL USING (true);
    END IF;
END $$;

-- 4. INSERTAR/COMPLETAR TODAS LAS 11 PLANTILLAS OFICIALES DE WHATSAPP
INSERT INTO public.plantillas_whatsapp (id, tipo, titulo, contenido, variables, updated_at) VALUES
(
    'wsp-pedido',
    'pedido',
    'Mensaje de Nuevo Pedido (/carrito)',
    'Hola, Iori Biker Shop 👋 Quiero hacer este pedido:

*Pedido {codigo}*
{items}

Subtotal: {subtotal}
Descuento: {descuento}
Envío: {envio}
*Total: {total}*

*Mis datos*
{nombre} · {celular}
Comprobante: {comprobante}
Entrega: {entrega}
Notas: {notas}

¿Me confirman stock y cómo pagar? 🙌',
    '["codigo", "items", "subtotal", "descuento", "envio", "total", "nombre", "celular", "comprobante", "entrega", "notas"]'::jsonb,
    NOW()
),
(
    'wsp-cotizar',
    'cotizar',
    'Cotización de Producto',
    'Hola, Iori Biker Shop 👋 Quiero cotizar: *{producto}* ({variante}), SKU {sku}. {url}',
    '["producto", "variante", "sku", "url"]'::jsonb,
    NOW()
),
(
    'wsp-flotante',
    'flotante',
    'Botón Flotante de Tienda',
    'Hola, Iori Biker Shop 👋 Quiero información sobre sus productos.',
    '[]'::jsonb,
    NOW()
),
(
    'wsp-financiamiento',
    'financiamiento',
    'Solicitud de Financiamiento',
    'Hola, Iori Biker Shop 👋 Envié la solicitud de financiamiento *{codigo}* para {producto}. Quedo a la espera de los requisitos.',
    '["codigo", "producto"]'::jsonb,
    NOW()
),
(
    'wsp-instrucciones-pago',
    'instrucciones_pago',
    'Instrucciones de Pago (Admin)',
    '¡Hola, {nombre}! Gracias por tu pedido *{codigo}* 🙌 Confirmamos stock de todo. Total a pagar: *{total}*.

Puedes pagar con:
- Yape o Plin: {numero_yape_plin} (a nombre de {titular})
- Transferencia {banco}: cuenta {cuenta} / CCI {cci}

Te enviamos el QR en el siguiente mensaje. Cuando pagues, mándanos la captura por aquí y preparamos tu pedido.',
    '["nombre", "codigo", "total", "numero_yape_plin", "titular", "banco", "cuenta", "cci"]'::jsonb,
    NOW()
),
(
    'wsp-pago-confirmado',
    'pago_confirmado',
    'Pago Confirmado (Admin)',
    '¡Pago recibido, {nombre}! ✅ Tu pedido *{codigo}* está confirmado y ya lo estamos preparando. Te avisamos por aquí en cuanto salga o esté listo para recoger.',
    '["nombre", "codigo"]'::jsonb,
    NOW()
),
(
    'wsp-en-camino-lima',
    'en_camino_lima',
    'En Camino - Lima (Admin)',
    '¡Tu pedido *{codigo}* ya salió, {nombre}! 🏍️ Lo entregamos en {direccion} {fecha_entrega}. Te llamaremos antes de llegar.',
    '["nombre", "codigo", "direccion", "fecha_entrega"]'::jsonb,
    NOW()
),
(
    'wsp-en-camino-provincia',
    'en_camino_provincia',
    'En Camino - Provincia (Admin)',
    '¡Tu pedido *{codigo}* ya va en camino, {nombre}! 🏍️
Agencia: {agencia}
Código de seguimiento: {codigo_seguimiento}
Destino: {ciudad}
Para recogerlo en la agencia, lleva tu DNI.',
    '["nombre", "codigo", "agencia", "codigo_seguimiento", "ciudad"]'::jsonb,
    NOW()
),
(
    'wsp-listo-recojo',
    'listo_recojo',
    'Listo para Recojo en Tienda (Admin)',
    '¡Tu pedido *{codigo}* ya está listo, {nombre}! 🙌 Recógelo en nuestra tienda de {tienda} ({direccion_tienda}), {horario_tienda}. Menciona tu número de pedido al llegar.',
    '["nombre", "codigo", "tienda", "direccion_tienda", "horario_tienda"]'::jsonb,
    NOW()
),
(
    'wsp-producto-agotado',
    'producto_agotado',
    'Producto Agotado (Admin)',
    'Hola, {nombre}. Revisando tu pedido *{codigo}*, el producto {producto} ({variante}) se nos agotó 😕 Te podemos ofrecer {alternativa} o seguir con el resto del pedido por {nuevo_total}. ¿Cómo prefieres continuar?',
    '["nombre", "codigo", "producto", "variante", "alternativa", "nuevo_total"]'::jsonb,
    NOW()
),
(
    'wsp-pedido-sin-mensaje',
    'pedido_sin_mensaje',
    'Pedido sin Mensaje tras 1h (Admin)',
    'Hola, {nombre} 👋 Te escribimos de Iori Biker Shop. Registraste el pedido *{codigo}* en nuestra web, pero no nos llegó tu mensaje. ¿Te ayudamos a completarlo?',
    '["nombre", "codigo"]'::jsonb,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    titulo = EXCLUDED.titulo,
    contenido = EXCLUDED.contenido,
    variables = EXCLUDED.variables,
    updated_at = EXCLUDED.updated_at;
