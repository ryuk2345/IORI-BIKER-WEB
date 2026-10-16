-- ====================================================================
-- IORI BIKER SHOP — ESQUEMA COMPLETO Y CONTROL DE ACCESO (ADMIN & TIENDA)
-- Fase: Supabase y Panel Admin según especificación oficial
-- ====================================================================

-- Extensión para generación de tokens aleatorios seguros
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. TABLA PROFILES Y ROLES DE USUARIO
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nombre TEXT,
    celular TEXT,
    dni_ruc TEXT,
    direccion_predeterminada TEXT,
    rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'atencion', 'cliente')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Función auxiliar para verificar si el usuario actual es staff (admin o atencion)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND rol IN ('admin', 'atencion')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función auxiliar para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND rol = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear profile automáticamente al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nombre, rol)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 2. CATEGORÍAS CON SUB-CATEGORÍAS (parent_id)
-- --------------------------------------------------------------------
-- Agregamos parent_id y activo a categorias si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categorias' AND column_name='parent_id') THEN
        ALTER TABLE public.categorias ADD COLUMN parent_id TEXT REFERENCES public.categorias(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categorias' AND column_name='activo') THEN
        ALTER TABLE public.categorias ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marcas' AND column_name='activo') THEN
        ALTER TABLE public.marcas ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- 3. PRODUCTOS Y RELACIONES (VARIANTES, IMÁGENES)
-- --------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='precio_oferta') THEN
        ALTER TABLE public.productos ADD COLUMN precio_oferta NUMERIC(10, 2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='ficha_tecnica') THEN
        ALTER TABLE public.productos ADD COLUMN ficha_tecnica JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='financiamiento_disponible') THEN
        ALTER TABLE public.productos ADD COLUMN financiamiento_disponible BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='activo') THEN
        ALTER TABLE public.productos ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Tabla de Variantes por Producto (talla, color, stock individual)
CREATE TABLE IF NOT EXISTS public.producto_variantes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    producto_id TEXT NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    talla TEXT,
    color TEXT,
    color_hex TEXT,
    stock INT NOT NULL DEFAULT 0,
    precio_ajuste NUMERIC(10, 2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Imágenes por Producto (múltiples fotos con orden)
CREATE TABLE IF NOT EXISTS public.producto_imagenes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    producto_id TEXT NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    alt TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. BANNERS (HERO, DESTACADOS, ANCHO, MEDIANO)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    titulo TEXT,
    subtitulo TEXT,
    imagen_desktop TEXT NOT NULL,
    imagen_mobile TEXT NOT NULL,
    texto_boton TEXT,
    enlace TEXT,
    badge TEXT,
    ubicacion TEXT NOT NULL CHECK (ubicacion IN ('hero', 'destacado', 'ancho', 'mediano', 'promo_esparta')),
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    activo BOOLEAN DEFAULT true,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 5. PROMOCIONES Y CUPONES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promociones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitulo TEXT,
    descripcion TEXT,
    tipo TEXT NOT NULL DEFAULT 'campaña',
    descuento_tipo TEXT CHECK (descuento_tipo IN ('porcentaje', 'monto_fijo', 'combo_duo')),
    descuento_valor NUMERIC(10, 2),
    banner_desktop TEXT,
    banner_mobile TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cupones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    codigo TEXT NOT NULL UNIQUE,
    descuento_tipo TEXT NOT NULL CHECK (descuento_tipo IN ('porcentaje', 'monto_fijo')),
    descuento_valor NUMERIC(10, 2) NOT NULL,
    monto_minimo NUMERIC(10, 2) DEFAULT 0,
    uso_maximo INT,
    usos_actuales INT DEFAULT 0,
    fecha_expiracion TIMESTAMPTZ,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. SECCIONES DE LA HOME Y RANGOS DE PRECIO
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.secciones_home (
    id TEXT PRIMARY KEY,
    clave TEXT NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    visible BOOLEAN DEFAULT true,
    orden INT NOT NULL DEFAULT 0,
    configuracion JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.rangos_precio (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    etiqueta TEXT NOT NULL,
    min NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max NUMERIC(10, 2),
    orden INT NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true
);

-- --------------------------------------------------------------------
-- 7. AJUSTES GENERALES Y TARIFAS DE ENVÍOS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ajustes_generales (
    clave TEXT PRIMARY KEY,
    valor JSONB NOT NULL,
    descripcion TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.envios_tarifas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    zona TEXT NOT NULL,
    metodo TEXT NOT NULL,
    tarifa NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tiempo_estimado TEXT,
    activo BOOLEAN DEFAULT true,
    orden INT DEFAULT 0
);

-- --------------------------------------------------------------------
-- 8. PEDIDOS CON TOKEN, ÍTEMS E HISTORIAL DE ESTADOS
-- --------------------------------------------------------------------
-- Agregamos token y user_id a pedidos si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='token') THEN
        ALTER TABLE public.pedidos ADD COLUMN token TEXT NOT NULL DEFAULT gen_random_uuid()::text;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_pedidos_token ON public.pedidos(token);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='user_id') THEN
        ALTER TABLE public.pedidos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Tabla de Ítems del Pedido (congelando el precio del momento de compra)
