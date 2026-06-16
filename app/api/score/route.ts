import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const cache = new Map<string, { data: unknown; expires: number }>();

async function fetchYahooFinance(ticker: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1mo`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Finicia/1.0)" },
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
  return res.json();
}

async function fetchYahooQuote(ticker: string) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Finicia/1.0)" },
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`Yahoo Quote error: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  const cacheKey = ticker.toUpperCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const TICKERS: Record<string, { name: string; sector: string }> = {
    AAPL: { name: "Apple", sector: "Tecnología" },
    MSFT: { name: "Microsoft", sector: "Tecnología" },
    GOOGL: { name: "Alphabet", sector: "Tecnología" },
    NVDA: { name: "NVIDIA", sector: "Tecnología" },
    AMZN: { name: "Amazon", sector: "Consumo" },
    NEE: { name: "NextEra Energy", sector: "Energía" },
    JNJ: { name: "Johnson & Johnson", sector: "Salud" },
    "BRK-B": { name: "Berkshire Hathaway", sector: "Finanzas" },
  };

  const meta = TICKERS[cacheKey] ?? { name: cacheKey, sector: "General" };

  try {
    const [quoteData] = await Promise.all([fetchYahooQuote(ticker)]);

    const quote = quoteData?.quoteResponse?.result?.[0] ?? {};
    const price = quote.regularMarketPrice ?? 0;
    const change = quote.regularMarketChange ?? 0;
    const changePercent = quote.regularMarketChangePercent ?? 0;
    const pe = quote.trailingPE ?? null;
    const eps = quote.epsTrailingTwelveMonths ?? null;
    const marketCap = quote.marketCap ?? null;
    const volume = quote.regularMarketVolume ?? null;
    const avgVolume = quote.averageDailyVolume3Month ?? null;
    const fiftyTwoHigh = quote.fiftyTwoWeekHigh ?? null;
    const fiftyTwoLow = quote.fiftyTwoWeekLow ?? null;

    const volumeRatio = avgVolume ? volume / avgVolume : 1;
    const priceVs52High = fiftyTwoHigh ? price / fiftyTwoHigh : 0.8;

    const prompt = `Analiza esta acción para un inversor principiante.

Empresa: ${meta.name} (${ticker})
Sector: ${meta.sector}
Precio actual: $${price.toFixed(2)}
Cambio hoy: ${changePercent.toFixed(2)}%
P/E ratio: ${pe ?? "N/A"}
EPS: ${eps ?? "N/A"}
Capitalización: $${marketCap ? (marketCap / 1e9).toFixed(1) + "B" : "N/A"}
Volumen vs promedio: ${(volumeRatio * 100).toFixed(0)}%
Precio vs máximo 52 semanas: ${(priceVs52High * 100).toFixed(0)}%

Devuelve SOLO un JSON válido con esta estructura exacta:
{
  "score": <número 0-10, una decimal>,
  "tecnico": <número 0-10>,
  "fundamental": <número 0-10>,
  "sentimiento": <número 0-10>,
  "resumen": "<1 oración en español simple explicando la señal general>",
  "riesgo": "<bajo|medio|alto>"
}

Criterios:
- tecnico: basado en momento del precio (cambio hoy, posición vs 52 semanas, volumen)
- fundamental: basado en P/E y EPS (sin datos = 5 neutro)
- sentimiento: basado en volumen relativo y momentum
- score: promedio ponderado (40% tecnico, 40% fundamental, 20% sentimiento)
- resumen: explica el score en lenguaje muy simple, sin jerga
- sé conservador: si hay pocas señales positivas, el score no debe ser alto`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 5, tecnico: 5, fundamental: 5, sentimiento: 5, resumen: "Análisis no disponible.", riesgo: "medio" };

    const result = {
      ticker: cacheKey,
      name: meta.name,
      sector: meta.sector,
      price,
      change,
      changePercent,
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
      resumen: "No se pudieron cargar los datos en este momento.",
      riesgo: "medio",
    });
  }
}
