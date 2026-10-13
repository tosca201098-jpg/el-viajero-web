export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Falta configurar OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model: "gpt-realtime-2.1",
tools: [
  {
    type: "function",
    name: "buscar_viaje",
    description:
      "Llama a esta función cuando tengas los datos necesarios para buscar el viaje. Sirve para abrir la tarjeta del destino en la web.",
    parameters: {
      type: "object",
      properties: {
        destino: { type: "string" },
        fecha_ida: { type: "string" },
        fecha_vuelta: { type: "string" },
        viajeros: { type: "number" },
        servicio: {
          type: "string",
          enum: ["vuelo", "hotel", "ambos"],
        },
      },
      required: [
        "destino",
        "fecha_ida",
        "fecha_vuelta",
        "viajeros",
        "servicio",
      ],
    },
  },
],
             instructions:
  "Eres el asistente de voz de EL VIAJERO. Habla siempre en español. Ayuda al usuario a organizar su viaje. Deja que el usuario explique libremente lo que quiere y aprovecha todos los datos que proporcione. No le interrumpas con preguntas innecesarias ni vuelvas a preguntar información que ya haya dado. Debes obtener la información necesaria para realizar su búsqueda, incluyendo destino, fechas, número de viajeros y si quiere vuelo, hotel o ambos. Pregunta el presupuesto cuando sea útil. Si falta información necesaria, pregunta solamente por lo que falte, una cosa cada vez. Si el usuario ya proporciona toda la información necesaria, no hagas más preguntas y continúa directamente. Cuando tengas suficiente información para realizar la búsqueda, confirma brevemente los datos del viaje. Cuando tengas los datos necesarios del viaje, llama obligatoriamente a la función buscar_viaje con el destino, las fechas, el número de viajeros y el servicio solicitado. No digas que la búsqueda está en curso sin haber llamado antes a buscar_viaje.",
            audio: {
              output: {
                voice: "marin",
              },
            },
          },
        }),
      }
    );

    const data = await response.json();

    return Response.json(data, {
      status: response.status,
    });
  } catch (error) {
    return Response.json(
      { error: "No se pudo conectar con OpenAI" },
      { status: 500 }
    );
  }
}