-- ====================================================================
-- IORI BIKER SHOP — SEED COMPLETO DE PRODUCCIÓN
-- Categorías, Subcategorías, 14 Marcas, Productos Demo, Variantes,
-- Promo Esparta hasta 31/10/2026, Banners, Ajustes y Plantillas
-- ====================================================================

-- 1. MARCAS OFICIALES (14 Marcas de la regla)
INSERT INTO public.marcas (id, nombre, slug, logo, destacada, activo, orden) VALUES
('ls2', 'LS2', 'ls2', '/images/brands/brand_1.png', true, true, 1),
('xkudo', 'XKUDO', 'xkudo', '/images/brands/brand_2.png', true, true, 2),
('kratoz', 'KRATOZ', 'kratoz', '/images/brands/brand_3.png', true, true, 3),
('soman', 'SOMAN', 'soman', '/images/brands/brand_4.png', true, true, 4),
('logan', 'LOGAN', 'logan', '/images/brands/brand_5.png', true, true, 5),
('xtreme', 'XTREME', 'xtreme', '/images/brands/brand_6.png', true, true, 6),
('hjc', 'HJC', 'hjc', '/images/brands/brand_1.png', true, true, 7),
('shaft', 'SHAFT', 'shaft', '/images/brands/brand_2.png', true, true, 8),
('mt-helmet', 'MT HELMET', 'mt-helmet', '/images/brands/brand_3.png', true, true, 9),
('alpinstar', 'ALPINSTAR', 'alpinstar', '/images/brands/brand_4.png', true, true, 10),
('airoh', 'AIROH', 'airoh', '/images/brands/brand_5.png', false, true, 11),
('sfx', 'SFX', 'sfx', '/images/brands/brand_6.png', false, true, 12),
('royal', 'ROYAL', 'royal', '/images/brands/brand_1.png', false, true, 13),
('motowolf', 'MOTOWOLF', 'motowolf', '/images/brands/brand_2.png', true, true, 14)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    slug = EXCLUDED.slug,
    destacada = EXCLUDED.destacada,
    activo = EXCLUDED.activo,
    orden = EXCLUDED.orden;

-- 2. CATEGORÍAS PRINCIPALES (8 Categorías Oficiales)
INSERT INTO public.categorias (id, nombre, slug, columna, descripcion, imagen, activo, orden) VALUES
('cascos', 'Cascos', 'cascos', 'piloto', 'Más de 200 modelos certificados para ciudad, ruta y competición.', '/images/categories/cat_1.png', true, 1),
('guantes', 'Guantes', 'guantes', 'piloto', 'Protección en nudillos, palma reforzada y touch screen.', '/images/categories/cat_3.png', true, 2),
('accesorios-casco', 'Accesorios para Casco', 'accesorios-casco', 'piloto', 'Intercomunicadores bluetooth, visores, micas y pines.', '/images/categories/cat_2.png', true, 3),
('indumentaria', 'Indumentaria', 'indumentaria', 'piloto', 'Casacas con protección, botas biker e impermeables de lluvia.', '/images/categories/cat_4.png', true, 4),
('accesorios-moto', 'Accesorios para Moto', 'accesorios-moto', 'moto', 'Equipa tu máquina con soportes, manijas, espejos y cajuelas.', '/images/categories/cat_5.png', true, 5),
('iluminacion-luces', 'Iluminación / Luces', 'iluminacion-luces', 'moto', 'Máxima visibilidad nocturna con faros LED y neblineros potentes.', '/images/categories/cat_6.png', true, 6),
('limpieza-mantenimiento', 'Limpieza / Mantenimiento', 'limpieza-mantenimiento', 'moto', 'Cuidado integral de tu motor, cadena y plásticos.', '/images/categories/cat_8.png', true, 7),
('motitos-escala', 'Motitos Escala', 'motitos-escala', 'general', 'Réplicas a escala de alta precisión para coleccionistas moteros.', '/images/categories/cat_7.png', true, 8)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    slug = EXCLUDED.slug,
    columna = EXCLUDED.columna,
    descripcion = EXCLUDED.descripcion,
    imagen = EXCLUDED.imagen,
    activo = EXCLUDED.activo,
    orden = EXCLUDED.orden;

