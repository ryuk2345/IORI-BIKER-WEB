# Diagnóstico Visual y Arquitectura de Front: Iori Biker Shop

> **Fecha**: Septiembre 2026  
> **Objetivo**: Identificar los motivos de desorden visual y desalineación en el front de Iori Biker Shop frente a las 4 referencias oficiales de la regla `iori-contexto.md`, y establecer las directrices de rediseño bajo el sistema de diseño KTM / Kawasaki / Direli / Somos Moto.

---

## 1. Referencias Analizadas y Capturas

Se realizaron capturas de pantalla completas y de viewport a **1440 px (Desktop)** y **390 px (Mobile)** de las 4 referencias de la regla y del sitio en localhost (`/`, `/productos`, `/producto/[slug]`, `/carrito`):

| Sitio de Referencia | URL Oficial | Patrón de Diseño Extraído |
| :--- | :--- | :--- |
| **Direli Motos** | `direlimotos.com` | Header compacto de una fila, franja aCuotaz limpia justo debajo del header, pocas categorías directas y filas de productos con "Ver todo →". |
| **Somos Moto** | `tienda.somosmoto.pe` | Home estructurada por categoría con tarjetas fotográficas verticales 4:5 y una fila uniforme de productos por cada categoría principal. |
| **Kawasaki Perú** | `kawasaki.com.pe/productos/categoria/cascos/` | Navegación con breadcrumb, barra de orden estándar, filtros laterales con contador exacto por opción (marca, precio, talla, color), conteo total y paginación clara. |
| **KTM PowerWear** | `ktm.com/es-pe/piezasyropa/powerwear/` | Lenguaje visual rector: base blanca, negra y gris tenue (`#F5F5F5`), naranja reservado estrictamente para acentos (CTA principal, ofertas, badges activos), títulos en mayúsculas con fuente condensada y esquinas rectas o ≤ 4 px. Sin degradados. |

Las capturas tomadas se encuentran archivadas en `docs/rediseno/capturas/` para trazabilidad y comparación antes/después:
- `ref_direlimotos_1440_viewport.png` / `ref_direlimotos_390_viewport.png`
- `ref_somosmoto_1440_viewport.png` / `ref_somosmoto_390_viewport.png`
- `ref_kawasaki_1440_viewport.png` / `ref_kawasaki_390_viewport.png`
- `ref_ktm_1440_viewport.png` / `ref_ktm_390_viewport.png`
- `local_home_antes_1440_viewport.png` / `local_home_antes_390_viewport.png`
- `local_catalogo_antes_1440_viewport.png` / `local_catalogo_antes_390_viewport.png`
- `local_producto_antes_1440_viewport.png` / `local_producto_antes_390_viewport.png`
- `local_carrito_antes_1440_viewport.png` / `local_carrito_antes_390_viewport.png`

---

## 2. Hallazgos: ¿Por qué nuestro sitio se ve desordenado?

### A. Secciones de más y sobrecarga vertical
1. **Doble barra superior ruidosa (`TopBar`)**: El sitio contaba con una franja naranja vibrante con texto de promo activa sobre una barra negra con teléfonos, correos y enlaces secundarios. Esto empujaba el contenido útil hacia abajo y competía visualmente con el header.
2. **Proliferación de componentes huérfanos en la Home**: Existían más de 12 bloques y widgets heterogéneos (`BannersTrio`, `FeaturedCards`, `HelpCards`, `LimitedTimeDeals`, `BestDealsCarousel`, `ConsejosBiker`, `WidePromoBanner`, `SiguenosSocial`), creando un ritmo visual inconexo con tarjetas de proporciones dispares (unas apaisadas, otras cuadradas, otras rectangulares).
3. **Falta de apego al orden de Home de la regla**: La regla establece exactamente 11 bloques:
   1. Hero slider (1 a 3 banners)
   2. Beneficios en una sola línea
   3. COMPRA POR CATEGORÍA (8 tarjetas 4:5; 4x2 en desktop, 2x4 en móvil)
   4. PROMO ESPARTA u OFERTAS (fila de productos si está activa)
   5. CASCOS (chips + fila)
   6. INDUMENTARIA (chips + fila)
   7. ACCESORIOS PARA MOTO (chips + fila)
   8. NUEVOS INGRESOS (fila)
   9. NUESTRAS MARCAS (grilla fija de logos)
   10. VISÍTANOS (2 tiendas lado a lado)
   11. Footer institucional

### B. Tarjetas distintas y falta de componentes únicos
1. **Multiplicidad de tarjetas**: Se detectaron variaciones de `ProductCard` y tarjetas de categorías en diferentes componentes con botones flotantes, bordes de 8px, 12px y 16px (`rounded-xl`, `rounded-2xl`).
2. **Ruptura de la regla de esquinas y sombras**: Varias secciones tenían `rounded-2xl` y sombras intensas persistentes, en contradicción directa con la directriz del cliente: *esquinas rectas o de máximo 4 px; sombras únicamente al hacer hover*.
3. **Badges caóticos y botones invasivos**: Productos con 2 o 3 badges amontonados (-20%, NUEVO, HOMOLOGADO ECE) y botones "Agregar al Carrito" fijos sobre la imagen que tapaban el producto. La regla exige: *máximo 1 badge (-%, Nuevo o Agotado), foto 1:1 limpia sobre blanco, segunda foto al hover, toda la tarjeta clicable sin botones fijos*.
4. **Tarjetas de categoría no estandarizadas**: Convivían un grid y carruseles con proporciones cuadradas o circulares, en vez de un único `CategoryTile` en proporción **4:5**.

