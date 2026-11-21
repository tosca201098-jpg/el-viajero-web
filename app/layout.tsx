import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { siteUrl } from '@/lib/seo';
import LanguageProvider from './components/LanguageProvider';
import SiteFooter from './components/SiteFooter';
import CookieConsent from './components/CookieConsent';
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
    <body className={inter.className}>
  
  <LanguageProvider>{children}<SiteFooter /><CookieConsent /></LanguageProvider>

  
  
  
</body>
    </html>
  );
}