-- 3. SUBCATEGORÍAS (como hijas con parent_id en categorias y en subcategorias)
INSERT INTO public.subcategorias (id, categoria_id, nombre, slug, orden) VALUES
('integrales', 'cascos', 'Integrales', 'integrales', 1),
('abatibles', 'cascos', 'Abatibles', 'abatibles', 2),
('open-face', 'cascos', 'Open Face', 'open-face', 3),
('cross-doble-proposito', 'cascos', 'Cross / Doble Propósito', 'cross-doble-proposito', 4),
('ninos', 'cascos', 'Niños', 'ninos', 5),
('femeninos', 'cascos', 'Femeninos', 'femeninos', 6),

('urbanos', 'guantes', 'Urbanos', 'urbanos', 1),
('deportivos', 'guantes', 'Deportivos', 'deportivos', 2),
('impermeables', 'guantes', 'Impermeables', 'impermeables', 3),
('verano-malla', 'guantes', 'Verano / Malla', 'verano-malla', 4),

('bluetooth-intercomunicador', 'accesorios-casco', 'Bluetooth / Intercomunicador', 'bluetooth-intercomunicador', 1),
('visores', 'accesorios-casco', 'Visores', 'visores', 2),
('decorativos', 'accesorios-casco', 'Decorativos', 'decorativos', 3),
('otros-casco', 'accesorios-casco', 'Otros', 'otros-casco', 4),

('casacas', 'indumentaria', 'Casacas', 'casacas', 1),
('botas', 'indumentaria', 'Botas', 'botas', 2),
('impermeables-indumentaria', 'indumentaria', 'Impermeables', 'impermeables-indumentaria', 3),
('otros-indumentaria', 'indumentaria', 'Otros', 'otros-indumentaria', 4),

('porta-celular', 'accesorios-moto', 'Porta Celular', 'porta-celular', 1),
('manijas', 'accesorios-moto', 'Manijas', 'manijas', 2),
('porta-placa', 'accesorios-moto', 'Porta Placa', 'porta-placa', 3),
('espejos', 'accesorios-moto', 'Espejos', 'espejos', 4),
('cajuelas', 'accesorios-moto', 'Cajuelas', 'cajuelas', 5),
('munequitos-biker', 'accesorios-moto', 'Muñequitos Biker', 'munequitos-biker', 6),
('otros-moto', 'accesorios-moto', 'Otros', 'otros-moto', 7),

('faros-led', 'iluminacion-luces', 'Faros LED', 'faros-led', 1),
('neblineros', 'iluminacion-luces', 'Neblineros', 'neblineros', 2),
('direccionales', 'iluminacion-luces', 'Direccionales', 'direccionales', 3),
('focos', 'iluminacion-luces', 'Focos', 'focos', 4),

('aceites', 'limpieza-mantenimiento', 'Aceites', 'aceites', 1),
('lubricante-desengrasante', 'limpieza-mantenimiento', 'Lubricante / Desengrasante', 'lubricante-desengrasante', 2),
('otros-limpieza', 'limpieza-mantenimiento', 'Otros', 'otros-limpieza', 3),

('deportivas-escala', 'motitos-escala', 'Deportivas', 'deportivas-escala', 1),
('clasicas-escala', 'motitos-escala', 'Clásicas', 'clasicas-escala', 2),
('otros-escala', 'motitos-escala', 'Otros Modelos', 'otros-escala', 3)
ON CONFLICT (id) DO UPDATE SET 
    categoria_id = EXCLUDED.categoria_id,
    nombre = EXCLUDED.nombre,
    slug = EXCLUDED.slug,
    orden = EXCLUDED.orden;

