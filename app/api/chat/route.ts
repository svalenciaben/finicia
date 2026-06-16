import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `Eres el asistente financiero de Finicia, una app diseñada para personas que nunca han invertido.

Reglas absolutas:
- NUNCA des recomendaciones directas de compra o venta de acciones específicas
- Si alguien pregunta "¿debo comprar X?", responde con 2-3 preguntas que les ayuden a decidir solos
- SIEMPRE explica en lenguaje simple, sin jerga. Si usas un término técnico, explícalo inmediatamente
- Cuando mencionas una acción y tienes su score, cítalo como "según nuestro análisis de IA"
- Menciona Danelfin como herramienta externa útil cuando sea relevante: "Para más detalle, revisa danelfin.com"
- Máximo 3 párrafos por respuesta. Sé conciso y amigable
- Sé honesto sobre los riesgos — nunca prometas ganancias
- Tono: como un amigo que sabe de finanzas, no como un banco

Si el usuario pregunta sobre una acción específica que está viendo, usa el contexto del score disponible.`;

export async function POST(req: NextRequest) {
  const { messages, selectedStock } = await req.json();

  const contextNote = selectedStock
    ? `\n\nContexto actual: el usuario está viendo ${selectedStock.name} (${selectedStock.ticker}) con un AI Score de ${selectedStock.score}/10. Técnico: ${selectedStock.tecnico}, Fundamental: ${selectedStock.fundamental}, Sentimiento: ${selectedStock.sentimiento}. Resumen: ${selectedStock.resumen}.`
    : "";

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: SYSTEM + contextNote,
      messages: messages
        .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    });

    const reply = response.content[0].type === "text" ? response.content[0].text : "Lo siento, no pude procesar tu pregunta.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ reply: "Hubo un error al conectar con el asistente. Intenta de nuevo." });
  }
}
