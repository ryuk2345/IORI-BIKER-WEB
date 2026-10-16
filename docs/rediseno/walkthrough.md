# Walkthrough de Rediseño Integral de Frontend: Iori Biker Shop

> **Regla de Referencia:** `.agents/rules/iori-contexto.md`  
> **Referencias de Diseño:** `direlimotos.com`, `tienda.somosmoto.pe`, `kawasaki.com.pe`, `ktm.com` (PowerWear).  
> **Fecha de Finalización:** 29 de Septiembre, 2026.  
> **Restricciones Respetadas:** 100% frontend. Sin alteraciones a panel Admin (`/admin`), sin mutaciones de esquema ni tablas de Supabase, preservación íntegra de props y capa de datos (`types/`, `data/mock.ts`, Zustand stores).

---

## 1. Resumen Ejecutivo del Rediseño

El sitio presentaba inconsistencias visuales, saturación de sombras profundas y esquinas redondeadas excesivas (`rounded-3xl`, `rounded-2xl`), multiplicidad de estilos de tarjetas de producto, gradientes oscuros dispersos y una jerarquía tipográfica sin escala estricta.

Siguiendo la nueva dirección de diseño inspirada en e-commerce motero de alto estándar (**Direli Motos**, **Somos Moto**, **Kawasaki Perú** y **KTM PowerWear**), se implementó un sistema de diseño sobrio, técnico y angular:
1. **Paleta Rigurosa:** Fondo blanco dominante, bandas alternas en gris neutro técnico (`#F5F5F5`), fondos negros planos (`#111111`) en Header, Navegación y Footer. El naranja Iori (`#F58220`) se reservó **exclusivamente como color de acento** (botones primarios, precios de oferta, badges y estados activos). Sin gradientes.
2. **Tipografía Estricta:** Títulos en **Barlow Condensed 700 uppercase** con tracking técnico. Textos de cuerpo y lectura en **Inter**. Escala fija de 7 tamaños (`text-40`, `text-32`, `text-24`, `text-18`, `text-16`, `text-14`, `text-12`).
3. **Morfología y Bordes:** Esquinas vivas o con radio máximo de 4px (`rounded-[4px]`). Eliminación total de sombras estáticas difusas; elevación sutil solo en `:hover`.
4. **Unificación de Componentes Clave:** 
   - Un único `SectionHeader` con título mayúscula, bajada y "VER TODO →".
   - Un único `ProductCard` (foto cuadrada 1:1 sobre blanco, swap de imagen en hover, marca visible en gris, máximo 1 badge, precio regular tachado y precio oferta en naranja, 100% clickeable).
   - Un único `ProductCarousel` embla con navegación simétrica y avance de 4 productos en desktop y 2 en mobile.
   - Un único `CategoryTile` con proporción 4:5 y tipografía angular legible.
5. **Franja aCuotaz:** Franja compacta y sobria debajo del header en todas las páginas, widget técnico en la ficha de producto y bloque informativo de pago en cuotas en el checkout del carrito (con datos de ejemplo, listo para integración futura).
6. **Estructura Estricta de la Home:** 10 filas de contenido exactamente ordenadas según la regla.

---

## 2. Matriz Comparativa: Antes vs. Después