-- 4. PRODUCTOS DEMO
INSERT INTO public.productos (
    id, nombre, slug, categoria_slug, subcategoria_slug, categoria_nombre, subcategoria_nombre,
    marca_id, marca_nombre, precio, precio_original, precio_oferta, descuento_porcentaje,
    es_oferta, es_nuevo, es_combo, modo_venta, descripcion_corta, descripcion_larga,
    sku, certificacion, stock, financiamiento_disponible, ficha_tecnica, activo
) VALUES
(
    'prod-esparta-1',
    'Casco Shaft Pro Series Carbono Esparta Edition',
    'casco-shaft-pro-series-carbono',
    'cascos', 'integrales', 'Cascos', 'Integrales',
    'shaft', 'SHAFT',
    499.00, 649.00, 499.00, 23,
    true, true, true, 'online',
    'Casco integral de alto impacto con calota de fibra de carbono y certificación ECE 22.06.',
    'El Shaft Pro Series combina ligereza extrema, ventilación multipunto y un visor de policarbonato con tratamiento antirrayas y preparado para Pinlock 70 Max Vision. Ideal para rodadas urbanas exigentes y carretera.',
    'SH-PRO-ESP01', 'ECE 22.06', 14, true,
    '{"Tipo de Calota": "Fibra de Carbono", "Peso": "1350g ± 50g", "Cierre": "Doble D micrométrico", "Pinlock": "Preparado Max Vision 70"}'::jsonb,
    true
),
(
    'prod-esparta-2',
    'Casco LS2 FF800 Storm Esparta Double Visor',
    'casco-ls2-ff800-storm',
    'cascos', 'integrales', 'Cascos', 'Integrales',
    'ls2', 'LS2',
    449.00, 580.00, 449.00, 22,
    true, true, true, 'online',
    'Casco integral deportivo con visor solar retráctil interno y excelente aislamiento acústico.',
    'Fabricado en aleación KPA (Kinetic Polymer Alloy) para máxima absorción de energía. Cuenta con doble visor, entradas de aire canalizadas y acabados premium.',
    'LS2-FF800-ESP', 'ECE 22.05', 20, true,
    '{"Material": "KPA Kinetic Polymer", "Visor": "Twin Shield UV", "Peso": "1400g ± 50g", "Pinlock": "Incluido Max Vision 70"}'::jsonb,
    true
),
(
    'prod-3',
    'Casco Airoh Aviator 3 Off-Road Edición Especial',
    'casco-airoh-aviator-3-off-road',
    'cascos', 'cross-doble-proposito', 'Cascos', 'Cross / Doble Propósito',
    'airoh', 'AIROH',
    1850.00, NULL, NULL, NULL,
    false, true, false, 'cotizar',
    'Casco de competición off-road ultraligero en fibra de carbono HPC para enduro y motocross.',
    'El pináculo del diseño italiano off-road. Sistema AMS2 Plus, interiores magnetizados y máxima canalización de aire probada en el mundial de MXGP.',
    'AIR-AV3-CARBON', 'ECE 22.06', 3, false,
    '{"Material": "Full Carbon 3K", "Peso": "1070g ± 50g", "Sistema": "AMS2 Plus", "Uso": "Enduro / Cross Profesional"}'::jsonb,
    true
),
(
    'prod-4',
    'Intercomunicador Bluetooth FreedConn T-Rex Pro Mesh',
    'intercomunicador-freedconn-t-rex-pro',
    'accesorios-casco', 'bluetooth-intercomunicador', 'Accesorios para Casco', 'Bluetooth / Intercomunicador',
    'motowolf', 'MOTOWOLF',
    289.00, 350.00, 289.00, 17,
    true, false, false, 'online',
    'Intercomunicador de 8 pilotos en simultáneo con alcance de 1500m, radio FM y audio HD.',
    'Altavoces de alta definición con graves reforzados, tecnología CVC de supresión de ruido por viento y batería de 15 horas continuas.',
    'FC-TREX-MESH', 'IP67 Waterproof', 25, false,
    '{"Alcance": "1500 metros", "Batería": "15 horas de conversación", "Conectividad": "Bluetooth 5.2 Mesh", "Compatibilidad": "Universal para todo casco"}'::jsonb,
    true
),
(
    'prod-5',
    'Guantes Biker Alpinestars SMX-1 Air V2 Carbono',
    'guantes-alpinestars-smx1-air-v2',
    'guantes', 'urbanos', 'Guantes', 'Urbanos',
    'alpinstar', 'ALPINSTAR',
    219.00, 260.00, 219.00, 15,
    true, true, false, 'online',
    'Guantes de caña corta con piel de primera calidad, malla ventilada y protector de nudillos en polímero.',
    'Inserción elástica ergonómica entre palma y pulgar para máxima maniobrabilidad. Puntas de dedos táctiles para smartphones y GPS.',
    'ALP-SMX1-V2', 'CE Nivel 1', 18, false,
    '{"Material": "Cuero vacuno + Malla 3D", "Protección": "Nudillos de carbono", "Touchscreen": "Compatible dedo índice"}'::jsonb,
    true
),
(
    'prod-6',
    'Soporte de Celular Motowolf CNC con Antivibración',
    'soporte-celular-motowolf-antivibracion',
    'accesorios-moto', 'porta-celular', 'Accesorios para Moto', 'Porta Celular',
    'motowolf', 'MOTOWOLF',
    119.00, 149.00, 119.00, 20,
    true, false, false, 'online',
    'Soporte de aluminio aeronáutico con amortiguador hidráulico de 4 puntos para proteger cámaras de gama alta.',
    'Bloqueo mecánico rápido con rotación 360 grados. Compatible con manillares de 22mm, 28mm y base para espejo retrovisor.',
    'MW-HLD-CNC01', 'Aleación T6063', 45, false,
    '{"Material": "Aluminio CNC anodizado", "Amortiguación": "4 gomas de silicona antivibración", "Ajuste": "Universal 4.7 a 7.2 pulgadas"}'::jsonb,
    true
)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    precio_oferta = EXCLUDED.precio_oferta,
    precio_original = EXCLUDED.precio_original,
    descuento_porcentaje = EXCLUDED.descuento_porcentaje,
    es_oferta = EXCLUDED.es_oferta,
    es_nuevo = EXCLUDED.es_nuevo,
    es_combo = EXCLUDED.es_combo,
    modo_venta = EXCLUDED.modo_venta,
    stock = EXCLUDED.stock,
    ficha_tecnica = EXCLUDED.ficha_tecnica,
    financiamiento_disponible = EXCLUDED.financiamiento_disponible,
    activo = EXCLUDED.activo;

