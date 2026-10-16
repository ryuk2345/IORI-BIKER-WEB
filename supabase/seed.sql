-- ====================================================================
-- IORI BIKER SHOP — SEED LIMPIO PARA ENTREGA A CLIENTE
-- Categorías, Subcategorías, 14 Marcas (sin logos placeholder),
-- Promo Esparta en Borrador, Ajustes Oficiales y Plantillas WhatsApp
-- SIN PRODUCTOS, SIN PEDIDOS, SIN BANNERS NI ARTÍCULOS DEMO
-- ====================================================================

-- 1. MARCAS OFICIALES (14 Marcas con nombres y slugs limpios, logos listos para carga por el cliente)
INSERT INTO public.marcas (id, nombre, slug, logo, destacada, activo, orden) VALUES
('ls2', 'LS2', 'ls2', NULL, true, true, 1),
('xkudo', 'XKUDO', 'xkudo', NULL, true, true, 2),
('kratoz', 'KRATOZ', 'kratoz', NULL, true, true, 3),
('soman', 'SOMAN', 'soman', NULL, true, true, 4),
('logan', 'LOGAN', 'logan', NULL, true, true, 5),
('xtreme', 'XTREME', 'xtreme', NULL, true, true, 6),
('hjc', 'HJC', 'hjc', NULL, true, true, 7),
('shaft', 'SHAFT', 'shaft', NULL, true, true, 8),
('mt-helmet', 'MT HELMET', 'mt-helmet', NULL, true, true, 9),
('alpinstar', 'ALPINSTAR', 'alpinstar', NULL, true, true, 10),
('airoh', 'AIROH', 'airoh', NULL, false, true, 11),
('sfx', 'SFX', 'sfx', NULL, false, true, 12),
('royal', 'ROYAL', 'royal', NULL, false, true, 13),
('motowolf', 'MOTOWOLF', 'motowolf', NULL, true, true, 14)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    slug = EXCLUDED.slug,
    logo = EXCLUDED.logo,
    destacada = EXCLUDED.destacada,
    activo = EXCLUDED.activo,
    orden = EXCLUDED.orden;

-- 2. CATEGORÍAS PRINCIPALES (8 Categorías Oficiales)
INSERT INTO public.categorias (id, nombre, slug, columna, descripcion, imagen, activo, orden) VALUES
('cascos', 'Cascos', 'cascos', 'piloto', 'Más de 200 modelos certificados para ciudad, ruta y competición.', NULL, true, 1),
('guantes', 'Guantes', 'guantes', 'piloto', 'Protección en nudillos, palma reforzada y touch screen.', NULL, true, 2),
('accesorios-casco', 'Accesorios para Casco', 'accesorios-casco', 'piloto', 'Intercomunicadores bluetooth, visores, micas y pines.', NULL, true, 3),
('indumentaria', 'Indumentaria', 'indumentaria', 'piloto', 'Casacas con protección, botas biker e impermeables de lluvia.', NULL, true, 4),
('accesorios-moto', 'Accesorios para Moto', 'accesorios-moto', 'moto', 'Equipa tu máquina con soportes, manijas, espejos y cajuelas.', NULL, true, 5),
('iluminacion-luces', 'Iluminación / Luces', 'iluminacion-luces', 'moto', 'Máxima visibilidad nocturna con faros LED y neblineros potentes.', NULL, true, 6),
('limpieza-mantenimiento', 'Limpieza / Mantenimiento', 'limpieza-mantenimiento', 'moto', 'Cuidado integral de tu motor, cadena y plásticos.', NULL, true, 7),
('motitos-escala', 'Motitos Escala', 'motitos-escala', 'general', 'Réplicas a escala de alta precisión para coleccionistas moteros.', NULL, true, 8)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    slug = EXCLUDED.slug,
    columna = EXCLUDED.columna,
    descripcion = EXCLUDED.descripcion,
    activo = EXCLUDED.activo,
    orden = EXCLUDED.orden;

-- 3. SUBCATEGORÍAS (35 Subcategorías vinculadas a Categorías)
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
('cuero', 'guantes', 'Cuero', 'cuero', 4),

('bluetooth-intercomunicador', 'accesorios-casco', 'Bluetooth / Intercomunicador', 'bluetooth-intercomunicador', 1),
('visores-micas', 'accesorios-casco', 'Visores / Micas', 'visores-micas', 2),
('pinlock-antiempanante', 'accesorios-casco', 'Pinlock / Antiempañante', 'pinlock-antiempanante', 3),
('mochilas-porta-casco', 'accesorios-casco', 'Mochilas Porta-Casco', 'mochilas-porta-casco', 4),

('casacas', 'indumentaria', 'Casacas', 'casacas', 1),
('pantalones', 'indumentaria', 'Pantalones', 'pantalones', 2),
('botas-calzado', 'indumentaria', 'Botas / Calzado', 'botas-calzado', 3),
('trajes-impermeables', 'indumentaria', 'Trajes Impermeables', 'trajes-impermeables', 4),
('rodilleras-coderas', 'indumentaria', 'Rodilleras / Coderas', 'rodilleras-coderas', 5),
('balaclavas-cuelleras', 'indumentaria', 'Balaclavas / Cuelleras', 'balaclavas-cuelleras', 6),

