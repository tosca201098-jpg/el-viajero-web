// Baja con un clic del correo de vuelos a buen precio.
// - GET: enseña una página con UN botón «Darme de baja». No cambia nada (así un programa de seguridad que abre los enlaces
//   del correo para revisarlos no puede dar de baja a nadie por error).
// - POST: da de baja de verdad. Es lo que usa el botón de esa página y lo que usa el botón «Cancelar suscripción» del propio
//   programa de correo (cabecera List-Unsubscribe-Post, RFC 8058).
// El enlace va firmado (ver lib/email/unsubscribe.ts): sin la firma correcta no se toca nada. La baja solo pone
// email_consent = false en la fila de esa cuenta (la base de datos anota la fecha); no borra nada ni lee el correo de nadie.
// Si no se puede guardar, la página lo dice: nunca afirma una baja que no se ha hecho.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { normalizeUserId, readUnsubscribeSecret, UNSUBSCRIBE_PATH, verifyUnsubscribe } from '@/lib/email/unsubscribe';
import { unsubscribeText, type UnsubscribeTextKey } from '@/lib/email/unsubscribe-texts';
import { isLocale, type Locale } from '@/lib/i18n/translations';
import { siteUrl } from '@/lib/seo';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

type View = 'confirm' | 'done' | 'error' | 'invalid';

// Se escribe aquí (y no se importa del correo) para que esta ruta pequeña no cargue el catálogo de destinos.
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

type Parsed = { locale: Locale; userId: string | null; token: string | null };

function parse(request: Request): Parsed {
  const params = new URL(request.url).searchParams;
  const localeParam = params.get('l') ?? 'es';
  return { locale: isLocale(localeParam) ? localeParam : 'es', userId: normalizeUserId(params.get('u')), token: params.get('t') };
}

function page(locale: Locale, view: View, status: number, action?: string): Response {
  const text = (key: UnsubscribeTextKey) => escapeHtml(unsubscribeText(locale, key));
  const titleKey: UnsubscribeTextKey = view === 'confirm' ? 'title' : view === 'done' ? 'doneTitle' : view === 'error' ? 'errorTitle' : 'invalidTitle';
  const bodyKey: UnsubscribeTextKey = view === 'confirm' ? 'intro' : view === 'done' ? 'doneBody' : view === 'error' ? 'errorBody' : 'invalidBody';
  const form = view === 'confirm' && action
    ? `<form method="post" action="${escapeHtml(action)}"><button type="submit">${text('button')}</button></form>`
    : '';
  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${text(titleKey)}</title>
<style>
body{margin:0;background:#F7F2E8;color:#44403c;font-family:Inter,Arial,Helvetica,sans-serif;}
main{box-sizing:border-box;max-width:520px;margin:0 auto;padding:48px 20px;}
.card{background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:28px 24px;}
.brand{font-size:20px;font-weight:800;color:#2563eb;margin:0 0 18px 0;}
h1{margin:0 0 12px 0;font-size:24px;line-height:30px;color:#1c1917;}
p{margin:0 0 20px 0;font-size:16px;line-height:25px;}
button{font:inherit;font-weight:600;font-size:16px;color:#ffffff;background:#2563eb;border:0;border-radius:10px;padding:12px 22px;cursor:pointer;}
a{color:#1d4ed8;font-weight:600;}
</style>
</head>
<body>
<main>
<div class="card">
<p class="brand">Destinauta</p>
<h1>${text(titleKey)}</h1>
<p>${text(bodyKey)}</p>
${form}
<p style="margin:${form ? '20px' : '0'} 0 0 0;"><a href="${escapeHtml(siteUrl)}/">${text('back')}</a></p>
</div>
</main>
</body>
</html>`;
  return new Response(html, { status, headers: HEADERS });
}

/** Comprueba la clave y la firma del enlace. Devuelve la respuesta de error o la cuenta que se da de baja. */
function check(request: Request): { error: Response } | { locale: Locale; userId: string; token: string } {
  const { locale, userId, token } = parse(request);
  const secret = readUnsubscribeSecret(process.env.EMAIL_UNSUBSCRIBE_SECRET);
  if (!secret) return { error: page(locale, 'error', 503) };
  if (!userId || !token || !verifyUnsubscribe(userId, token, secret)) return { error: page(locale, 'invalid', 400) };
  return { locale, userId, token };
}

export async function GET(request: Request) {
  const checked = check(request);
  if ('error' in checked) return checked.error;
  const query = new URLSearchParams({ u: checked.userId, t: checked.token, l: checked.locale });
  return page(checked.locale, 'confirm', 200, `${UNSUBSCRIBE_PATH}?${query.toString()}`);
}

export async function POST(request: Request) {
  const checked = check(request);
  if ('error' in checked) return checked.error;
  const client = getSupabaseAdminClient();
  if (!client) return page(checked.locale, 'error', 503);
  try {
    const { error } = await client.from('email_preferences').update({ email_consent: false }).eq('user_id', checked.userId);
    if (error) return page(checked.locale, 'error', 503);
  } catch {
    return page(checked.locale, 'error', 503);
  }
  return page(checked.locale, 'done', 200);
}