CREATE TABLE IF NOT EXISTS public.pedido_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pedido_id TEXT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id TEXT REFERENCES public.productos(id) ON DELETE SET NULL,
    variante_id TEXT REFERENCES public.producto_variantes(id) ON DELETE SET NULL,
    producto_nombre TEXT NOT NULL,
    variante_nombre TEXT,
    sku TEXT,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL,
    imagen_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Historial de Estados del Pedido (trazabilidad y notas internas)
CREATE TABLE IF NOT EXISTS public.pedido_historial (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pedido_id TEXT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    estado_anterior TEXT,
    estado_nuevo TEXT NOT NULL,
    nota TEXT,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 9. PLANTILLAS DE WHATSAPP
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plantillas_whatsapp (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 10. POSTULACIONES, RESEÑAS, BLOG Y PREGUNTAS FRECUENTES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.postulaciones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    puesto TEXT NOT NULL,
    nombre TEXT NOT NULL,
    celular TEXT NOT NULL,
    email TEXT NOT NULL,
    cv_url TEXT NOT NULL,
    mensaje TEXT,
    estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'revisado', 'descartado')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.resenas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    producto_id TEXT REFERENCES public.productos(id) ON DELETE CASCADE,
    autor TEXT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.blog (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    resumen TEXT NOT NULL,
    contenido TEXT,
    imagen TEXT NOT NULL,
    categoria TEXT NOT NULL,
    autor TEXT DEFAULT 'Iori Biker Team',
    fecha TEXT,
    lectura_minutos INT DEFAULT 3,
    publicado BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.preguntas_frecuentes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    categoria TEXT NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT true
);

-- --------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) ESTRICTO
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_variantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secciones_home ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rangos_precio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ajustes_generales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_tarifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantillas_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas_frecuentes ENABLE ROW LEVEL SECURITY;

-- Reglas para PROFILES
CREATE POLICY "Usuarios ven su propio perfil" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_staff());
CREATE POLICY "Usuarios editan su propio perfil" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_admin());

-- Reglas para CATÁLOGO Y PÚBLICO (Lectura libre de activos, edición solo staff)
CREATE POLICY "Lectura pública de variantes activas" ON public.producto_variantes FOR SELECT USING (activo = true OR public.is_staff());
CREATE POLICY "Staff gestiona variantes" ON public.producto_variantes FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de imágenes de producto" ON public.producto_imagenes FOR SELECT USING (true);
CREATE POLICY "Staff gestiona imágenes de producto" ON public.producto_imagenes FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de banners activos" ON public.banners FOR SELECT USING (activo = true OR public.is_staff());
CREATE POLICY "Staff gestiona banners" ON public.banners FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de promociones activas" ON public.promociones FOR SELECT USING (activo = true OR public.is_staff());
CREATE POLICY "Staff gestiona promociones" ON public.promociones FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de cupones válidos" ON public.cupones FOR SELECT USING (activo = true OR public.is_staff());
CREATE POLICY "Staff gestiona cupones" ON public.cupones FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de secciones home visibles" ON public.secciones_home FOR SELECT USING (visible = true OR public.is_staff());
CREATE POLICY "Staff gestiona secciones home" ON public.secciones_home FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de rangos precio" ON public.rangos_precio FOR SELECT USING (activo = true OR public.is_staff());
CREATE POLICY "Staff gestiona rangos precio" ON public.rangos_precio FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de ajustes generales" ON public.ajustes_generales FOR SELECT USING (true);
CREATE POLICY "Staff gestiona ajustes generales" ON public.ajustes_generales FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de tarifas de envío" ON public.envios_tarifas FOR SELECT USING (activo = true OR public.is_staff());
CREATE POLICY "Staff gestiona tarifas de envío" ON public.envios_tarifas FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de blog publicado" ON public.blog FOR SELECT USING (publicado = true OR public.is_staff());
CREATE POLICY "Staff gestiona blog" ON public.blog FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de preguntas frecuentes" ON public.preguntas_frecuentes FOR SELECT USING (activo = true OR public.is_staff());
CREATE POLICY "Staff gestiona preguntas frecuentes" ON public.preguntas_frecuentes FOR ALL USING (public.is_staff());

