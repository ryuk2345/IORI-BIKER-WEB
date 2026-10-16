/**
 * SCRIPT PARA INVITAR AL ADMINISTRADOR DEL CLIENTE: ioribikershop@gmail.com
 * 
 * Invita al administrador oficial del cliente enviando un enlace seguro de Supabase
 * para que configure su propia contraseña cifrada.
 * 
 * Uso:
 *   node --env-file=.env.local scripts/invitar-admin-cliente.mjs
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

const CLIENT_ADMIN_EMAIL = process.argv[2] || process.env.CLIENT_ADMIN_EMAIL || 'ioribikershop@gmail.com';
const CLIENT_ADMIN_NOMBRE = process.argv[3] || process.env.CLIENT_ADMIN_NOMBRE || 'Administrador Iori Biker Shop';

async function main() {
  console.log(`\n📨 INVITACIÓN DE ADMINISTRADOR OFICIAL`);
  console.log(`Destinatario: ${CLIENT_ADMIN_EMAIL}`);
  console.log(`Rol: admin`);
  console.log(`Nombre: ${CLIENT_ADMIN_NOMBRE}\n`);

  try {
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      CLIENT_ADMIN_EMAIL,
      {
        data: {
          nombre: CLIENT_ADMIN_NOMBRE,
          rol: 'admin',
        },
      }
    );

    if (inviteError) {
      // Si ya existe
      if (inviteError.message.includes('already registered')) {
        console.log(`ℹ️ El usuario ${CLIENT_ADMIN_EMAIL} ya está registrado.`);
      } else {
        throw inviteError;
      }
    } else {
      console.log(`✅ Invitación enviada exitosamente a ${CLIENT_ADMIN_EMAIL}.`);
    }

    // Actualizar perfil
    if (inviteData?.user) {
      await supabase.from('profiles').upsert({
        id: inviteData.user.id,
        email: CLIENT_ADMIN_EMAIL,
        nombre: CLIENT_ADMIN_NOMBRE,
        rol: 'admin',
        is_owner: true,
        updated_at: new Date().toISOString(),
      });
      console.log(`✅ Perfil registrado en public.profiles con rol admin.`);
    }

    console.log(`\n🎉 El cliente puede revisar su bandeja de correo en ${CLIENT_ADMIN_EMAIL} para acceder.\n`);
  } catch (err) {
    console.error('❌ Error en el proceso:', err.message);
  }
}

main();
