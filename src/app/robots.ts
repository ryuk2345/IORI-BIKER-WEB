import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/carrito',
          '/checkout',
          '/pedido',
          '/pedido/*',
          '/mi-cuenta',
          '/mi-cuenta/*',
          '/api/*',
        ],
      },
    ],
    sitemap: 'https://ioribikershop.pe/sitemap.xml',
  };
}
