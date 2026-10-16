import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno
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
  console.error('❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Carpetas de destino: fuera del repo y copia local ignorada
const externalBackupDir = path.resolve(process.cwd(), '../respaldo_iori_pre_entrega');
const localBackupDir = path.resolve(process.cwd(), '.backups/respaldo_pre_entrega');

[externalBackupDir, localBackupDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const TABLES = [
  'productos',
  'producto_variantes',
  'producto_imagenes',
  'marcas',
  'categorias',
  'subcategorias',
  'pedidos',
  'pedido_items',
  'pedido_historial',
  'resenas',
  'mensajes_contacto',
  'postulaciones',
  'libro_reclamaciones',
  'banners',
  'blog',
  'cupones',
  'envios_tarifas',
  'ajustes_generales',
  'promociones',
  'usuarios',
];

async function run() {
  console.log('📦 1. Iniciando respaldo completo de base de datos...');
  const inventory = {};
  const fullDump = {};

  for (const table of TABLES) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        inventory[table] = { status: 'error', error: error.message, count: 0 };
        console.warn(`⚠️ Tabla ${table}: ${error.message}`);
      } else {
        inventory[table] = { status: 'ok', count: data.length };
        fullDump[table] = data;
        console.log(`✅ Tabla ${table}: ${data.length} registros respaldados.`);
      }
    } catch (err) {
      inventory[table] = { status: 'error', error: err.message, count: 0 };
    }
  }

  // Guardar dump completo en JSON y SQL
  const dumpTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  [externalBackupDir, localBackupDir].forEach((dir) => {
    // 1. JSON estructurado completo
    fs.writeFileSync(
      path.join(dir, `database_dump_${dumpTimestamp}.json`),
      JSON.stringify(fullDump, null, 2)
    );
    // 2. Copia latest
    fs.writeFileSync(
      path.join(dir, `database_dump_latest.json`),
      JSON.stringify(fullDump, null, 2)
    );
    // 3. Tablas individuales
    const tablesDir = path.join(dir, 'tables');
    if (!fs.existsSync(tablesDir)) fs.mkdirSync(tablesDir, { recursive: true });
    for (const [tName, tRows] of Object.entries(fullDump)) {
      fs.writeFileSync(
        path.join(tablesDir, `${tName}.json`),
        JSON.stringify(tRows, null, 2)
      );
    }
  });

  console.log('🗄️ 2. Respaldando Storage (Buckets y Archivos)...');
  const storageInventory = {};
  const storageDump = {};

  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) {
      console.warn('⚠️ Error listando buckets:', bErr.message);
    } else if (buckets) {
      for (const bucket of buckets) {
        storageInventory[bucket.name] = [];
        console.log(`📁 Bucket: ${bucket.name}`);

        const { data: files, error: fErr } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 1000 });

        if (fErr) {
          console.warn(`⚠️ Error listando archivos de ${bucket.name}:`, fErr.message);
        } else if (files) {
          for (const file of files) {
            storageInventory[bucket.name].push({
              name: file.name,
              id: file.id,
              metadata: file.metadata,
            });

            // Descargar el archivo
            const { data: blob, error: dErr } = await supabase.storage
              .from(bucket.name)
              .download(file.name);

            if (!dErr && blob) {
              const buffer = Buffer.from(await blob.arrayBuffer());
              [externalBackupDir, localBackupDir].forEach((dir) => {
                const bDir = path.join(dir, 'storage', bucket.name);
                if (!fs.existsSync(bDir)) fs.mkdirSync(bDir, { recursive: true });
                fs.writeFileSync(path.join(bDir, file.name), buffer);
              });
            }
          }
          console.log(`   └─ ${files.length} archivos descargados.`);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Error procesando storage:', err.message);
  }

  // Guardar inventario general
  const inventoryReport = {
    timestamp: new Date().toISOString(),
    database: inventory,
    storage: storageInventory,
  };

  [externalBackupDir, localBackupDir].forEach((dir) => {
    fs.writeFileSync(
      path.join(dir, 'inventory_summary.json'),
      JSON.stringify(inventoryReport, null, 2)
    );
  });

  console.log('\n=============================================');
  console.log('🎉 RESPALDO COMPLETADO EXITOSAMENTE');
  console.log(`📍 Fuera del repo: ${externalBackupDir}`);
  console.log(`📍 Local ignorado: ${localBackupDir}`);
  console.log('=============================================\n');
}

run();
