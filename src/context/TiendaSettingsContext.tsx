'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AjustesNegocio } from '@/types';
import { createClient } from '@/lib/supabase/client';

const AJUSTES_INICIALES: AjustesNegocio = {
  empresa: {
    razonSocial: 'IORI SAC',
    ruc: '20610816089',
    correo: 'ioribikershop@gmail.com',
    nombreComercial: 'IORI BIKER SHOP',
    direccionPrincipal: 'Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima',
    horarioPrincipal: 'Lunes a Sábado 9:00 am – 10:00 pm / Domingos o Feriados 11:00 am – 8:00 pm',
    telefono: '905445698',
    whatsapp: '+51 905 445 698',
  },
  whatsapp: {
    numero: '905445698',
    numeroCompleto: '+51 905 445 698',
    url: 'https://wa.me/51905445698',
  },
  tiendasFisicas: [
    {
      id: 'independencia',
      nombre: 'Sede Independencia (Principal)',
      direccion: 'Av. Contisuyo #418, Tahuantinsuyo, Independencia, Lima',
      distrito: 'Independencia',
      ciudad: 'Lima',
      referencia: 'A pocas cuadras de la estación del Metropolitano Tahuantinsuyo',
      horario: 'Lunes a Sábado 9:00 am – 10:00 pm / Domingos y Feriados 11:00 am – 8:00 pm',
      mapsUrl: 'https://maps.google.com/?q=Av.+Contisuyo+418,+Independencia,+Lima',
      telefonoWhatsApp: '+51 905 445 698',
    },
    {
      id: 'la-victoria',
      nombre: 'Sede La Victoria',
      direccion: 'Av. Nicolás Arriola 901, La Victoria, Lima',
      distrito: 'La Victoria',
      ciudad: 'Lima',
      referencia: 'En plena zona comercial repuestera de Arriola',
      horario: 'Lunes a Sábado 9:00 am – 6:00 pm',
      mapsUrl: 'https://maps.google.com/?q=Av.+Nicolás+Arriola+901,+La+Victoria,+Lima',
      telefonoWhatsApp: '+51 905 445 698',
    },
  ],
  redes: {
    instagram: 'https://instagram.com/ioribikershop',
    tiktok: 'https://tiktok.com/@ioribikershop',
    facebook: 'https://facebook.com/ioribikershop',
  },
  barraSuperior: {
    texto: 'Envíos a todo el Perú • Atención personalizada por WhatsApp',
    enlace: '/contacto',
    activo: true,
  },
  tiendaEnPreparacion: {
    activo: false,
    mensaje: 'Estamos preparando nuestro nuevo catálogo digital. ¡Muy pronto disponible!',
    mostrar_tiendas: true,
    mostrar_whatsapp: true,
  },
};

const TiendaSettingsContext = createContext<{
  settings: AjustesNegocio;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}>({
  settings: AJUSTES_INICIALES,
  refreshSettings: async () => {},
  loading: false,
});

export function TiendaSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AjustesNegocio>(AJUSTES_INICIALES);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('ajustes_generales').select('*');

      if (!error && data && data.length > 0) {
        const map: Record<string, any> = {};
        data.forEach((row) => {
          map[row.clave] = row.valor;
        });

        const emp = map['empresa'] || {};
        const wsp = map['whatsapp'] || {};
        const redes = map['redes_sociales'] || {};
        const barra = map['barra_superior'] || {};
        const prep = map['tienda_en_preparacion'] || {};
        const tiendas = Array.isArray(map['tiendas_fisicas']) ? map['tiendas_fisicas'] : AJUSTES_INICIALES.tiendasFisicas;

        setSettings({
          empresa: {
            razonSocial: emp.razonSocial || emp.razon_social || AJUSTES_INICIALES.empresa.razonSocial,
            ruc: emp.ruc || AJUSTES_INICIALES.empresa.ruc,
            correo: emp.correo || AJUSTES_INICIALES.empresa.correo,
            nombreComercial: emp.nombreComercial || emp.nombre_comercial || AJUSTES_INICIALES.empresa.nombreComercial,
            direccionPrincipal: emp.direccion || emp.direccionPrincipal || AJUSTES_INICIALES.empresa.direccionPrincipal,
            horarioPrincipal: emp.horario || emp.horarioPrincipal || AJUSTES_INICIALES.empresa.horarioPrincipal,
            telefono: emp.telefono || AJUSTES_INICIALES.empresa.telefono,
            whatsapp: emp.whatsapp || wsp.numeroCompleto || AJUSTES_INICIALES.empresa.whatsapp,
          },
          whatsapp: {
            numero: wsp.numero || AJUSTES_INICIALES.whatsapp.numero,
            numeroCompleto: wsp.numeroCompleto || (wsp.numero ? `+51 ${wsp.numero}` : AJUSTES_INICIALES.whatsapp.numeroCompleto),
            url: wsp.url || (wsp.numero ? `https://wa.me/51${wsp.numero}` : AJUSTES_INICIALES.whatsapp.url),
          },
          tiendasFisicas: tiendas.map((t: any) => ({
            id: t.id || 'tienda',
            nombre: t.nombre || '',
            direccion: t.direccion || '',
            distrito: t.distrito || '',
            ciudad: t.ciudad || 'Lima',
            referencia: t.referencia || '',
            horario: t.horario || '',
            telefonoWhatsApp: t.telefonoWhatsApp || t.telefono || wsp.numeroCompleto || '+51 905 445 698',
            mapsUrl: t.mapsUrl || t.maps_url || '',
          })),
          redes: {
            instagram: redes.instagram || AJUSTES_INICIALES.redes.instagram,
            tiktok: redes.tiktok || AJUSTES_INICIALES.redes.tiktok,
            facebook: redes.facebook || AJUSTES_INICIALES.redes.facebook,
            youtube: redes.youtube,
          },
          barraSuperior: {
            texto: barra.texto || AJUSTES_INICIALES.barraSuperior.texto,
            enlace: barra.enlace || AJUSTES_INICIALES.barraSuperior.enlace,
            activo: Boolean(barra.activo ?? true),
          },
          tiendaEnPreparacion: {
            activo: Boolean(prep.activo),
            mensaje: prep.mensaje || AJUSTES_INICIALES.tiendaEnPreparacion.mensaje,
            mostrar_tiendas: prep.mostrar_tiendas !== false,
            mostrar_whatsapp: prep.mostrar_whatsapp !== false,
          },
        });
      }
    } catch (err) {
      console.error('Error cargando ajustes de tienda en contexto:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <TiendaSettingsContext.Provider value={{ settings, refreshSettings: fetchSettings, loading }}>
      {children}
    </TiendaSettingsContext.Provider>
  );
}

export function useTiendaSettings() {
  const context = useContext(TiendaSettingsContext);
  return context.settings;
}
