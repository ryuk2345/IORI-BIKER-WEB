# Proyecto: tienda online de Iori Biker Shop

Responde y escribe todos los artifacts (planes, tareas, walkthroughs) en español.
Esta regla refleja los requerimientos del cliente y las decisiones del proyecto. Si un prompt la contradice, pregúntame antes de decidir.

## Negocio
- Iori Biker Shop (IORI S.A.C., RUC 20610816089), desde 2023: tienda de accesorios para moto e indumentaria biker. Envíos a todo el Perú.
- WhatsApp: +51 905 445 698 (https://wa.me/51905445698). Correo: ioribikershop@gmail.com
- Tienda Independencia (principal): Av. Contisuyo 418, Tahuantinsuyo, Independencia, Lima. Lunes a sábado de 9 a. m. a 10 p. m.; domingos y feriados de 11 a. m. a 8 p. m.
- Tienda La Victoria: Av. Nicolás Arriola 901, La Victoria, Lima. Lunes a sábado de 9 a. m. a 6 p. m.; domingos [PENDIENTE].
- Redes: Facebook, Instagram y TikTok como "Iori Biker Shop" (URLs [PENDIENTE]).
- Financiamiento: trabajan con aCuotaz (Apurata), cuotas sin tarjeta solo con DNI.
- [PENDIENTE], nunca inventado: dominio, zonas, costos y tiempos de envío, textos de políticas, datos de pago (Yape/Plin y cuentas) y número de cuotas y factor del estimado de aCuotaz.

## Referencias de diseño (patrones, nunca logos, fotos, textos ni código)
- direlimotos.com: header compacto, franja de aCuotaz bajo el header, pocas categorías grandes y filas de productos con "Ver todo".
- tienda.somosmoto.pe: home ordenada por categoría, con tarjetas con foto y una fila de productos por categoría.
- kawasaki.com.pe/productos/categoria/cascos/: breadcrumb, orden, filtros con contador por marca, precio, talla y color, total de resultados y paginación.
- ktm.com/es-pe/piezasyropa/powerwear/products.html: lenguaje visual. Misma paleta que Iori (naranja, negro y blanco) con el naranja solo como acento, mucho blanco, fotos grandes y títulos condensados en mayúsculas.
makemusic.pe deja de ser la referencia.

## Sistema de diseño
- Paleta: negro en header, footer y bandas oscuras; blanco y gris muy claro (#F5F5F5) para alternar bandas. El naranja del logo solo en el botón principal, precios de oferta, badges y estados activos. Degradado oscuro sutil solo del lado del texto en banners.
- Tipografía: títulos en MAYÚSCULAS con Barlow Condensed 700; textos con Inter. Escala fija: 40, 32, 24, 18, 16, 14 y 12 px (títulos del hero: 56 a 64 px en desktop y 36 px en móvil).
- Esquinas rectas o de máximo 4 px; sombras solo al pasar el mouse.
- Contenedor de 1280 px, grilla de 12 columnas, márgenes de 16 px en móvil y 24 px en desktop. Espaciado solo en múltiplos de 8; 64 px entre secciones en desktop y 40 px en móvil.
- Un solo SectionHeader: título a la izquierda, bajada opcional y "Ver todo →" a la derecha.
- Una sola ProductCard: foto 1:1 sobre blanco, segunda foto al hover, marca en gris, nombre en máximo 2 líneas, precio (y tachado si hay oferta) y máximo 1 badge (-%, Nuevo o Agotado). Toda la tarjeta es clicable, sin botones fijos.
- Un solo estilo de carrusel. Las filas de productos muestran 4 productos en desktop y 2 en móvil. Solo se muestran las filas de productos si tienen 4 productos o más. Las grillas de listado van a 4, 3 y 2 columnas.
- Íconos lucide del mismo tamaño y grosor.
- Proporciones: fotos de producto SIEMPRE 1:1 (pedido del cliente); hero en mosaico (máximo 520 px de alto en desktop): slider principal 16:9 en desktop y 4:5 en móvil, promos laterales fijas 16:9; tarjetas de categoría 4:5.
- Detalles visuales: tarjetas de categoría con zoom suave al pasar el mouse, contador de productos y degradado inferior para el título; textura de grano sutil (CSS) en las bandas oscuras y separadores en diagonal entre bandas oscuras y claras, sin exagerar; animación de entrada suave al hacer scroll, respetando prefers-reduced-motion.

## Categorías y subcategorías (definidas por el cliente, editables desde el admin)
- Cascos (+200 modelos): Integrales, Abatibles, Open face, Cross / Doble propósito, Niños, Femeninos
- Accesorios para casco: Bluetooth / Intercomunicadores, Visores, Decorativos, Otros
- Guantes
- Indumentaria: Casacas, Botas, Impermeables, Otros
- Accesorios para moto: Porta celular, Manijas, Porta placa, Espejos, Cajuelas, Muñequitos biker, Otros
- Iluminación / Luces
- Limpieza / Mantenimiento: Aceites, Lubricante / Desengrasante, Otros
- Motitos a escala

## Marcas
LS2, Xkudo, Kratoz, Soman, Logan, Xtreme, HJC, Shaft, MT Helmets, Alpinestars, Airoh, SFX, Royal y Motowolf. Logos placeholder hasta tener los oficiales.

## Header y navegación
- Header negro en una fila: logo, buscador ancho con sugerencias, Mi cuenta, carrito con monto y contador, y botón naranja "Ofertas". Se compacta al hacer scroll.
- Franja de aCuotaz justo debajo del header, en todas las páginas: logo de aCuotaz, "Divide tu pago en hasta {N} cuotas", etiqueta "Sin tarjeta, solo con tu DNI" y enlace "¿Cómo funciona?" a /financiamiento.
- Desktop: segunda fila con las 8 categorías y "Marcas"; cada una abre un desplegable simple con sus subcategorías, sin mega menú de columnas.
- Móvil: logo, buscar y carrito; menú hamburguesa en drawer con acordeones.
- Botón flotante de WhatsApp en la tienda.
- Se navega por categoría, marca y rango de precio. No hay navegación por uso, modelo ni cilindrada.

## Home (en este orden; cada fila se activa o desactiva desde el admin, oculta si no tiene contenido)
1. Hero en mosaico: contenedor de 1280 px, máximo 520 px de alto en desktop. Slider principal a 2/3 del ancho (imagen 16:9 en desktop y 4:5 en móvil) y dos promos fijas apiladas a 1/3 (16:9), editables desde Banners con ubicación "Hero lateral". Degradado oscuro solo del lado del texto, título de 56 a 64 px en desktop y 36 px en móvil, con etiqueta, bajada, botón y precio gancho opcional ("Desde S/ 249.90"). En móvil: slider arriba y las dos promos en fila debajo.
2. Beneficios: franja debajo del hero, en fondo blanco con íconos naranjas en una sola línea (Envíos a todo el Perú · Recojo en 2 tiendas · Yape, Plin o transferencia · Atención por WhatsApp).
3. Compra por categoría: las 8 categorías como tarjetas con foto (4:5) con zoom suave al pasar el mouse, contador de productos y degradado inferior para el título.
4. Promo Esparta destacada (si está activa): imagen grande, texto, contador opcional hasta el 31/10 y sus productos.
5. Cascos: chips de subcategorías y una fila de productos (solo si tiene 4 productos o más).
6. Arma tu equipo: banda oscura con textura de grano y foto de motociclista de cuerpo entero con 5 puntos interactivos (casco, guantes, casaca, pantalón y botas). Cada punto abre una tarjeta con su categoría y hasta 3 productos. En el admin, se hace clic sobre la imagen para colocar cada punto y elegir su categoría. Oculto si no tiene contenido.
7. Indumentaria: chips y una fila de productos (solo si tiene 4 productos o más).
8. Accesorios para moto: chips y una fila de productos (solo si tiene 4 productos o más).
9. Nuevos ingresos: una fila de productos (solo si tiene 4 productos o más).
10. Marcas: grilla fija de logos en gris que toman color al pasar el mouse.
11. Opiniones de clientes: solo opiniones reales cargadas desde el admin (nombre, texto, estrellas, fuente y fecha). Nunca texto inventado. Oculto si no tiene contenido.
12. Visítanos: fotos reales de cada tienda (fachada e interior) junto al mapa, el horario y el botón "Cómo llegar".
13. Síguenos: grilla de 6 imágenes cargadas desde el admin, cada una con su enlace a Instagram o TikTok. Oculto si no tiene contenido.
14. Footer: contacto y direcciones; Tienda; Ayuda (Preguntas frecuentes, Envíos y devoluciones, Financiamiento, Trabaja con nosotros, Blog); redes; medios de pago con aCuotaz; Libro de Reclamaciones; razón social y RUC.

## Listado (categoría, subcategoría, marca, búsqueda y ofertas)
- Breadcrumb, título con número de productos y chips de subcategorías arriba.
- Barra con orden (Relevancia, Menor precio, Mayor precio, Más recientes, Nombre A-Z). En móvil, botón "Filtros" que abre un drawer.
- Desktop: filtros a la izquierda con contador por opción (subcategoría, marca, precio desde/hasta, talla, color, disponibilidad y en oferta), chips de filtros activos y "Limpiar todo".
- Grilla de ProductCard, paginación numerada y estado vacío con sugerencias.

## Ficha de producto
- Breadcrumb; galería 1:1 con miniaturas y zoom a la izquierda. A la derecha: marca, nombre, SKU, calificación, precio (oferta, tachado y % de ahorro) y justo debajo el recuadro de cuotas estimadas de aCuotaz.
- Talla con botones, color con muestras, stock ("Quedan 3") y cantidad. Botón principal "Agregar al carrito" y secundario "Cotizar por WhatsApp", según el modo de venta.
- Debajo, en pestañas o acordeones: Descripción, Ficha técnica, Guía de tallas y Reseñas. Luego "También te puede interesar".
- En móvil, barra fija inferior con precio y "Agregar al carrito".

## Productos
- Modo de venta "online" (carrito y cotizar) o "solo cotizar". Todos pueden cotizarse por WhatsApp.
- Datos: nombre y SKU, marca, precio normal y de oferta, varias fotos 1:1, descripción, ficha técnica, stock, variantes de talla y color con stock propio, reseñas y relacionados.
- Precios y stock cambian todos los días: el admin los actualiza en bloque desde Excel.

## Promociones
- Tipos: descuento en % o monto fijo, combos y packs, cupones, envío gratis desde un monto, regalo por compra, promociones por fecha y outlet o liquidación. Todas con fecha de inicio y fin, activables desde el admin.
- Al lanzar: "Promo Esparta", precio rebajado en 2 cascos ([PENDIENTE] cuáles y a qué precio), vigente hasta el 31 de octubre de 2026.
- Se muestran en el hero, con badge -% en el producto y en /ofertas.

## Pedidos y pagos
- La web no cobra directamente: no hay pasarela de tarjetas.
- En el carrito el cliente elige cómo pagar:
  a) Yape, Plin o transferencia: la web valida precios y stock en el servidor, registra el pedido con correlativo (IORI-000001) y abre WhatsApp al +51 905 445 698 con el detalle. Atención al cliente envía los QR o cuentas, valida el pago y actualiza el estado en el admin.
  b) En cuotas con aCuotaz: el pedido se envía por WhatsApp igual que la opción a), con 'Pago: en cuotas con aCuotaz' y la cuota estimada. Atención al cliente le envía el enlace de aCuotaz y coordina todo por WhatsApp.
