# Guía de Carga Inicial y Puesta en Marcha
**IORI BIKER SHOP — Plataforma Web de Comercio y Atención por WhatsApp**

Esta guía está diseñada para que el equipo de **IORI BIKER SHOP** cargue su catálogo oficial, configure sus canales de cobro y despacho, y publique la tienda de manera ordenada y segura.

---

## Índice
1. [Estado Actual: Tienda en Preparación](#1-estado-actual-tienda-en-preparación)
2. [Checklist de 12 Pasos para el Lanzamiento](#2-checklist-de-12-pasos-para-el-lanzamiento)
3. [Llenado de la Plantilla de Productos en Excel](#3-llenado-de-la-plantilla-de-productos-en-excel)
4. [Convención de Nomenclatura para Fotografías](#4-convención-de-nomenclatura-para-fotografías)
5. [Dimensiones y Formatos de Banners](#5-dimensiones-y-formatos-de-banners)
6. [Invitación de Usuarios y Asignación de Roles](#6-invitación-de-usuarios-y-asignación-de-roles)
7. [Publicación Oficial de la Tienda](#7-publicación-oficial-de-la-tienda)

---

## 1. Estado Actual: Tienda en Preparación

La tienda se encuentra actualmente en **Modo Tienda en Preparación**.
- **Visitantes del público**: Visualizan una portada limpia e institucional con el logotipo de IORI BIKER SHOP, aviso de preparación del nuevo catálogo, horarios y direcciones de las sedes de Independencia y La Victoria, y un botón directo a WhatsApp (+51 905 445 698).
- **Equipo Administrador**: Al iniciar sesión en `/admin`, pueden ver la tienda pública completa con una barra superior que indica: `MODO VISTA PREVIA ADMINISTRADOR`, permitiendo navegar y validar cada cambio antes de abrir al público.

---

## 2. Checklist de 12 Pasos para el Lanzamiento

En la pantalla de bienvenida del panel administrativo (`/admin` -> pestaña **Inicio**), encontrarás el indicador de avance en tiempo real:

| Paso | Ruta en Admin | Qué debes configurar |
| :--- | :--- | :--- |
| **1. Datos del negocio** | [`/admin/ajustes/empresa#seccion-empresa`](/admin/ajustes/empresa#seccion-empresa) | Razón social (`IORI SAC`), RUC (`20610816089`), dirección y celular de WhatsApp de atención. |
| **2. Cuentas bancarias y medios de pago** | [`/admin/ajustes/pagos#seccion-pagos`](/admin/ajustes/pagos#seccion-pagos) | Cuentas BCP, BBVA, Interbank, Yape y Plin que se enviarán a los clientes para concretar pedidos. |
| **3. Tarifas de despacho y envío** | [`/admin/ajustes/envios#seccion-envios`](/admin/ajustes/envios#seccion-envios) | Costos de delivery en Lima Metropolitana y agencias de transporte a provincia (Shalom / Mavisur). Mientras no se configuren tarifas, el carrito indicará automáticamente *"Se coordina por WhatsApp"*. |
| **4. Parámetros de aCuotaz** | [`/admin/ajustes/acuotaz#seccion-acuotaz`](/admin/ajustes/acuotaz#seccion-acuotaz) | Si se activa el financiamiento, ingresar el número de cuotas (ej. 9) y el factor quincenal obtenido de la calculadora comercial de aCuotaz. Si no se utiliza, mantener inactivo. |
| **5. Logos de marcas oficiales** | [`/admin/catalogo?tab=marcas&filtro=sin_logo#seccion-marcas`](/admin/catalogo?tab=marcas&filtro=sin_logo#seccion-marcas) | Subir el archivo PNG/SVG sanitizado en fondo transparente para las 14 marcas del catálogo con selector de contraste claro/oscuro. |
| **6. Catálogo de productos (Excel)** | [`/admin/productos`](/admin/productos) | Cargar la plantilla Excel completada con los productos, precios, variantes y SKUs desde el botón *"Importar Excel"*. |
| **7. Fotografías de productos** | [`/admin/productos`](/admin/productos) | Subir las fotos cuadradas 1:1 de cada producto o mediante carga masiva por SKU (`SKU_1.jpg`, `SKU_2.jpg`). |
| **8. Banners de portada (Hero Slider)** | [`/admin/banners`](/admin/banners) | Subir entre 1 y 3 banners para la cabecera (escritorio 21:9 y móvil 4:5). Mientras no haya banners activos, el slider se oculta automáticamente. |
| **9. Promoción Combo Esparta** | [`/admin/promociones#seccion-promo-esparta`](/admin/promociones#seccion-promo-esparta) | Seleccionar los 2 cascos que conforman el combo oficial y definir su precio especial, o marcar *"No aplica"* si no se ofrecerá la promoción. |
| **10. Políticas y preguntas frecuentes** | [`/admin/contenido#seccion-politicas`](/admin/contenido#seccion-politicas) | Revisar términos de compra, política de privacidad, envíos y preguntas frecuentes y certificar la casilla de conformidad legal. |
| **11. Invitaciones al equipo** | [`/admin/ajustes/equipo#seccion-equipo`](/admin/ajustes/equipo#seccion-equipo) | Invitar a los colaboradores del equipo asignándoles rol de `admin` o `atencion`. |
| **12. Publicar tienda online** | [`/admin/ajustes/publicacion#seccion-publicacion`](/admin/ajustes/publicacion#seccion-publicacion) | Desmarcar la casilla *"Activar modo tienda en preparación"* y confirmar. ¡La tienda queda en línea para todo el Perú! |

---

## 3. Llenado de la Plantilla de Productos en Excel

Para importar productos de forma masiva:
1. Dirígete a `/admin` -> **Productos**.
2. Haz clic en el botón **"Importar / Exportar Excel"** y presiona **"Descargar Plantilla Excel"**.
3. Abre el archivo en Microsoft Excel o Google Sheets.

### Estructura de Columnas:
- **`nombre`** *(Obligatorio)*: Nombre comercial completo del producto (ej. *Casco Integral LS2 FF353 Rapid Deaduz*).
- **`sku`** *(Obligatorio y único)*: Código de identificación de inventario (ej. *CAS-LS2-FF353-DED*). No debe contener espacios ni caracteres especiales.
- **`categoria_slug`** *(Obligatorio)*: Slug de una de las 8 categorías oficiales:
  - `cascos`
  - `guantes`
  - `indumentaria`
  - `accesorios-casco`
  - `accesorios-moto`
  - `luces-seguridad`
  - `limpieza-mantenimiento`
  - `motitos-escala`
- **`subcategoria_slug`** *(Opcional)*: Slug de la subcategoría específica (ej. `integrales`, `abatibles`, `urbanos`, etc.).
- **`marca_id`** *(Obligatorio)*: Identificador de la marca (ej. `ls2`, `shaft`, `mt-helmet`, `motowolf`, etc.).
- **`precio`** *(Obligatorio)*: Precio regular de venta en Soles (PEN) con IGV incluido (ej. *349.00*).
- **`precio_oferta`** *(Opcional)*: Precio rebajado en promoción. Si se deja en blanco o igual al precio, el producto se vende al precio regular.
- **`stock`** *(Obligatorio)*: Cantidad total de existencias disponibles en almacén.
- **`modo_venta`**:
  - `online`: Se puede agregar al carrito y pedir por WhatsApp.
  - `cotizar`: Muestra el botón *"Consultar precio por WhatsApp"* (ideal para productos especiales o bajo pedido).
- **`certificacion`**: Normativas de seguridad (ej. *ECE 22.06 / DOT* para cascos).
- **`variantes`**: Para productos con tallas o colores, utiliza el formato estructurado:
  `Talla:S|Color:Negro Mate|Stock:5; Talla:M|Color:Negro Mate|Stock:8; Talla:L|Color:Negro Mate|Stock:4`

---

## 4. Convención de Nomenclatura para Fotografías

El sistema incluye dos formas de asociar fotos a los productos:

### Opción A: Carga Directa en el Formulario (Recomendada para pocos productos)
1. Edita el producto en `/admin` -> **Productos**.
2. Arrastra las imágenes a la zona de subida.
3. Utiliza la herramienta integrada de recorte cuadrado 1:1 con zoom y desplazamiento para encuadrar el producto perfectamente sobre fondo neutro.

### Opción B: Carga Masiva por SKU (Recomendada para catálogo grande)
1. Prepara las fotos en tu computadora nombrándolas con el **SKU exacto del producto**, seguido de un guión bajo y el número correlativo:
   - Portada principal: `{SKU}_1.jpg` (ej. `CAS-LS2-RAPID_1.jpg`)
   - Foto lateral: `{SKU}_2.jpg` (ej. `CAS-LS2-RAPID_2.jpg`)
   - Foto posterior o detalle: `{SKU}_3.jpg` (ej. `CAS-LS2-RAPID_3.jpg`)
2. En `/admin` -> **Productos**, abre **"Carga Masiva de Fotos"**.
3. Selecciona todas las fotos juntas y arrástralas. El sistema leerá el nombre de cada archivo y lo vinculará automáticamente al producto que tenga ese SKU en la base de datos.

> [!TIP]
> **Recomendaciones para las fotos:**
> - Proporción: Cuadrada 1:1 (mínimo 1000 × 1000 px).
> - Fondo: Blanco o gris claro neutro (#F5F5F5).
> - Peso: Menos de 600 KB por imagen (formato JPG o WebP).

---

## 5. Dimensiones y Formatos de Banners

Para que el diseño se vea nítido y premium en pantallas Retina y smartphones:

### A. Hero Slider Principal (Portada Superior)
- **Versión Escritorio / Computadora**:
  - Proporción: **21:9** (Ultra-wide).
  - Medida recomendada: **1920 × 820 px** (o 2560 × 1080 px para pantallas 2K/4K).
  - Zona segura de texto: Centrado o cargado a la izquierda, dejando los 80 px superiores libres para la barra de navegación.
- **Versión Móvil**:
  - Proporción: **4:5** (Vertical para smartphone).
  - Medida recomendada: **1080 × 1350 px** (o 800 × 1000 px).

### B. Cards Destacadas (3 Bloques de Campaña)
- Proporción: **3:2** (Horizontal).
- Medida recomendada: **600 × 400 px**.

### C. Logotipos de Marcas
- Formato: **PNG con fondo transparente** o **SVG**.
- Medida: 240 × 120 px aproximadamente, con el logo centrado.

---

## 6. Invitación de Usuarios y Asignación de Roles

Por directriz estricta de seguridad, **las contraseñas nunca deben compartirse por chat ni guardarse en archivos de texto**. Cada colaborador debe recibir un correo oficial de invitación para crear su propia clave cifrada:

1. Ejecuta el script seguro en la terminal del servidor:
   ```bash
   node scripts/invitar-usuarios.mjs --email asesor@ioribikershop.pe --rol atencion --nombre "Nombre del Asesor"
   ```
2. O para un nuevo administrador:
   ```bash
   node scripts/invitar-usuarios.mjs --email admin2@ioribikershop.pe --rol admin --nombre "Nombre Administrador"
   ```
3. El colaborador recibirá un correo electrónico de bienvenida de Supabase con un botón seguro para establecer su contraseña y acceder inmediatamente a `/admin`.

### Diferencias entre Roles:
- **`admin`**: Acceso total al catálogo de productos, importaciones, banners, finanzas, ajustes de negocio y tarifas de envío.
- **`atencion`**: Acceso restringido exclusivamente al módulo de **Pedidos**, bandejas de contacto, postulaciones y atención del **Libro de Reclamaciones**.

---

## 7. Publicación Oficial de la Tienda

Una vez completados los pasos anteriores:
1. Ingresa a `/admin` -> pestaña **Ajustes** -> subsección **Envíos y Tienda**.
2. Desmarca el interruptor **"Activar modo tienda en preparación"**.
3. Haz clic en **"Guardar Ajustes"**.
4. ¡Felicidades! La tienda online de IORI BIKER SHOP estará disponible al público en todo el Perú con carrito conectado a WhatsApp.
