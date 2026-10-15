export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const origin = 'BCN';
const destination = 'MAD';

function errorResponse(message: string, status: number) {
  return Response.json(
    { success: false, resultCount: 0, origin, destination, firstPrice: null, error: message },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function GET() {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN;

  if (!token) {
    return errorResponse('La API de Travelpayouts no está configurada.', 503);
  }

  const url = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
  url.searchParams.set('origin', origin);
  url.searchParams.set('destination', destination);
  url.searchParams.set('currency', 'EUR');
  url.searchParams.set('one_way', 'true');
  url.searchParams.set('sorting', 'price');
  url.searchParams.set('limit', '1');

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-Access-Token': token,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return errorResponse(
        response.status === 401 || response.status === 403
          ? 'Travelpayouts ha rechazado la autenticación.'
          : 'No se ha podido consultar Travelpayouts.',
        502
      );
    }

    const payload: unknown = await response.json();
    if (
      !payload ||
      typeof payload !== 'object' ||
      !('success' in payload) ||
      payload.success !== true ||
      !('data' in payload) ||
      !Array.isArray(payload.data)
    ) {
      return errorResponse('Travelpayouts ha devuelto una respuesta no válida.', 502);
    }

    const firstResult: unknown = payload.data[0];
    const firstPrice =
      firstResult &&
      typeof firstResult === 'object' &&
      'price' in firstResult &&
      typeof firstResult.price === 'number' &&
      Number.isFinite(firstResult.price)
        ? firstResult.price
        : null;

    return Response.json(
      {
        success: true,
        resultCount: payload.data.length,
        origin,
        destination,
        firstPrice,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return errorResponse('No se ha podido conectar con Travelpayouts.', 502);
  }
}
