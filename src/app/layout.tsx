import type { Metadata, Viewport } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { JsonLdOrganization } from '@/components/seo/JsonLdOrganization';
import { AnalyticsScripts } from '@/components/analytics/AnalyticsScripts';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  weight: ['600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Iori Biker Shop | Tienda de Accesorios para Moto e Indumentaria Biker en Perú',
  description: 'Tienda de accesorios para moto e indumentaria biker. Envíos a todo el Perú.',
  keywords: [
    'cascos para moto',
    'cascos certificados peru',
    'accesorios moto lima',
    'indumentaria biker',
    'iori biker shop',
    'cascos ece 22.06',
    'intercomunicador moto',
  ],
  authors: [{ name: 'Iori Biker Shop' }],
  metadataBase: new URL('https://ioribikershop.pe'),
  openGraph: {
    title: 'Iori Biker Shop | Tienda de Accesorios para Moto e Indumentaria Biker en Perú',
    description: 'Tienda de accesorios para moto e indumentaria biker. Envíos a todo el Perú.',
    locale: 'es_PE',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#121214',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <head>
        <JsonLdOrganization />
      </head>
      <body className="antialiased font-sans">
        <AnalyticsScripts />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
