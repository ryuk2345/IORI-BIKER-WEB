import React from 'react';

export function JsonLdOrganization() {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Iori Biker Shop',
    legalName: 'IORI SAC',
    url: 'https://ioribikershop.pe',
    logo: 'https://ioribikershop.pe/images/logo.png',
    telephone: '+51 905 445 698',
    email: 'ioribikershop@gmail.com',
    sameAs: [
      'https://facebook.com/ioribikershop',
      'https://instagram.com/ioribikershop',
      'https://tiktok.com/@ioribikershop',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Contisuyo #418, Tahuantinsuyo',
      addressLocality: 'Independencia',
      addressRegion: 'Lima',
      addressCountry: 'PE',
    },
  };

  const storeIndependencia = {
    '@context': 'https://schema.org',
    '@type': 'MotorcycleDealer',
    name: 'Iori Biker Shop - Sede Independencia (Principal)',
    image: 'https://ioribikershop.pe/images/stores/store_independencia.jpg',
    '@id': 'https://ioribikershop.pe/#store-independencia',
    url: 'https://ioribikershop.pe',
    telephone: '+51 905 445 698',
    priceRange: 'S/ 20 - S/ 1500',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Contisuyo #418, Tahuantinsuyo',
      addressLocality: 'Independencia',
      addressRegion: 'Lima',
      postalCode: '15332',
      addressCountry: 'PE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -11.9962,
      longitude: -77.0543,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '11:00',
        closes: '20:00',
      },
    ],
  };

  const storeLaVictoria = {
    '@context': 'https://schema.org',
    '@type': 'MotorcycleDealer',
    name: 'Iori Biker Shop - Sede La Victoria',
    image: 'https://ioribikershop.pe/images/stores/store_la_victoria.jpg',
    '@id': 'https://ioribikershop.pe/#store-la-victoria',
    url: 'https://ioribikershop.pe',
    telephone: '+51 905 445 698',
    priceRange: 'S/ 20 - S/ 1500',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Nicolás Arriola 901',
      addressLocality: 'La Victoria',
      addressRegion: 'Lima',
      postalCode: '15034',
      addressCountry: 'PE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -12.0725,
      longitude: -77.0142,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeIndependencia) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeLaVictoria) }}
      />
    </>
  );
}
