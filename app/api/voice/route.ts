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
            instructions:
              "Eres el asistente de voz de EL VIAJERO. Habla siempre en español. Ayuda a organizar viajes preguntando por destino, fechas, presupuesto y viajeros. Haz una pregunta cada vez.",
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