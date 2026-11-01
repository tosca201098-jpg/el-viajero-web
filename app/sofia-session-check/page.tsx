import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { sofiaSessionCheckAvailable, SOFIA_SESSION_CHECK_HOST } from '@/lib/ai/sofia-session-check-scope';
import SessionCheck from './SessionCheck';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Comprobación privada de sesión | DESTINAUTA',
  robots: { index: false, follow: false } };

export default async function SofiaSessionCheckPage() {
  if (!sofiaSessionCheckAvailable(process.env)) notFound();
  const requestHeaders = await headers();
  if (requestHeaders.get('host') !== SOFIA_SESSION_CHECK_HOST ||
      requestHeaders.get('x-forwarded-proto') !== 'https') notFound();
  return <main style={{ maxWidth: 800, margin: '32px auto', padding: 24, background: '#fff', color: '#172554', borderRadius: 16 }}>
    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Verificación privada de Sofía</h1>
    <p style={{ marginBottom: 16 }}>Solo Preview. Caduca el 2 de noviembre de 2026 a las 20:30 (hora peninsular española).</p>
    <SessionCheck />
  </main>;
}
