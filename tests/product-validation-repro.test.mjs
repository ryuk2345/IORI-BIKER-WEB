import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Reproducción de caso real: Producto con variantes y precio 350 / oferta 200', () => {
  // Datos del caso real ingresado por el usuario:
  const formState = {
    nombre: 'Casco LS2 FF800 Storm',
    precio: '350',
    precioOferta: '200',
    sku: '', // Campo general de SKU que queda oculto al activar tieneVariantes
    stock: 0, // Campo general de stock que queda oculto al activar tieneVariantes
    tieneVariantes: true,
    variantes: [
      { talla: 'M', color: 'Negro Mate', sku: 'LS2-FF500-NM-M', stock: 5, precio_ajuste: 0 },
      { talla: 'L', color: 'Negro Mate', sku: 'LS2-FF700-NM-M', stock: 5, precio_ajuste: 0 },
      { talla: 'XL', color: 'Negro Mate', sku: 'LS2-FF200-NM-P', stock: 5, precio_ajuste: 0 },
    ],
  };

  const numPrecio = parseFloat(formState.precio) || 0;
  const numPrecioOferta = parseFloat(formState.precioOferta) || 0;

  // Lógica actual de validateForm en AdminProductForm.tsx:
  const newErrors = {};

  if (!formState.nombre.trim()) {
    newErrors.nombre = 'El nombre del producto es obligatorio.';
  }
  if (!formState.sku.trim()) {
    newErrors.sku = 'El código SKU es obligatorio.';
  }
  if (isNaN(numPrecio) || numPrecio <= 0) {
    newErrors.precio = 'El precio normal debe ser un monto mayor a 0.';
  }
  if (formState.precioOferta && (isNaN(numPrecioOferta) || numPrecioOferta <= 0)) {
    newErrors.precioOferta = 'El precio de oferta debe ser un número válido.';
  } else if (numPrecioOferta >= numPrecio && numPrecioOferta > 0) {
    newErrors.precioOferta = 'El precio de oferta debe ser menor al precio normal.';
  }

  // Registro en consola del objeto completo de errores de validación
  console.log('====================================================');
  console.log('REPRODUCCIÓN DEL CASO REAL:');
  console.log('Form State:', JSON.stringify(formState, null, 2));
  console.log('----------------------------------------------------');
  console.log('OBJETO COMPLETO DE ERRORES DE VALIDACIÓN (newErrors):', JSON.stringify(newErrors, null, 2));
  console.log('====================================================');

  // Comprobar que newErrors contiene { sku: 'El código SKU es obligatorio.' }
  assert.strictEqual(
    newErrors.sku,
    'El código SKU es obligatorio.',
    'El campo SKU general falla porque se valida incondicionalmente a pesar de estar oculto cuando tieneVariantes = true'
  );
  
  // Verificar que el resto de campos no tienen error
  assert.strictEqual(newErrors.nombre, undefined);
  assert.strictEqual(newErrors.precio, undefined);
  assert.strictEqual(newErrors.precioOferta, undefined);
});