| Vista | Estado Anterior | Estado Rediseñado (Nuevo) |
| :--- | :--- | :--- |
| **Header y Navegación** | TopBar con promociones estridentes; buscador genérico con bordes redondeados tipo píldora; dos filas desconectadas; navegación móvil compleja. | Header unificado en una sola fila en desktop (Logo, buscador ancho con botón naranja, Ofertas, Mi Cuenta, Carrito con total acumulado). Segunda fila sobria con 8 categorías principales + Marcas. Franja aCuotaz compacta a 12 cuotas. Drawer móvil limpio con acordeones. |
| **Home Page** | Secciones duplicadas; sliders con tarjetas redondeadas flotantes; testimonios y banners promocionales saturados de gradientes; inconsistencia de márgenes y espaciados verticales. | 10 filas exactas: 1) Hero slider (21:9 desktop / 4:5 mobile con barras planas KTM), 2) Franja de 4 beneficios clave, 3) Compra por Categoría (grilla 4x2 con `CategoryTile` 4:5), 4) Promo Esparta / Ofertas del mes con `ProductCarousel`, 5) Cascos con `ProductCarousel`, 6) Indumentaria con `ProductCarousel`, 7) Accesorios para Moto con `ProductCarousel`, 8) Nuevos Ingresos con `ProductCarousel`, 9) Nuestras Marcas (carrusel de logos monocromos con hover a color), 10) Visítanos en Tienda (2 sedes). |
| **Catálogo de Productos** | Filtros tipo acordeón desalineados; chips desordenados; tarjetas con múltiples botones "Añadir" y "Comprar" dentro del cuadro; ausencia de conteo exacto por filtro. | Barra superior con conteo dinámico de resultados `TODOS LOS PRODUCTOS (N)`, selector de ordenamiento limpio estilo Somos Moto, chips de subcategorías horizontales, barra lateral izquierda estilo Kawasaki con contadores por categoría, marca, precio, certificación y talla. Grilla uniforme de 4 columnas (desktop), 3 (tablet) y 2 (mobile). |
| **Ficha de Producto** | Disposición asimétrica; múltiples badges amontonados; widgets invasivos; selectores de talla poco claros; ausencia de barra de compra fija en móviles. | Columna izquierda: galería cuadrada 1:1 con thumbnails limpios y zoom al click. Columna derecha: marca, SKU, título Barlow Condensed, rating de estrellas, precio de oferta destacado, widget aCuotaz sin tarjeta de crédito, selectores de talla y color en cajas limpias, indicador de stock real, botón principal naranja de ancho completo. Pestañas técnicas tabuladas y barra flotante sticky inferior en mobile. |
| **Carrito y Checkout** | Tarjetas con bordes ultra redondeados (`rounded-3xl`), sombras pesadas, campos desalineados y falta de claridad entre pago directo y cuotas. | Contenedor unificado `max-w-[1280px]`, tabla de productos en formato lista limpia, edición ágil de cantidad, resumen económico desglosado (subtotal, envío gratis, cupón y total destacado en naranja) e integración de opción de pago con aCuotaz en cuotas sin tarjeta. |

---

## 3. Registro de Capturas de Pantalla (Evidencia Visual)

Todas las capturas han sido registradas y almacenadas en [docs/rediseno/capturas](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas).

### 3.1. Desktop (1440 px)

#### Home
- **Antes (Viewport):** [local_home_antes_1440_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_home_antes_1440_viewport.png)
- **Después (Viewport):** [local_home_despues_1440_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_home_despues_1440_viewport.png)
- **Después (Página Completa):** [local_home_despues_1440_full.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_home_despues_1440_full.png)

#### Catálogo
- **Antes (Viewport):** [local_catalogo_antes_1440_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_catalogo_antes_1440_viewport.png)
- **Después (Viewport):** [local_catalogo_despues_1440_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_catalogo_despues_1440_viewport.png)
- **Después (Página Completa):** [local_catalogo_despues_1440_full.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_catalogo_despues_1440_full.png)

#### Ficha de Producto
- **Antes (Viewport):** [local_producto_antes_1440_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_producto_antes_1440_viewport.png)
- **Después (Viewport):** [local_producto_despues_1440_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_producto_despues_1440_viewport.png)
- **Después (Página Completa):** [local_producto_despues_1440_full.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_producto_despues_1440_full.png)

#### Carrito de Compras
- **Antes (Viewport):** [local_carrito_antes_1440_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_carrito_antes_1440_viewport.png)
- **Después (Viewport):** [local_carrito_despues_1440_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_carrito_despues_1440_viewport.png)
- **Después (Página Completa):** [local_carrito_despues_1440_full.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_carrito_despues_1440_full.png)