- El precio válido es el del pedido registrado, no el texto del mensaje de WhatsApp.
- Estados: Nuevo, Esperando pago, Pagado, En preparación, En camino, Listo para recojo, Entregado y Cancelado.
- Stock: se descuenta al marcar "Pagado".

## aCuotaz (solo visual; el financiamiento se coordina por WhatsApp)
- No hay integración con aCuotaz: nada de API, webhooks, widgets externos ni preevaluación.
- Franja bajo el header en todas las páginas, como en direlimotos.com: logo oficial de aCuotaz (/public/brand/acuotaz.svg), "Divide tu pago en hasta {n} cuotas", etiqueta "Sin tarjeta, solo con tu DNI" y enlace a /financiamiento.
- Recuadro de cuotas estimadas en la ficha, debajo del precio y del SKU y antes de las tallas: "Llévatelo en {n} cuotas quincenales de {cuota}", etiqueta "Sin tarjeta de crédito", enlace "Conoce más" a /financiamiento y logo de aCuotaz a la derecha.
- Cálculo: cuota = precio × factor ÷ n, redondeada hacia arriba al céntimo. Debajo, siempre: "Monto referencial, sujeto a evaluación y condiciones de aCuotaz."
- Ajustes editables en el admin: activo, número de cuotas (n), factor, monto mínimo y máximo, y textos. Mínimo S/ 100 y máximo S/ 2,000 por defecto.
- Si falta el factor, el recuadro muestra solo "Paga en cuotas sin tarjeta, solo con tu DNI", sin montos. Si el precio está fuera del mínimo o del máximo, el recuadro no aparece.