-- 5. VARIANTES DE PRODUCTO
INSERT INTO public.producto_variantes (id, producto_id, sku, talla, color, color_hex, stock) VALUES
('var-1', 'prod-esparta-1', 'SH-PRO-ESP01-M-NEGRO', 'M', 'Negro Mate Carbono', '#1C1C1C', 5),
('var-2', 'prod-esparta-1', 'SH-PRO-ESP01-L-NEGRO', 'L', 'Negro Mate Carbono', '#1C1C1C', 5),
('var-3', 'prod-esparta-1', 'SH-PRO-ESP01-XL-TITAN', 'XL', 'Titanio Gráfico', '#4B4B4B', 4),

('var-4', 'prod-esparta-2', 'LS2-FF800-M-NARANJA', 'M', 'Negro / Naranja', '#F58220', 8),
('var-5', 'prod-esparta-2', 'LS2-FF800-L-NARANJA', 'L', 'Negro / Naranja', '#F58220', 7),
('var-6', 'prod-esparta-2', 'LS2-FF800-XL-GRIS', 'XL', 'Gris Nardo Mate', '#63666A', 5),

('var-7', 'prod-5', 'ALP-SMX1-M-NEGRO', 'M', 'Negro Stealth', '#111111', 8),
('var-8', 'prod-5', 'ALP-SMX1-L-NEGRO', 'L', 'Negro Stealth', '#111111', 10)
ON CONFLICT (id) DO UPDATE SET stock = EXCLUDED.stock;

-- 6. IMÁGENES DE PRODUCTO
INSERT INTO public.producto_imagenes (id, producto_id, url, orden, alt) VALUES
('img-1', 'prod-esparta-1', '/images/products/prod_1.png', 1, 'Casco Shaft Pro Series Carbono Frontal'),
('img-2', 'prod-esparta-1', '/images/products/prod_2.png', 2, 'Casco Shaft Pro Series Carbono Lateral'),
('img-3', 'prod-esparta-2', '/images/products/prod_2.png', 1, 'Casco LS2 FF800 Storm Esparta'),
('img-4', 'prod-esparta-2', '/images/products/prod_1.png', 2, 'Casco LS2 FF800 Visor'),
('img-5', 'prod-3', '/images/products/prod_3.png', 1, 'Casco Airoh Aviator 3 Off-Road'),
('img-6', 'prod-4', '/images/products/prod_4.png', 1, 'Intercomunicador FreedConn T-Rex Pro'),
('img-7', 'prod-5', '/images/products/prod_3.png', 1, 'Guantes Alpinestars SMX-1 Air V2'),
('img-8', 'prod-6', '/images/products/prod_5.png', 1, 'Soporte Celular Motowolf CNC')
ON CONFLICT (id) DO NOTHING;

