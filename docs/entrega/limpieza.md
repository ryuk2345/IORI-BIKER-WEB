# Plan de Limpieza y Vaciado de Tienda Pre-Entrega

**Fecha de Generación:** 30 de Septiembre de 2026  
**Estado:** **ESPERANDO CONFIRMACIÓN DEL USUARIO ANTES DE EJECUTAR**  
**Ubicación del Respaldo Completo:**  
- **Fuera del Repositorio:** `/Users/user/Documents/respaldo_iori_pre_entrega/`
- **Copia Local (en `.gitignore`):** `/Users/user/Documents/web de iori/.backups/respaldo_pre_entrega/`

---

## 1. Estado del Respaldo Previo (100% Exportado y Seguro)

Antes de programar o ejecutar cualquier acción destructiva, se exportó la totalidad de la información actual:
1. **Base de Datos (Dump JSON y Tablas Individuales):** 20 tablas respaldadas con integridad referencial.
2. **Archivos de Storage:** Descargados íntegramente todos los archivos de los buckets `productos` y `cvs`.
3. **Control de Versiones:** Las carpetas de respaldo fueron agregadas a [`.gitignore`](file:///Users/user/Documents/web%20de%20iori/.gitignore) para prevenir que se incluyan accidentalmente en commits.

---

## 2. Inventario Detallado: Elementos a BORRAR

Se clasifica entre los datos DEMO de fábrica y los artefactos residuales generados por la suite de pruebas automatizadas:

| Módulo / Tabla / Recurso | Cantidad Actual | Descripción de los Elementos a Eliminar (DEMO + Pruebas QA) | Tipo / Origen | Destino / Acción |
| :--- | :---: | :--- | :--- | :--- |
| **Productos (`productos`)** | 5 | Cascos Shaft Pro, LS2 FF800, Airoh Aviator 3, etc. (SKUs temporales `CONC-SKU-*` y `TEST-PROD-*` fueron limpiados por teardown de tests; se asegura barrido con filtro comodín). | DEMO + Tests | **Eliminación Total** |
| **Variantes (`producto_variantes`)** | 5 | Tallas M, L, XL y combinaciones de color asociadas a los productos. | DEMO + Tests | **Eliminación Total** |
| **Fotos de Productos en BD (`producto_imagenes`)** | 0 | Registros adicionales de galería. | DEMO | **Limpieza de tabla** |
| **Archivos en Storage: Fotos (`productos`)** | 3 | Archivos `1790702343977_161979.jpg`, `1790702345762_sh49tm.jpg`, `1790716475327_ckklx2.jpg` (fotos demo y subidas por tests no vinculadas). | Storage huérfano | **Borrado físico de Storage** |
| **Pedidos (`pedidos`)** | 57 | Pedidos DEMO iniciales más pedidos creados por pruebas (`Hacker Intentando Alterar Precio`, `Cliente Concurrente`, `Enrique Cárdenas Test QA`, `Cliente con Nombre Muy Largo`, etc.). | DEMO + Tests | **Eliminación Total** |
| **Items de Pedidos (`pedido_items`)** | 20 | Líneas de detalle de pedidos de prueba. | DEMO + Tests | **Eliminación Total** |
| **Historial de Pedidos (`pedido_historial`)** | 93 | Registro cronológico de eventos de cambio de estado durante pruebas. | DEMO + Tests | **Eliminación Total** |
| **Reseñas (`resenas`)** | 0 | Calificaciones y comentarios de prueba. | DEMO | **Limpieza de tabla** |
| **Mensajes de Contacto (`mensajes_contacto`)** | 15 | Formularios de contacto DEMO y de prueba automatizada. | DEMO + Tests | **Eliminación Total** |
| **Postulaciones laborales (`postulaciones`)** | 4 | Registros de prueba de "Trabaja con nosotros". | DEMO + Tests | **Eliminación Total** |
| **Archivos en Storage: CVs (`cvs`)** | 2 | Archivos PDF `asesor-de-ventas-presencial--s` y `ventas-en-tienda` (archivos de prueba no vinculados a clientes reales). | Storage huérfano | **Borrado físico de Storage** |
| **Libro de Reclamaciones (`libro_reclamaciones`)** | 17 | Hojas `REC-2026-000001` a `REC-2026-000017` generadas por seeds y por pruebas E2E. | DEMO + Tests | **Eliminación Total** |
| **Banners (`banners`)** | 6 | Banners de slider y promocionales de ejemplo. | DEMO | **Eliminación Total** |
| **Artículos de Blog (`blog`)** | 6 | Artículos de prueba con texto simulado. | DEMO | **Eliminación Total** |
| **Cupones (`cupones`)** | 0 | Cupones de prueba. | DEMO | **Limpieza de tabla** |
| **Tarifas de Envío (`envios_tarifas`)** | 5 | Tarifas provisionales de ejemplo (Lima, Provincias, Express). | DEMO | **Eliminación Total** |
| **Datos de Pago de Ejemplo (`ajustes_generales`)** | 1 clave | Cuentas bancarias simuladas de BCP, BBVA, Interbank en `datos_pago_plantillas`. | DEMO | **Vaciado a valores neutros** |
| **Valores DEMO de aCuotaz (`ajustes_generales`)** | 1 clave | Factores DEMO (`n = 9`, `factor = 1.23`) y límites de simulación. | DEMO | **Reseteo a vacío / inactivo** |
| **Logos placeholder de marcas (`marcas.logo`)** | 14 | URLs y rutas a logos no oficiales o temporales. | DEMO | **Set `logo = NULL`** |
| **Usuarios de Prueba en Auth (`auth.users`)** | 0 | Solo existe el usuario administrador principal (`admin@ioribikershop.com`). No hay usuarios huérfanos de tests. | — | **Ninguno extra por borrar** |

---

## 3. Inventario Detallado: Elementos a CONSERVAR

| Módulo / Tabla / Recurso | Cantidad | Qué se Conserva y Justificación |
| :--- | :---: | :--- |
| **Categorías (`categorias`)** | 8 | Estructura troncal oficial de la tienda (`cascos`, `indumentaria`, `accesorios-moto`, `repuestos`, etc.). |
| **Subcategorías (`subcategorias`)** | 35 | Clasificaciones oficiales (`integrales`, `modulares`, `chaquetas`, `guantes`, etc.) vinculadas a categorías. |
| **Marcas (`marcas`)** | 14 | Las 14 marcas oficiales de motociclismo (LS2, Shaft, Alpinestars, Airoh, Shoei, AGV, etc.), **conservando solo el nombre y slug**, limpiando el logo para carga formal. |
| **Datos del Negocio (`ajustes_generales.empresa`)** | 1 | RUC `20610816089`, Razón Social `IORI SAC`, Nombre Comercial `IORI BIKER SHOP`, correo oficial. |
| **Configuración de WhatsApp (`ajustes_generales.whatsapp`)** | 1 | Número oficial `+51 905 445 698`, enlace `https://wa.me/51905445698` y plantillas de cotización y pedidos. |
| **Sedes Físicas (`ajustes_generales.tiendas_fisicas`)** | 2 | Información de las sedes oficiales (Independencia y Lince) con direcciones y horarios de atención. |
| **Textos Legales y Políticas** | 3 páginas | Términos y Condiciones, Política de Privacidad y Cambios/Devoluciones en estado base. |
| **Preguntas Frecuentes (FAQs)** | 1 módulo | Respuestas estandarizadas sobre envíos, garantías y medios de pago. |
| **Promo Esparta (`promociones`)** | 1 | Registro de la campaña `esparta`, pero **en estado Borrador (`activo: false`) y sin productos vinculados**. |
| **Usuario Administrador (`auth.users`)** | 1 | Cuenta principal del cliente: `admin@ioribikershop.com` con rol `admin`. |

---

## 4. Secuencia Estricta de Ejecución Programada

Una vez confirmada la ejecución por el usuario:
1. **Paso 1: Ejecución del Vaciado de Tablas y Storage:**
   - Eliminación en cascada respetando dependencias (`pedido_items` -> `pedido_historial` -> `pedidos`).
   - Eliminación de productos, variantes y barrido explícito de cualquier registro residual con prefijos de prueba (`CONC-SKU-`, `TEST-PROD-`).
   - Eliminación física de archivos huérfanos en los buckets `productos` y `cvs`.
   - Limpieza de logos de marcas (`logo = NULL`).
   - Reseteo de cuentas bancarias y parámetros de aCuotaz.
2. **Paso 2: Limpieza de Seeds (`supabase/seed.sql`):**
   - Retiro definitivo de las sentencias INSERT de productos, pedidos, banners y artículos DEMO, para evitar que futuros despliegues o resets reinyecten datos ficticios.
3. **Paso 3: Modo "Tienda en Preparación" (Ajustes):**
   - Activación por defecto (`tienda_en_preparacion: true`). Visitantes verán la página elegante *"Muy Pronto"* con enlaces a WhatsApp y a las 2 sedes físicas. Administradores autenticados mantendrán acceso a la tienda completa.
4. **Paso 4: Auditoría Visual en Modo Solo Lectura (Sin Escritura):**
   - **No se ejecutarán pruebas que escriban en esta base de datos** (respetando la indicación de que es la base del cliente).
   - Recorrido de verificación en modo solo lectura (`GET` HTTP y navegación del navegador) para asegurar que:
     - No aparezca ningún `[PENDIENTE]` visible al público.
     - Las secciones vacías (banners, destacados, ofertas) se oculten elegantemente sin errores.
     - La franja de aCuotaz muestre texto genérico institucional sin números.
     - En el carrito, la tarifa de envío muestre *"Se coordina por WhatsApp"*.
5. **Paso 5: Guía de Configuración en Admin (Dashboard Home):**
   - Implementación del checklist interactivo de 12 pasos con barra de progreso (ej. 3/12) y enlaces directos a cada sección.
6. **Paso 6: Preparación de Invitaciones de Usuarios:**
   - Plantillas de invitación para el administrador del cliente y el personal de atención al cliente, sin contraseñas escritas en archivos.
7. **Paso 7: Reinicio Final de Correlativos (Última Operación):**
   - Como **último paso absoluto**, se reinician las secuencias de base de datos:
     ```sql
     ALTER SEQUENCE pedido_correlativo_seq RESTART WITH 1;
     ALTER SEQUENCE libro_reclamaciones_seq RESTART WITH 1;
     ```
     Garantizando que el primer pedido del cliente sea **`IORI-000001`** y la primera reclamación **`REC-2026-000001`**.
8. **Paso 8: Entrega de la Guía de Carga Inicial:**
   - Publicación de `/docs/entrega/guia-carga-inicial.md` con las instrucciones detalladas para el cliente.

---

> [!IMPORTANT]
> **ESPERANDO CONFIRMACIÓN DEL USUARIO:**  
> El inventario ha sido actualizado con los 3 ajustes solicitados. No se ha ejecutado ninguna operación destructiva en la base de datos ni en Storage.
> 
> Quedo a la espera de tu confirmación explícita para iniciar la ejecución en el orden establecido.
