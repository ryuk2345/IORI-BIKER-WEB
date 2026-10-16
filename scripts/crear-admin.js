// Script para crear el primer usuario Administrador en Supabase Auth y tabla Profiles
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@ioribikershop.pe';
  const password = process.argv[3] || process.env.ADMIN_INITIAL_PASSWORD;
  const nombre = process.argv[4] || 'Administrador Iori';
  const rol = process.argv[5] || 'admin'; // 'admin' o 'atencion'
  if (!password) {
    console.error('Error: Debe proporcionar la contraseña como argumento o en ADMIN_INITIAL_PASSWORD');
    process.exit(1);
  }

  console.log(`Creando/verificando usuario ${rol}: ${email}...`);

  // 1. Listar usuarios existentes para verificar si ya existe
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error al listar usuarios:', listError.message);
    process.exit(1);
  }

  let user = usersData.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // 2. Crear usuario
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, rol },
    });

    if (createError) {
      console.error('Error al crear usuario en Supabase Auth:', createError.message);
      process.exit(1);
    }
    user = createData.user;
    console.log(`Usuario creado exitosamente con ID: ${user.id}`);
  } else {
    console.log(`El usuario ${email} ya existía en Auth con ID: ${user.id}. Actualizando contraseña y metadata...`);
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: { nombre, rol },
    });
  }

  // 3. Asegurar registro en public.profiles con el rol correspondiente
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      nombre,
      rol,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('Error al asignar rol en tabla profiles:', profileError.message);
    process.exit(1);
  }

  console.log('----------------------------------------------------');
  console.log('✅ USUARIO CONFIGURADO EXITOSAMENTE');
  console.log(`Email:      ${email}`);
  console.log(`Password:   ${password}`);
  console.log(`Nombre:     ${nombre}`);
  console.log(`Rol:        ${rol}`);
  console.log('----------------------------------------------------');
}

main().catch(err => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
