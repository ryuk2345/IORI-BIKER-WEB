# Walkthrough de Implementación Visual de aCuotaz (Sin Integración API)

> **Regla de Referencia:** `.agents/rules/iori-contexto.md` (Sección *aCuotaz*)  
> **Patrón:** Información 100% visual y coordinación comercial por WhatsApp. Sin API, sin webhooks, sin widgets externos ni preevaluación.

---

## 1. Resumen de Implementación

Se ha configurado la solución visual para el financiamiento con **aCuotaz**, respetando estrictamente el sistema de diseño de Iori Biker Shop y las referencias de la industria (*Direli Motos*):

1. **Ajustes en Panel de Administración:**
   - Grupo dedicado `aCuotaz — Ajustes del Estimado de Cuotas (Visual)` en [AdminSettingsShipping.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/admin/AdminSettingsShipping.tsx).
   - Control de: activo/inactivo, número de cuotas ($n=9$ DEMO), factor ($1.23$ DEMO), montos mínimo ($S/\ 100$) y máximo ($S/\ 2,000$), texto de franja, texto de recuadro y aviso legal.
   - Aviso visual destacado advirtiendo que los valores iniciales son DEMO y deben actualizarse con el simulador oficial antes del lanzamiento.

2. **Cálculo Único y Pruebas Unitarias:**
   - Módulo [src/lib/acuotaz-estimado.ts](file:///Users/user/Documents/web%20de%20iori/src/lib/acuotaz-estimado.ts) con la función `calcularCuotaEstimada(precio)`.
   - Fórmula: $\text{cuota} = \text{precio} \times \text{factor} \div n$, con redondeo estricto hacia arriba al céntimo.
   - Manejo de casos borde: montos fuera de rango, servicio inactivo, factor faltante (con fallback sin monto "Paga en cuotas sin tarjeta, solo con tu DNI").
   - Pruebas unitarias automáticas con `node --test` en [tests/acuotaz-estimado.test.mjs](file:///Users/user/Documents/web%20de%20iori/tests/acuotaz-estimado.test.mjs) ejecutadas con **8/8 tests aprobados** (`npm test`).

3. **Franja Superior Bajo el Header:**
   - Componente [src/components/acuotaz/ACuotazHeaderStrip.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/acuotaz/ACuotazHeaderStrip.tsx) con fondo claro (`#F4F4F5`), logo oficial SVG [acuotaz.svg](file:///Users/user/Documents/web%20de%20iori/public/brand/acuotaz.svg), texto con número en negrita (`Divide tu pago en hasta 9 cuotas`), badge en contraste negro (`SIN TARJETA, SOLO CON TU DNI`) y enlace completo a `/financiamiento`. En móvil se visualiza en una sola línea compacta.

4. **Recuadro en Ficha de Producto:**
   - Componente [src/components/acuotaz/ACuotazWidget.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/acuotaz/ACuotazWidget.tsx) ubicado exactamente bajo el precio y SKU y antes de las tallas en [ProductDetailView.tsx](file:///Users/user/Documents/web%20de%20iori/src/components/product/ProductDetailView.tsx).
   - Muestra cuota estimada en negrita (`Llévatelo en 9 cuotas quincenales de S/ 61.37`), etiqueta `Sin tarjeta de crédito`, enlace `CONOCE MÁS` a `/financiamiento` y logo aCuotaz a la derecha. Debajo: `"Monto referencial, sujeto a evaluación y condiciones de aCuotaz."`
   - Reactivo: se recalcula al cambiar variantes de precio.

5. **Carrito y Proceso de Compra:**
   - En [src/app/carrito/page.tsx](file:///Users/user/Documents/web%20de%20iori/src/app/carrito/page.tsx), opción de pago: `En cuotas con aCuotaz (se coordina por WhatsApp)` con desglose de la cuota calculada del pedido.
   - Si el total no alcanza el mínimo, avisa dinámicamente: `"Agrega S/ X más para pagar en cuotas"` deshabilitando la opción.
   - En [src/app/api/pedidos/route.ts](file:///Users/user/Documents/web%20de%20iori/src/app/api/pedidos/route.ts), se registra el pedido como `nuevo` sin bloquear stock prematuramente (el stock se descuenta al marcar 'Pagado') y genera el mensaje de WhatsApp preformateado con `Pago: en cuotas con aCuotaz (estimado: 9 cuotas quincenales de S/ X)` para que el asesor envíe el link correspondiente.

6. **Página de Financiamiento (/financiamiento):**
   - En [src/app/financiamiento/page.tsx](file:///Users/user/Documents/web%20de%20iori/src/app/financiamiento/page.tsx):
     1. Proceso de 4 pasos (Eliges productos -> Marcas cuotas -> Envías por WhatsApp -> Recibes enlace).
     2. Requisitos comerciales con badges de confirmación previa.
     3. Preguntas Frecuentes desplegadas en tarjetas limpias.
     4. Botón de contacto directo con mensaje preformateado: `"Hola, quiero comprar en cuotas con aCuotaz"`.

7. **Footer:**
   - Inclusión del logo oficial blanco [acuotaz-white.svg](file:///Users/user/Documents/web%20de%20iori/public/brand/acuotaz-white.svg) junto al texto corporativo en la sección de medios de pago.

---

## 2. Evidencia Visual a 1440 px y 390 px

| Sección | Desktop (1440 px) | Mobile (390 px) |
| :--- | :--- | :--- |
| **Franja Header** | [Ver Captura 1440](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/acuotaz_franja_home_1440.png) | [Ver Captura 390](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/acuotaz_franja_home_390.png) |
| **Ficha de Producto** | [Ver Captura 1440](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/acuotaz_recuadro_ficha_1440.png) | [Ver Captura 390](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/acuotaz_recuadro_ficha_390.png) |
| **Carrito (Opción Cuotas)** | [Ver Captura 1440](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/acuotaz_carrito_opcion_1440.png) | [Ver Captura 390](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/acuotaz_carrito_opcion_390.png) |
| **Página /financiamiento** | [Ver Captura 1440](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/acuotaz_pagina_financiamiento_1440.png) | [Ver Captura 390](file:///Users/user/Documents/web%20de%20iori/docs/rediseno/capturas/acuotaz_pagina_financiamiento_390.png) |
