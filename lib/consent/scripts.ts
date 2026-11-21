// Servicios de terceros que SOLO se cargan si la persona los ha aceptado en el aviso de cookies.
// Antes estaban fijos en app/layout.tsx y se cargaban en todas las páginas sin preguntar.
//  - Travelpayouts «drive»: convierte los enlaces en enlaces de afiliado y mide las reservas (guarda cookies).
// Los widgets de resultados de vuelos y el mapa de hoteles no están aquí: se cargan cuando la persona hace una búsqueda
// (es el servicio que pide) y se explican en la política de privacidad.

export const THIRD_PARTY_SCRIPTS = [
  { id: "travelpayouts-drive", src: "https://emrldco.com/NTg2MDI1.js?t=586025", attributes: { "data-cmp-ab": "2" } as Record<string, string> },
] as const;

type ScriptElement = { id: string; src: string; async: boolean; setAttribute(name: string, value: string): void };
type ScriptDocument = {
  getElementById(id: string): unknown;
  createElement(tag: "script"): ScriptElement;
  head: { appendChild(node: ScriptElement): unknown };
};

/** Añade cada script una sola vez. Devuelve los ids que ha añadido ahora. */
export function loadThirdPartyScripts(doc: ScriptDocument): string[] {
  const added: string[] = [];
  for (const item of THIRD_PARTY_SCRIPTS) {
    if (doc.getElementById(item.id)) continue;
    const script = doc.createElement("script");
    script.id = item.id;
    script.async = true;
    for (const [name, value] of Object.entries(item.attributes)) script.setAttribute(name, value);
    script.src = item.src;
    doc.head.appendChild(script);
    added.push(item.id);
  }
  return added;
}