## Envíos
Delivery en Lima, envío a provincias por Shalom o Mavisur y recojo en cualquiera de las 2 tiendas. Zonas, tarifas y tiempos configurables desde el admin; si no hay tarifa, se indica "Se coordina por WhatsApp".

## Páginas
Inicio, Tienda, Ofertas, Marcas, Financiamiento (cómo comprar en cuotas con aCuotaz por WhatsApp, requisitos y preguntas), Blog / Consejos, Preguntas frecuentes, Contacto y ubicación (mapas de las 2 tiendas), Políticas de envío y devoluciones, Trabaja con nosotros (formulario con CV), Mi cuenta, Libro de Reclamaciones, Política de privacidad y Términos y condiciones. No hay página Nosotros ni de taller.

## Rutas
/, /productos (filtros por query: cat, sub, marca, precio_min, precio_max, talla, color, stock, oferta, orden, buscar, page), /categoria/[slug], /categoria/[slug]/[sub], /marcas, /marca/[slug], /producto/[slug], /ofertas, /lo-nuevo, /combos, /outlet, /promo/[slug], /carrito, /pedido/[token], /financiamiento, /blog, /blog/[slug], /preguntas-frecuentes, /contacto, /trabaja-con-nosotros, /politicas/[slug], /libro-de-reclamaciones, /mi-cuenta, /admin

