-- ====================================================================
-- IORI BIKER SHOP — ESQUEMA INICIAL DE BASE DE DATOS SUPABASE
-- Conforme a las reglas de negocio de .agents/rules/iori-contexto.md
-- ====================================================================

-- 1. TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS public.categorias (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    columna TEXT NOT NULL CHECK (columna IN ('piloto', 'moto', 'general')),
    descripcion TEXT,
    imagen TEXT,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DE SUBCATEGORÍAS
CREATE TABLE IF NOT EXISTS public.subcategorias (
    id TEXT PRIMARY KEY,
    categoria_id TEXT NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(categoria_id, slug)
);

-- 3. TABLA DE MARCAS (14 Marcas Oficiales)
CREATE TABLE IF NOT EXISTS public.marcas (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo TEXT,
    destacada BOOLEAN DEFAULT false,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.productos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    categoria_slug TEXT NOT NULL,
    subcategoria_slug TEXT NOT NULL,
    categoria_nombre TEXT NOT NULL,
    subcategoria_nombre TEXT NOT NULL,
    marca_id TEXT NOT NULL REFERENCES public.marcas(id) ON DELETE RESTRICT,
    marca_nombre TEXT NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    precio_original NUMERIC(10, 2),
    descuento_porcentaje INT,
    es_oferta BOOLEAN DEFAULT false,
    es_nuevo BOOLEAN DEFAULT false,
    es_combo BOOLEAN DEFAULT false,
    modo_venta TEXT NOT NULL DEFAULT 'online' CHECK (modo_venta IN ('online', 'cotizar')),
    descripcion_corta TEXT,
    descripcion_larga TEXT,
    sku TEXT UNIQUE,
    certificacion TEXT,
    stock INT NOT NULL DEFAULT 0,
    tallas JSONB DEFAULT '[]'::jsonb,
    colores JSONB DEFAULT '[]'::jsonb,
    imagenes JSONB DEFAULT '[]'::jsonb,
    especificaciones JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA DE PEDIDOS (Flujo WhatsApp)
CREATE SEQUENCE IF NOT EXISTS pedido_correlativo_seq START 1;

CREATE TABLE IF NOT EXISTS public.pedidos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    codigo TEXT NOT NULL UNIQUE,
    estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (
        estado IN ('nuevo', 'esperando_pago', 'pagado', 'en_preparacion', 'en_camino', 'listo_recojo', 'entregado', 'cancelado')
    ),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    descuento NUMERIC(10, 2) NOT NULL DEFAULT 0,
    envio NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    
    -- Datos del cliente
    cliente_nombre TEXT NOT NULL,
    cliente_celular TEXT NOT NULL,
    tipo_comprobante TEXT NOT NULL DEFAULT 'boleta' CHECK (tipo_comprobante IN ('boleta', 'factura')),
    dni_ruc TEXT,
    razon_social TEXT,
    
    -- Entrega
    metodo_entrega TEXT NOT NULL CHECK (metodo_entrega IN ('lima_domicilio', 'provincia_agencia', 'recojo_independencia', 'recojo_la_victoria')),
    direccion_entrega TEXT,
    agencia_envio TEXT,
    
    notas TEXT,
    codigo_seguimiento TEXT,
    fecha_entrega TEXT,
    notas_internas TEXT,
    
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para generar código correlativo automático IORI-000001
CREATE OR REPLACE FUNCTION generar_codigo_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        NEW.codigo := 'IORI-' || LPAD(nextval('pedido_correlativo_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_codigo_pedido ON public.pedidos;
CREATE TRIGGER trigger_codigo_pedido
BEFORE INSERT ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION generar_codigo_pedido();

-- 6. TABLA DE SOLICITUDES DE FINANCIAMIENTO
CREATE TABLE IF NOT EXISTS public.solicitudes_financiamiento (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    codigo TEXT NOT NULL UNIQUE,
    producto_id TEXT,
    producto_nombre TEXT NOT NULL,
    monto_financiar NUMERIC(10, 2) NOT NULL,
    cuotas INT NOT NULL,
    cuota_mensual NUMERIC(10, 2),
    inicial NUMERIC(10, 2) DEFAULT 0,
    cliente_nombre TEXT NOT NULL,
    cliente_celular TEXT NOT NULL,
    cliente_dni TEXT NOT NULL,
    cliente_email TEXT,
    departamento TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_evaluacion', 'aprobado', 'rechazado')),
    notas_internas TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA DE MENSAJES DE CONTACTO
CREATE TABLE IF NOT EXISTS public.mensajes_contacto (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nombre TEXT NOT NULL,
    celular TEXT NOT NULL,
    email TEXT,
    motivo TEXT,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA DE LIBRO DE RECLAMACIONES
CREATE TABLE IF NOT EXISTS public.libro_reclamaciones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    codigo TEXT NOT NULL UNIQUE,
    datos_consumidor JSONB NOT NULL,
    bien_contratado JSONB NOT NULL,
    detalle_reclamacion JSONB NOT NULL,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'atendido')),
    respuesta TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA DE AJUSTES GENERALES (DATOS DEL NEGOCIO, CUENTAS BANCARIAS, WHATSAPP)
CREATE TABLE IF NOT EXISTS public.ajustes (
    clave TEXT PRIMARY KEY,
    valor JSONB NOT NULL,
    descripcion TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. SEGURIDAD Y POLÍTICAS RLS (Row Level Security)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_financiamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.libro_reclamaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ajustes ENABLE ROW LEVEL SECURITY;

-- Lectura pública para catálogo y ajustes públicos
CREATE POLICY "Lectura pública de categorías" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Lectura pública de subcategorías" ON public.subcategorias FOR SELECT USING (true);
CREATE POLICY "Lectura pública de marcas" ON public.marcas FOR SELECT USING (true);
CREATE POLICY "Lectura pública de productos" ON public.productos FOR SELECT USING (true);
CREATE POLICY "Lectura pública de ajustes" ON public.ajustes FOR SELECT USING (true);

-- Inserción pública para pedidos, financiamiento, contacto y reclamaciones
CREATE POLICY "Clientes pueden crear pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Clientes pueden ver sus pedidos por código" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "Inserción pública de financiamiento" ON public.solicitudes_financiamiento FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserción pública de contacto" ON public.mensajes_contacto FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserción pública de reclamaciones" ON public.libro_reclamaciones FOR INSERT WITH CHECK (true);
