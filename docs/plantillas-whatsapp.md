# Plantillas Oficiales de WhatsApp — Iori Biker Shop

> **Nota:** Las variables van entre llaves `{}`. Los datos de pago (Yape, Plin, cuentas bancarias) se administran desde la configuración del panel administrativo.

---

## 1. Mensajes que genera la web

### A. Pedido (desde /carrito)
```text
Hola, Iori Biker Shop 👋 Quiero hacer este pedido:

*Pedido {codigo}*
{items: • {cantidad} x {producto} ({variante}) · SKU {sku} · {precio}}

Subtotal: {subtotal}
Descuento: {descuento}
Envío: {envio}
*Total: {total}*

*Mis datos*
{nombre} · {celular}
Comprobante: {comprobante}
Entrega: {entrega}
Notas: {notas}

¿Me confirman stock y cómo pagar? 🙌
```

### B. Cotizar (desde ProductCard y ficha de producto)
```text
Hola, Iori Biker Shop 👋 Quiero cotizar: *{producto}* ({variante}), SKU {sku}. {url}
```

### C. Botón flotante
```text
Hola, Iori Biker Shop 👋 Quiero información sobre sus productos.
```

### D. Financiamiento (desde /financiamiento)
```text
Hola, Iori Biker Shop 👋 Envié la solicitud de financiamiento *{codigo}* para {producto}. Quedo a la espera de los requisitos.
```

---

## 2. Plantillas de atención al cliente (Admin)

### A. Instrucciones de pago
```text
¡Hola, {nombre}! Gracias por tu pedido *{codigo}* 🙌 Confirmamos stock de todo. Total a pagar: *{total}*.

Puedes pagar con:
- Yape o Plin: {numero_yape_plin} (a nombre de {titular})
- Transferencia {banco}: cuenta {cuenta} / CCI {cci}

Te enviamos el QR en el siguiente mensaje. Cuando pagues, mándanos la captura por aquí y preparamos tu pedido.
```

### B. Pago confirmado
```text
¡Pago recibido, {nombre}! ✅ Tu pedido *{codigo}* está confirmado y ya lo estamos preparando. Te avisamos por aquí en cuanto salga o esté listo para recoger.
```

### C. En camino (Lima)
```text
¡Tu pedido *{codigo}* ya salió, {nombre}! 🏍️ Lo entregamos en {direccion} {fecha_entrega}. Te llamaremos antes de llegar.
```

### D. En camino (provincia)
```text
¡Tu pedido *{codigo}* ya va en camino, {nombre}! 🏍️
Agencia: {agencia}
Código de seguimiento: {codigo_seguimiento}
Destino: {ciudad}
Para recogerlo en la agencia, lleva tu DNI.
```

### E. Listo para recojo
```text
¡Tu pedido *{codigo}* ya está listo, {nombre}! 🙌 Recógelo en nuestra tienda de {tienda} ({direccion_tienda}), {horario_tienda}. Menciona tu número de pedido al llegar.
```

### F. Producto agotado
```text
Hola, {nombre}. Revisando tu pedido *{codigo}*, el producto {producto} ({variante}) se nos agotó 😕 Te podemos ofrecer {alternativa} o seguir con el resto del pedido por {nuevo_total}. ¿Cómo prefieres continuar?
```

### G. Pedido sin mensaje
```text
Hola, {nombre} 👋 Te escribimos de Iori Biker Shop. Registraste el pedido *{codigo}* en nuestra web, pero no nos llegó tu mensaje. ¿Te ayudamos a completarlo?
```
