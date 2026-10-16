import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pruebas unitarias de la lógica de validación de precios, stock, cupones y envíos en el servidor.
 * Esta lógica refleja las reglas implementadas en:
 * - src/app/api/pedidos/route.ts
 * - src/app/api/admin/pedidos/estado/route.ts
 */

// Función simulada que implementa la regla de cálculo de precios del servidor
function calcularSubtotalServidor(itemsEnviados, productosBD) {
  let subtotal = 0;
  const itemsValidados = [];

  for (const item of itemsEnviados) {
    const prodId = item.producto_id;
    const dbProd = productosBD[prodId];

    if (!dbProd || !dbProd.activo) {
      throw new Error(`El producto no está disponible`);
    }

    if (dbProd.modo_venta === 'cotizar' || dbProd.modo_venta === 'solo_cotizar') {
      throw new Error(`El producto "${dbProd.nombre}" es de venta exclusiva por cotización`);
    }

    const cantidad = Math.max(1, Number(item.cantidad) || 1);
    // REGLA CRÍTICA: Se toma el precio del servidor (precio_oferta si existe, o precio regular),
    // NUNCA el precio que envía el cliente desde el navegador.
    const precioUnitario = Number(dbProd.precio_oferta || dbProd.precio);
    const subtotalItem = Math.round(precioUnitario * cantidad * 100) / 100;
    subtotal += subtotalItem;

    itemsValidados.push({
      producto_id: dbProd.id,
      precio_unitario: precioUnitario,
      cantidad,
      subtotal: subtotalItem,
    });
  }

  return { subtotal: Math.round(subtotal * 100) / 100, itemsValidados };
}

// Función que implementa la validación de cupones en el servidor
function validarCuponServidor(cupon, subtotal, fechaActual = new Date().toISOString()) {
  if (!cupon || !cupon.activo) return 0;

  if (cupon.fecha_fin && cupon.fecha_fin < fechaActual) {
    return 0; // Cupón vencido
  }

  if (cupon.minimo_compra && subtotal < Number(cupon.minimo_compra)) {
    return 0; // No alcanza el mínimo de compra
  }

  if (cupon.tipo === 'porcentaje') {
    return Math.round(((subtotal * Number(cupon.valor)) / 100) * 100) / 100;
  } else {
    return Math.min(subtotal, Number(cupon.valor));
  }
}

// Función que valida la transición de stock en el admin
function procesarTransicionStock(pedido, nuevoEstado, stockDisponible) {
  const estadoAnterior = pedido.estado;
  const nuevoStock = { ...stockDisponible };

  if (nuevoEstado === 'pagado' && estadoAnterior !== 'pagado') {
    for (const item of pedido.items) {
      const disponible = nuevoStock[item.variante_id || item.producto_id] ?? 0;
      if (disponible < item.cantidad) {
        throw new Error(`Stock insuficiente: disponible ${disponible}, solicitado ${item.cantidad}`);
      }
      nuevoStock[item.variante_id || item.producto_id] = disponible - item.cantidad;
    }
  }

  if (nuevoEstado === 'cancelado' && estadoAnterior === 'pagado') {
    for (const item of pedido.items) {
      const actual = nuevoStock[item.variante_id || item.producto_id] ?? 0;
      nuevoStock[item.variante_id || item.producto_id] = actual + item.cantidad;
    }
  }

  return nuevoStock;
}

test('Servidor - Ignora precio manipulado por el cliente y usa el de la BD', () => {
  const productosBD = {
    'prod-casco-1': {
      id: 'prod-casco-1',
      nombre: 'Casco Shaft Pro',
      precio: 450.0,
      precio_oferta: 399.0,
      modo_venta: 'regular',
      activo: true,
    },
  };

  // Cliente intenta enviar precio alterado de S/ 1.00
  const itemsCliente = [
    {
      producto_id: 'prod-casco-1',
      cantidad: 2,
      precio: 1.0, // MANIPULADO
    },
  ];

  const resultado = calcularSubtotalServidor(itemsCliente, productosBD);
  // El precio debe ser 399.00 * 2 = 798.00, NO 2.00
  assert.equal(resultado.subtotal, 798.0);
  assert.equal(resultado.itemsValidados[0].precio_unitario, 399.0);
});

test('Servidor - Rechaza productos marcados como solo cotizar', () => {
  const productosBD = {
    'prod-especial': {
      id: 'prod-especial',
      nombre: 'Mono de Competición a Medida',
      precio: 2500.0,
      modo_venta: 'solo_cotizar',
      activo: true,
    },
  };

  const itemsCliente = [{ producto_id: 'prod-especial', cantidad: 1 }];

  assert.throws(
    () => calcularSubtotalServidor(itemsCliente, productosBD),
    /es de venta exclusiva por cotización/
  );
});

test('Servidor - Validación de cupón porcentual y monto fijo', () => {
  const cuponPorcentaje = {
    codigo: 'BIKER10',
    tipo: 'porcentaje',
    valor: 10,
    activo: true,
    minimo_compra: 100,
  };

  const cuponFijo = {
    codigo: 'DESC30',
    tipo: 'monto_fijo',
    valor: 30,
    activo: true,
    minimo_compra: 150,
  };

  // 10% de S/ 500 = S/ 50
  assert.equal(validarCuponServidor(cuponPorcentaje, 500), 50.0);

  // Cupón fijo de S/ 30 con subtotal S/ 200
  assert.equal(validarCuponServidor(cuponFijo, 200), 30.0);

  // No cumple mínimo de compra (S/ 100 < S/ 150)
  assert.equal(validarCuponServidor(cuponFijo, 100), 0.0);

  // Cupón vencido
  const cuponVencido = {
    ...cuponPorcentaje,
    fecha_fin: '2026-01-01T00:00:00Z',
  };
  assert.equal(validarCuponServidor(cuponVencido, 500, '2026-09-30T00:00:00Z'), 0.0);
});

test('Servidor - Control de stock: Descuenta al marcar pagado y restaura al cancelar', () => {
  const stockInicial = { 'var-m': 5, 'var-l': 1 };

  const pedido = {
    id: 'ped-1',
    estado: 'nuevo',
    items: [{ variante_id: 'var-l', cantidad: 1 }],
  };

  // Transición 1: nuevo -> pagado (debe descontar 1 de var-l)
  const stockDespuesPago = procesarTransicionStock(pedido, 'pagado', stockInicial);
  assert.equal(stockDespuesPago['var-l'], 0);

  // Transición 2: pagado -> cancelado (debe devolver 1 a var-l)
  const pedidoPagado = { ...pedido, estado: 'pagado' };
  const stockDespuesCancelacion = procesarTransicionStock(pedidoPagado, 'cancelado', stockDespuesPago);
  assert.equal(stockDespuesCancelacion['var-l'], 1);
});

test('Servidor - Bloquea marcar como pagado si el stock es insuficiente', () => {
  const stockInsuficiente = { 'var-xl': 0 };

  const pedido = {
    id: 'ped-2',
    estado: 'nuevo',
    items: [{ variante_id: 'var-xl', cantidad: 2 }],
  };

  assert.throws(
    () => procesarTransicionStock(pedido, 'pagado', stockInsuficiente),
    /Stock insuficiente/
  );
});
