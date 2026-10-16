import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Cuenta | Iori Biker Shop',
  description: 'Panel de usuario y compras en Iori Biker Shop.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
