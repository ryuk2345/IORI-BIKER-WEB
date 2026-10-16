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

export async function ejecutarLimpiezaCompleta() {
  console.log('🧹 INICIANDO LIMPIEZA IDEMPOTENTE DE BASE DE DATOS Y STORAGE...');

  // 1. Borrar tablas de pedidos y formularios
  console.log('1. Eliminando pedidos, historial y líneas de pedido...');
  await supabase.from('pedido_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pedido_historial').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pedidos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('2. Eliminando formularios de prueba (contacto, postulaciones, reclamaciones)...');
  await supabase.from('mensajes_contacto').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('postulaciones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('libro_reclamaciones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('resenas').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 3. Borrar productos DEMO y variantes
  console.log('3. Eliminando catálogo DEMO (productos, variantes, imágenes)...');
  await supabase.from('producto_imagenes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('producto_variantes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 4. Borrar banners, blog, cupones y tarifas
  console.log('4. Eliminando banners DEMO, blog DEMO, cupones y tarifas de ejemplo...');
  await supabase.from('banners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('blog').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('cupones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('envios_tarifas').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 5. Limpiar logos placeholder de marcas
  console.log('5. Limpiando logos temporales de las 14 marcas (se conservan nombres)...');
  await supabase.from('marcas').update({ logo: null }).neq('id', '');

  // 6. Desactivar Promo Esparta (modo borrador sin productos)
  console.log('6. Ajustando Promo Esparta a estado Borrador (inactiva)...');
  await supabase.from('promociones').update({
    activo: false,
    descripcion: 'Configurar los 2 cascos de la promoción antes de activar.'
  }).eq('id', 'promo-esparta-2026');

  // 7. Limpiar datos de pago de ejemplo y aCuotaz en ajustes_generales
  console.log('7. Limpiando datos de pago de ejemplo y valores de aCuotaz...');
  await supabase.from('ajustes_generales').upsert([
    {
      clave: 'datos_pago_plantillas',
      valor: {
        titular: 'IORI SAC',
        numero_yape_plin: '905 445 698',
        bancos: [], // Vacío para que el cliente configure sus cuentas reales
      },
      descripcion: 'Cuentas para instrucciones de pago',
    },
    {
      clave: 'barra_superior',
      valor: {
        texto: 'Envíos a todo el Perú • Atención personalizada por WhatsApp',
        activo: true,
        enlace: '/contacto',
      },
      descripcion: 'Mensaje superior informativo genérico',
    },
    {
      clave: 'tienda_en_preparacion',
      valor: {
        activo: true,
        mensaje: 'Estamos preparando nuestro nuevo catálogo digital. ¡Muy pronto disponible!',
        mostrar_whatsapp: true,
        mostrar_tiendas: true,
      },
      descripcion: 'Modo tienda en preparación para visitantes',
    },
    {
      clave: 'acuotaz_config',
      valor: {
        activo: false,
        cuotas: null,
        factor: null,
        monto_minimo: null,
        monto_maximo: null,
        texto_franja: 'Divide tu compra en cuotas con tu DNI',
        texto_ficha: 'Llévatelo en cuotas quincenales',
      },
      descripcion: 'Configuración oficial de aCuotaz',
    },
    {
      clave: 'financiamiento_condiciones',
      valor: {
        titulo: 'Financiamiento Directo Iori Biker',
        subtitulo: 'Llévate tu casco, indumentaria o equipamiento pagando en cómodas cuotas.',
        nota_legal: 'Todas las solicitudes están sujetas a evaluación crediticia y verificación de identidad según los términos comerciales vigentes.',
        requisitos: [
          'DNI vigente (mayor de 18 años)',
          'Número de celular activo con WhatsApp',
          'Sujeto a evaluación crediticia',
        ],
        descripcion: 'En Iori Biker Shop te facilitamos el acceso al mejor equipo de protección con financiamiento y atención personalizada por WhatsApp.',
        tea_referencial: 'Consultar por WhatsApp',
        telefono_whatsapp: '+51 905 445 698',
        cuotas_disponibles: [2, 4, 6],
      },
      descripcion: 'Condiciones y requisitos editables para financiamiento',
    },
  ]);

  // 8. Borrar archivos de Storage
  console.log('8. Vaciando archivos de Storage en buckets productos y cvs...');
  for (const bName of ['productos', 'cvs']) {
    const { data: files } = await supabase.storage.from(bName).list('', { limit: 1000 });
    if (files && files.length > 0) {
      const fileNames = files.map((f) => f.name);
      await supabase.storage.from(bName).remove(fileNames);
      console.log(`   └─ Bucket ${bName}: ${fileNames.length} archivos eliminados.`);
    }
  }

  console.log('✨ LIMPIEZA FINALIZADA CON ÉXITO.');
}

// Solo ejecutar si se llama explícitamente desde CLI con flag --confirmar
if (process.argv.includes('--confirmar')) {
  ejecutarLimpiezaCompleta();
} else {
  console.log('ℹ️ Script preparado en modo seguro. Para ejecutar requiere el flag --confirmar.');
}