---

### 3.2. Tablet (768 px)

- **Home (Viewport):** [local_home_despues_768_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_home_despues_768_viewport.png)
- **Catálogo (Viewport):** [local_catalogo_despues_768_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_catalogo_despues_768_viewport.png)
- **Ficha de Producto (Viewport):** [local_producto_despues_768_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_producto_despues_768_viewport.png)
- **Carrito (Viewport):** [local_carrito_despues_768_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_carrito_despues_768_viewport.png)

---

### 3.3. Mobile (390 px)

- **Home (Viewport):** [local_home_despues_390_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_home_despues_390_viewport.png)
- **Catálogo (Viewport):** [local_catalogo_despues_390_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_catalogo_despues_390_viewport.png)
- **Ficha de Producto (Viewport):** [local_producto_despues_390_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_producto_despues_390_viewport.png)
- **Carrito (Viewport):** [local_carrito_despues_390_viewport.png](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/local_carrito_despues_390_viewport.png)

---

## 4. Archivos Modificados e Implementaciones Clave

1. [src/app/globals.css](file:///Users/user/Documents/web%20de%20iori/src/app/globals.css):
   - Tokens de color HSL exactos (`--background`, `--foreground`, `--primary #F58220`, `--muted #F5F5F5`, `--border #E5E5E5`).
   - Clases de tipografía estricta: `.text-40`, `.text-32`, `.text-24`, `.text-18`, `.text-16`, `.text-14`, `.text-12`.
   - Utilidades estructurales: `.container-iori` (`max-w-[1280px]`), `.section-py` (64px desktop / 40px mobile), botones planos `.btn-primary`, `.btn-secondary`, `.btn-outline` con bordes de 4px.
2. [src/components/ui/SectionHeader.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/ui/SectionHeader.tsx): Componente unificado para títulos de sección.
3. [src/components/product/ProductCard.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/product/ProductCard.tsx): Tarjeta de producto estandarizada (1:1, cambio de foto en hover, sin botones fijos que tapen la imagen).
4. [src/components/ui/CategoryTile.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/ui/CategoryTile.tsx): Tile de categoría con aspecto 4:5.
5. [src/components/ui/ProductCarousel.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/ui/ProductCarousel.tsx): Carrusel con Embla para 4 productos en desktop y 2 en mobile.
6. [src/components/layout/Header.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/layout/Header.tsx) & [src/components/layout/Navigation.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/layout/Navigation.tsx): Navegación sobria de 2 filas en desktop y Drawer limpio en móvil.
7. [src/components/acuotaz/ACuotazHeaderStrip.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/acuotaz/ACuotazHeaderStrip.tsx) & [src/components/acuotaz/ACuotazWidget.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/acuotaz/ACuotazWidget.tsx): Franja y widgets de ejemplo aCuotaz.
8. [src/components/catalog/CatalogView.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/catalog/CatalogView.tsx): Catálogo con barra lateral de filtros facetados (estilo Kawasaki) y vista responsiva.
9. [src/components/product/ProductDetailView.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/product/ProductDetailView.tsx): Ficha técnica y comercial estructurada con selectores de talla/color tipo botón, widget aCuotaz y barra sticky en mobile.
10. [src/app/carrito/page.tsx](file:///Users/user/Documents/web%20de%20iori/src/app/carrito/page.tsx): Carrito depurado a 4px de radio y selección clara de método de pago.
11. [src/app/page.tsx](file:///Users/user/Documents/web%20de%20iori/src/app/page.tsx): Secuencia estricta de 10 filas de contenido.

---

## 5. Verificación de Compilación y Calidad

- Ejecución de `npx tsc --noEmit`: **0 errores de tipos**.
- Servidor de desarrollo Next.js en ejecución sin advertencias bloqueantes.
- Verificación responsiva completa en 390px, 768px y 1440px.
