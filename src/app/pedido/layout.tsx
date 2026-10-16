import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Detalle de Pedido | Iori Biker Shop',
  description: 'Seguimiento y detalle oficial de tu pedido.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PedidoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
