// Decisión de la persona sobre los servicios de terceros (afiliación y medición). Lógica sin React para poder probarla.
// Se guarda en el navegador (localStorage) solo la decisión, la fecha y la versión del texto; nada más.
// Sin decisión guardada = no se carga ningún servicio de terceros.

export const CONSENT_KEY = "destinauta.cookie-consent";
/** Subirla si cambia lo que se pide aceptar: así se vuelve a preguntar a todo el mundo. */
export const CONSENT_VERSION = 1;
/** Evento para reabrir el aviso desde el enlace «Cookies» del pie de página. */
export const OPEN_CONSENT_EVENT = "destinauta:open-cookie-settings";

export type Consent = { v: number; thirdParty: boolean; at: string };

type ReadStorage = Pick<Storage, "getItem">;
type WriteStorage = Pick<Storage, "setItem">;

export function readConsent(storage: ReadStorage | undefined): Consent | null {
  try {
    const raw = storage?.getItem(CONSENT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Consent> | null;
    if (!value || value.v !== CONSENT_VERSION || typeof value.thirdParty !== "boolean" || typeof value.at !== "string") return null;
    return { v: value.v, thirdParty: value.thirdParty, at: value.at };
  } catch {
    return null;
  }
}

export function writeConsent(storage: WriteStorage | undefined, thirdParty: boolean, now: Date = new Date()): Consent {
  const consent: Consent = { v: CONSENT_VERSION, thirdParty, at: now.toISOString() };
  try { storage?.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch { /* Sin almacenamiento: se vuelve a preguntar en la siguiente visita. */ }
  return consent;
}

/** Huellas que dejan los servicios de terceros en NUESTRO dominio y que se borran si la persona los rechaza o cambia de opinión. */
export const THIRD_PARTY_COOKIE = /^(tpwl_|_sp_|bb-session|am_user_session)/;
export const THIRD_PARTY_STORAGE = /^(__wl|snowplow)/;

type CookieDocument = { cookie: string; location?: { hostname: string } };
type KeyStorage = { length: number; key(index: number): string | null; removeItem(key: string): void };

/** Borra las cookies y datos locales conocidos de esos servicios. Las cookies de otros dominios no se pueden tocar desde aquí. */
export function clearThirdPartyTraces(doc: CookieDocument | undefined, local: KeyStorage | undefined, session: KeyStorage | undefined): string[] {
  const removed: string[] = [];
  if (doc) {
    const host = doc.location?.hostname ?? "";
    const parts = host.split(".");
    const domains = ["", host, `.${host}`, ...(parts.length > 2 ? [`.${parts.slice(-2).join(".")}`] : [])];
    for (const entry of doc.cookie.split(";")) {
      const name = entry.split("=")[0].trim();
      if (!name || !THIRD_PARTY_COOKIE.test(name)) continue;
      for (const domain of domains) doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
      removed.push(name);
    }
  }
  for (const storage of [local, session]) {
    if (!storage) continue;
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) { const key = storage.key(i); if (key && THIRD_PARTY_STORAGE.test(key)) keys.push(key); }
    for (const key of keys) { storage.removeItem(key); removed.push(key); }
  }
  return removed;
}
