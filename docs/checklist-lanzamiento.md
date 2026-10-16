# Checklist de Lanzamiento a Producción — Iori Biker Shop

Este documento consolida todas las configuraciones, credenciales y contenidos marcados como **`[PENDIENTE]`** o en modo de prueba que deben ser completados o validados por el cliente antes de habilitar la tienda al público general.

---

## 1. Cuentas Bancarias y Pasarelas de Cobro por WhatsApp

> [!IMPORTANT]
> La web no cobra online; todos los cobros se coordinan por WhatsApp con las cuentas configuradas en el panel admin (`/admin` > pestaña *Ajustes & Envíos*).

- [ ] **Titular de las Cuentas**: Confirmar el nombre o razón social exacta que aparecerá en los comprobantes (por defecto: `IORI SAC`).
- [ ] **Yape y Plin**: Confirmar el número oficial de recepción de pagos móviles (actualmente configurado: `+51 905 445 698`).
- [ ] **Cuenta BCP**:
  - Número de cuenta corriente o ahorros: `[PENDIENTE]` (actualmente demo: `191-98765432-0-12`).
  - Código de Cuenta Interbancario (CCI): `[PENDIENTE]` (demo: `002-191-009876543201-23`).
- [ ] **Cuenta BBVA o Interbank** (opcional): Ingresar número y CCI si se habilitan más opciones de transferencia.
- [ ] **QR de Yape / Plin**: Cargar las imágenes oficiales de los QR en la galería de medios del admin para que el personal de atención pueda enviarlos por chat con un clic.

---

## 2. Variables de Entorno en Producción (Vercel)

Configurar en el panel de Vercel (**Project Settings > Environment Variables**):

| Variable | Propósito | Estado |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint de la base de datos Supabase | Configurado |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública anónima de Supabase | Configurado |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave secreta administrativa (servidor) | Configurado |
| `NEXT_PUBLIC_GA_ID` | ID de medición de Google Analytics 4 (ej. `G-XXXXXXXXXX`) | `[PENDIENTE]` (proporcionado por el cliente) |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID de píxel de Meta / Facebook Ads (ej. `1234567890`) | `[PENDIENTE]` (proporcionado por el cliente) |
| `RESEND_API_KEY` | Clave API de Resend para envío de correos del Libro de Reclamaciones | `[PENDIENTE]` (modo prueba activo) |

---

## 3. Dominio Oficial y Certificados SSL

- [ ] **Dominio Principal**: `ioribikershop.pe` o `www.ioribikershop.pe`.
- [ ] **Configuración DNS en el registrador (ej. Punto.pe / Cloudflare)**:
  - Registro `A` apuntando a `76.76.21.21` (Vercel).
  - Registro `CNAME` para `www` apuntando a `cname.vercel-dns.com`.
- [ ] **Verificación de Dominio en Resend**:
  - Para salir de `onboarding@resend.dev` y enviar desde `reclamos@ioribikershop.pe`, agregar los registros DKIM y SPF indicados en el panel de Resend.

---

## 4. Textos Legales y Políticas (`[PENDIENTE]`)

Revisar y reemplazar las plantillas demo en `/politicas/[slug]`:

- [ ] **Términos y Condiciones** (`/politicas/terminos-y-condiciones`):
  - Plazos de garantía por marca (1 año para cascos de gama alta, 6 meses en accesorios).
  - Política de cambio de talla: quién asume el flete en envíos a provincia (recomendado: primer cambio gratuito en tienda física; cliente asume flete de retorno).
- [ ] **Políticas de Privacidad** (`/politicas/privacidad`):
  - Inscripción del banco de datos personales ante el Ministerio de Justicia (código de registro `[PENDIENTE]`).
- [ ] **Financiamiento Propio** (`/financiamiento`):
  - Condiciones exactas de aprobación: porcentaje de cuota inicial mínima (ej. 30%), rango de cuotas (3, 6, 9 o 12 meses) y tasa de interés efectiva mensual (TEM).

---

## 5. Preguntas Frecuentes (`/preguntas-frecuentes`)

- [ ] **Horarios exactos en feriados**: Confirmar si las sedes de Independencia y La Victoria abren en feriados no laborables.
- [ ] **Tarifas de envío a provincia con Shalom y Marvisur**: Definir si el cliente paga el flete al recoger en agencia (*pago en destino*) o si se añade una tarifa plana en pedidos específicos.

---

## 6. Verificación Final de Seguridad y Datos

- [x] RLS activado en todas las tablas de Supabase.
- [x] Bloqueo de productos "solo cotizar" en el carrito.
- [x] Precios y totales validados estrictamente en el servidor en cada pedido.
- [x] Tokens UUID criptográficos para seguimiento de pedidos (sin correlativos en la URL).
- [x] Correlativo oficial `REC-YYYY-XXXXXX` en base de datos para el Libro de Reclamaciones.
- [x] Descuento y devolución transaccional de stock al marcar pagado / cancelado.
- [x] Páginas privadas (`/carrito`, `/pedido`, `/admin`, `/mi-cuenta`) con cabecera `noindex, nofollow`.
- [x] Suite E2E de Playwright pasando 7 de 7 pruebas automatizadas.
