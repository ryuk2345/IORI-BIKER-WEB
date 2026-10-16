// Utilidades de Analítica: Google Analytics 4 (GA4) y Meta Pixel (Facebook Pixel)
// Diseñado para operar solo cuando existen los IDs en variables de entorno

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * 1. Evento: Ver Ficha de Producto (view_item / ViewContent)
 */
export function trackViewItem(item: {
  id: string;
  nombre: string;
  precio: number;
  categoria?: string;
  marca?: string;
}) {
  if (typeof window === 'undefined') return;

  // GA4
  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('event', 'view_item', {
      currency: 'PEN',
      value: item.precio,
      items: [
        {
          item_id: item.id,
          item_name: item.nombre,
          item_category: item.categoria,
          item_brand: item.marca,
          price: item.precio,
        },
      ],
    });
  }

  // Meta Pixel
  if (window.fbq && META_PIXEL_ID) {
    window.fbq('track', 'ViewContent', {
      content_name: item.nombre,
      content_ids: [item.id],
      content_type: 'product',
      value: item.precio,
      currency: 'PEN',
    });
  }
}

/**
 * 2. Evento: Agregar al Carrito (add_to_cart / AddToCart)
 */
export function trackAddToCart(item: {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  variante?: string;
  categoria?: string;
}) {
  if (typeof window === 'undefined') return;

  // GA4
  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('event', 'add_to_cart', {
      currency: 'PEN',
      value: item.precio * item.cantidad,
      items: [
        {
          item_id: item.id,
          item_name: item.nombre,
          item_variant: item.variante,
          item_category: item.categoria,
          price: item.precio,
          quantity: item.cantidad,
        },
      ],
    });
  }

  // Meta Pixel
  if (window.fbq && META_PIXEL_ID) {
    window.fbq('track', 'AddToCart', {
      content_name: item.nombre,
      content_ids: [item.id],
      content_type: 'product',
      value: item.precio * item.cantidad,
      currency: 'PEN',
    });
  }
}

/**
 * 3. Evento: Iniciar proceso de checkout al llenar datos (begin_checkout / InitiateCheckout)
 */
export function trackBeginCheckout(total: number, itemsCount: number) {
  if (typeof window === 'undefined') return;

  // GA4
  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('event', 'begin_checkout', {
      currency: 'PEN',
      value: total,
      items_count: itemsCount,
    });
  }

  // Meta Pixel
  if (window.fbq && META_PIXEL_ID) {
    window.fbq('track', 'InitiateCheckout', {
      value: total,
      currency: 'PEN',
      num_items: itemsCount,
    });
  }
}

/**
 * 4. Evento: Generación de Lead al enviar pedido por WhatsApp (generate_lead / Lead)
 */
export function trackGenerateLead(codigoPedido: string, total: number) {
  if (typeof window === 'undefined') return;

  // GA4
  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('event', 'generate_lead', {
      currency: 'PEN',
      value: total,
      transaction_id: codigoPedido,
    });
  }

  // Meta Pixel
  if (window.fbq && META_PIXEL_ID) {
    window.fbq('track', 'Lead', {
      content_name: `Pedido ${codigoPedido}`,
      value: total,
      currency: 'PEN',
    });
  }
}

/**
 * 5. Evento: Clic en Cotizar por WhatsApp (quote_click / Contact)
 */
export function trackQuoteClick(producto: string, sku?: string) {
  if (typeof window === 'undefined') return;

  // GA4
  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('event', 'quote_click', {
      product_name: producto,
      sku: sku || 'sin-sku',
      contact_method: 'whatsapp',
    });
  }

  // Meta Pixel
  if (window.fbq && META_PIXEL_ID) {
    window.fbq('track', 'Contact', {
      content_name: `Cotizar: ${producto}`,
    });
  }
}

/**
 * 6. Evento: Clic en el botón flotante de WhatsApp (floating_whatsapp_click / Contact)
 */
export function trackFloatingWhatsAppClick() {
  if (typeof window === 'undefined') return;

  // GA4
  if (window.gtag && GA_TRACKING_ID) {
    window.gtag('event', 'floating_whatsapp_click', {
      source: 'floating_button',
    });
  }

  // Meta Pixel
  if (window.fbq && META_PIXEL_ID) {
    window.fbq('trackCustom', 'FloatingWhatsAppClick', {
      source: 'floating_button',
    });
  }
}