-- 7. PROMO ESPARTA (Hasta el 31 de Octubre de 2026 según la regla)
INSERT INTO public.promociones (
    id, titulo, slug, subtitulo, descripcion, tipo, descuento_tipo, descuento_valor,
    banner_desktop, banner_mobile, fecha_inicio, fecha_fin, activo
) VALUES (
    'promo-esparta-2026',
    'PROMO ESPARTA',
    'esparta',
    'LLEVA 2 CASCOS A PRECIO REBAJADO PARA TI Y TU COPILOTO',
    'La Promo Esparta está pensada para equipar al piloto y copiloto con cascos certificados de primeras marcas (Shaft, LS2, HJC, MT Helmets) con un descuento acumulado insuperable. Vigencia activa durante todo Octubre 2026.',
    'combo_duo',
    'combo_duo',
    25.00,
    '/images/banners/banner_wide_1.png',
    '/images/hero/hero_mobile_1.png',
    '2026-09-01 00:00:00+00',
    '2026-10-31 23:59:59+00',
    true
)
ON CONFLICT (id) DO UPDATE SET 
    fecha_fin = EXCLUDED.fecha_fin,
    activo = EXCLUDED.activo;

-- 8. BANNERS Y SLIDERS (Hero, destacados, anchos y medianos)
INSERT INTO public.banners (
    id, titulo, subtitulo, imagen_desktop, imagen_mobile, texto_boton, enlace, badge, ubicacion, fecha_inicio, fecha_fin, activo, orden
) VALUES
(
    'banner-hero-1',
    'PROMO ESPARTA',
    'LLEVA 2 CASCOS A PRECIO REBAJADO • DESDE YA Y TODO OCTUBRE',
    '/images/hero/hero_desktop_1.png',
    '/images/hero/hero_mobile_1.png',
    'Ver Promo Esparta',
    '/promo/esparta',
    'CAMPAÑA OFICIAL',
    'hero',
    '2026-09-01 00:00:00+00',
    '2026-10-31 23:59:59+00',
    true, 1
),
(
    'banner-hero-2',
    'EQUIPAMIENTO DE ALTO IMPACTO',
    'Cascos certificados, intercomunicadores y accesorios de marcas líderes',
    '/images/banners/banner_wide_1.png',
    '/images/hero/hero_mobile_1.png',
    'Ver Catálogo',
    '/categoria/cascos',
    'MÁS DE 200 MODELOS',
    'hero',
    '2026-01-01 00:00:00+00',
    '2026-12-31 23:59:59+00',
    true, 2
),
(
    'banner-hero-3',
    'COMBOS Y PACKS BIKER',
    'Equípate completo con descuentos especiales en paquetes de protección',
    '/images/hero/hero_desktop_1.png',
    '/images/hero/hero_mobile_1.png',
    'Explorar Combos',
    '/combos',
    'AHORRA EN PACKS',
    'hero',
    '2026-01-01 00:00:00+00',
    '2026-12-31 23:59:59+00',
    true, 3
),
(
    'banner-destacado-1',
    'CASCOS INTEGRALES DE FIBRA DE CARBONO',
    'Diseñados para alta velocidad con aerodinámica optimizada y certificación europea ECE 22.06.',
    '/images/banners/banner_wide_1.png',
    '/images/banners/banner_wide_1.png',
    'Ver Integrales',
    '/categoria/cascos/integrales',
    'SEGURIDAD DEPORTIVA',
    'destacado',
    '2026-01-01 00:00:00+00',
    '2026-12-31 23:59:59+00',
    true, 1
),
(
    'banner-destacado-2',
    'INTERCOMUNICADORES BLUETOOTH HD',
    'Comunicación nítida con cancelación de ruido, alcance multi-piloto y manos libres.',
    '/images/banners/banner_mid_1.png',
    '/images/banners/banner_mid_1.png',
    'Ver Intercomunicadores',
    '/categoria/accesorios-casco/bluetooth-intercomunicador',
    'CONECTIVIDAD EN RUTA',
    'destacado',
    '2026-01-01 00:00:00+00',
    '2026-12-31 23:59:59+00',
    true, 2
),
(
    'banner-destacado-3',
    'INDUMENTARIA CON PROTECCIONES CE',
    'Casacas cordura resistentes a la abrasión con membrana impermeable para cualquier clima.',
    '/images/banners/banner_mid_2.png',
    '/images/banners/banner_mid_2.png',
    'Ver Casacas',
    '/categoria/indumentaria/casacas',
    'ESTILO Y CONFORT',
    'destacado',
    '2026-01-01 00:00:00+00',
    '2026-12-31 23:59:59+00',
    true, 3
)
ON CONFLICT (id) DO UPDATE SET 
    titulo = EXCLUDED.titulo,
    subtitulo = EXCLUDED.subtitulo,
    imagen_desktop = EXCLUDED.imagen_desktop,
    imagen_mobile = EXCLUDED.imagen_mobile,
    texto_boton = EXCLUDED.texto_boton,
    enlace = EXCLUDED.enlace,
    activo = EXCLUDED.activo;

