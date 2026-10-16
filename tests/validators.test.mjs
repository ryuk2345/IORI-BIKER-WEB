import test from 'node:test';
import assert from 'node:assert/strict';
import { validarDNI, validarRUC, validarCelular } from '../src/utils/validators.ts';

test('Validador de DNI - Casos válidos', () => {
  const res1 = validarDNI('71234567');
  assert.equal(res1.valido, true);
  assert.equal(res1.limpio, '71234567');

  // Con espacios o guiones
  const res2 = validarDNI(' 45.678.901 ');
  assert.equal(res2.valido, true);
  assert.equal(res2.limpio, '45678901');
});

test('Validador de DNI - Casos inválidos', () => {
  // Longitud incorrecta
  assert.equal(validarDNI('1234567').valido, false, 'Menos de 8 dígitos debe fallar');
  assert.equal(validarDNI('123456789').valido, false, 'Más de 8 dígitos debe fallar');

  // Letras o símbolos sin suficientes números
  assert.equal(validarDNI('ABC12345').valido, false);

  // Cadena vacía o nulo
  assert.equal(validarDNI('').valido, false);
  assert.equal(validarDNI(null).valido, false);

  // Secuencia repetitiva inválida
  assert.equal(validarDNI('00000000').valido, false);
  assert.equal(validarDNI('11111111').valido, false);
});

test('Validador de RUC - Casos válidos (SUNAT 10, 15, 17, 20)', () => {
  // RUC persona natural con negocio (10)
  const ruc10 = validarRUC('10712345678');
  assert.equal(ruc10.valido, true);
  assert.equal(ruc10.limpio, '10712345678');

  // RUC empresa (20)
  const ruc20 = validarRUC(' 20601234567 ');
  assert.equal(ruc20.valido, true);
  assert.equal(ruc20.limpio, '20601234567');

  // RUC con formato con guiones
  const rucGuiones = validarRUC('20-60123456-7');
  assert.equal(rucGuiones.valido, true);
  assert.equal(rucGuiones.limpio, '20601234567');
});

test('Validador de RUC - Casos inválidos', () => {
  // No empieza con 10, 15, 17 o 20
  assert.equal(validarRUC('19123456789').valido, false);
  assert.equal(validarRUC('30123456789').valido, false);

  // Longitud distinta a 11 dígitos
  assert.equal(validarRUC('2060123456').valido, false);
  assert.equal(validarRUC('206012345678').valido, false);

  // Nulo o vacío
  assert.equal(validarRUC('').valido, false);
  assert.equal(validarRUC(null).valido, false);

  // Secuencias repetitivas
  assert.equal(validarRUC('22222222222').valido, false);
});

test('Validador de Celular - Casos válidos (9 dígitos iniciando en 9)', () => {
  const cel1 = validarCelular('912345678');
  assert.equal(cel1.valido, true);
  assert.equal(cel1.limpio, '912345678');

  // Con código país internacional +51
  const celInt = validarCelular('+51 905 445 698');
  assert.equal(celInt.valido, true);
  assert.equal(celInt.limpio, '905445698');

  // Con prefijo 51 sin más
  const cel51 = validarCelular('51987654321');
  assert.equal(cel51.valido, true);
  assert.equal(cel51.limpio, '987654321');
});

test('Validador de Celular - Casos inválidos', () => {
  // No empieza con 9
  assert.equal(validarCelular('812345678').valido, false);
  assert.equal(validarCelular('412345678').valido, false);

  // Longitud incorrecta
  assert.equal(validarCelular('91234567').valido, false); // 8 dígitos
  assert.equal(validarCelular('9123456789').valido, false); // 10 dígitos sin prefijo

  // Vacío o nulo
  assert.equal(validarCelular('').valido, false);
  assert.equal(validarCelular(null).valido, false);

  // Secuencia repetitiva falsa
  assert.equal(validarCelular('999999999').valido, false);
});
