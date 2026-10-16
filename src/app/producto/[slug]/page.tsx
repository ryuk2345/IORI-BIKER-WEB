import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductoBySlug, getProductos } from '@/lib/data/supabase-data';
import { ProductDetailView } from '@/components/product/ProductDetailView';

export const revalidate = 10;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  if (!producto) {
    return {
      title: 'Producto no encontrado | Iori Biker Shop',
    };
  }

  const title = `${producto.nombre} | Iori Biker Shop Perú`;
  const description = producto.descripcionCorta || producto.descripcionLarga || 'Compra con garantía y envío seguro en Iori Biker Shop.';
  const canonicalUrl = `https://ioribikershop.pe/producto/${producto.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: producto.imagenes?.[0] ? [{ url: producto.imagenes[0] }] : [],
      siteName: 'Iori Biker Shop',
      locale: 'es_PE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: producto.imagenes?.[0] ? [producto.imagenes[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [producto, todos] = await Promise.all([
    getProductoBySlug(slug),
    getProductos(),
  ]);

  if (!producto) {
    notFound();
  }

  const relacionados = todos.filter(
    (p) => p.id !== producto.id && (p.categoriaSlug === producto.categoriaSlug || p.marcaId === producto.marcaId)
  ).slice(0, 8);

  // Schema JSON-LD de Product
  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: producto.nombre,
    image: producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : undefined,
    description: producto.descripcionCorta || producto.descripcionLarga || producto.nombre,
    sku: producto.sku || producto.id,
    brand: {
      '@type': 'Brand',
      name: producto.marcaNombre || 'Iori Biker Shop',
    },
    category: producto.categoriaNombre,
    offers: {
      '@type': 'Offer',
      url: `https://ioribikershop.pe/producto/${producto.slug}`,
      priceCurrency: 'PEN',
      price: producto.precio,
      priceValidUntil: '2027-12-31',
      availability: (producto.stock ?? 10) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Iori Biker Shop',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailView producto={producto} relacionados={relacionados} />
    </>
  );
}
