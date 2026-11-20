/** @type {import('next').NextConfig} */

// Dirección oficial de la web. Debe coincidir con `siteUrl` de lib/seo.ts
// (lo comprueba tests/seo.test.cjs).
const canonicalOrigin = 'https://destinauta.com';

const nextConfig = {
  // La portada se abre con parámetros desde enlaces internos
  // (/?ficha=León, /?primaveraServicio=vuelo&destino=Sabadell…). Todas esas
  // variantes son la misma portada: se declara su dirección oficial para que
  // Google no las trate como páginas duplicadas. Las demás páginas no cambian.
  async headers() {
    return [
      {
        source: '/',
        headers: [{ key: 'Link', value: `<${canonicalOrigin}/>; rel="canonical"` }],
      },
    ];
  },
};

module.exports = nextConfig;
