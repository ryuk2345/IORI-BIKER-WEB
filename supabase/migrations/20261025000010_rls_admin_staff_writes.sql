-- ====================================================================
-- MIGRACIÓN 10: REGLAS RLS DEFINITIVAS PARA ADMIN Y STAFF
-- --------------------------------------------------------------------
-- Problema: al guardar productos salía
--   "new row violates row-level security policy for table productos"
-- y las migraciones 06 y 07 habían dejado políticas FOR ALL USING (true)
-- en pedidos, pedido_items, libro_reclamaciones, mensajes_contacto,
-- postulaciones, politicas y preguntas_frecuentes: cualquiera con la
-- clave pública (la que viaja en la web) podía leer, editar y borrar
-- pedidos, reclamos, mensajes y postulaciones.
--
-- Esta migración:
--   1. Redefine is_admin() e is_staff() como SECURITY DEFINER leyendo
--      profiles.rol del auth.uid().
--   2. Borra TODAS las políticas existentes de las tablas listadas y las
--      vuelve a crear de forma explícita (sin restos de migraciones previas).
--   3. Catálogo, contenido y ajustes: lectura pública igual que antes,
--      escritura (INSERT/UPDATE/DELETE) solo admin.
--   4. Pedidos y bandejas de mensajes: lectura y gestión para staff
--      (admin y atencion), borrado solo admin, formularios públicos
--      siguen pudiendo insertar.
--   5. Storage: imágenes de productos/banners/blog solo admin; CVs lectura staff.
--
-- El service role (clave secreta del servidor) ignora RLS como siempre.
-- ====================================================================

-- 1. FUNCIONES DE ROL ------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND rol = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND rol IN ('admin', 'atencion')
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated, service_role;

-- 2. LIMPIEZA DE POLÍTICAS PREVIAS -----------------------------------
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
            'productos', 'producto_variantes', 'producto_imagenes',
            'categorias', 'subcategorias', 'marcas',
            'banners', 'promociones', 'cupones',
            'ajustes', 'ajustes_generales', 'envios_tarifas',
            'secciones_home', 'rangos_precio',
            'blog', 'preguntas_frecuentes', 'politicas', 'plantillas_whatsapp',
            'pedidos', 'pedido_items', 'pedido_historial',
            'mensajes_contacto', 'libro_reclamaciones',
            'solicitudes_financiamiento', 'postulaciones', 'resenas'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 3. CATÁLOGO, CONTENIDO Y AJUSTES: lectura pública, escritura admin --
DO $$
DECLARE
    t record;
BEGIN
    -- tabla y condición de lectura pública (idéntica a la que existía)
    FOR t IN
        SELECT * FROM (VALUES
            ('productos',            'true'),
            ('producto_variantes',   'activo = true OR public.is_staff()'),
            ('producto_imagenes',    'true'),
            ('categorias',           'true'),
            ('subcategorias',        'true'),
            ('marcas',               'true'),
            ('banners',              'activo = true OR public.is_staff()'),
            ('promociones',          'activo = true OR public.is_staff()'),
            ('cupones',              'activo = true OR public.is_staff()'),
            ('ajustes',              'true'),
            ('ajustes_generales',    'true'),
            ('envios_tarifas',       'activo = true OR public.is_staff()'),
            ('secciones_home',       'visible = true OR public.is_staff()'),
            ('rangos_precio',        'activo = true OR public.is_staff()'),
            ('blog',                 'publicado = true OR public.is_staff()'),
            ('preguntas_frecuentes', 'true'),
            ('politicas',            'true'),
            ('plantillas_whatsapp',  'true')
        ) AS v(tabla, lectura)
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tabla);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (%s)',
            t.tabla || '_select_publico', t.tabla, t.lectura);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())',
            t.tabla || '_insert_admin', t.tabla);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
            t.tabla || '_update_admin', t.tabla);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_admin())',
            t.tabla || '_delete_admin', t.tabla);
    END LOOP;
END $$;

-- 4. PEDIDOS ---------------------------------------------------------
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY pedidos_select_dueno_o_staff ON public.pedidos
    FOR SELECT USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY pedidos_insert_publico ON public.pedidos
    FOR INSERT WITH CHECK (true);
CREATE POLICY pedidos_update_staff ON public.pedidos
    FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY pedidos_delete_admin ON public.pedidos
    FOR DELETE TO authenticated USING (public.is_admin());

ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY pedido_items_select_dueno_o_staff ON public.pedido_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id = pedido_items.pedido_id
              AND (p.user_id = auth.uid() OR public.is_staff())
        )
    );
CREATE POLICY pedido_items_insert_publico ON public.pedido_items
    FOR INSERT WITH CHECK (true);
CREATE POLICY pedido_items_update_staff ON public.pedido_items
    FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY pedido_items_delete_staff ON public.pedido_items
    FOR DELETE TO authenticated USING (public.is_staff());

ALTER TABLE public.pedido_historial ENABLE ROW LEVEL SECURITY;
CREATE POLICY pedido_historial_select_staff ON public.pedido_historial
    FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY pedido_historial_insert_staff ON public.pedido_historial
    FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY pedido_historial_update_staff ON public.pedido_historial
    FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY pedido_historial_delete_admin ON public.pedido_historial
    FOR DELETE TO authenticated USING (public.is_admin());

-- 5. BANDEJAS (formularios públicos que gestiona el staff) -----------
DO $$
DECLARE
    tabla text;
BEGIN
    FOREACH tabla IN ARRAY ARRAY[
        'mensajes_contacto', 'libro_reclamaciones',
        'solicitudes_financiamiento', 'postulaciones'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tabla);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (true)',
            tabla || '_insert_publico', tabla);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_staff())',
            tabla || '_select_staff', tabla);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())',
            tabla || '_update_staff', tabla);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_admin())',
            tabla || '_delete_admin', tabla);
    END LOOP;
END $$;

-- 6. RESEÑAS ---------------------------------------------------------
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;
CREATE POLICY resenas_select_publico ON public.resenas
    FOR SELECT USING (estado = 'aprobada' OR public.is_staff());
CREATE POLICY resenas_insert_publico ON public.resenas
    FOR INSERT WITH CHECK (true);
CREATE POLICY resenas_update_staff ON public.resenas
    FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY resenas_delete_staff ON public.resenas
    FOR DELETE TO authenticated USING (public.is_staff());

-- 7. STORAGE ---------------------------------------------------------
DROP POLICY IF EXISTS "Staff sube imágenes a productos, banners y blog" ON storage.objects;
DROP POLICY IF EXISTS "Staff edita y elimina imágenes en productos, banners y blog" ON storage.objects;
DROP POLICY IF EXISTS "Staff elimina imágenes en productos, banners y blog" ON storage.objects;
DROP POLICY IF EXISTS "Admin sube imágenes públicas" ON storage.objects;
DROP POLICY IF EXISTS "Admin edita imágenes públicas" ON storage.objects;
DROP POLICY IF EXISTS "Admin elimina imágenes públicas" ON storage.objects;

CREATE POLICY "Admin sube imágenes públicas" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('productos', 'banners', 'blog') AND public.is_admin());
CREATE POLICY "Admin edita imágenes públicas" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id IN ('productos', 'banners', 'blog') AND public.is_admin())
    WITH CHECK (bucket_id IN ('productos', 'banners', 'blog') AND public.is_admin());
CREATE POLICY "Admin elimina imágenes públicas" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id IN ('productos', 'banners', 'blog') AND public.is_admin());
-- Lectura pública de imágenes y subida/lectura de CVs se mantienen como en la migración 02.
