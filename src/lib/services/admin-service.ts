import { createClient } from '@/lib/supabase/client';

export interface ProductoAdminInput {
  id?: string;
  nombre: string;
  slug: string;
  categoria_slug: string;
  subcategoria_slug?: string;
  categoria_nombre: string;
  subcategoria_nombre?: string;
  marca_id: string;
  marca_nombre: string;
  precio: number;
  precio_original?: number;
  precio_oferta?: number;
  descuento_porcentaje?: number;
  es_oferta?: boolean;
  es_nuevo?: boolean;
  es_combo?: boolean;
  modo_venta: 'online' | 'cotizar';
  descripcion_corta?: string;
  descripcion_larga?: string;
  sku: string | null;
  certificacion?: string;
  stock: number;
  financiamiento_disponible?: boolean;
  activo?: boolean;
  ficha_tecnica?: Record<string, any>;
  variantes?: Array<{
    id?: string;
    sku?: string;
    talla?: string;
    color?: string;
    color_hex?: string;
    stock: number;
    precio_ajuste?: number;
  }>;
  imagenes?: Array<{
    url: string;
    orden: number;
  }>;
}

/** Disparar revalidación de Next.js para que el front se actualice al instante */
async function triggerRevalidate(path = '/') {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
  } catch (e) {
    console.error('Error revalidando caché:', e);
  }
}

/** Obtener productos con variantes e imágenes para el admin */
export async function getAdminProducts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      producto_variantes (*),
      producto_imagenes (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

/** Actualización rápida inline de precio, oferta y stock */
export async function updateProductQuick(
  id: string, 
  updates: { precio?: number; precio_oferta?: number | null; stock?: number; activo?: boolean }
) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/admin/products', {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ id, updates }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al actualizar producto');
  }
  return data.data;
}

/** Guardar o crear producto con variantes e imágenes */
export async function saveProduct(product: ProductoAdminInput) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers,
    body: JSON.stringify(product),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al guardar producto');
  }
  return data.id;
}

/** Eliminar producto */
export async function deleteProduct(id: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/admin/products?id=${id}`, {
    method: 'DELETE',
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al eliminar producto');
  }
  return true;
}

/** Obtener banners */
export async function getAdminBanners() {
  const supabase = createClient();
  const { data, error } = await supabase.from('banners').select('*').order('orden', { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Guardar o actualizar banner (vía API o cliente directo) */
export async function saveBanner(banner: any) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers,
      body: JSON.stringify(banner),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('Fallback a guardado directo en supabase client:', err);
  }

  // Fallback con supabase client directo
  const supabase = createClient();
  const payload = {
    ...banner,
    imagen_mobile: banner.imagen_mobile || banner.imagen_desktop,
  };
  const { data, error } = await supabase.from('banners').upsert(payload).select();
  if (error) throw error;
  await triggerRevalidate();
  return data?.[0] || payload;
}

/** Eliminar banner */
export async function deleteBanner(id: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/banners?id=${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Fallback a eliminación directa en supabase client:', err);
  }

  const supabase = createClient();
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
  await triggerRevalidate();
  return true;
}

/** Duplicar banner */
export async function duplicateBanner(banner: any) {
  const newBanner = {
    ...banner,
    id: `banner-${Date.now()}`,
    titulo: banner.titulo ? `${banner.titulo} (Copia)` : 'Banner (Copia)',
    orden: (banner.orden || 0) + 1,
    created_at: new Date().toISOString(),
  };
  return await saveBanner(newBanner);
}

/** Reordenar banners */
export async function reorderBanners(reorderList: Array<{ id: string; orden: number }>) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/banners', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ reorder: reorderList }),
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Fallback a reordenamiento directo:', err);
  }

  const supabase = createClient();
  for (const item of reorderList) {
    await supabase.from('banners').update({ orden: item.orden }).eq('id', item.id);
  }
  await triggerRevalidate();
  return true;
}

/** Alternar estado activo */
export async function toggleBannerActive(id: string, activo: boolean) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/banners', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id, updates: { activo } }),
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Fallback a toggle directo:', err);
  }

  const supabase = createClient();
  const { error } = await supabase.from('banners').update({ activo }).eq('id', id);
  if (error) throw error;
  await triggerRevalidate();
  return true;
}

/** Obtener ajustes generales */
export async function getAdminSettings() {
  const supabase = createClient();
  const { data, error } = await supabase.from('ajustes_generales').select('*');
  if (error) throw error;
  const map: Record<string, any> = {};
  (data || []).forEach((row) => {
    map[row.clave] = row.valor;
  });
  return map;
}

/** Guardar ajuste general */
export async function saveAdminSetting(clave: string, valor: any, descripcion?: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('ajustes_generales')
    .upsert({ clave, valor, descripcion, updated_at: new Date().toISOString() });
  if (error) throw error;
  await triggerRevalidate();
}

/** Obtener tarifas de envío */
export async function getAdminShipping() {
  const supabase = createClient();
  const { data, error } = await supabase.from('envios_tarifas').select('*').order('orden', { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Guardar tarifa de envío */
export async function saveAdminShipping(shipping: any) {
  const supabase = createClient();
  if (shipping.id) {
    const { error } = await supabase.from('envios_tarifas').update(shipping).eq('id', shipping.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('envios_tarifas').insert(shipping);
    if (error) throw error;
  }
  await triggerRevalidate();
}

/** Obtener promociones */
export async function getAdminPromos() {
  const supabase = createClient();
  const { data, error } = await supabase.from('promociones').select('*');
  if (error) throw error;
  return data || [];
}

/** Guardar promoción */
export async function saveAdminPromo(promo: any) {
  const supabase = createClient();
  const { error } = await supabase.from('promociones').upsert(promo);
  if (error) throw error;
  await triggerRevalidate();
}

/** Obtener cupones */
export async function getAdminCoupons() {
  const supabase = createClient();
  const { data, error } = await supabase.from('cupones').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Guardar cupón */
export async function saveAdminCoupon(coupon: any) {
  const supabase = createClient();
  const { error } = await supabase.from('cupones').upsert(coupon);
  if (error) throw error;
}

/** Bandejas */
export async function getInboxCount() {
  const supabase = createClient();
  const [pedidos, financiamiento, postulaciones, contacto, resenas, reclamaciones] = await Promise.all([
    supabase.from('pedidos').select('id', { count: 'exact', head: true }),
    supabase.from('solicitudes_financiamiento').select('id', { count: 'exact', head: true }),
    supabase.from('postulaciones').select('id', { count: 'exact', head: true }),
    supabase.from('mensajes_contacto').select('id', { count: 'exact', head: true }),
    supabase.from('resenas').select('id', { count: 'exact', head: true }),
    supabase.from('libro_reclamaciones').select('id', { count: 'exact', head: true }),
  ]);

  return {
    pedidos: pedidos.count || 0,
    financiamiento: financiamiento.count || 0,
    postulaciones: postulaciones.count || 0,
    contacto: contacto.count || 0,
    resenas: resenas.count || 0,
    reclamaciones: reclamaciones.count || 0,
  };
}

/** Subida de imagen a Supabase Storage con URL pública */
export async function uploadImageToStorage(file: File, bucket = 'productos'): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: '3600', upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