-- 9. AJUSTES GENERALES DEL NEGOCIO (YAPE, PLIN, BANCOS, CONTACTO)
INSERT INTO public.ajustes_generales (clave, valor, descripcion) VALUES
('barra_superior', '{"texto": "¡PROMO ESPARTA ACTIVA! Lleva 2 cascos certificados a precio rebajado todo Octubre.", "enlace": "/promo/esparta", "activo": true}'::jsonb, 'Mensaje superior promocional'),
('whatsapp', '{"numero": "905445698", "numeroCompleto": "+51 905 445 698", "url": "https://wa.me/51905445698"}'::jsonb, 'Configuración oficial de WhatsApp'),
('empresa', '{"nombreComercial": "IORI BIKER SHOP", "razonSocial": "IORI SAC", "ruc": "20610816089", "correo": "ioribikershop@gmail.com"}'::jsonb, 'Datos fiscales y comerciales'),
('metodos_pago_visibles', '["Yape", "Plin", "Transferencia BCP", "Transferencia BBVA", "Transferencia Interbank", "Efectivo en Tienda"]'::jsonb, 'Métodos mostrados al cliente'),
('datos_pago_plantillas', '{
    "titular": "Kiara Balarezo Berttea / IORI SAC",
    "numero_yape_plin": "905 445 698",
    "bancos": [
        {"banco": "BCP", "cuenta": "191-94820158-0-44", "cci": "002-191009482015804452", "moneda": "Soles"},
        {"banco": "BBVA", "cuenta": "0011-0175-0200849201", "cci": "011-175-000200849201-19", "moneda": "Soles"},
        {"banco": "Interbank", "cuenta": "200-3001849281", "cci": "003-200-003001849281-34", "moneda": "Soles"}
    ]
}'::jsonb, 'Cuentas para instrucciones de pago'),
('tiendas_fisicas', '[
    {
        "id": "independencia",
        "nombre": "Sede Independencia (Principal)",
        "direccion": "Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima",
        "horario": "Lunes a Sábado 9:00 am – 10:00 pm / Domingos y Feriados 11:00 am – 8:00 pm",
        "mapsUrl": "https://maps.google.com/?q=Av.+Contisuyo+418,+Independencia,+Lima"
    },
    {
        "id": "la-victoria",
        "nombre": "Sede La Victoria",
        "direccion": "Av. Nicolás Arriola 901, La Victoria, Lima",
        "horario": "Lunes a Sábado 9:00 am – 6:00 pm",
        "mapsUrl": "https://maps.google.com/?q=Av.+Nicolás+Arriola+901,+La+Victoria,+Lima"
    }
]'::jsonb, 'Horarios y sedes físicas')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, updated_at = now();

-- 10. TARIFAS DE ENVÍO
INSERT INTO public.envios_tarifas (id, zona, metodo, tarifa, tiempo_estimado, activo, orden) VALUES
('env-1', 'Lima Metropolitana', 'Motorizado Express a Domicilio', 15.00, '24 a 48 horas hábiles', true, 1),
('env-2', 'Provincias (Todo el Perú)', 'Agencia Shalom (Pago o Recojo en Agencia)', 20.00, '48 a 72 horas hábiles', true, 2),
('env-3', 'Provincias (Todo el Perú)', 'Agencia Marvisur', 25.00, '48 a 96 horas hábiles', true, 3),
('env-4', 'Lima - Sede Independencia', 'Retiro Gratuito en Tienda', 0.00, 'Inmediato previa confirmación', true, 4),
('env-5', 'Lima - Sede La Victoria', 'Retiro Gratuito en Tienda', 0.00, 'Inmediato previa confirmación', true, 5)
ON CONFLICT (id) DO UPDATE SET tarifa = EXCLUDED.tarifa, activo = EXCLUDED.activo;

