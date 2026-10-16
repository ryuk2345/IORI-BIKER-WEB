import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carrito de Compras | Iori Biker Shop',
  description: 'Finaliza tu pedido en Iori Biker Shop y coordina tu compra por WhatsApp.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
