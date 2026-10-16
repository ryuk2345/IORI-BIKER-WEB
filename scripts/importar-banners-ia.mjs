/**
 * Script oficial para importar los Banners Reales generados con IA
 * Utiliza la misma estructura y validaciones de saveBanner del panel admin.
 * Autorizado por el cliente para contenido real.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno desde .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
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
  console.error('❌ Error: Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Lista ordenada de banners según especificación oficial
const bannersAImportar = [
  {
    id: 'banner-hero-1',
    titulo: 'PROMO ESPARTA',
    subtitulo: 'LLEVA 2 CASCOS A PRECIO REBAJADO • DESDE YA Y TODO OCTUBRE',
    imagen_desktop: '/images/hero/hero_desktop_1.png',
    imagen_mobile: '/images/hero/hero_mobile_1.png',
    texto_boton: 'Ver Promo Esparta',
    enlace: '/promo/esparta',
    badge: 'CAMPAÑA OFICIAL',
    ubicacion: 'hero',
    fecha_inicio: '2026-09-01T00:00:00-05:00',
    fecha_fin: '2026-10-31T23:59:59-05:00',
    activo: true,
    orden: 1,
  },
  {
    id: 'banner-hero-2',
    titulo: 'EQUIPAMIENTO DE ALTO IMPACTO',
    subtitulo: 'Cascos certificados, intercomunicadores y accesorios de marcas líderes',
    imagen_desktop: '/images/banners/banner_wide_1.png',
    imagen_mobile: '/images/hero/hero_mobile_1.png',
    texto_boton: 'Ver Catálogo',
    enlace: '/categoria/cascos',
    badge: 'MÁS DE 200 MODELOS',
    ubicacion: 'hero',
    fecha_inicio: '2026-01-01T00:00:00-05:00',
    fecha_fin: '2026-12-31T23:59:59-05:00',
    activo: true,
    orden: 2,
  },
  {
    id: 'banner-hero-3',
    titulo: 'COMBOS Y PACKS BIKER',
    subtitulo: 'Equípate completo con descuentos especiales en paquetes de protección',
    imagen_desktop: '/images/hero/hero_desktop_1.png',
    imagen_mobile: '/images/hero/hero_mobile_1.png',
    texto_boton: 'Explorar Combos',
    enlace: '/combos',
    badge: 'AHORRA EN PACKS',
    ubicacion: 'hero',
    fecha_inicio: '2026-01-01T00:00:00-05:00',
    fecha_fin: '2026-12-31T23:59:59-05:00',
    activo: true,
    orden: 3,
  },
  {
    id: 'banner-destacado-1',
    titulo: 'CASCOS INTEGRALES DE FIBRA DE CARBONO',
    subtitulo: 'Diseñados para alta velocidad con aerodinámica optimizada y certificación europea ECE 22.06.',
    imagen_desktop: '/images/banners/banner_wide_1.png',
    imagen_mobile: '/images/banners/banner_wide_1.png',
    texto_boton: 'Ver Integrales',
    enlace: '/categoria/cascos/integrales',
    badge: 'SEGURIDAD DEPORTIVA',
    ubicacion: 'destacado',
    fecha_inicio: '2026-01-01T00:00:00-05:00',
    fecha_fin: '2026-12-31T23:59:59-05:00',
    activo: true,
    orden: 1,
  },
  {
    id: 'banner-destacado-2',
    titulo: 'INTERCOMUNICADORES BLUETOOTH HD',
    subtitulo: 'Comunicación nítida con cancelación de ruido, alcance multi-piloto y manos libres.',
    imagen_desktop: '/images/banners/banner_mid_1.png',
    imagen_mobile: '/images/banners/banner_mid_1.png',
    texto_boton: 'Ver Intercomunicadores',
    enlace: '/categoria/accesorios-casco/bluetooth-intercomunicador',
    badge: 'CONECTIVIDAD EN RUTA',
    ubicacion: 'destacado',
    fecha_inicio: '2026-01-01T00:00:00-05:00',
    fecha_fin: '2026-12-31T23:59:59-05:00',
    activo: true,
    orden: 2,
  },
  {
    id: 'banner-destacado-3',
    titulo: 'INDUMENTARIA CON PROTECCIONES CE',
    subtitulo: 'Casacas cordura resistentes a la abrasión con membrana impermeable para cualquier clima.',
    imagen_desktop: '/images/banners/banner_mid_2.png',
    imagen_mobile: '/images/banners/banner_mid_2.png',
    texto_boton: 'Ver Casacas',
    enlace: '/categoria/indumentaria/casacas',
    badge: 'ESTILO Y CONFORT',
    ubicacion: 'destacado',
    fecha_inicio: '2026-01-01T00:00:00-05:00',
    fecha_fin: '2026-12-31T23:59:59-05:00',
    activo: true,
    orden: 3,
  },
];

async function main() {
  console.log('🚀 Iniciando importación autorizada de banners reales...');

  for (const banner of bannersAImportar) {
    const payload = {
      ...banner,
      imagen_mobile: banner.imagen_mobile || banner.imagen_desktop,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('banners')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error(`❌ Error importando ${banner.id}:`, error.message);
    } else {
      console.log(`✅ [${banner.ubicacion.toUpperCase()}] Orden ${banner.orden}: ${banner.titulo} → ${banner.enlace}`);
    }
  }

  // Verificar recuento final
  const { count, error: countErr } = await supabaseAdmin
    .from('banners')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    console.error('Error al verificar conteo:', countErr.message);
  } else {
    console.log(`\n🎉 Total de banners activos en base de datos: ${count}`);
  }
}

main().catch(console.error);
