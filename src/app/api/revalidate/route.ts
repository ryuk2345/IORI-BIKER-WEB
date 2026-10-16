import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { path = '/', type = 'page' } = await req.json().catch(() => ({}));
    
    // Revalidar path solicitado y home por defecto
    revalidatePath(path, type as any);
    revalidatePath('/', 'page');
    revalidatePath('/productos', 'page');

    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