('soportes-celular', 'accesorios-moto', 'Soportes de Celular', 'soportes-celular', 1),
('cargadores-usb', 'accesorios-moto', 'Cargadores USB', 'cargadores-usb', 2),
('alforjas-maleteros', 'accesorios-moto', 'Alforjas / Maleteros', 'alforjas-maleteros', 3),
('fundas-cobertores', 'accesorios-moto', 'Fundas / Cobertores', 'fundas-cobertores', 4),
('candados-alarmas', 'accesorios-moto', 'Candados / Alarmas', 'candados-alarmas', 5),
('sliders-defensas', 'accesorios-moto', 'Sliders / Defensas', 'sliders-defensas', 6),

('faros-principales-led', 'iluminacion-luces', 'Faros Principales LED', 'faros-principales-led', 1),
('neblineros-exploradoras', 'iluminacion-luces', 'Neblineros / Exploradoras', 'neblineros-exploradoras', 2),
('direccionales-led', 'iluminacion-luces', 'Direccionales LED', 'direccionales-led', 3),
('tiras-led-decorativas', 'iluminacion-luces', 'Tiras LED Decorativas', 'tiras-led-decorativas', 4),

('lubricantes-cadena', 'limpieza-mantenimiento', 'Lubricantes de Cadena', 'lubricantes-cadena', 1),
('limpiadores-desengrasantes', 'limpieza-mantenimiento', 'Limpiadores / Desengrasantes', 'limpiadores-desengrasantes', 2),
('ceras-shampoo', 'limpieza-mantenimiento', 'Ceras / Shampoo', 'ceras-shampoo', 3),
('cepillos-herramientas', 'limpieza-mantenimiento', 'Cepillos / Herramientas', 'cepillos-herramientas', 4),

('maisto-1-18', 'motitos-escala', 'Maisto 1:18', 'maisto-1-18', 1)
ON CONFLICT (categoria_id, slug) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    orden = EXCLUDED.orden;

-- 4. PROMO ESPARTA (En estado Borrador, sin productos vinculados, lista para que el cliente la configure)
INSERT INTO public.promociones (
    id, titulo, slug, subtitulo, descripcion, tipo, descuento_tipo, descuento_valor,
    banner_desktop, banner_mobile, fecha_inicio, fecha_fin, activo
) VALUES (
    'promo-esparta-2026',
    'PROMO ESPARTA',
    'esparta',
    'LLEVA 2 CASCOS A PRECIO REBAJADO PARA TI Y TU COPILOTO',
    'Configurar los 2 cascos certificados y el precio de campaña antes de activar.',
    'combo_duo',
    'combo_duo',
    25.00,
    NULL,
    NULL,
    '2026-09-01 00:00:00+00',
    '2026-10-31 23:59:59+00',
    false
)
ON CONFLICT (id) DO UPDATE SET 
    activo = false;

-- 5. AJUSTES GENERALES DEL NEGOCIO (Oficiales y Limpios)
INSERT INTO public.ajustes_generales (clave, valor, descripcion) VALUES
('barra_superior', '{"texto": "Envíos a todo el Perú • Atención personalizada por WhatsApp", "enlace": "/contacto", "activo": true}'::jsonb, 'Mensaje superior informativo'),
('whatsapp', '{"numero": "905445698", "numeroCompleto": "+51 905 445 698", "url": "https://wa.me/51905445698"}'::jsonb, 'Configuración oficial de WhatsApp'),
('empresa', '{"nombreComercial": "IORI BIKER SHOP", "razonSocial": "IORI SAC", "ruc": "20610816089", "correo": "ioribikershop@gmail.com"}'::jsonb, 'Datos fiscales y comerciales'),
('metodos_pago_visibles', '["Yape", "Plin", "Transferencia BCP", "Transferencia BBVA", "Transferencia Interbank", "Efectivo en Tienda"]'::jsonb, 'Métodos mostrados al cliente'),
('datos_pago_plantillas', '{
    "titular": "IORI SAC",
    "numero_yape_plin": "905 445 698",
    "bancos": []
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
]'::jsonb, 'Horarios y sedes físicas'),
('tienda_en_preparacion', '{
    "activo": true,
    "mensaje": "Estamos preparando nuestro nuevo catálogo digital. ¡Muy pronto disponible!",
    "mostrar_whatsapp": true,
    "mostrar_tiendas": true
}'::jsonb, 'Modo tienda en preparación para visitantes'),
('acuotaz_config', '{
    "activo": false,
    "cuotas": null,
    "factor": null,
    "monto_minimo": null,
    "monto_maximo": null,
    "texto_franja": "Divide tu compra en cuotas con tu DNI",
    "texto_ficha": "Llévatelo en cuotas quincenales"
}'::jsonb, 'Configuración oficial de aCuotaz')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, updated_at = now();

-- 6. PLANTILLAS DE WHATSAPP OFICIALES
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
- Transferencia bancaria (solicitar cuenta por aquí)

Cuando pagues, mándanos la captura por aquí y preparamos tu pedido.',
    '["nombre", "codigo", "total", "numero_yape_plin", "titular"]'::jsonb
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

-- 7. RANGOS DE PRECIO
INSERT INTO public.rangos_precio (id, etiqueta, min, max, orden, activo) VALUES
('rango-1', 'Menos de S/ 150', 0, 150, 1, true),
('rango-2', 'S/ 150 – S/ 300', 150, 300, 2, true),
('rango-3', 'S/ 300 – S/ 600', 300, 600, 3, true),
('rango-4', 'S/ 600 – S/ 1,200', 600, 1200, 4, true),
('rango-5', 'Más de S/ 1,200', 1200, 99999, 5, true)
ON CONFLICT (id) DO NOTHING;
