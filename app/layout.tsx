import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { siteUrl } from '@/lib/seo';
import LanguageProvider from './components/LanguageProvider';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Destinauta',
  description: 'Descubre destinos, organiza tu viaje y encuentra vuelos y hoteles con Destinauta, tu asistente inteligente de viajes.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'Destinauta',
    description: 'Descubre destinos, organiza tu viaje y encuentra vuelos y hoteles con Destinauta.',
    siteName: 'Destinauta',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Destinauta',
    description: 'Descubre destinos, organiza tu viaje y encuentra vuelos y hoteles con Destinauta.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
    <head>
      <Script
        id="travelpayouts-drive"
        strategy="beforeInteractive"
        data-noptimize="1"
        data-cfasync="false"
        data-wpfc-render="false"
        data-no-defer="1"
        data-cmp-ab="2"
        {...{ nowprocket: '', 'seraph-accel-crit': '1' }}
      >
        {`(function () {
          var script = document.createElement("script");
          script.async = 1;
          script.setAttribute("data-cmp-ab", "2");
          script.src = "https://emrldco.com/NTg2MDI1.js?t=586025";
          document.head.appendChild(script);
        })();`}
      </Script>
    </head>
    <body className={inter.className}>
  
  <LanguageProvider>{children}</LanguageProvider>
  <Script
  src="https://unpkg.com/@tavus/embed@latest"
  strategy="afterInteractive"
/>
  
  
  
</body>
    </html>
  );
}
