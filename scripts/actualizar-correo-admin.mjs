/**
 * SCRIPT PARA ACTUALIZAR EL CORREO DEL USUARIO TÉCNICO INICIAL
 * 
 * Permite cambiar el correo de admin@ioribikershop.com (dominio no existente del cliente)
 * al correo del desarrollador/técnico mediante la API de administración de Supabase,
 * manteniendo el mismo user_id y sin romper sesiones ni permisos.
 * 
 * Uso:
 *   node --env-file=.env.local scripts/actualizar-correo-admin.mjs --nuevo-correo desarrollador@ejemplo.com
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const args = process.argv.slice(2);
  let nuevoCorreo = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--nuevo-correo' && args[i + 1]) {
      nuevoCorreo = args[++i].trim().toLowerCase();
    }
  }

  if (!nuevoCorreo) {
    console.error('❌ Debes especificar el nuevo correo:');
    console.log('   node --env-file=.env.local scripts/actualizar-correo-admin.mjs --nuevo-correo <tu_correo@dominio.com>\n');
    process.exit(1);
  }

  console.log(`\n🔍 Buscando cuenta técnica 'admin@ioribikershop.com'...`);
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Error listando usuarios:', listError.message);
    process.exit(1);
  }

  const targetUser = users.users.find(u => u.email === 'admin@ioribikershop.com');
  if (!targetUser) {
    console.error('❌ No se encontró el usuario admin@ioribikershop.com en auth.users');
    process.exit(1);
  }

  console.log(`ID encontrado: ${targetUser.id}`);
  console.log(`Actualizando correo a: ${nuevoCorreo}...`);

  const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
    targetUser.id,
    {
      email: nuevoCorreo,
      email_confirm: true,
    }
  );

  if (updateError) {
    console.error('❌ Error actualizando usuario en Supabase Auth:', updateError.message);
    process.exit(1);
  }

  // Actualizar en public.profiles
  const { error: profError } = await supabase
    .from('profiles')
    .update({ email: nuevoCorreo, updated_at: new Date().toISOString() })
    .eq('id', targetUser.id);

  if (profError) {
    console.error('⚠️ Aviso al actualizar perfil:', profError.message);
  } else {
    console.log('✅ Perfil actualizado en public.profiles.');
  }

  console.log(`\n🎉 Correo actualizado exitosamente a: ${nuevoCorreo}`);
  console.log(`   El user_id (${targetUser.id}) y el rol (${updated.user.role || 'admin'}) se mantienen intactos.\n`);
}

main();
