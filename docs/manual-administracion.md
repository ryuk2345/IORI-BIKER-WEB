# Manual de Administración del E-commerce — Iori Biker Shop

Este manual describe el funcionamiento detallado del panel de administración (`/admin`) para la gestión integral del catálogo, precios, fotos, banners, promociones y ajustes generales de la tienda.

---

## 1. Acceso y Roles

- **URL de Acceso**: `https://ioribikershop.pe/admin`
- **Roles de Usuario**:
  - `admin`: Acceso completo a productos, importador Excel, banners, promociones, ajustes generales, tarifas de envío y bandejas.
  - `atencion`: Acceso optimizado para la gestión diaria de pedidos de WhatsApp, solicitudes de financiamiento, mensajes de contacto y reclamos.

---

## 2. Gestión de Productos y Precios

Ubicación: Pestaña **"Productos y Precios"**.

### Creación o Edición de Productos
1. **Información Principal**:
   - **Nombre**: Nombre comercial claro del producto (ej. *Casco Shaft Pro Series Carbono*).
   - **Slug**: Identificador único para la URL (se autogenera a partir del nombre).
   - **Categoría y Subcategoría**: Clasificación en el catálogo.
   - **Marca**: Selección entre las 14 marcas oficiales (LS2, XKUDO, KRATOZ, SOMAN, LOGAN, XTREME, HJC, SHAFT, MT HELMET, ALPINSTAR, AIROH, SFX, ROYAL, MOTOWOLF).
2. **Modo de Venta**:
   - **Venta Online**: El producto muestra precio y botón *"Agregar al Carrito"*.
   - **Solo Cotizar**: El producto NO entra al carrito; muestra botón *"Cotizar por WhatsApp"* para validar talla y disponibilidad en bodega.
3. **Precios y Ofertas**:
   - **Precio Regular**: Precio normal de venta en PEN (S/).
   - **Precio de Oferta**: Si se especifica un monto menor al regular, la web calculará automáticamente el badge de descuento porcentual (`-%`).
4. **Variantes (Tallas y Colores)**:
   - Cada variante posee su propio SKU y control de stock independiente (ej. Talla L / Color Negro Mate).
   - El inventario se descuenta automáticamente cuando Atención al Cliente marca el pedido como "Pagado".

---

## 3. Importación y Exportación Masiva con Excel

Ubicación: Pestaña **"Importar / Exportar Excel"**.

### Exportación
- Haz clic en **"Descargar Catálogo Completo (Excel / CSV)"** para obtener una copia de seguridad en tiempo real con todos los productos, variantes, precios y existencias.

### Importación Masiva
1. Descarga la plantilla oficial haciendo clic en **"Descargar Plantilla Base"**.
2. **Columnas de la plantilla**:
   - `sku`: Código único de inventario.
   - `nombre`: Título del producto.
   - `categoria_slug`: Slug de la categoría (ej. `cascos`, `guantes`, `casacas`).
   - `marca_slug`: Slug de la marca (ej. `shaft`, `ls2`, `alpinestars`).
   - `precio`: Precio en soles sin símbolo (ej. `380.00`).
   - `precio_oferta`: Precio con descuento (opcional).
   - `stock`: Cantidad disponible.
   - `talla`: Talla de la variante (ej. `M`, `L`, `XL`, o vacío si es unitalla).
   - `color`: Nombre del color.
   - `modo_venta`: `online` o `cotizar`.
3. Arrastra tu archivo Excel (`.xlsx` o `.csv`) en la zona de carga.
4. El sistema verificará los datos en vista previa antes de sincronizarlos con la base de datos de Supabase.

---

## 4. Gestor de Fotos 1:1

Ubicación: Pestaña **"Gestor Fotos 1:1"**.

- **Formato recomendado**: Cuadrado exacto (proporción 1:1, ej. `800x800` o `1000x1000 px`), fondo blanco o neutro para cascos e indumentaria.
- **Asignación rápida**: Puedes subir múltiples fotos y asignarlas a cualquier producto mediante su buscador interno. La primera foto asignada será la portada del producto en los listados y en la home.

---

## 5. Banners Publicitarios (Desktop y Móvil)

Ubicación: Pestaña **"Banners (21:9 / 4:5)"**.

Para ofrecer una experiencia visual sin recortes distorsionados:
- **Banner Desktop**: Proporción panorámica ultra-ancha `21:9` (recomendado: `1920x820 px`).
- **Banner Móvil**: Proporción vertical `4:5` (recomendado: `800x1000 px`).
- **Enlace opcional**: Puedes dirigir al usuario a una categoría (`/categoria/cascos`), una marca (`/marca/ls2`), una campaña (`/promo/esparta`) o un producto específico.
- **Fechas de vigencia**: Programa fecha y hora de inicio y fin para campañas temporales (Navidad, Cyber Days, Campaña Escolar, etc.).

---

## 6. Promociones y Cupones

Ubicación: Pestaña **"Promo Esparta & Cupones"**.

- **Sección Promo Esparta**: Define los productos destacados de la campaña principal de la home, el porcentaje de descuento global y la fecha límite con contador regresivo.
- **Cupones de Descuento**:
  - Código en mayúsculas (ej. `ESPARTA10`, `BIKER2026`).
  - Tipo: Porcentaje (ej. `10%`) o Monto Fijo (ej. `S/ 30.00`).
  - Monto mínimo de compra opcional (ej. válido en compras mayores a S/ 200).
  - Límite de usos y fecha de caducidad.

---

## 7. Ajustes Generales y Tarifas de Envíos

Ubicación: Pestaña **"Ajustes & Envíos"**.

- **Número oficial de WhatsApp**: Número al que se enviarán todos los pedidos y consultas desde la web (por defecto `+51 905 445 698`).
- **Mensaje de la barra superior (TopBar)**: Texto promocional visible en la parte más alta de toda la tienda (ej. *"Envíos a todo el Perú • 2 Tiendas físicas en Lima"*).
- **Datos de Pago para Plantillas**:
  - Cuentas de Yape y Plin con nombre del titular.
  - Cuentas corrientes y CCI de BCP, BBVA o Interbank para transferencias.
- **Tarifas de Delivery en Lima**:
  - Tarifas por zonas o distritos (ej. Lima Norte, Lima Centro, Lima Sur, Callao).
- **Tarifas de Envíos a Provincia**:
  - Parámetros para agencias Shalom y Marvisur.
