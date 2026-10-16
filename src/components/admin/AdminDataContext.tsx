'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  getAdminProducts, 
  getAdminBanners, 
  getAdminSettings, 
  getAdminShipping, 
  getAdminPromos, 
  getAdminCoupons, 
  getInboxCount 
} from '@/lib/services/admin-service';
import { CATEGORIAS, MARCAS } from '@/data/mock';

export interface AdminDataContextType {
  user: any | null;
  role: 'admin' | 'atencion';
  isAtencion: boolean;
  isOwner: boolean;
  checkingAuth: boolean;
  loadingData: boolean;
  products: any[];
  categories: any[];
  brands: any[];
  banners: any[];
  settings: Record<string, any>;
  shipping: any[];
  promos: any[];
  coupons: any[];
  teamMembers: any[];
  invitedStaffCount: number;
  inboxCounts: {
    pedidos: number;
    financiamiento: number;
    postulaciones: number;
    contacto: number;
    resenas: number;
    reclamaciones: number;
  };
  refreshAll: () => Promise<void>;
  handleLogout: () => Promise<void>;
  setUser: (user: any) => void;
}

const AdminDataContext = createContext<AdminDataContextType | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [shipping, setShipping] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [invitedStaffCount, setInvitedStaffCount] = useState<number>(0);
  const [inboxCounts, setInboxCounts] = useState({
    pedidos: 0,
    financiamiento: 0,
    postulaciones: 0,
    contacto: 0,
    resenas: 0,
    reclamaciones: 0,
  });

  // 1. Verificar sesión de usuario
  const checkUser = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('rol, nombre, email')
          .eq('id', user.id)
          .single();

        if (profile?.rol === 'admin' || profile?.rol === 'atencion') {
          setUser({ ...user, profile });
        } else {
          setUser(null);
        }
      } else {
        if (typeof document !== 'undefined') {
          if (document.cookie.includes('iori-demo-admin=atencion')) {
            setUser({
              id: 'demo-atencion-user',
              email: 'atencion@ioribikershop.pe',
              profile: { rol: 'atencion', is_owner: false, nombre: 'Asesor de Atención (DEMO)' },
            });
          } else if (document.cookie.includes('iori-demo-admin=admin')) {
            setUser({
              id: 'demo-admin-user',
              email: 'admin@ioribikershop.pe',
              profile: { rol: 'admin', is_owner: true, nombre: 'Admin Iori (DEMO)' },
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch (e) {
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // 2. Cargar todos los datos desde Supabase con fallback seguro
  const loadAllData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    const supabase = createClient();

    try {
      const [
        prods,
        catsRes,
        brandsRes,
        bans,
        sets,
        ships,
        prm,
        cpn,
        inboxes,
        teamRes,
      ] = await Promise.all([
        getAdminProducts().catch(() => null),
        Promise.resolve(supabase.from('categorias').select('*').order('orden', { ascending: true })).catch(() => ({ data: null })),
        Promise.resolve(supabase.from('marcas').select('*').order('orden', { ascending: true })).catch(() => ({ data: null })),
        getAdminBanners().catch(() => []),
        getAdminSettings().catch(() => ({})),
        getAdminShipping().catch(() => []),
        getAdminPromos().catch(() => []),
        getAdminCoupons().catch(() => []),
        getInboxCount().catch(() => ({ pedidos: 0, financiamiento: 0, postulaciones: 0, contacto: 0, resenas: 0, reclamaciones: 0 })),
        Promise.resolve(supabase.from('profiles').select('id, email, nombre, rol, created_at').in('rol', ['admin', 'atencion'])).catch(() => ({ data: null })),
      ]);

      if (Array.isArray(prods)) {
        setProducts(prods);
      } else {
        setProducts([]);
      }

      setCategories(
        catsRes?.data && catsRes.data.length > 0
          ? catsRes.data
          : CATEGORIAS.map((c) => ({
              id: c.id,
              nombre: c.nombre,
              slug: c.slug,
              subcategorias: c.subcategorias.map((s) => ({ slug: s.slug, nombre: s.nombre })),
            }))
      );

      setBrands(
        brandsRes?.data && brandsRes.data.length > 0
          ? brandsRes.data
          : MARCAS.map((m) => ({ id: m.id, nombre: m.nombre, slug: m.slug, logo: (m as any).logo || null }))
      );

      setBanners(bans || []);
      const settingsObj = sets || {};
      setSettings(settingsObj);
      setShipping(ships || []);
      setPromos(prm || []);
      setCoupons(cpn || []);
      if (inboxes) setInboxCounts(inboxes);

      const teamList = teamRes?.data || [];
      setTeamMembers(teamList);
      
      // Contar invitaciones a otros usuarios (excluyendo al dueño / owner)
      // Si profiles aún no tiene columna is_owner en la base cliente, consideramos owner al primer admin
      const nonOwners = teamList.filter((m: any, idx: number) => {
        if (m.is_owner === true) return false;
        if (m.is_owner === false) return true;
        // Fallback si no tiene is_owner: el primer usuario admin es el dueño técnico inicial
        return idx > 0;
      });
      setInvitedStaffCount(nonOwners.length);

    } catch (err) {
      console.error('Error cargando datos del admin:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, loadAllData]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      // Ignorar error al salir
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'iori-demo-admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    setUser(null);
  };

  const role = (user?.profile?.rol as 'admin' | 'atencion') || 'admin';
  const isAtencion = role === 'atencion';
  const isOwner = Boolean(user?.profile?.is_owner ?? true);

  return (
    <AdminDataContext.Provider
      value={{
        user,
        role,
        isAtencion,
        isOwner,
        checkingAuth,
        loadingData,
        products,
        categories,
        brands,
        banners,
        settings,
        shipping,
        promos,
        coupons,
        teamMembers,
        invitedStaffCount,
        inboxCounts,
        refreshAll: loadAllData,
        handleLogout,
        setUser,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData debe ser usado dentro de un AdminDataProvider');
  }
  return context;
}
