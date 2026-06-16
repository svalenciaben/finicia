import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const cache = new Map<string, { data: unknown; expires: number }>();

const TICKERS: Record<string, { name: string; sector: string }> = {
  AAPL: { name: "Apple", sector: "Tecnología" },
  MSFT: { name: "Microsoft", sector: "Tecnología" },
  GOOGL: { name: "Alphabet", sector: "Tecnología" },
  NVDA: { name: "NVIDIA", sector: "Tecnología" },
  AMZN: { name: "Amazon", sector: "Consumo" },
  TSLA: { name: "Tesla", sector: "Automoción" },
  JNJ: { name: "Johnson & Johnson", sector: "Salud" },
  JPM: { name: "JPMorgan Chase", sector: "Finanzas" },
};

async function fetchQuote(ticker: string) {
  // Finnhub — free tier, 60 calls/min, works from servers
  const key = process.env.FINNHUB_API_KEY;
  if (key) {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${key}`,
      { next: { revalidate: 900 } }
    );
    if (res.ok) {
      const d = await res.json();
      if (d.c && d.c > 0) {
        return {
          price: d.c,
          change: d.d ?? 0,
          changePercent: d.dp ?? 0,
          high52: d.h ?? 0,
          low52: d.l ?? 0,
          pe: null,
          eps: null,
          marketCap: null,
          volumeRatio: 1,
        };
      }
    }
  }

  // FMP stable endpoint (new API, free tier 250 calls/day)
  const fmpKey = process.env.FMP_API_KEY;
  if (fmpKey) {
    const res = await fetch(
      `https://financialmodelingprep.com/stable/quote?symbol=${ticker}&apikey=${fmpKey}`,
      { next: { revalidate: 900 } }
    );
    if (res.ok) {
      const d = await res.json();
      const q = Array.isArray(d) ? d[0] : null;
      if (q) {
        return {
          price: q.price ?? 0,
          change: q.change ?? 0,
          changePercent: q.changePercentage ?? 0,
          high52: q.yearHigh ?? 0,
          low52: q.yearLow ?? 0,
          pe: q.pe ?? null,
          eps: q.eps ?? null,
          marketCap: q.marketCap ?? null,
          volumeRatio: q.volume && q.priceAvg50 ? 1 : 1,
        };
      }
    }
  }

  throw new Error("No data source available");
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  const cacheKey = ticker.toUpperCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const meta = TICKERS[cacheKey] ?? { name: cacheKey, sector: "General" };

  try {
    const q = await fetchQuote(ticker);

    const priceVs52High = q.high52 > 0 ? q.price / q.high52 : 0.8;

    const prompt = `Analiza esta acción para un inversor principiante.

Empresa: ${meta.name} (${ticker})
Sector: ${meta.sector}
Precio actual: $${q.price.toFixed(2)}
Cambio hoy: ${q.changePercent.toFixed(2)}%
P/E ratio: ${q.pe ?? "N/A"}
EPS: ${q.eps ?? "N/A"}
Capitalización: $${q.marketCap ? (q.marketCap / 1e9).toFixed(1) + "B" : "N/A"}
Volumen vs promedio: ${(q.volumeRatio * 100).toFixed(0)}%
Precio vs máximo 52 semanas: ${(priceVs52High * 100).toFixed(0)}%

Devuelve SOLO un JSON válido:
{
  "score": <número 0-10>,
  "tecnico": <número 0-10>,
  "fundamental": <número 0-10>,
  "sentimiento": <número 0-10>,
  "resumen": "<1 oración en español simple>",
  "riesgo": "<bajo|medio|alto>"
}

- tecnico: momentum precio (cambio hoy, posición vs 52 semanas)
- fundamental: P/E y EPS (sin datos = 5)
- sentimiento: volumen relativo
- score: promedio ponderado 40/40/20
- sé conservador si hay pocas señales`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { score: 5, tecnico: 5, fundamental: 5, sentimiento: 5, resumen: "Análisis no disponible.", riesgo: "medio" };

    const result = {
      ticker: cacheKey,
      name: meta.name,
      sector: meta.sector,
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      ...analysis,
    };

    cache.set(cacheKey, { data: result, expires: Date.now() + 4 * 60 * 60 * 1000 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Score error:", err);
    return NextResponse.json({
      ticker: cacheKey,
      name: meta.name,
      sector: meta.sector,
      price: 0,
      change: 0,
      changePercent: 0,
      score: 5,
      tecnico: 5,
      fundamental: 5,
      sentimiento: 5,
      resumen: "Agrega FINNHUB_API_KEY o FMP_API_KEY en Vercel para ver datos reales.",
      riesgo: "medio",
    });
  }
}
