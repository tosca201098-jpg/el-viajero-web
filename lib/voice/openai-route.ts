// Voice-only rollback from protected base 0bd1d46; itinerary generation is independent.
import { isLocale, type Locale } from '@/lib/i18n/translations';
import { admitAiRequest } from '@/lib/ai/admission';

const languageNames: Record<Locale, string> = { es: 'español', en: 'English', fr: 'français', de: 'Deutsch', it: 'italiano', pt: 'português', ca: 'català' };
const unavailable = () => Response.json({ error: 'ai_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const length = Number(request.headers.get('content-length'));
    if (length > 512) return Response.json({ error: 'invalid_request' }, { status: 400 });
    const raw = await request.text();
    if (raw.length > 512) return Response.json({ error: 'invalid_request' }, { status: 400 });
    let input;
    try { input = raw ? JSON.parse(raw) : {}; } catch { return Response.json({ error: 'invalid_request' }, { status: 400 }); }
    if (!input || typeof input !== 'object' || Array.isArray(input) || !isLocale(input.locale ?? 'es')) {
      return Response.json({ error: 'invalid_request' }, { status: 400 });
    }
    const locale: Locale = input.locale ?? 'es';
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return unavailable();
    // Keep the same atomic admission and conservative voice allowance on rollback.
    const denied = await admitAiRequest(request, 'voice');
    if (denied) return denied;
    const itineraryInstructions = `Responde siempre en ${languageNames[locale]}. Si el usuario pide un itinerario, utiliza crear_itinerario con destino y dias (entero de 1 a 7). Para un itinerario no pidas origen, vuelos, hoteles, fechas ni viajeros: bastan destino y duración. Pregunta solo el destino o la duración que falte. No inventes un itinerario hablado ni afirmes que está generado antes del resultado de la herramienta. Con status success confirma brevemente que está visible en pantalla, sin inventar actividades que no hayas recibido. Con status error informa del fallo; unknown_destination requiere aclarar el destino, invalid_arguments requiere destino y 1 a 7 días, busy requiere esperar. Con status cancelled no confirmes éxito. Las reglas siguientes de buscar_viaje se aplican únicamente a búsquedas de vuelos, hoteles o paquetes, nunca a crear itinerarios. `;
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST', signal: controller.signal, cache: 'no-store',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expires_after: { anchor: 'created_at', seconds: 60 },
        session: {
          type: 'realtime', model: 'gpt-realtime-2.1', max_output_tokens: 1024,
          tools: [
            {
              type: 'function', name: 'buscar_viaje',
              description: 'Llama a esta función cuando tengas los datos necesarios para buscar el viaje. Sirve para abrir la tarjeta del destino en la web.',
              parameters: {
                type: 'object',
                properties: {
                  origen: { type: 'string' }, destino: { type: 'string' },
                  fecha_ida: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
                  fecha_vuelta: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
                  viajeros: { type: 'number' }, servicio: { type: 'string', enum: ['vuelo', 'hotel', 'ambos'] },
                  presupuesto: { type: 'number', description: 'Presupuesto máximo en euros, si el usuario lo ha indicado.' },
                  tipo_presupuesto: { type: 'string', enum: ['total', 'por_persona'], description: 'Indica si el presupuesto es total o por persona. Envíalo cuando haya presupuesto.' },
                },
                required: ['origen', 'destino', 'fecha_ida', 'fecha_vuelta', 'viajeros', 'servicio'],
              },
            },
            {
              type: 'function', name: 'crear_itinerario',
              description: 'Genera y muestra en pantalla un itinerario real usando la ficha del destino. Solo necesita destino y duración.',
              parameters: {
                type: 'object', additionalProperties: false,
                properties: { destino: { type: 'string', minLength: 1, maxLength: 100 }, dias: { type: 'integer', minimum: 1, maximum: 7 } },
                required: ['destino', 'dias'],
              },
            },
          ],
          instructions: itineraryInstructions + 'Eres el asistente de voz de Destinauta. Ayuda al usuario a organizar su viaje. Deja que el usuario explique libremente lo que quiere y aprovecha todos los datos que proporcione. No le interrumpas con preguntas innecesarias ni vuelvas a preguntar información que ya haya dado. Debes obtener la información necesaria para realizar su búsqueda, incluyendo origen, destino, fechas, número de viajeros y si quiere vuelo, hotel o ambos. Pregunta el presupuesto cuando sea útil. Si el usuario indica un presupuesto, consérvalo en euros y envía presupuesto y tipo_presupuesto (total o por_persona) al llamar a buscar_viaje. Si no queda claro si es total o por persona y hace falta para interpretar la búsqueda, pregunta brevemente: «¿Ese presupuesto es total o por persona?». No vuelvas a preguntar si ya lo ha aclarado. Si falta información necesaria, pregunta solamente por lo que falte, una cosa cada vez. Si el usuario ya proporciona toda la información necesaria, no hagas más preguntas y continúa directamente. Cuando tengas suficiente información para realizar la búsqueda, confirma brevemente los datos del viaje. Cuando tengas los datos necesarios del viaje, llama obligatoriamente a la función buscar_viaje con el origen, destino, las fechas, el número de viajeros, el servicio solicitado y el presupuesto si lo hay. No digas que la búsqueda está en curso sin haber llamado antes a buscar_viaje.',
          audio: {
            input: { turn_detection: { type: 'server_vad', create_response: false, interrupt_response: false } },
            output: { voice: 'marin' },
          },
        },
      }),
    });
    if (!response.ok) return unavailable();
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || typeof (data as { value?: unknown }).value !== 'string' ||
        !(data as { value: string }).value.trim()) return unavailable();
    // Same client contract as the protected base; no provider details or server key.
    return Response.json({ value: (data as { value: string }).value }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return unavailable(); }
  finally { clearTimeout(timeout); }
}
