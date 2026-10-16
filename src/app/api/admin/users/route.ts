import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Obtener lista de usuarios de Auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    // 2. Obtener lista de perfiles
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (profError) throw profError;

    return NextResponse.json({
      users: authData.users || [],
      profiles: profiles || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { action, email, nombre, rol, userId, newEmail, isOwner } = body;

    // 1. Invitación de nuevo miembro del equipo (admin o atencion)
    if (action === 'invite') {
      if (!email || !rol) {
        return NextResponse.json({ error: 'Email y rol son requeridos' }, { status: 400 });
      }

      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        email.trim().toLowerCase(),
        {
          data: {
            nombre: nombre?.trim() || email.split('@')[0],
            rol: rol,
          },
        }
      );

      if (inviteError) {
        throw inviteError;
      }

      // Upsert profile
      if (inviteData?.user) {
        await supabase.from('profiles').upsert({
          id: inviteData.user.id,
          email: email.trim().toLowerCase(),
          nombre: nombre?.trim() || email.split('@')[0],
          rol: rol,
          is_owner: false,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        message: `Invitación enviada a ${email} con rol ${rol}.`,
        user: inviteData?.user,
      });
    }

    // 2. Actualizar correo electrónico administrativo sin romper sesión
    if (action === 'update_email') {
      if (!userId || !newEmail) {
        return NextResponse.json({ error: 'userId y newEmail son requeridos' }, { status: 400 });
      }

      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          email: newEmail.trim().toLowerCase(),
          email_confirm: true,
        }
      );

      if (updateError) {
        throw updateError;
      }

      // Actualizar en profiles
      await supabase
        .from('profiles')
        .update({
          email: newEmail.trim().toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return NextResponse.json({
        success: true,
        message: `Correo administrativo actualizado a ${newEmail} exitosamente.`,
        user: updateData?.user,
      });
    }

    // 3. Marcar o desmarcar dueño (is_owner)
    if (action === 'set_owner') {
      if (!userId) {
        return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
      }

      await supabase
        .from('profiles')
        .update({
          is_owner: Boolean(isOwner),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return NextResponse.json({
        success: true,
        message: `Estado de propietario actualizado.`,
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
