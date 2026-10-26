import test from 'node:test';
import assert from 'node:assert/strict';
import { detectSupabaseKeyType, resolveAdminKey } from '../src/lib/supabase/admin.ts';

const jwt = (payload) =>
  ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'firma'].join('.');

test('detecta tipos de clave sin exponer el valor', () => {
  assert.equal(detectSupabaseKeyType('sb_secret_abc123'), 'secret');
  assert.equal(detectSupabaseKeyType('sb_publishable_abc123'), 'publishable');
  assert.equal(detectSupabaseKeyType(jwt({ role: 'service_role' })), 'service_role');
  assert.equal(detectSupabaseKeyType(jwt({ role: 'anon' })), 'anon');
  assert.equal(detectSupabaseKeyType('tu_clave_secreta_service_role'), 'desconocida');
  assert.equal(detectSupabaseKeyType('   '), 'ausente');
  assert.equal(detectSupabaseKeyType(undefined), 'ausente');
});

test('nunca usa una clave pública como clave admin', () => {
  const r = resolveAdminKey({ SUPABASE_SERVICE_ROLE_KEY: 'sb_publishable_xyz' });
  assert.equal(r.valid, false);
  assert.equal(r.key, null);
  assert.equal(r.type, 'publishable');
  assert.equal(r.source, 'SUPABASE_SERVICE_ROLE_KEY');
});

test('si SERVICE_ROLE_KEY trae la pública pero SECRET_KEY la secreta, usa la secreta', () => {
  const r = resolveAdminKey({
    SUPABASE_SERVICE_ROLE_KEY: jwt({ role: 'anon' }),
    SUPABASE_SECRET_KEY: ' sb_secret_ok \n',
  });
  assert.equal(r.valid, true);
  assert.equal(r.source, 'SUPABASE_SECRET_KEY');
  assert.equal(r.key, 'sb_secret_ok');
});

test('sin claves reporta ausente', () => {
  const r = resolveAdminKey({});
  assert.equal(r.valid, false);
  assert.equal(r.type, 'ausente');
  assert.equal(r.source, null);
});

test('createAdminClient lanza un error claro con clave pública', async () => {
  const prev = { ...process.env };
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://demo.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_publishable_xyz';
  delete process.env.SUPABASE_SECRET_KEY;
  try {
    const { createAdminClient } = await import('../src/lib/supabase/admin.ts');
    assert.throws(() => createAdminClient(), /es una clave pública/);
  } finally {
    process.env = prev;
  }
});
