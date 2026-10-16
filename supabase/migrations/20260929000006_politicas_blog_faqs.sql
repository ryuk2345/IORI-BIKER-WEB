-- ====================================================================
-- MIGRACIÓN 06: POLÍTICAS, BLOG SEO, FAQS Y CONDICIONES FINANCIAMIENTO
-- ====================================================================

-- 1. TABLA DE POLÍTICAS EDITABLES
CREATE TABLE IF NOT EXISTS public.politicas (
    slug TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    subtitulo TEXT,
    contenido TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.politicas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'politicas' AND policyname = 'politicas_select_public'
    ) THEN
        CREATE POLICY politicas_select_public ON public.politicas FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'politicas' AND policyname = 'politicas_admin_manage'
    ) THEN
        CREATE POLICY politicas_admin_manage ON public.politicas FOR ALL USING (true);
    END IF;
END $$;

-- 2. CAMPOS SEO PARA BLOG
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS keywords TEXT;

-- 3. PERMISOS PARA PREGUNTAS FRECUENTES Y POSTULACIONES
ALTER TABLE public.preguntas_frecuentes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'preguntas_frecuentes' AND policyname = 'faqs_select_public'
    ) THEN
        CREATE POLICY faqs_select_public ON public.preguntas_frecuentes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'preguntas_frecuentes' AND policyname = 'faqs_admin_manage'
    ) THEN
        CREATE POLICY faqs_admin_manage ON public.preguntas_frecuentes FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'postulaciones' AND policyname = 'postulaciones_insert_public'
    ) THEN
        CREATE POLICY postulaciones_insert_public ON public.postulaciones FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'postulaciones' AND policyname = 'postulaciones_admin_manage'
    ) THEN
        CREATE POLICY postulaciones_admin_manage ON public.postulaciones FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'mensajes_contacto' AND policyname = 'contacto_insert_public'
    ) THEN
        CREATE POLICY contacto_insert_public ON public.mensajes_contacto FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'mensajes_contacto' AND policyname = 'contacto_admin_manage'
    ) THEN
        CREATE POLICY contacto_admin_manage ON public.mensajes_contacto FOR ALL USING (true);
    END IF;
END $$;

