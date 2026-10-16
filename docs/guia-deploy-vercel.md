# Guía de Despliegue en Vercel — Iori Biker Shop

Esta guía detalla los pasos para realizar el despliegue continuo de la aplicación en Vercel con integración a Supabase, configuración de dominio peruano (`.pe`) y optimización de producción.

---

## 1. Conexión del Repositorio a Vercel

1. Ingresa a tu cuenta de [Vercel](https://vercel.com/) y haz clic en **Add New... > Project**.
2. Conecta tu cuenta de GitHub y selecciona el repositorio de `iori-biker-shop`.
3. En la sección **Framework Preset**, Vercel detectará automáticamente **Next.js**.
4. Deja el **Root Directory** en `./`.
5. En **Build Command**: `npm run build` (o déjalo por defecto).
6. En **Output Directory**: `.next` (por defecto).

---

## 2. Configuración de Variables de Entorno

Antes de hacer clic en **Deploy**, despliega el acordeón **Environment Variables** y agrega las siguientes variables para todos los entornos (**Production**, **Preview**, **Development**):

```ini
# Supabase Conexión
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_publica
SUPABASE_SERVICE_ROLE_KEY=tu_clave_secreta_service_role

# Variables de compatibilidad
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima_publica
SUPABASE_SECRET_KEY=tu_clave_secreta_service_role
SUPABASE_PROJECT_REF=tu_project_ref

# Analítica (Opcionales - completarlas cuando el cliente cree sus cuentas)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890

# Envío de Correos (Resend para Libro de Reclamaciones)
RESEND_API_KEY=re_tu_clave_de_resend
```

> [!CAUTION]
> Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` **NUNCA** tenga el prefijo `NEXT_PUBLIC_`. De esta forma Next.js garantiza que la clave solo esté disponible en el entorno de servidor (Node.js) y jamás llegue al navegador del cliente.

---

## 3. Primer Despliegue

1. Haz clic en el botón **Deploy**.
2. Vercel compilará la aplicación con Next.js App Router, generará las páginas estáticas, configurará las Server Actions y APIs, e iniciará el CDN global Edge Network.
3. Al finalizar, obtendrás una URL temporal `https://iori-biker-shop-xxxx.vercel.app`.

---

## 4. Configuración del Dominio Personalizado (`.pe`)

Para asociar tu dominio propio (ejemplo: `ioribikershop.pe` o `www.ioribikershop.pe`):

1. En el panel del proyecto en Vercel, ve a **Settings > Domains**.
2. Ingresa `ioribikershop.pe` y haz clic en **Add**.
3. Vercel te recomendará configurar también la redirección de `www.ioribikershop.pe` a `ioribikershop.pe` (o viceversa).
4. En tu proveedor de dominio (Punto.pe, Cloudflare, Namecheap, GoDaddy):
   - **Registro A**:
     - Nombre/Host: `@` (o en blanco)
     - Valor/Destino: `76.76.21.21`
   - **Registro CNAME**:
     - Nombre/Host: `www`
     - Valor/Destino: `cname.vercel-dns.com`
5. Vercel emitirá y renovará automáticamente los certificados SSL Let's Encrypt para HTTPS sin costo adicional.

---

## 5. Pruebas Post-Despliegue

Una vez completado el despliegue:

1. **Verificar Sitemap y Robots**:
   - Accede a `https://ioribikershop.pe/sitemap.xml` y corrobora que contenga las URLs de productos, categorías, marcas y blog.
   - Accede a `https://ioribikershop.pe/robots.txt` y corrobora que bloquee `/admin` y `/carrito`.
2. **Probar el flujo de Pedido**:
   - Agrega un producto al carrito, ingresa a `/carrito`, llena datos de prueba y presiona *"Enviar pedido por WhatsApp"*.
   - Comprueba que se abra el chat con el mensaje formateado y que se cree el pedido en Supabase con su correlativo oficial.
3. **Verificar el Libro de Reclamaciones**:
   - Envía un reclamo de prueba en `/libro-de-reclamaciones` y comprueba que se genere el código `REC-YYYY-XXXXXX`.
