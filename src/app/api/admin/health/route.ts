import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, resolveAdminKey } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { verifyAdminOnly } from '@/lib/security/auth-check';

/**
 * GET: Diagnóstico TEMPORAL de la conexión de escritura con Supabase (solo admin).
 * Nunca devuelve el valor de las claves, solo su tipo.
 * Borrar este endpoint cuando producción quede verificada.
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdminOnly(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolved = resolveAdminKey();
  const report: Record<string, unknown> = {
    claveSecretaCargada: resolved.valid,
    tipoClaveAdmin: resolved.type,
    variableUsada: resolved.source,
    serviceRoleKeyDefinida: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    secretKeyDefinida: Boolean(process.env.SUPABASE_SECRET_KEY?.trim()),
  };

  // 1. Cliente admin (clave secreta): lectura y escritura en productos
  try {
    const adminSupabase = createAdminClient();
    const { data: muestra, error: readError } = await adminSupabase
      .from('productos')
      .select('id, nombre')
      .limit(1)
      .maybeSingle();
    report.adminPuedeLeerProductos = !readError;
    if (readError) report.adminErrorLectura = readError.message;

    if (muestra) {
      // Escritura sin cambios reales: reescribe el mismo nombre y pide la fila de vuelta.
      // Con RLS bloqueando, Supabase devuelve 0 filas en lugar de 1.
      const { data: escrito, error: writeError } = await adminSupabase
        .from('productos')
        .update({ nombre: muestra.nombre })
        .eq('id', muestra.id)
        .select('id');
      report.adminPuedeEscribirProductos = !writeError && (escrito?.length ?? 0) === 1;
      if (writeError) report.adminErrorEscritura = writeError.message;
    } else {
      report.adminPuedeEscribirProductos = 'sin productos para probar';
    }
  } catch (err: any) {
    report.adminPuedeLeerProductos = false;
    report.adminPuedeEscribirProductos = false;
    report.adminError = err.message;
  }

  // 2. Sesión del usuario: ¿las reglas RLS lo reconocen como admin?
  try {
    const sessionSupabase = await createServerClient();
    const [{ data: esAdmin, error: adminErr }, { data: esStaff, error: staffErr }] = await Promise.all([
      sessionSupabase.rpc('is_admin'),
      sessionSupabase.rpc('is_staff'),
    ]);
    report.rlsSesionEsAdmin = adminErr ? `error: ${adminErr.message}` : esAdmin;
    report.rlsSesionEsStaff = staffErr ? `error: ${staffErr.message}` : esStaff;
  } catch (err: any) {
    report.rlsSesionError = err.message;
  }

  report.ok = report.claveSecretaCargada === true && report.adminPuedeEscribirProductos === true;
  return NextResponse.json(report, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
