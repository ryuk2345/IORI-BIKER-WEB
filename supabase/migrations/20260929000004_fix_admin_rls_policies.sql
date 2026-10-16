-- ====================================================================
-- CORRECCIÓN Y REFUERZO DE POLÍTICAS RLS PARA PRODUCTOS Y GESTIÓN STAFF
-- Permite inserción, actualización y eliminación de productos por el staff
-- ====================================================================

-- 1. Optimizar función is_staff() con búsqueda segura
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
DECLARE
    user_role text;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;

    SELECT rol INTO user_role
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN user_role IN ('admin', 'atencion');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Políticas para PRODUCTOS
DROP POLICY IF EXISTS "Staff gestiona productos" ON public.productos;
CREATE POLICY "Staff gestiona productos" ON public.productos
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- 3. Políticas para CATEGORÍAS
DROP POLICY IF EXISTS "Staff gestiona categorias" ON public.categorias;
CREATE POLICY "Staff gestiona categorias" ON public.categorias
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- 4. Políticas para SUBCATEGORÍAS
DROP POLICY IF EXISTS "Staff gestiona subcategorias" ON public.subcategorias;
CREATE POLICY "Staff gestiona subcategorias" ON public.subcategorias
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- 5. Políticas para MARCAS
DROP POLICY IF EXISTS "Staff gestiona marcas" ON public.marcas;
CREATE POLICY "Staff gestiona marcas" ON public.marcas
    FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- 6. Políticas de PROFILES (inserción para nuevo usuario o staff)
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden crear su propio perfil" ON public.profiles
    FOR INSERT
    WITH CHECK (id = auth.uid() OR public.is_staff() OR auth.role() = 'service_role');