-- 4. INSERTAR/ACTUALIZAR POLÍTICAS
INSERT INTO public.politicas (slug, titulo, subtitulo, contenido, updated_at) VALUES
(
    'envios-y-devoluciones',
    'Políticas de Envíos, Entregas y Devoluciones',
    'Condiciones operativas de entrega a nivel nacional y lineamientos de garantía y devoluciones.',
    '## 1. Envíos y Cobertura Nacional
Iori Biker Shop realiza despachos a todo el Perú utilizando agencias de transporte terrestre y servicios de courier certificados como Shalom, Marvisur y Olva Courier.

### Plazos estimados de entrega:
- **Lima Metropolitana:** De 24 a 48 horas hábiles tras la verificación de stock y validación del comprobante de pago por WhatsApp.
- **Provincias y Departamentos:** De 48 a 96 horas hábiles según la distancia y la frecuencia de salida de la agencia elegida.
- **Seguimiento:** Una vez despachado el paquete, nuestro equipo te enviará la foto de la guía de remisión o clave secreta de recojo directamente por WhatsApp.

---

## 2. Recojo Gratuito en Tiendas
Puedes retirar tus compras sin costo de flete en nuestras 2 tiendas físicas oficiales en Lima:
- **Sede Tahuantisuyo (Independencia):** Av. Contisuyo #418, Tahuantinsuyo, Independencia.
- **Sede La Victoria:** Av. Nicolás Arriola 901, La Victoria.

El retiro en tienda requiere presentar el código correlativo de pedido generado por la web y coordinar previamente la disponibilidad con tu asesor de WhatsApp.

---

## 3. Cambios de Talla y Garantía de Productos
Para prendas, cascos y guantes:
- El cliente dispone de un plazo de hasta [PENDIENTE: definir días hábiles por el cliente] para solicitar cambio de talla.
- El producto debe encontrarse sin uso, en su empaque original, con manuales, accesorios y sellos protectores de visor intactos.
- Los costos de transporte generados por cambios de talla atribuibles a elección del cliente quedan sujetos a [PENDIENTE: definir políticas de flete por el cliente].

---

## 4. Devoluciones de Dinero y Cancelaciones
- Las solicitudes de reembolso y causales de cancelación de pedidos se encuentran en: [PENDIENTE: definir por el cliente].',
    NOW()
),
(
    'privacidad',
    'Política de Privacidad y Protección de Datos Personales',
    'Cumplimiento estricto de la Ley N° 29733 (Ley de Protección de Datos Personales en el Perú).',
    '## 1. Responsable del Tratamiento
IORI SAC (RUC 20610816089), con nombre comercial IORI BIKER SHOP, con sedes comerciales en Av. Contisuyo #418, Independencia y Av. Nicolás Arriola 901, La Victoria, Lima - Perú, es el titular y responsable de los bancos de datos personales recopilados a través de esta plataforma digital.

---

## 2. Datos Personales Recabados
Recopilamos únicamente los datos necesarios para procesar tus pedidos, solicitudes de financiamiento y consultas de contacto:
- Nombre y apellidos completos.
- Documento Nacional de Identidad (DNI) o Carné de Extranjería.
- Número de teléfono celular / WhatsApp de contacto.
- Dirección de correo electrónico.
- Dirección física o agencia de destino para la entrega de mercadería.

---

## 3. Finalidad del Tratamiento
Los datos personales recabados son utilizados exclusivamente con las siguientes finalidades:
1. Coordinar y formalizar pedidos mediante nuestro canal oficial de WhatsApp (+51 905 445 698).
2. Emitir comprobantes de pago autorizados por SUNAT (boletas de venta electrónica y facturas).
3. Evaluar preliminarmente solicitudes de financiamiento directo para productos biker.
4. Despachar productos a través de las agencias de transporte seleccionadas.
5. Gestionar atenciones posventa y libro de reclamaciones.

---

## 4. Transferencia de Datos a Terceros
Iori Biker Shop NO vende, alquila ni comparte datos con empresas externas de publicidad. Los datos son compartidos únicamente con las empresas de logística y transporte (Shalom, Olva Courier, Marvisur) con el único fin de rotular y entregar los paquetes.

---

## 5. Ejercicio de Derechos ARCO
Conforme a la Ley N° 29733, puedes solicitar el acceso, rectificación, cancelación u oposición al tratamiento de tus datos enviando un correo a **ioribikershop@gmail.com** con el asunto "Derechos ARCO".',
    NOW()
),
(
    'terminos',
    'Términos y Condiciones Generales de Compra',
    'Condiciones legales de navegación, registro de pedidos y adquisición de productos en Iori Biker Shop.',
    '## 1. Naturaleza de la Plataforma y Flujo de Compra
> **[BORRADOR PENDIENTE DE VALIDACIÓN POR CLIENTE]**
> 
> **Flujo Oficial de Registro y Confirmación de Pedidos:**
> 1. La plataforma web de Iori Biker Shop opera como un catálogo digital inteligente con carrito de compras interactivo y generador de pedidos correlativos.
> 2. **La web NO procesa pagos en línea de forma automática ni cobra directamente tarjetas de crédito en la pasarela.**
> 3. Al completar el carrito y pulsar "Enviar pedido por WhatsApp", el sistema registra un pedido formal en nuestra base de datos con un código correlativo único (ejemplo: IORI-000001) y abre automáticamente el canal oficial de atención (+51 905 445 698).
> 4. **El pedido se considera confirmado únicamente cuando el equipo de atención al cliente valida la disponibilidad real de stock en almacén y confirma la recepción válida del comprobante de pago por WhatsApp.**
> 5. **El precio y las condiciones válidas son estrictamente las registradas en el pedido del sistema web al momento de su generación**, garantizando al cliente que no habrá sobrecostos arbitrarios y protegiendo a la empresa ante alteraciones del texto del mensaje en WhatsApp por parte del usuario.

---

## 2. Precios, Promociones y Stock
- Todos los precios mostrados están expresados en Soles Peruanos (PEN / S/) e incluyen el Impuesto General a las Ventas (IGV) correspondiente según ley.
- Las promociones por temporada (como el Combo Esparta y liquidaciones) son válidas hasta la fecha indicada o hasta agotar el stock asignado a la campaña.
- En caso excepcional de falta de stock tras el registro de un pedido, el cliente podrá optar por el reemplazo por un producto de igual o superior gama, o la inmediata devolución de su dinero sin penalidad.

---

## 3. Medios de Pago Aceptados
Las coordinaciones de pago se realizan a través de WhatsApp mediante:
- Billeteras digitales: Yape y Plin autorizados.
- Transferencias directas o interbancarias a cuentas de IORI SAC en BCP, BBVA e Interbank.
- Pago en efectivo o tarjeta con POS físico en nuestras tiendas de Independencia y La Victoria.

---

## 4. Garantías y Limitación de Responsabilidad
- Todos los cascos comercializados cuentan con certificaciones internacionales oficiales (DOT, ECE 22.05 o ECE 22.06) especificadas en su ficha técnica.
- Lo referente a términos de cobertura por uso indebido, caídas o modificaciones mecánicas queda: **[PENDIENTE: revisión legal del cliente]**.

---

## 5. Jurisdicción y Solución de Controversias
Para cualquier discrepancia o controversia legal derivada del uso de este sitio web o la compra de productos, las partes se someten a la competencia de los jueces y tribunales del Distrito Judicial de Lima, Perú.',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    subtitulo = EXCLUDED.subtitulo,
    contenido = EXCLUDED.contenido,
    updated_at = EXCLUDED.updated_at;

-- 5. SEMBRAR PREGUNTAS FRECUENTES ADMINISTRABLES
INSERT INTO public.preguntas_frecuentes (id, categoria, pregunta, respuesta, orden, activo) VALUES
(
    'faq-1',
    'compra-whatsapp',
    '¿Cómo comprar por WhatsApp en Iori Biker Shop?',
    'El proceso es muy simple y seguro: 1) Explora nuestro catálogo y agrega tus cascos o accesorios al carrito. 2) Ve a /carrito, completa tus datos de entrega y pulsa "Enviar pedido por WhatsApp". 3) El sistema registrará tu código correlativo (ej. IORI-000001) y abrirá WhatsApp con todo el detalle listo. 4) Un asesor validará stock al instante y te enviará las instrucciones de pago.',
    1,
    true
),
(
    'faq-2',
    'pagos',
    '¿Cuáles son los métodos de pago disponibles?',
    'Aceptamos pagos directos y 100% seguros: billeteras digitales Yape y Plin, transferencias bancarias a cuentas oficiales de IORI SAC en BCP, BBVA e Interbank (directas y CCI interbancario), y pagos con tarjeta o efectivo en nuestras tiendas físicas. El comprobante se valida directamente por WhatsApp.',
    2,
    true
),
(
    'faq-3',
    'envios',
    '¿Cómo funcionan los envíos a Lima y provincias?',
    'En Lima Metropolitana entregamos entre 24 y 48 horas hábiles vía mensajería motorizada. Para provincias, despachamos a diario a través de Shalom, Marvisur y Olva Courier. Apenas tu paquete es dejado en la agencia, te enviamos la foto de la guía con número de seguimiento y clave de retiro.',
    3,
    true
),
(
    'faq-4',
    'recojo',
    '¿Puedo recoger mi pedido personalmente en sus tiendas?',
    '¡Por supuesto y sin ningún costo de envío! Contamos con 2 tiendas en Lima: Sede Independencia (Av. Contisuyo 418, Tahuantinsuyo) y Sede La Victoria (Av. Nicolás Arriola 901). Solo indica "Recojo en tienda" al armar tu pedido y coordinaremos tu entrega en la sede elegida.',
    4,
    true
),
(
    'faq-5',
    'financiamiento',
    '¿Cómo solicito el financiamiento propio de Iori Biker?',
    'Ingresa a la sección /financiamiento, calcula tu cuota estimada (de 3 a 12 meses) y llena el formulario con tu DNI, celular y producto de interés. Recibirás tu código de solicitud FIN-XXXXXX y se abrirá WhatsApp para que un asesor te indique los requisitos específicos [PENDIENTE: requisitos crediticios detallados por el cliente].',
    5,
    true
),
(
    'faq-6',
    'garantia-cambios',
    '¿Qué pasa si el casco o guantes no me quedan bien?',
    'Puedes solicitar cambio de talla comunicándote de inmediato a nuestro WhatsApp (+51 905 445 698). El producto debe mantenerse sin uso, con etiquetas, protectores y empaques originales. Los plazos y condiciones específicas para cambios son: [PENDIENTE: definir por el cliente].',
    6,
    true
)
ON CONFLICT (id) DO UPDATE SET
    categoria = EXCLUDED.categoria,
    pregunta = EXCLUDED.pregunta,
    respuesta = EXCLUDED.respuesta,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo;

-- 6. SEMBRAR 3 ARTÍCULOS DEMO DE BLOG EN BORRADOR (16:9, SEO, CONTENIDO ENRIQUECIDO)
INSERT INTO public.blog (id, titulo, slug, resumen, contenido, imagen, categoria, autor, fecha, lectura_minutos, publicado, meta_title, meta_description, keywords, created_at) VALUES
(
    'blog-demo-1',
    'Guía definitiva 2026: Cómo certificar y elegir un casco seguro (ECE 22.06 vs DOT)',
    'guia-casco-seguro-ece-2206-dot',
    'Descubre las diferencias clave entre la exigente norma europea ECE 22.06 y la tradicional DOT americana, y por qué tu seguridad en moto depende de este sello.',
    '# Guía definitiva 2026: Cómo certificar y elegir un casco seguro

La seguridad en moto empieza por la cabeza. En el mercado peruano circulan cientos de alternativas, pero no todos los cascos protegen por igual. Conocer las certificaciones oficiales te permitirá tomar una decisión informada antes de salir a la ruta o al tráfico urbano.

![Pruebas de impacto en cascos](/images/banners/banner_mid_1.png)

## 1. La norma europea ECE 22.06: El estándar de oro
Aprobada recientemente para reemplazar a la veterana ECE 22.05, la homologación **ECE 22.06** somete al casco a pruebas de impacto mucho más rigurosas:
- **Impactos oblicuos y rotacionales:** Miden la aceleración angular transmitida al cerebro, previniendo lesiones axonales difusas.
- **Diferentes niveles de velocidad:** Se prueba tanto a alta velocidad como a impactos moderados, donde una calota demasiado rígida podría resultar perjudicial.
- **Accesorios integrados:** Los visores solares internos y los sistemas de intercomunicador deben estar instalados durante las pruebas para garantizar que no penetren la calota.

## 2. La certificación DOT (FMVSS 218)
La norma **DOT** es el estándar del Departamento de Transporte de los Estados Unidos. Aunque es obligatoria en Norteamérica, se basa en la autorregulación de los fabricantes con auditorías aleatorias. Marcas reconocidas como LS2, HJC y MT Helmets superan con holgura estas exigencias.

## 3. ¿Cómo verificar que tu casco es original en Iori Biker Shop?
1. **Etiqueta cosida en la correa:** Busca el círculo con la letra "E" y el número de homologación correspondiente.
2. **Grosor del visor:** Micas con grosor mínimo de 2 mm con tratamiento anti-rayaduras y soporte Pinlock.
3. **Ajuste anatómico:** El casco debe presionar firmemente las mejillas sin crear puntos de presión dolorosos en la frente o nuca.

> En Iori Biker Shop todos nuestros cascos integrales y abatibles cuentan con certificación homologada y ficha técnica verificable.',
    '/images/banners/banner_mid_1.png',
    'Seguridad y Normativa',
    'Iori Biker Team',
    '28 Sep 2026',
    5,
    false, -- BORRADOR
    'Guía 2026: Cascos ECE 22.06 vs DOT | Iori Biker Shop',
    'Aprende a diferenciar las certificaciones ECE 22.06 y DOT en cascos de moto en Perú. Guía completa de seguridad, pruebas y cómo elegir tu talla ideal.',
    'cascos certificados, ece 22.06, dot, seguridad moto, iori biker shop, cascos lima',
    NOW()
),
(
    'blog-demo-2',
    'Mantenimiento de cadena de transmisión: Paso a paso para alargar su vida útil',
    'mantenimiento-cadena-transmision-paso-a-paso',
    'Limpieza, desengrase y lubricación adecuada para evitar desgaste prematuro y mantener la potencia de tu moto al 100%.',
    '# Mantenimiento de cadena de transmisión: Paso a paso

La cadena de transmisión es el componente que transmite la fuerza del motor a la rueda trasera. Un mantenimiento deficiente no solo resta aceleración y aumenta el consumo de combustible, sino que representa un peligro inminente de rotura en plena marcha.

![Mantenimiento de cadena](/images/categories/cat_8.png)

## ¿Cada cuántos kilómetros se debe lubricar?
- **En ciudad seca:** Cada 500 a 800 km.
- **Bajo lluvia o polvo:** Cada 300 km o inmediatamente después de lavar la moto.

## Pasos esenciales para un servicio profesional:
1. **Desengrase a fondo:** Aplica un desengrasante especializado para cadenas (evita gasolina o thinner, ya que degradan los retenes O-ring o X-ring).
2. **Cepillado trilateral:** Usa un cepillo especial de tres caras para retirar el barro y la arenilla acumulada entre los rodillos.
3. **Secado completo:** Espera 10 minutos o seca con un paño de microfibra limpio.
4. **Lubricación precisa:** Aplica lubricante para cadena por la cara interna mientras giras la rueda con la mano. Deja reposar al menos 30 minutos antes de encender la moto para evitar salpicaduras.

Encuentra los kits completos de lubricación y cepillos en nuestra categoría de Limpieza y Mantenimiento.',
    '/images/categories/cat_8.png',
    'Mantenimiento y Mecánica',
    'Especialistas Iori',
    '27 Sep 2026',
    4,
    false, -- BORRADOR
    'Mantenimiento de Cadena de Moto: Guía Práctica | Iori Biker Shop',
    'Aprende a desengrasar y lubricar la cadena de tu moto paso a paso. Productos recomendados y frecuencia adecuada para alargar su durabilidad.',
    'mantenimiento moto, lubricante de cadena, desengrasante motul, iori biker',
    NOW()
),
(
    'blog-demo-3',
    'Intercomunicadores para moto: Beneficios, instalación y normativas en el Perú',
    'intercomunicadores-moto-beneficios-instalacion',
    'Todo lo que necesitas saber antes de equipar tu casco con intercomunicador bluetooth: conectividad de grupo, autonomía y sonido de alta fidelidad.',
    '# Intercomunicadores para moto: Beneficios, instalación y normativas

Viajar en grupo o atender llamadas de trabajo mientras conduces tu motocicleta solía ser una tarea incómoda o peligrosa. Los intercomunicadores bluetooth modernos han revolucionado la experiencia motera, combinando seguridad y comunicación nítida.

![Intercomunicador Bluetooth en casco](/images/categories/cat_2.png)

## Principales ventajas en ruta:
- **Comunicación mesh o bluetooth de largo alcance:** Conéctate con hasta 8 o más pilotos en tiempo real sin gastar datos celulares.
- **Navegación GPS por voz:** Recibe las instrucciones giro a giro de Waze o Google Maps sin apartar la mirada de la pista.
- **Cancelación activa de ruido (DSP / CVC):** Filtra el ruido del viento incluso a velocidades de carretera (+100 km/h).

## Consejos de instalación en tu casco:
1. Retira las almohadillas laterales internas de tu casco (cheek pads).
2. Ubica los parlantes en los huecos preformados para orejas de la calota interna.
3. Coloca el micrófono de varilla (si es casco abatible) o de botón (si es casco integral).
4. Esconde el cableado por debajo del tapizado para evitar molestias.

En Iori Biker Shop ofrecemos servicio de instalación y prueba de audio en nuestras tiendas de Independencia y La Victoria.',
    '/images/categories/cat_2.png',
    'Tecnología y Accesorios',
    'Iori Biker Team',
    '26 Sep 2026',
    4,
    false, -- BORRADOR
    'Intercomunicadores Bluetooth para Cascos de Moto | Iori Biker Shop',
    'Conoce los mejores intercomunicadores para moto en Perú. Características, cómo instalarlos en tu casco y consejos para viajes en grupo.',
    'intercomunicador casco, bluetooth moto, manos libres moto lima, accesorios biker',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    slug = EXCLUDED.slug,
    resumen = EXCLUDED.resumen,
    contenido = EXCLUDED.contenido,
    imagen = EXCLUDED.imagen,
    categoria = EXCLUDED.categoria,
    autor = EXCLUDED.autor,
    fecha = EXCLUDED.fecha,
    lectura_minutos = EXCLUDED.lectura_minutos,
    publicado = EXCLUDED.publicado,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    keywords = EXCLUDED.keywords;

-- 7. AJUSTE DE CONDICIONES DE FINANCIAMIENTO
INSERT INTO public.ajustes_generales (clave, valor, descripcion, updated_at) VALUES
(
    'financiamiento_condiciones',
    '{
        "titulo": "Financiamiento Directo Iori Biker",
        "subtitulo": "Llévate tu casco, indumentaria o equipamiento pagando en cómodas cuotas.",
        "descripcion": "En Iori Biker Shop te facilitamos el acceso al mejor equipo de protección con financiamiento directo y evaluación crediticia ágil.",
        "requisitos": [
            "DNI vigente (ambos lados)",
            "Número de celular con WhatsApp activo",
            "Correo electrónico personal para envío de contrato y cronograma",
            "Ingresos demostrables o actividad laboral formal/independiente [PENDIENTE]",
            "Mayor de 18 años y residencia en territorio peruano [PENDIENTE]"
        ],
        "cuotas_disponibles": [3, 6, 9, 12],
        "tea_referencial": "Por definir [PENDIENTE]",
        "nota_legal": "Todas las solicitudes están sujetas a evaluación crediticia y verificación de identidad. Las tasas, comisiones y condiciones finales quedan [PENDIENTE: definir por el cliente].",
        "telefono_whatsapp": "+51 905 445 698"
    }'::jsonb,
    'Condiciones y requisitos editables para financiamiento',
    NOW()
)
ON CONFLICT (clave) DO UPDATE SET
    valor = EXCLUDED.valor,
    descripcion = EXCLUDED.descripcion,
    updated_at = EXCLUDED.updated_at;