## Admin (simple, para personal no técnico)
Patrones de referencia: el admin de Shopify (una página por producto con columna principal, columna lateral y barra fija de guardar) y demo.filamentphp.com (módulo Shop). Nunca copies su código ni su marca.

### Estructura
- Layout propio, sin el header de la tienda: menú lateral (drawer en móvil) y barra superior con buscador global (pedido por código o celular, producto por nombre o SKU), "Ver tienda" y usuario.
- Menú: Inicio · Pedidos (con contador de nuevos) · Productos · Categorías y marcas · Banners · Promociones · Mensajes (reclamaciones, contacto, postulaciones y reseñas) · Contenido (blog y preguntas frecuentes) · Ajustes.
- Atención al cliente solo ve Inicio, Pedidos y Mensajes.

### Reglas de UX
- Todo en español y con etiquetas humanas: nunca se muestran valores internos como recojo_independencia. Fechas dd/mm/aaaa junto a "hace 5 min".
- Componentes únicos: DataTable (buscador, filtros, orden, paginación y estado vacío), FormSection (tarjeta con título y texto de ayuda), barra fija de guardar con aviso de cambios sin guardar, confirmación en acciones destructivas, toasts y skeletons.
- Estilo neutro (blanco y grises) con el naranja solo en la acción principal.
- Funciona bien en celular, porque Pedidos se usa desde el teléfono.

### Inicio
- 4 indicadores: pedidos nuevos, pedidos por cobrar, vendido hoy y en la semana (pedidos pagados) y productos agotados.
- Lista "Requiere atención": pedidos en Nuevo hace más de 1 hora, pedidos en Esperando pago hace más de 24 horas y productos con stock bajo.

### Productos
- Lista:
  - Columnas: foto, nombre, SKU, categoría, precio y stock editables en línea (si tiene variantes, se abre un popover con el stock de cada una), estado (Publicado o Borrador) y menú de acciones (editar, duplicar, ver en tienda, eliminar).
  - Filtros por categoría, marca, estado y stock (agotado o bajo).
  - Acciones masivas: publicar, ocultar, cambiar categoría y eliminar.
  - Botones arriba: "Nuevo producto", "Importar Excel", "Exportar" y "Subir fotos por SKU".
