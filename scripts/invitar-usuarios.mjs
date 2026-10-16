/**
 * SCRIPT SEGURO DE INVITACIÓN DE EQUIPO - IORI BIKER SHOP
 * 
 * Permite invitar a nuevos miembros del equipo (administradores y asesores)
 * mediante supabase.auth.admin.inviteUserByEmail.
 * 
 * Cumplimiento de Seguridad:
 * - NO almacena ni recibe contraseñas en código ni parámetros.
 * - El usuario recibe un enlace seguro oficial de Supabase en su bandeja
 *   de correo electrónico para establecer su propia contraseña cifrada.
 * 
 * Uso:
 *   node scripts/invitar-usuarios.mjs --email usuario@empresa.com --rol admin --nombre "Juan Pérez"
 *   node scripts/invitar-usuarios.mjs --listar
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno desde .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      const key = k.trim();
      const val = v.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) options.email = args[++i];
    if (args[i] === '--rol' && args[i + 1]) options.rol = args[++i];
    if (args[i] === '--nombre' && args[i + 1]) options.nombre = args[++i];
    if (args[i] === '--listar') options.listar = true;
    if (args[i] === '--help') options.help = true;
  }
  return options;
}

async function listarEquipo() {
  console.log('📋 MIEMBROS ACTUALES DEL EQUIPO EN LA BASE DE DATOS:');
  const { data: perfiles, error } = await supabase
    .from('profiles')
    .select('id, email, nombre, rol, created_at')
    .in('rol', ['admin', 'atencion'])
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error consultando perfiles:', error.message);
    return;
  }

  if (!perfiles || perfiles.length === 0) {
    console.log('  (No hay miembros del equipo registrados actualmente)');
    return;
  }

  console.table(perfiles.map(p => ({
    Email: p.email,
    Nombre: p.nombre || '(Sin nombre)',
    Rol: p.rol,
    Registrado: new Date(p.created_at).toLocaleString('es-PE'),
  })));
}

async function invitarUsuario(email, rol, nombre) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    console.error('❌ Error: Debes ingresar un correo electrónico válido.');
    process.exit(1);
  }

  const rolValido = ['admin', 'atencion'].includes(rol);
  if (!rolValido) {
    console.error('❌ Error: El rol debe ser "admin" o "atencion".');
    process.exit(1);
  }

  console.log(`\n📨 ENVIANDO INVITACIÓN SEGURA A: ${email}`);
  console.log(`   Rol asignado: ${rol.toUpperCase()}`);
  console.log(`   Nombre: ${nombre || '(Sin especificar)'}`);

  // 1. Invitar vía Supabase Auth Admin
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      rol,
      nombre: nombre || email.split('@')[0],
    },
  });

  if (authError) {
    // Si el usuario ya existe en auth.users, verificar si podemos actualizar su rol en profiles
    if (authError.message.includes('already been registered') || authError.status === 422) {
      console.log('ℹ️  El correo ya está registrado en el sistema de autenticación.');
      console.log('   Actualizando rol en public.profiles...');

      const { data: usuarioExistente } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (usuarioExistente) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            rol,
            nombre: nombre || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', usuarioExistente.id);

        if (updateError) {
          console.error('❌ Error actualizando rol:', updateError.message);
          process.exit(1);
        }

        console.log(`✅ Rol de ${email} actualizado exitosamente a "${rol}".`);
        return;
      }
    }

    console.error('❌ Error enviando invitación de Supabase:', authError.message);
    process.exit(1);
  }

  const userId = authData.user?.id;
  console.log(`✅ Invitación enviada exitosamente por correo.`);
  console.log(`   ID de usuario generado: ${userId}`);

  // 2. Asegurar que public.profiles tenga el rol y nombre correcto
  if (userId) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        nombre: nombre || email.split('@')[0],
        rol,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.warn('⚠️ Nota: No se pudo actualizar profile directamente:', profileError.message);
    } else {
      console.log(`✅ Perfil sincronizado con rol "${rol}".`);
    }
  }

  console.log('\n🔒 Seguridad:');
  console.log('   El invitado recibirá un email con un enlace oficial de acceso.');
  console.log('   Al hacer clic, el usuario creará su propia contraseña de forma segura.');
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Uso de la herramienta de invitación segura:

  node scripts/invitar-usuarios.mjs --email <correo> --rol <admin|atencion> [--nombre <nombre>]
  node scripts/invitar-usuarios.mjs --listar
  node scripts/invitar-usuarios.mjs --help

Roles disponibles:
  - admin:    Acceso total al panel administrativo (productos, pedidos, ajustes, banners, etc.)
  - atencion: Acceso al módulo de Pedidos, Bandejas de Entrada y Libro de Reclamaciones.
`);
    return;
  }

  if (options.listar) {
    await listarEquipo();
    return;
  }

  if (!options.email || !options.rol) {
    console.log('Uso: node scripts/invitar-usuarios.mjs --email <correo> --rol <admin|atencion> [--nombre <nombre>]');
    console.log('Ejemplo: node scripts/invitar-usuarios.mjs --email ventas@ioribikershop.pe --rol atencion --nombre "Equipo Ventas"');
    console.log('Para ver los miembros actuales: node scripts/invitar-usuarios.mjs --listar\n');
    await listarEquipo();
    return;
  }

  await invitarUsuario(options.email, options.rol, options.nombre);
}

main().catch((err) => {
  console.error('❌ Error inesperado:', err);
  process.exit(1);
});