CREATE POLICY "Lectura pública de reseñas aprobadas" ON public.resenas FOR SELECT USING (estado = 'aprobada' OR public.is_staff());
CREATE POLICY "Inserción pública de reseñas" ON public.resenas FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff gestiona reseñas" ON public.resenas FOR ALL USING (public.is_staff());

-- Reglas para PEDIDOS (Lectura: dueño o staff; creación por el servidor/cliente; modificación solo staff)
DROP POLICY IF EXISTS "Clientes pueden crear pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Clientes pueden ver sus pedidos por código" ON public.pedidos;
CREATE POLICY "Clientes ven sus pedidos propios o por staff" ON public.pedidos
    FOR SELECT USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY "Creación de pedidos permitida" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff actualiza pedidos" ON public.pedidos FOR UPDATE USING (public.is_staff());

CREATE POLICY "Lectura de items por dueño o staff" ON public.pedido_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_items.pedido_id AND (p.user_id = auth.uid() OR public.is_staff()))
    );
CREATE POLICY "Creación de items de pedido permitida" ON public.pedido_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff gestiona items de pedido" ON public.pedido_items FOR ALL USING (public.is_staff());

CREATE POLICY "Historial de pedido visible por staff" ON public.pedido_historial FOR SELECT USING (public.is_staff());
CREATE POLICY "Staff gestiona historial de pedido" ON public.pedido_historial FOR ALL USING (public.is_staff());

-- Reglas para POSTULACIONES (CV privado)
CREATE POLICY "Inserción pública de postulaciones" ON public.postulaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff visualiza y gestiona postulaciones" ON public.postulaciones FOR ALL USING (public.is_staff());

-- Reglas para PLANTILLAS DE WHATSAPP
CREATE POLICY "Lectura pública de plantillas de WhatsApp" ON public.plantillas_whatsapp FOR SELECT USING (true);
CREATE POLICY "Staff edita plantillas de WhatsApp" ON public.plantillas_whatsapp FOR ALL USING (public.is_staff());

-- --------------------------------------------------------------------
-- 12. STORAGE BUCKETS (productos, banners, blog, cvs)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES
('productos', 'productos', true),
('banners', 'banners', true),
('blog', 'blog', true),
('cvs', 'cvs', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Políticas de Storage
-- 1) Productos, Banners y Blog: Lectura pública de objetos
CREATE POLICY "Lectura pública de imágenes de productos" ON storage.objects
    FOR SELECT USING (bucket_id IN ('productos', 'banners', 'blog'));

CREATE POLICY "Staff sube imágenes a productos, banners y blog" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id IN ('productos', 'banners', 'blog') AND (public.is_staff() OR auth.role() = 'service_role'));

CREATE POLICY "Staff edita y elimina imágenes en productos, banners y blog" ON storage.objects
    FOR UPDATE USING (bucket_id IN ('productos', 'banners', 'blog') AND (public.is_staff() OR auth.role() = 'service_role'));

CREATE POLICY "Staff elimina imágenes en productos, banners y blog" ON storage.objects
    FOR DELETE USING (bucket_id IN ('productos', 'banners', 'blog') AND (public.is_staff() OR auth.role() = 'service_role'));

-- 2) CVs: Subida pública permitida para candidatos, descarga SOLO staff
CREATE POLICY "Candidatos pueden subir su CV a cvs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'cvs');

CREATE POLICY "Staff descarga y revisa CVs privados" ON storage.objects
    FOR SELECT USING (bucket_id = 'cvs' AND (public.is_staff() OR auth.role() = 'service_role'));