- Formulario en UNA sola página para crear y editar, sin pestañas.
  - Columna principal:
    1) Información: nombre, descripción y ficha técnica en filas "característica: valor".
    2) Fotos: zona para arrastrar varias fotos y miniaturas 1:1 ordenables. La primera es la portada y se cambia con una estrella. Cada foto abre el recorte cuadrado con zoom y arrastre.
    3) Precio: precio normal y de oferta, con vista previa del % de descuento y de la cuota estimada de aCuotaz.
    4) Stock y variantes: sin tallas ni colores, SKU y stock. Con tallas o colores, se eligen como chips y se genera una tabla editable (variante, SKU, stock y precio opcional) con "aplicar a todas".
  - Columna lateral: "¿Mostrar en la web?", modo de venta (Online o Solo cotizar), categoría y subcategoría dependientes, marca (con opción de crear una nueva), etiqueta (Nuevo o Más vendido) y enlace "Ver en la tienda".
  - Sin campos de repuestos (OEM, compatibilidad ni fabricante).
- La importación y exportación de Excel y la carga masiva de fotos viven dentro de Productos, no en pestañas aparte.

### Pedidos
- Lista en tabla en desktop y en tarjetas en móvil:
  - Columnas: código, hace cuánto, cliente y celular, entrega ("Recojo · Independencia", "Delivery · Surquillo", "Provincia · Shalom"), pago (Yape/Plin/transferencia o Cuotas aCuotaz), total y estado con color.
  - Filtros como pestañas con contador: Nuevos, Esperando pago, Pagados, En preparación, En camino, Listos para recojo, Entregados, Cancelados y Todos.
  - Los pedidos Nuevos de más de 1 hora se resaltan.
- Detalle en una sola página:
  - Línea de pasos del estado.
  - Botón con la siguiente acción ("Marcar como pagado", "Marcar en camino"…) en vez de un select, y "Cancelar pedido" aparte con confirmación.
  - Tarjetas: cliente (con botón de WhatsApp); entrega (con código de seguimiento); productos con foto; totales; pago (método y número de operación, obligatorio al marcar pagado); plantillas de WhatsApp como botones; notas internas; historial de cambios con usuario y hora.
- Cada pedido tiene un solo estado, y el que se muestra es el mismo que se edita.

### Demás módulos (mismo patrón: lista y formulario de una página)
- Banners: vista previa desktop y móvil, recortes según tipo (slide principal 16:9 desktop y 4:5 móvil; lateral 16:9), ubicación ("Hero slider", "Hero lateral", "Destacados"), enlace elegido con un buscador de categorías, productos o promociones (sin escribir URLs), fechas, activo y orden con drag & drop.
- Categorías y marcas: árbol ordenable con drag & drop y subcategorías en línea; marcas con logo.
- Promociones: tipo, valor, a qué aplica, fechas y texto del badge; estado Activa, Programada o Vencida.
- Ajustes agrupados: Tienda, Pagos y datos para plantillas, aCuotaz, Envíos, Plantillas de WhatsApp y Usuarios.

## Reglas de trabajo
- Textos en español de Perú, tuteando. Precios con Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).
- Usa los nombres de categorías, subcategorías y marcas tal como están en esta regla.
- Lo marcado [PENDIENTE] se muestra como placeholder visible y editable; nunca lo inventes. Los datos de prueba van marcados como DEMO.
- Las secciones sin contenido activo se ocultan solas.
- Server Components por defecto; 'use client' solo en lo interactivo.
- Componentes en src/components/{layout,home,catalog,product,cart,admin,ui}; tipos en src/types alineados con Supabase. Los componentes reciben sus datos por props.
- Accesibilidad: alt, aria-labels, foco visible, navegación con teclado y contraste AA.
- Rendimiento: next/image con sizes correctos y carga diferida bajo el pliegue.
- Al cerrar cada tarea: abre localhost, toma capturas a 390 y 1440 px, verifica que se cumpla el sistema de diseño y recién entonces reporta con un walkthrough.
- No toques archivos fuera del alcance de la tarea sin avisarme.
