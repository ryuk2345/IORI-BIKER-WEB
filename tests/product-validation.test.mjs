import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  generateVariantSku,
  validateProductForm,
  assertNoInvisibleFieldErrors,
  resolveGeneralSku,
} from '../src/utils/productValidation.ts';

test('1. Producto sin variantes y sin SKU: Es obligatorio y marca error visible', () => {
  const formSinSku = {
    nombre: 'Guantes Alpinestars SP-8 V3',
    precio: '280.00',
    precioOferta: '',
    categoriaSlug: 'guantes',
    marcaId: 'alpinestars',
    sku: '', // VACÍO
    tieneVariantes: false,
    variantes: [],
  };

  const errors = validateProductForm(formSinSku);

  assert.equal(
    errors.sku,
    'El código SKU es obligatorio para productos sin variantes.',
    'Debe marcar error obligatorio en SKU general cuando no hay variantes'
  );
  assert.equal(errors.nombre, undefined);
  assert.equal(errors.categoria, undefined);
  assert.equal(errors.marca, undefined);
  assert.equal(errors.precio, undefined);
});

test('2. Caso real: Producto con variantes y sin SKU general se guarda con SKU NULL', () => {
  // Caso real reportado por el cliente que fallaba con "Corrige los campos marcados en rojo"
  const formConVariantes = {
    nombre: 'Casco LS2 FF800 Storm',
    precio: '350',
    precioOferta: '200',
    categoriaSlug: 'cascos',
    marcaId: 'ls2',
    sku: '', // Campo general que está OCULTO en pantalla
    tieneVariantes: true,
    variantes: [
      { talla: 'M', color: 'Negro Mate', sku: 'LS2-FF500-NM-M', stock: 5, precio_ajuste: 0 },
      { talla: 'L', color: 'Negro Mate', sku: 'LS2-FF700-NM-M', stock: 5, precio_ajuste: 0 },
      { talla: 'XL', color: 'Negro Mate', sku: 'LS2-FF200-NM-P', stock: 5, precio_ajuste: 0 },
    ],
  };

  const errors = validateProductForm(formConVariantes);

  // 1. No debe existir ningún error
  assert.deepEqual(errors, {}, 'El formulario con variantes válidas debe pasar sin ningún error');

  // 2. El SKU general guardado debe ser exactamente NULL (nunca copiar el SKU de una variante)
  const savedGeneralSku = resolveGeneralSku(formConVariantes.tieneVariantes, formConVariantes.sku);
  assert.equal(
    savedGeneralSku,
    null,
    'Para productos con variantes, el SKU general en la BD debe ser NULL'
  );

  // 3. Invariante: no debe haber ningún error en campos invisibles
  assert.doesNotThrow(() => {
    assertNoInvisibleFieldErrors(errors, formConVariantes.tieneVariantes);
  });
});

test('3. Generador de SKU de variante: crea código editable a partir de nombre, color y talla', () => {
  const sku1 = generateVariantSku('Casco LS2 FF800 Storm', 'M', 'Negro Mate');
  assert.equal(sku1, 'CASCO-LS2-FF800-NEGRO-M');

  const sku2 = generateVariantSku('Chaqueta Dainese Racing 4', '52', 'Rojo');
  assert.equal(sku2, 'CHAQUETA-DAINESE-RACING-ROJO-52');

  const skuFallback = generateVariantSku('', '', '');
  assert.equal(skuFallback, 'PROD-STD-STD');
});

test('4. Variantes: SKU vacío se marca con la fila exacta', () => {
  const formVarianteSinSku = {
    nombre: 'Casco Shaft 582',
    precio: '320',
    categoriaSlug: 'cascos',
    marcaId: 'shaft',
    sku: '',
    tieneVariantes: true,
    variantes: [
      { talla: 'M', color: 'Negro', sku: 'SHAFT-582-NEG-M' },
      { talla: 'L', color: 'Negro', sku: '' }, // VACÍO en fila índice 1
    ],
  };

  const errors = validateProductForm(formVarianteSinSku);

  assert.equal(
    errors.variante_1_sku,
    'El SKU de esta variante es obligatorio.',
    'Debe marcar con exactitud la fila #2 (índice 1)'
  );
  assert.equal(errors.variante_0_sku, undefined);
  assert.equal(errors.sku, undefined, 'El SKU general no debe reportar error porque está oculto');
});