### C. Espaciados irregulares y ruptura de la grilla
1. **Múltiples contenedores**: Se mezclaban clases como `max-w-7xl`, `max-w-[1440px]`, `max-w-screen-xl` y `container-iori`. El contenido oscilaba en anchos laterales al hacer scroll.
2. **Separación entre secciones sin métrica**: Distancias verticales arbitrarias (24px, 36px, 50px, 80px, 96px). El sistema de diseño exige:
   - Contenedor fijo de **1280 px** con márgenes laterales de **16 px en móvil** y **24 px en desktop**.
   - Espaciado modular **estrictamente en múltiplos de 8**.
   - Separación entre secciones fija: **64 px en desktop** (`py-16` o `gap-16`) y **40 px en móvil** (`py-10` o `gap-10`).

### D. Colores y saturación
1. **Saturación del color naranja (#F58220)**: Utilizado en fondos completos de barra, bordes gruesos y textos secundarios, perdiendo su efectividad como acento de conversión.
2. **Ausencia de alternancia armónica**: Secciones con fondos gris oscuro intermedio o degradados (`bg-gradient-to-r`).
   - El estándar KTM / Iori define: **negro** en header, footer y bandas oscuras puntuales; **blanco** y **gris muy claro (#F5F5F5)** para alternar bandas; **naranja** reservado exclusivamente para el botón principal, precios de oferta, badges y estados activos. Sin ningún tipo de degradado.

### E. Jerarquía tipográfica y experiencia móvil
1. **Falta de tipografía unificada**: Títulos usando pesos variados e interpolaciones inconsistentes. La regla fija: *títulos en MAYÚSCULAS con Barlow Condensed 700; textos con Inter*.
2. **Escala tipográfica desbordada**: Uso de tamaños arbitrarios (13px, 15px, 21px). La escala del sistema debe ser exactamente: **40, 32, 24, 18, 16, 14 y 12 px**.
3. **Colapso en 390 px (Móvil)**:
   - El header móvil mostraba 5 elementos apelmazados (logo diminuto, botón Ofertas, usuario, bolsa y hamburguesa) además del input de búsqueda, ocupando casi 220 px de alto antes de ver el hero.
   - La franja de aCuotaz se desbordaba en 3 líneas desordenadas en pantallas pequeñas.
   - En listado no existía el drawer unificado de filtros móviles.
   - En producto móvil faltaba la barra fija inferior con precio y "Agregar al carrito".

---

## 3. Plan de Acción de Rediseño

1. **Tokens y Sistema Base (`globals.css`)**:
   - Variables CSS rígidas: contenedor 1280 px, escala 40/32/24/18/16/14/12 px, radios ≤ 4 px, paleta blanca/negra/`#F5F5F5` con naranja `#F58220` solo en acentos.
2. **Componentes Clave Únicos (Eliminación de variantes duplicadas)**:
   - `SectionHeader`: Título mayúsculas a la izquierda, bajada opcional, "Ver todo →" a la derecha.
   - `ProductCard`: Foto 1:1 sobre blanco, swap en hover, marca gris, título a 2 líneas, precio (tachado opcional), máximo 1 badge, tarjeta 100% clicable.
   - `CategoryTile`: Tarjeta vertical 4:5 con foto, degradado de legibilidad inferior tenue y texto mayúsculas.
   - `Carousel`: Un solo componente de carrusel reutilizable para filas de productos (4 en desktop, 2 en móvil).
3. **Header y Franja aCuotaz**:
   - Header negro en 1 fila (desktop con segunda fila de 8 categorías + Marcas con dropdown simple).
   - Franja aCuotaz compacta y perfectamente responsive.
   - En móvil: Logo, lupa/búsqueda compacta, carrito y hamburguesa con drawer acordeón.
4. **Páginas Principales**:
   - **Home**: Estricto orden de 11 bloques de la regla, eliminando componentes obsoletos.
   - **Listado (`/productos`)**: Breadcrumb, título con contador, chips de subcategorías, barra de orden (Relevancia, Menor precio, Mayor precio, Recientes, A-Z), sidebar de filtros con contador por opción y drawer en móvil.
   - **Ficha de Producto (`/producto/[slug]`)**: Galería 1:1, bloque derecho con precios, widget aCuotaz de ejemplo, selectores de talla/color, pestañas/acordeones de especificaciones, y barra fija inferior en móvil.
   - **Carrito (`/carrito`)**: Diseño limpio sin saturación, selector de método de pago con cuotas aCuotaz destacado y cálculo claro.
   - **Footer**: Estructura institucional completa de 4 columnas, medios de pago con aCuotaz, RUC y Libro de Reclamaciones.
