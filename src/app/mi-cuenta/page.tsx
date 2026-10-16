'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Package, 
  MapPin, 
  LogOut, 
  ArrowRight, 
  MessageCircle, 
  ShieldCheck, 
  Save, 
  Check, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPEN } from '@/utils/currency';
import { DATOS_NEGOCIO } from '@/data/mock';

export default function MiCuentaPage() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Form State (Login / Registro)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Perfil editable
  const [editNombre, setEditNombre] = useState('');
  const [editCelular, setEditCelular] = useState('');
  const [editDni, setEditDni] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Tab activo
  const [activeTab, setActiveTab] = useState<'pedidos' | 'datos'>('pedidos');

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          // Cargar perfil
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (prof) {
            setProfile(prof);
            setEditNombre(prof.nombre || '');
            setEditCelular(prof.celular || '');
            setEditDni(prof.dni_ruc || '');
            setEditDireccion(prof.direccion_predeterminada || '');
          }

          // Cargar pedidos del usuario
          const { data: userPedidos } = await supabase
            .from('pedidos')
            .select('*, pedido_items(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          setPedidos(userPedidos || []);
        }
      } catch (err) {
        console.error('Error cargando usuario:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const supabase = createClient();

    try {
      if (isLoginMode) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        if (data.user) {
          window.location.reload();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              nombre: nombre.trim(),
              celular: celular.trim(),
              rol: 'cliente',
            },
          },
        });
        if (error) throw error;
        alert('¡Cuenta creada exitosamente! Bienvenido a Iori Biker Shop.');
        window.location.reload();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error en la autenticación.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          nombre: editNombre,
          celular: editCelular,
          dni_ruc: editDni,
          direccion_predeterminada: editDireccion,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Error guardando perfil: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
        Cargando cuenta biker...
      </div>
    );
  }

  // SI NO ESTÁ AUTENTICADO: Formulario opcional con aviso de compra sin registro
  if (!user) {
    return (
      <div className="py-12 bg-zinc-50 min-h-screen">
        <div className="max-w-md mx-auto px-4 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#f58220] bg-orange-100 px-3 py-1 rounded-full">
              Mi Cuenta Biker
            </span>
            <h1 className="text-2xl font-black uppercase font-[family-name:var(--font-heading)] tracking-wider">
              {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta Biker'}
            </h1>
            <p className="text-xs text-zinc-500">
              {isLoginMode
                ? 'Accede a tus datos de entrega guardados y al historial de pedidos.'
                : 'Regístrate para no tener que volver a escribir tus datos en futuros pedidos.'}
            </p>
          </div>

          <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs text-zinc-600 space-y-1">
            <p className="font-bold text-zinc-800">💡 Recordatorio de Compra Libre:</p>
            <p className="text-[11px] leading-relaxed">
              Tener cuenta es 100% opcional. Puedes armar tu carrito y pedir por WhatsApp directamente sin registrarte.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 text-xs">
            {!isLoginMode && (
              <>
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Número de Celular / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="900000000"
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>
              </>
            )}

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-3 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white py-3 rounded-xl font-black uppercase tracking-wider transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {authLoading ? 'Procesando...' : isLoginMode ? 'Ingresar a Mi Cuenta' : 'Crear Cuenta'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setAuthError(null);
                }}
                className="text-xs font-bold text-zinc-600 hover:text-black underline"
              >
                {isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link href="/productos" className="text-xs font-bold text-[#f58220] hover:underline">
              ← Volver al Catálogo de Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SI ESTÁ AUTENTICADO: Panel de Cliente con Historial y Datos Guardados
  return (
    <div className="py-10 bg-zinc-50 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header de Mi Cuenta */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black text-[#f58220] flex items-center justify-center font-black text-xl font-[family-name:var(--font-heading)]">
              {(profile?.nombre || user.email)?.[0]?.toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#f58220] bg-orange-50 px-2 py-0.5 rounded">
                Biker Registrado
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase font-[family-name:var(--font-heading)] tracking-wider mt-0.5">
                {profile?.nombre || user.email}
              </h1>
              <p className="text-xs text-zinc-500 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-zinc-100 hover:bg-red-50 text-zinc-700 hover:text-red-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'pedidos'
                ? 'bg-black text-[#f58220]'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Mis Pedidos ({pedidos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('datos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'datos'
                ? 'bg-black text-[#f58220]'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Datos Guardados para Envíos
          </button>
        </div>

        {/* TAB 1: HISTORIAL DE PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            {pedidos.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border text-center space-y-3">
                <Package className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="text-base font-bold text-zinc-800">Aún no tienes pedidos registrados</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Tus pedidos enviados por WhatsApp se registrarán aquí con su estado en tiempo real.
                </p>
                <Link
                  href="/productos"
                  className="inline-block mt-2 bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pedidos.map((ped) => (
                  <div key={ped.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm text-zinc-900">{ped.codigo}</span>
                        <span className="text-xs text-zinc-400">
                          {new Date(ped.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                          Estado: {ped.estado.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-700">
                      {ped.pedido_items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <span>{item.cantidad}x {item.producto_nombre} ({item.variante_nombre || 'Estándar'})</span>
                          <span className="font-mono font-bold">{formatPEN(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t text-xs font-bold">
                      <span className="text-zinc-500">Total a pagar:</span>
                      <span className="text-base text-zinc-900 font-mono font-black">{formatPEN(ped.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DATOS GUARDADOS */}
        {activeTab === 'datos' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm max-w-2xl space-y-6">
            <div>
              <h2 className="text-base font-black uppercase font-[family-name:var(--font-heading)] tracking-wider">
                Datos de Entrega y Comprobante
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Al tener estos datos guardados, no tendrás que volver a escribirlos al comprar en el carrito.
              </p>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                ¡Datos actualizados exitosamente!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Celular / WhatsApp</label>
                <input
                  type="tel"
                  value={editCelular}
                  onChange={(e) => setEditCelular(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">DNI o RUC (para boleta o factura)</label>
                <input
                  type="text"
                  value={editDni}
                  onChange={(e) => setEditDni(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Dirección de Entrega Predeterminada</label>
                <textarea
                  rows={2}
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                  placeholder="Distrito, calle, urbanización, referencia"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#f58220] hover:bg-[#c85000] text-black hover:text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-wider flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Guardando...' : 'Guardar Mis Datos'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