test('5. Variantes: SKU duplicado se marca con la fila exacta que duplica', () => {
  const formVariantesDuplicadas = {
    nombre: 'Casco MT Thunder 4',
    precio: '420',
    categoriaSlug: 'cascos',
    marcaId: 'mt',
    sku: '',
    tieneVariantes: true,
    variantes: [
      { talla: 'M', color: 'Negro', sku: 'MT-THUNDER4-NEG' },
      { talla: 'L', color: 'Negro', sku: 'MT-THUNDER4-NEG' }, // DUPLICADO de fila 1
    ],
  };

  const errors = validateProductForm(formVariantesDuplicadas);

  assert.equal(
    errors.variante_1_sku,
    'SKU duplicado con la fila #1.',
    'Debe identificar que la fila #2 duplica el SKU de la fila #1'
  );
  assert.equal(errors.variante_0_sku, undefined);
});

test('6. Categoría y Marca: No vienen elegidas por defecto y son obligatorias', () => {
  const formSinCatNiMarca = {
    nombre: 'Producto Nuevo Sin Categoría',
    precio: '100',
    categoriaSlug: '', // VACÍA POR DEFECTO
    marcaId: '', // VACÍA POR DEFECTO
    sku: 'PROD-TEST-123',
    tieneVariantes: false,
    variantes: [],
  };

  const errors = validateProductForm(formSinCatNiMarca);

  assert.equal(
    errors.categoria,
    'Debes seleccionar una categoría obligatoria.',
    'La categoría no puede venir seleccionada por defecto'
  );
  assert.equal(
    errors.marca,
    'Debes seleccionar una marca oficial obligatoria.',
    'La marca oficial no puede venir seleccionada por defecto'
  );
});

test('7. INVARIANTE CRÍTICO: Si un error corresponde a un campo no visible, la prueba falla', () => {
  // Simulamos un bug donde el validador accidentalmente produce error en SKU general estando oculto
  const erroresBug = {
    sku: 'El código SKU es obligatorio.',
  };

  assert.throws(
    () => {
      assertNoInvisibleFieldErrors(erroresBug, true);
    },
    /BUG DETECTADO: Se generó el error "El código SKU es obligatorio." en un campo no visible en pantalla \(SKU general\) cuando tieneVariantes=true/,
    'Debe arrojar fallo explícito si un campo oculto bloquea el guardado'
  );
});

test('8. Migración SQL: Índice único parcial para permitir múltiples NULLs en productos con variantes', () => {
  const migrationPath = path.resolve('supabase/migrations/20261025000009_sku_partial_unique_index.sql');
  assert.ok(fs.existsSync(migrationPath), 'El archivo de migración debe existir');

  const content = fs.readFileSync(migrationPath, 'utf8');

  // 1. Debe eliminar la restricción única estricta
  assert.ok(
    content.includes('DROP CONSTRAINT IF EXISTS productos_sku_key') ||
    content.includes('DROP INDEX IF EXISTS public.productos_sku_key'),
    'La migración debe eliminar la restricción UNIQUE estricta de productos'
  );

  // 2. Debe crear el índice único parcial WHERE sku IS NOT NULL
  assert.ok(
    content.includes('idx_productos_sku_partial_unique') &&
    content.includes('WHERE sku IS NOT NULL'),
    'La migración debe crear un índice único parcial WHERE sku IS NOT NULL en productos'
  );

  // 3. Debe crear el índice único parcial en producto_variantes
  assert.ok(
    content.includes('idx_producto_variantes_sku_partial_unique') &&
    content.includes('WHERE sku IS NOT NULL'),
    'La migración debe crear un índice único parcial WHERE sku IS NOT NULL en variantes'
  );
});

test('9. Visibilidad de UI: Toast en esquina superior y SaveBar con z-index alto y margen de insignias', () => {
  const toastPath = path.resolve('src/components/admin/ui/Toast.tsx');
  const toastCode = fs.readFileSync(toastPath, 'utf8');

  // El toast debe ubicarse en top-5 right-5 (esquina superior derecha, libre de la insignia de Netlify y botón WhatsApp)
  assert.ok(
    toastCode.includes('top-5 right-5 z-[99999]'),
    'El toast debe renderizarse en top-5 right-5 con z-index 99999 para no ser tapado por insignias inferiores'
  );

  const saveBarPath = path.resolve('src/components/admin/ui/StickySaveBar.tsx');
  const saveBarCode = fs.readFileSync(saveBarPath, 'utf8');

  // El StickySaveBar debe tener z-index elevado y padding derecho para no quedar tapado
  assert.ok(
    saveBarCode.includes('z-[9990]') && (saveBarCode.includes('pr-20') || saveBarCode.includes('pr-24')),
    'El StickySaveBar debe contar con z-index 9990 y espacio de separación a la derecha'
  );
});
