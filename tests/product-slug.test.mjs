import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify, buildUniqueSlug } from '../src/utils/slug.ts';

test('slugify quita tildes, ñ y símbolos', () => {
  assert.equal(slugify('Casco LS2 FF800 Storm – Flúor'), 'casco-ls2-ff800-storm-fluor');
  assert.equal(slugify('  Guantes Niño  '), 'guantes-nino');
  assert.equal(slugify(''), '');
});

test('nombre libre: usa el nombre tal cual', () => {
  assert.equal(buildUniqueSlug('Casco Royal EVO', []), 'casco-royal-evo');
});

test('nombre repetido con un solo color: agrega el color', () => {
  assert.equal(buildUniqueSlug('Casco Royal EVO', ['casco-royal-evo'], 'Rojo'), 'casco-royal-evo-rojo');
});

test('nombre repetido sin color: agrega -2, -3…', () => {
  assert.equal(buildUniqueSlug('Casco Royal EVO', ['casco-royal-evo']), 'casco-royal-evo-2');
  assert.equal(
    buildUniqueSlug('Casco Royal EVO', ['casco-royal-evo', 'casco-royal-evo-2']),
    'casco-royal-evo-3'
  );
});

test('nombre y color repetidos: numera sobre nombre + color', () => {
  assert.equal(
    buildUniqueSlug('Casco Royal EVO', ['casco-royal-evo', 'casco-royal-evo-rojo'], 'Rojo'),
    'casco-royal-evo-rojo-2'
  );
});

test('si el nombre ya incluye el color, no lo repite', () => {
  assert.equal(
    buildUniqueSlug('Casco Royal EVO Rojo', ['casco-royal-evo-rojo'], 'Rojo'),
    'casco-royal-evo-rojo-2'
  );
});
