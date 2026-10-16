# Variables de Entorno para Despliegue en Netlify (Producción)

Este documento detalla todas las variables de entorno necesarias para ejecutar **Iori Biker Shop** en Netlify en el entorno de **Producción**.

> [!IMPORTANT]
> **Regla de Seguridad**: Ningún valor sensible está documentado aquí. Las claves secretas deben cargarse directamente en el panel de Netlify en:  
> **Site configuration > Environment variables**.

---

## 1. Conexión con Supabase (Base de Datos, Autenticación y Storage)

| Variable | Tipo / Visibilidad | ¿Es Secreta? | Propósito y Descripción |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend & Backend | **No** (Pública) | URL base de la instancia de Supabase de producción (ej. `https://<project-ref>.supabase.co`). Necesaria para las peticiones de datos de la tienda, optimización de imágenes en Next.js y conexión con Supabase Storage. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend & Backend | **No** (Pública) | Clave anónima pública de Supabase. Permite al cliente web interactuar con la API bajo las políticas de Row Level Security (RLS) para navegación de catálogo, inicio de sesión de clientes y consulta de pedidos públicos. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend (Serverless) | **SÍ (SECRETA)** | Clave administrativa con rol `service_role`. Utilizada exclusivamente por las funciones del servidor de Next.js en Netlify para operaciones privilegiadas: creación y cálculo validado de pedidos, mitigación antispam persistente (`ajustes_generales`), registro de postulaciones laborales y gestión administrativa. **Nunca debe llevar prefijo NEXT_PUBLIC_**. |
| `SUPABASE_URL` | Backend | **No** (Pública) | Variable de compatibilidad idéntica a `NEXT_PUBLIC_SUPABASE_URL` requerida por librerías y scripts del lado del servidor. |
| `SUPABASE_ANON_KEY` | Backend | **No** (Pública) | Variable de compatibilidad idéntica a `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| `SUPABASE_SECRET_KEY` | Backend | **SÍ (SECRETA)** | Variable de compatibilidad idéntica a `SUPABASE_SERVICE_ROLE_KEY` para clientes administrativos de respaldo. |
| `SUPABASE_PROJECT_REF` | Backend / Config | **No** (Técnica) | Identificador o subdominio del proyecto de Supabase en producción. Utilizado para referencia de infraestructura y endpoints de Storage. |

---

## 2. Configuración del Sitio y Canales de Atención

| Variable | Tipo / Visibilidad | ¿Es Secreta? | Propósito y Descripción |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_SITE_URL` | Frontend & Backend | **No** (Pública) | Dominio canónico del sitio web en producción (ej. `https://ioribikershop.pe` o el subdominio de Netlify). Se usa para generar URLs canónicas de SEO, Open Graph para redes sociales, mapas de sitio (`sitemap.xml`) y enlaces de seguimiento de pedidos enviados por WhatsApp. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Frontend & Backend | **No** (Pública) | Número telefónico oficial de WhatsApp de la tienda (en formato internacional sin +, ej. `51905445698`). Alimenta el botón flotante de WhatsApp, enlaces de consulta directa en fichas de producto y contacto de soporte. |

---

## 3. Analítica y Marketing (Opcionales)

| Variable | Tipo / Visibilidad | ¿Es Secreta? | Propósito y Descripción |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_GA_ID` | Frontend | **No** (Pública) | ID de medición de Google Analytics 4 (ej. `G-XXXXXXXXXX`). Registra métricas de visitas, visualización de productos y eventos de comercio electrónico. Opcional hasta que el cliente configure su propiedad de analítica. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Frontend | **No** (Pública) | ID del píxel de Meta / Facebook Ads (ej. `1234567890`). Permite la medición de audiencias y conversiones publicitarias. Opcional. |

---

## 4. Servicios Externos e Integraciones (Opcionales / Recomendados)

| Variable | Tipo / Visibilidad | ¿Es Secreta? | Propósito y Descripción |
| :--- | :--- | :---: | :--- |
| `RESEND_API_KEY` | Backend (Serverless) | **SÍ (SECRETA)** | Token de API del servicio Resend. Utilizado por la API del Libro de Reclamaciones (`/api/reclamaciones`) para el envío automático por correo electrónico de la copia de la hoja de reclamación al consumidor y notificación interna a la tienda. |
| `ACUOTAZ_SECRET_TOKEN` | Backend (Serverless) | **SÍ (SECRETA)** | Token secreto compartido para la validación de peticiones webhook entrantes desde la pasarela de financiamiento aCuotaz (`/api/acuotaz/webhook`). Garantiza que las notificaciones de pago provengan de aCuotaz. |

---

## 5. Resumen de Carga en Netlify

Al configurar las variables en el panel de Netlify:
1. Asegúrate de seleccionar el entorno de despliegue **Production** (y opcionalmente **Preview / Branch deploys** si deseas probar ramas antes de fusionar).
2. Marca las variables identificadas como **SÍ (SECRETA)** con la opción **"Sensitive"** o **"Secret"** en Netlify para que no sean expuestas en los logs de construcción ni a usuarios colaboradores sin permisos.
