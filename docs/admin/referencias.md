# Referencias de Diseño Admin: Shopify y Filament PHP

Este documento registra los patrones de interfaz y experiencia de usuario analizados en **demo.filamentphp.com** (módulo Shop: Products & Orders) y el patrón clásico de **Shopify Admin**, definiendo qué elementos adoptamos para el nuevo admin de **Iori Biker Shop** y la justificación de cada decisión.

---

## 1. Patrones Observados en demo.filamentphp.com (Shop)

### A. Lista de Productos (DataTable)
- **Estructura visual:**
  - Encabezado con título claro, breadcrumb y botón de acción primaria destacado en la esquina superior derecha (`Nuevo producto`).
  - Barra de herramientas con buscador integrado en vivo, selector de columnas visibles y botón de filtros con badge de filtros activos.
  - Tabla limpia con selección por checkboxes (acciones por lote: eliminar, publicar/ocultar, cambiar categoría).
  - Columnas organizadas con jerarquía: Miniatura 1:1, Nombre, Marca/Categoría, Visibilidad (indicador visual), Precio, SKU y Stock.
  - Menú de acciones por fila mediante botón de tres puntos (`...`): Editar, Duplicar, Ver en tienda, Eliminar.

### B. Formulario de Edición/Creación de Producto (Página Única en 2 Columnas)
- **Columna Principal (2/3 del ancho):**
  - Secciones en tarjetas limpias (`FormSection`) con título y descripción:
    1. **Información básica:** Nombre del producto, descripción clara, especificaciones en pares clave/valor.
    2. **Galería multimedia:** Zona drag & drop para imágenes, vista previa 1:1, control de portada principal.
    3. **Precios:** Precio normal, precio comparativo/oferta, cálculo automático de márgenes/ahorro.
    4. **Inventario y Variantes:** SKU, stock general o matriz por variantes (tallas/colores) con actualización masiva.
- **Columna Lateral (1/3 del ancho):**
  - **Estado y Visibilidad:** Switch claro para "¿Mostrar en la web?", modo de venta (Online vs. Solo cotizar).
  - **Organización / Taxonomía:** Selector de Categoría, Subcategoría dependiente, Marca (con creación rápida) y Etiquetas (Nuevo, Más vendido).
  - **Acciones contextuales:** Enlace directo "Ver en la tienda".

---

## 2. Patrones del Admin de Shopify

### A. Barra Fija de Guardado (Sticky Save Bar)
- **Comportamiento:** Mientras no haya cambios, la barra permanece oculta o discreta. En cuanto el usuario modifica algún campo, se fija en la parte superior o inferior con:
  - Mensaje: *"Tienes cambios sin guardar"*.
  - Botón secundario: *"Descartar cambios"*.
  - Botón primario: *"Guardar producto"* (con spinner de carga).
- **Protección contra pérdida de datos:** Si el usuario intenta navegar o cerrar la pestaña sin guardar, se activa un diálogo de confirmación nativo o modal.

### B. Edición en Línea y Acciones Rápidas
- Capacidad de modificar precio y stock directamente desde la tabla de productos sin tener que entrar al formulario completo cada vez (ideal para sincronizaciones diarias).

---

## 3. Matriz de Decisiones para Iori Biker Shop

| Patrón | Fuente de Inspiración | Implementación en Iori Biker Shop | Justificación UX para Personal No Técnico |
| :--- | :--- | :--- | :--- |
| **Layout sin Header de Tienda** | Filament / Shopify | Layout administrativo dedicado con menú lateral colapsable y barra superior neutral. | Evita confusiones entre navegar como cliente y administrar la tienda. |
| **Buscador Global Unificado** | Filament | Barra superior con atajo de teclado (`⌘K`), busca pedidos (código/teléfono) y productos (nombre/SKU). | Permite al vendedor ubicar rápidamente un pedido mientras habla por WhatsApp con el cliente. |
| **Formulario en 1 Sola Página** | Shopify / Filament | Todo el producto visible en scroll vertical dividido en tarjetas `FormSection` (Información, Fotos, Precios, Variantes). | Las pestañas ocultaban campos obligatorios y causaban errores de guardado. |
| **Recorte 1:1 con Zoom** | Requisito Iori / Custom | Modal accesible desde cada imagen de la galería para encuadrar cascos e indumentaria en formato cuadrado exacto. | Mantiene la estética uniforme y profesional en el catálogo público sin software externo. |
| **Gestión Masiva Integrada** | Shopify | Botones modales dentro del módulo Productos para "Importar Excel", "Exportar" y "Subir fotos por SKU". | Elimina pestañas redundantes en el menú lateral y centraliza todo el ciclo del inventario. |
| **Barra Fija de Guardar** | Shopify | Barra superior fija que detecta `isDirty` con botones Descartar y Guardar. | Elimina la incertidumbre de si los cambios se registraron o se perdieron. |
| **Vocabulario Humano** | Regla Iori | Nombres comprensibles en español de Perú, sin términos técnicos de BD ni códigos crudos. | El personal de tienda opera ágilmente sin requerir capacitación técnica. |
