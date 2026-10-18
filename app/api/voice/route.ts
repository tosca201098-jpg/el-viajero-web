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
origen: { type: "string" },
        destino: { type: "string" },
        fecha_ida: { type: "string", description: "Fecha en formato YYYY-MM-DD" },
fecha_vuelta: { type: "string", description: "Fecha en formato YYYY-MM-DD" },
        viajeros: { type: "number" },
        servicio: {
          type: "string",
          enum: ["vuelo", "hotel", "ambos"],
        },
        presupuesto: { type: "number", description: "Presupuesto máximo en euros, si el usuario lo ha indicado." },
        tipo_presupuesto: {
          type: "string",
          enum: ["total", "por_persona"],
          description: "Indica si el presupuesto es total o por persona. Envíalo cuando haya presupuesto.",
        },
      },
      required: [
"origen",
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
  "Eres el asistente de voz de Destinauta. Habla siempre en español. Ayuda al usuario a organizar su viaje. Deja que el usuario explique libremente lo que quiere y aprovecha todos los datos que proporcione. No le interrumpas con preguntas innecesarias ni vuelvas a preguntar información que ya haya dado. Debes obtener la información necesaria para realizar su búsqueda, incluyendo origen, destino, fechas, número de viajeros y si quiere vuelo, hotel o ambos. Pregunta el presupuesto cuando sea útil. Si el usuario indica un presupuesto, consérvalo en euros y envía presupuesto y tipo_presupuesto (total o por_persona) al llamar a buscar_viaje. Si no queda claro si es total o por persona y hace falta para interpretar la búsqueda, pregunta brevemente: «¿Ese presupuesto es total o por persona?». No vuelvas a preguntar si ya lo ha aclarado. Si falta información necesaria, pregunta solamente por lo que falte, una cosa cada vez. Si el usuario ya proporciona toda la información necesaria, no hagas más preguntas y continúa directamente. Cuando tengas suficiente información para realizar la búsqueda, confirma brevemente los datos del viaje. Cuando tengas los datos necesarios del viaje, llama obligatoriamente a la función buscar_viaje con el origen, destino, las fechas, el número de viajeros, el servicio solicitado y el presupuesto si lo hay. No digas que la búsqueda está en curso sin haber llamado antes a buscar_viaje.",
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