-- 11. PLANTILLAS DE WHATSAPP (De docs/plantillas-whatsapp.md)
INSERT INTO public.plantillas_whatsapp (id, tipo, titulo, contenido, variables) VALUES
(
    'wsp-pedido',
    'pedido',
    'Mensaje de Nuevo Pedido',
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
    '["codigo", "items", "subtotal", "descuento", "envio", "total", "nombre", "celular", "comprobante", "entrega", "notas"]'::jsonb
),
(
    'wsp-cotizar',
    'cotizar',
    'Cotización por WhatsApp',
    'Hola, Iori Biker Shop 👋 Quiero cotizar: *{producto}* ({variante}), SKU {sku}. {url}',
    '["producto", "variante", "sku", "url"]'::jsonb
),
(
    'wsp-flotante',
    'flotante',
    'Botón Flotante de Consulta',
    'Hola, Iori Biker Shop 👋 Quiero información sobre sus productos.',
    '[]'::jsonb
),
(
    'wsp-financiamiento',
    'financiamiento',
    'Solicitud de Financiamiento',
    'Hola, Iori Biker Shop 👋 Envié la solicitud de financiamiento *{codigo}* para {producto}. Quedo a la espera de los requisitos.',
    '["codigo", "producto"]'::jsonb
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
    '["nombre", "codigo", "total", "numero_yape_plin", "titular", "banco", "cuenta", "cci"]'::jsonb
),
(
    'wsp-pago-confirmado',
    'pago_confirmado',
    'Pago Confirmado (Admin)',
    '¡Pago recibido, {nombre}! ✅ Tu pedido *{codigo}* está confirmado y ya lo estamos preparando. Te avisamos por aquí en cuanto salga o esté listo para recoger.',
    '["nombre", "codigo"]'::jsonb
),
(
    'wsp-en-camino-lima',
    'en_camino_lima',
    'En Camino Lima (Admin)',
    '¡Tu pedido *{codigo}* ya salió, {nombre}! 🏍️ Lo entregamos en {direccion} {fecha_entrega}. Te llamaremos antes de llegar.',
    '["codigo", "nombre", "direccion", "fecha_entrega"]'::jsonb
),
(
    'wsp-en-camino-provincia',
    'en_camino_provincia',
    'En Camino Provincia (Admin)',
    '¡Tu pedido *{codigo}* ya va en camino, {nombre}! 🏍️
Agencia: {agencia}
Código de seguimiento: {codigo_seguimiento}
Destino: {ciudad}
Para recogerlo en la agencia, lleva tu DNI.',
    '["codigo", "nombre", "agencia", "codigo_seguimiento", "ciudad"]'::jsonb
),
(
    'wsp-listo-recojo',
    'listo_recojo',
    'Listo para Recojo en Tienda (Admin)',
    '¡Tu pedido *{codigo}* ya está listo, {nombre}! 🙌 Recógelo en nuestra tienda de {tienda} ({direccion_tienda}), {horario_tienda}. Menciona tu número de pedido al llegar.',
    '["codigo", "nombre", "tienda", "direccion_tienda", "horario_tienda"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    contenido = EXCLUDED.contenido,
    variables = EXCLUDED.variables;

-- 12. SECCIONES DE LA HOME (Orden oficial según iori-contexto.md)
INSERT INTO public.secciones_home (id, clave, titulo, visible, orden, configuracion) VALUES
('sec-1', 'topbar', 'Barra Superior de Ofertas', true, 1, '{"activo": true}'::jsonb),
('sec-2', 'header', 'Encabezado y Buscador', true, 2, '{"activo": true}'::jsonb),
('sec-3', 'navegacion', 'Mega Menú y Categorías', true, 3, '{"activo": true}'::jsonb),
('sec-4', 'hero_slider', 'Hero Slider Principal', true, 4, '{"autoplayMs": 6000}'::jsonb),
('sec-5', 'franja_beneficios', 'Franja de 6 Beneficios Biker', true, 5, '{"activo": true}'::jsonb),
('sec-6', 'carrusel_categorias', 'Explora por Categorías', true, 6, '{"proporcion": "1:1"}'::jsonb),
('sec-7', 'destacados_cards', 'Destacados de Campaña', true, 7, '{"proporcion": "16:9"}'::jsonb),
('sec-8', 'tiles_categorias', 'Tiles de Categorías Oficiales', true, 8, '{"activo": true}'::jsonb),
('sec-9', 'producto_protagonista', 'Producto Protagonista', true, 9, '{"productoId": "prod-esparta-1"}'::jsonb),
('sec-10', 'mejores_ofertas', 'Las Mejores Ofertas', true, 10, '{"activo": true}'::jsonb),
('sec-11', 'banner_ancho', 'Banner Ancho', true, 11, '{"activo": true}'::jsonb),
('sec-12', 'promociones_temporada', 'Promociones de Temporada', true, 12, '{"contadorActivo": false}'::jsonb),
('sec-13', 'marcas_carrusel', 'Nuestras 14 Marcas Oficiales', true, 13, '{"activo": true}'::jsonb),
('sec-14', 'trio_banners', 'Trío de Banners (1 ancho + 2 medianos)', true, 14, '{"activo": true}'::jsonb),
('sec-15', 'tiendas_visitanos', 'Visita Nuestras 2 Tiendas Físicas', true, 15, '{"activo": true}'::jsonb),
('sec-16', 'consejos_biker', 'Consejos Biker y Mantenimiento', true, 16, '{"activo": true}'::jsonb),
('sec-17', 'siguenos_redes', 'Síguenos en Redes Sociales', true, 17, '{"activo": true}'::jsonb),
('sec-18', 'footer', 'Footer Institucional y Reclamaciones', true, 18, '{"activo": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    titulo = EXCLUDED.titulo,
    visible = EXCLUDED.visible,
    orden = EXCLUDED.orden;

-- 13. RANGOS DE PRECIO
INSERT INTO public.rangos_precio (id, etiqueta, min, max, orden, activo) VALUES
('rango-1', 'Menos de S/ 150', 0, 150, 1, true),
('rango-2', 'S/ 150 – S/ 300', 150, 300, 2, true),
('rango-3', 'S/ 300 – S/ 600', 300, 600, 3, true),
('rango-4', 'S/ 600 – S/ 1,200', 600, 1200, 4, true),
('rango-5', 'Más de S/ 1,200', 1200, 99999, 5, true)
ON CONFLICT (id) DO NOTHING;

-- 14. BLOG (Consejos Biker Reales)
INSERT INTO public.blog (id, titulo, slug, resumen, contenido, imagen, categoria, autor, fecha, lectura_minutos, publicado) VALUES
(
    'blog-1',
    'Cómo elegir la talla correcta de tu casco para que no baile ni apriete de más',
    'como-elegir-talla-de-casco',
    'Aprende a medir el contorno de tu cabeza con cinta métrica y conoce el tiempo de adaptación de las almohadillas.',
    'El ajuste de un casco es el factor de seguridad más crítico. Un casco holgado puede salir despedido en un impacto, mientras que uno excesivamente apretado causa jaquecas e incomodidad que merman tu concentración. En Iori Biker Shop te asesoramos para que obtengas la talla exacta.',
    '/images/banners/banner_mid_1.png',
    'Seguridad y Tallas',
    'Iori Biker Team',
    '25 Sep 2026',
    4,
    true
),
(
    'blog-2',
    'Cuidado de tu visor: los errores comunes que rayan tu mica antirrayas',
    'cuidado-limpieza-visor-casco',
    'Nunca uses papel higiénico ni alcohol puro. Te enseñamos la técnica con microfibra húmeda y agua tibia para prolongar su vida.',
    'La visibilidad es vida en la moto. El tratamiento antirrayas y la protección UV de tu visor se degradan si empleas limpiadores abrasivos o papel celulosa común. Utiliza siempre paños de microfibra dedicados y agua tibia jabonosa neutra.',
    '/images/banners/banner_mid_2.png',
    'Mantenimiento Biker',
    'Iori Biker Team',
    '20 Sep 2026',
    3,
    true
),
(
    'blog-3',
    'Cada cuántos kilómetros debes lubricar y tensar la cadena de tu moto en Lima',
    'lubricacion-tension-cadena-moto',
    'La humedad y el polvo de la costa desgastan la cadena rápidamente. Sigue estos pasos para evitar que salte o se rompa en marcha.',
    'En Lima, la combinación de alta salinidad marina y partículas de polvo acorta el ciclo de vida de la transmisión secundaria. La regla de oro es limpiar y lubricar cada 500 km en condiciones secas o inmediatamente después de rodar bajo garúa.',
    '/images/banners/banner_wide_1.png',
    'Mecánica Preventiva',
    'Iori Biker Team',
    '15 Sep 2026',
    5,
    true
)
ON CONFLICT (id) DO UPDATE SET 
    titulo = EXCLUDED.titulo,
    resumen = EXCLUDED.resumen,
    contenido = EXCLUDED.contenido,
    publicado = EXCLUDED.publicado;
