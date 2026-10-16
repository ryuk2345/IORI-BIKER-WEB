import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Fallback en memoria si Supabase no estuviera disponible temporalmente
const fallbackIpRequests = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS_PER_WINDOW = process.env.NODE_ENV === 'production' ? 15 : 100;

export interface AntiSpamResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Valida honeypot y rate limit para prevenir spam de bots.
 * En Netlify (serverless), persiste el conteo en Supabase (tabla ajustes_generales)
 * para sincronizar límites entre instancias independientes de funciones.
 */
export async function validateAntiSpam(
  req: NextRequest,
  honeypotValue?: string
): Promise<AntiSpamResult> {
  // 1. Honeypot check: si un bot llena el campo oculto, se descarta silenciosamente
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return { allowed: false, reason: 'Bot detectado por honeypot.' };
  }

  // 2. Extraer IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const now = Date.now();
  const safeIpKey = `rate_limit_${ip.replace(/[^a-zA-Z0-9_]/g, '_')}`;

  let currentCount = 1;
  let lastReset = now;

  // 3. Persistencia distribuida en Supabase
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('ajustes_generales')
      .select('valor')
      .eq('clave', safeIpKey)
      .maybeSingle();

    if (data?.valor && typeof data.valor === 'object') {
      const val = data.valor as { count?: number; lastReset?: number };
      const previousReset = Number(val.lastReset) || 0;
      const previousCount = Number(val.count) || 0;

      if (now - previousReset > RATE_LIMIT_WINDOW) {
        currentCount = 1;
        lastReset = now;
      } else {
        currentCount = previousCount + 1;
        lastReset = previousReset;
      }
    }

    await supabase.from('ajustes_generales').upsert({
      clave: safeIpKey,
      valor: { count: currentCount, lastReset },
      descripcion: `Límite de envíos Netlify/Serverless para IP ${ip}`,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Fallback seguro en memoria si las credenciales o la red fallan
    const clientData = fallbackIpRequests.get(ip) || { count: 0, lastReset: now };
    if (now - clientData.lastReset > RATE_LIMIT_WINDOW) {
      clientData.count = 1;
      clientData.lastReset = now;
    } else {
      clientData.count += 1;
    }
    fallbackIpRequests.set(ip, clientData);
    currentCount = clientData.count;
  }

  if (currentCount > MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      reason: 'Has alcanzado el límite de envíos por seguridad. Por favor espera unos minutos.',
    };
  }

  return { allowed: true };
}
