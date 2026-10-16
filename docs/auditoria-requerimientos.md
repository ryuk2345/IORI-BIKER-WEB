# Auditoría de Requerimientos vs. brief real del cliente (IORI BIKER SHOP)

> **Fecha:** 28 de Septiembre de 2026  
> **Documento Fuente:** Formulario de requerimientos Iori Biker Shop (Brief oficial firmado por Kiara Balarezo Berttea) y regla `iori-contexto`.  
> **Objetivo:** Comparativa entre la implementación inicial y los requerimientos reales del cliente para ejecutar las correcciones de la Fase 2.

---

## Tabla de Auditoría de Requerimientos

| # | Requisito / Área | Especificación Real del Cliente | Estado Actual en Código | Estado | Archivos Afectados |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Razón Social y RUC** | 20610816089 IORI SAC | Figuraba como "Iori Biker Shop" sin RUC oficial | **Falta** | `src/data/mock.ts`, `src/components/layout/Footer.tsx`, `src/app/libro-de-reclamaciones/page.tsx` |
| **2** | **Correo Electrónico** | `ioribikershop@gmail.com` | Estaba como `[PENDIENTE]` | **Falta** | `src/data/mock.ts`, `src/components/layout/TopBar.tsx`, `src/components/layout/Footer.tsx`, `src/app/contacto/page.tsx` |
| **3** | **Horarios de Tiendas Físicas** | • Sede Independencia: Lun a Sáb 9am - 10pm / Dom y Feriados 11am - 8pm.<br>• Sede La Victoria: Lun a Sáb 9am - 6pm. | Estaban marcados como `[PENDIENTE]` | **Falta** | `src/data/mock.ts`, `src/components/home/StoresSection.tsx`, `src/app/contacto/page.tsx` |
| **4** | **Redes Sociales Oficiales** | Facebook, Instagram y TikTok bajo el nombre `IORI BIKER SHOP` | Marcadas como `[PENDIENTE]` | **Falta** | `src/data/mock.ts`, `src/components/layout/Footer.tsx` |
| **5** | **Estructura de Categorías** | 8 categorías oficiales: Cascos, Guantes, Accesorios para casco, Accesorios para moto, Iluminación / Luces, Limpieza / Mantenimiento, Indumentaria, Motitos escala. | Tenía 9 categorías incluyendo "Neumáticos" y "Seguridad moto" | **Parcial** | `src/types/index.ts`, `src/data/mock.ts`, `src/components/layout/Navigation.tsx`, `src/components/layout/MobileNav.tsx`, `src/components/home/CategoryCarousel.tsx` |
| **6** | **Eliminación de Categorías Excluidas** | Eliminar `Neumáticos` y `Seguridad moto` | Existen en el mock actual y menú de navegación | **Sobra** | `src/data/mock.ts`, `src/types/index.ts`, `src/components/layout/Navigation.tsx` |
| **7** | **Las 14 Marcas Oficiales** | Exactamente 14 marcas: LS2, XKUDO, KRATOZ, SOMAN, LOGAN, XTREME, HJC, SHAFT, MT HELMET, ALPINSTAR, AIROH, SFX, ROYAL, MOTOWOLF. | Se tenían marcas demo genéricas como Fox, AGV, etc. | **Parcial** | `src/data/mock.ts`, `src/components/home/BrandsInfiniteCarousel.tsx`, `src/components/layout/Navigation.tsx` |
| **8** | **Filtros de Catálogo** | Filtrado por Categoría, Marca y Rango de Precio. Eliminar filtros por "Uso" y "Certificación". | Existen filtros por `uso` y `certificacion` en el catálogo y tipos | **Sobra** | `src/components/catalog/CatalogView.tsx`, `src/types/index.ts`, `src/data/mock.ts` |
| **9** | **Modo de Venta (Mixto)** | Venta online directa o Solo Cotizar por WhatsApp por producto. Botón "Cotizar" en card y detalle. | Solo existía flujo de compra directa / carrito | **Falta** | `src/types/index.ts`, `src/data/mock.ts`, `src/components/product/ProductCard.tsx`, `src/components/product/ProductDetailView.tsx` |
| **10** | **Slide Hero Promo Esparta** | Primer slide del carrusel Hero: "PROMO ESPARTA" (2 cascos a precio rebajado) con enlace a `/promo/esparta`. | Los slides eran genéricos de temporada | **Falta** | `src/data/mock.ts`, `src/components/home/HeroSlider.tsx` |
| **11** | **Franja de 6 Beneficios** | Beneficios actualizados: Envíos a todo el Perú (Shalom/Marvisur), Cascos certificados, 2 tiendas en Lima con horarios reales, Asesoría por WhatsApp, Pagos seguros (Yape/Plin/Transferencias/Tarjetas), Garantía Iori. | Contenía badges de "Cambios [PENDIENTE]" y "Medios de pago [PENDIENTE]" | **Parcial** | `src/data/mock.ts`, `src/components/home/FeaturesBar.tsx` |
| **12** | **Tiles en Home** | Bloque de tiles estructurado por Categorías oficiales del cliente, no por tipo de uso. | Estaba segmentado por uso ("Primera moto", "Lluvia", etc.) | **Parcial** | `src/components/home/CategoryTiles.tsx` |
| **13** | **Promociones de Temporada** | Sección "Promociones de temporada" con contador regresivo **apagado por defecto** (solo activable en campañas como Cyber/Aniversario). | Tenía un contador de tiempo activo permanentemente | **Parcial** | `src/components/home/LimitedTimeDeals.tsx` |
| **14** | **Sección Newsletter vs. Nuevas Secciones** | Sustituir Newsletter por: 1) "Consejos biker" (tips y blog motero) y 2) "Síguenos" (feed / tarjetas de redes sociales de Iori). | Existía un formulario tradicional de newsletter | **Parcial / Falta** | `src/components/home/NewsletterSection.tsx` (a reemplazar por `ConsejosBiker.tsx` y `SiguenosSocial.tsx`), `src/app/page.tsx` |
| **15** | **Menú "Descubre"** | Opciones: Lo nuevo, Combos y packs (`/combos`), Outlet (`/outlet`), y Compra por precio (enlaces con filtro `?precio_min=&precio_max=`). | Tenía "Lo que necesitas" por uso y "Combos y kits" | **Parcial** | `src/components/layout/Navigation.tsx`, `src/components/layout/MobileNav.tsx` |
| **16** | **Enlace Destacado de Navegación** | "Ofertas" en lugar de "Iori Deals 🔥". | Figuraba como "Iori Deals 🔥" en el menú | **Sobra / Falta** | `src/components/layout/Navigation.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/TopBar.tsx` |
| **17** | **Rutas: Eliminaciones** | Eliminar rutas `/iori-deals` y `/nosotros` (el cliente desmarcó "Nosotros" en el brief). | Existen `/iori-deals` y `/nosotros` | **Sobra** | `src/app/iori-deals/`, `src/app/nosotros/` |
| **18** | **Ruta: Renombramiento** | Renombrar `/ayuda` a `/preguntas-frecuentes` y actualizar todos los enlaces del sitio. | Estaba implementada como `/ayuda` | **Parcial** | `src/app/ayuda/` -> `src/app/preguntas-frecuentes/`, `TopBar.tsx`, `Footer.tsx`, `HelpCards.tsx` |
| **19** | **Rutas Nuevas Requeridas** | Crear `/marcas`, `/combos`, `/outlet` y `/promo/[slug]`. | Ninguna de estas 4 rutas existía | **Falta** | `src/app/marcas/page.tsx`, `src/app/combos/page.tsx`, `src/app/outlet/page.tsx`, `src/app/promo/[slug]/page.tsx` |
| **20** | **Home: 22 Secciones Ordenadas** | Orden estricto con las 22 secciones integrando Promo Esparta, Tiles por categoría, Promociones de temporada (contador off), Consejos biker y Síguenos. | Tenía 21 secciones con la configuración previa | **Parcial** | `src/app/page.tsx` |

