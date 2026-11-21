// Enlaces de afiliado de Travelpayouts para las ofertas de Aviasales («Ver oferta»).
//
// Antes, estos enlaces apuntaban a Aviasales a secas y era el script «Drive» de Travelpayouts (que ahora solo se carga si la
// persona acepta las cookies) el que los convertía en enlaces de afiliado al cargarse la página. Quien rechazaba las cookies
// no generaba comisión. Con este enlace de afiliado normal, escrito por nosotros, la comisión no depende de ningún script
// ni de ninguna cookie en destinauta.com: el seguimiento lo hace Travelpayouts cuando la persona pulsa el enlace.
//
// El formato es exactamente el que genera Drive en la web (comprobado el 21-11-2026 en destinauta.com):
//   https://emrldco.com/re?campaign_id=100&marker=790477&p=4114&trs=586025&u=<enlace de Aviasales codificado>
// Los números son identificadores públicos de la cuenta (se ven en cualquier enlace de la web), no son claves.

export const AFFILIATE_REDIRECT = "https://emrldco.com/re";
export const AFFILIATE_PARAMS = { campaign_id: "100", marker: "790477", p: "4114", trs: "586025" } as const;

const AVIASALES_HOSTS = new Set(["www.aviasales.com", "aviasales.com"]);

/** Devuelve el enlace de afiliado de una oferta de Aviasales. Si el enlace no es de Aviasales (https) o ya es de afiliado, lo deja como está. */
export function affiliateOfferHref(href: string): string {
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || url.username || url.password || !AVIASALES_HOSTS.has(url.hostname)) return href;
    const params = new URLSearchParams(AFFILIATE_PARAMS);
    params.set("u", url.toString());
    return `${AFFILIATE_REDIRECT}?${params.toString()}`;
  } catch {
    return href;
  }
}