---

## Plan de Ejecución Inmediata (Fase 2)

1. **Datos Mock (`src/data/mock.ts`) y Tipos (`src/types/index.ts`)**:
   - Actualizar datos de IORI SAC (RUC 20610816089, correo `ioribikershop@gmail.com`, horarios reales de Independencia y La Victoria).
   - Configurar las 8 categorías oficiales y las 14 marcas exactas (LS2, XKUDO, KRATOZ, SOMAN, LOGAN, XTREME, HJC, SHAFT, MT HELMET, ALPINSTAR, AIROH, SFX, ROYAL, MOTOWOLF).
   - Eliminar `Neumáticos` y `Seguridad moto`.
   - Agregar campo `modoVenta: 'online' | 'cotizar'` a `Producto`.
   - Agregar slide de "Promo Esparta" como #1 en el Hero y datos para `/promo/esparta`.
2. **Componentes de Producto y Catálogo**:
   - Agregar botón "Cotizar por WhatsApp" cuando `modoVenta === 'cotizar'` en `ProductCard.tsx` y `ProductDetailView.tsx`.
   - Limpiar filtros de `uso` y `certificacion` en `CatalogView.tsx`, conservando Categoría, Marca y Rango de Precio.
3. **Navegación y Layout**:
   - Actualizar menú "Descubre" con: Lo nuevo, Combos y packs, Outlet, y Compra por precio.
   - Reemplazar enlace "Iori Deals 🔥" por "Ofertas" (`/ofertas`).
   - Actualizar enlaces de `/ayuda` a `/preguntas-frecuentes`.
4. **Home (22 Secciones)**:
   - Adaptar `FeaturesBar.tsx` con beneficios reales.
   - Refactorizar `CategoryTiles.tsx` para presentar tiles de categorías reales.
   - Actualizar `LimitedTimeDeals.tsx` ("Promociones de temporada") con el contador regresivo apagado por defecto.
   - Reemplazar Newsletter por `ConsejosBiker.tsx` y `SiguenosSocial.tsx`.
5. **Rutas**:
   - Eliminar `/app/iori-deals` y `/app/nosotros`.
   - Renombrar `/app/ayuda` a `/app/preguntas-frecuentes`.
   - Crear `/app/marcas/page.tsx`, `/app/combos/page.tsx`, `/app/outlet/page.tsx`, `/app/promo/[slug]/page.tsx`.
6. **Verificación visual y Walkthrough**:
   - Compilación estricta con `npm run build`.
   - Verificación responsive a 390 px y 1440 px y walkthrough final.
