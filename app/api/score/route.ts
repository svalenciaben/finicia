import { NextRequest, NextResponse } from "next/server";

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
  const fmpKey = "1IYFXrvJ16BB5Lsd0sQGwK3R1rBaGi5c";
  const url = `https://financialmodelingprep.com/stable/quote?symbol=${ticker}&apikey=${fmpKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`FMP error ${res.status}: ${await res.text()}`);
  const d = await res.json();
  const q = Array.isArray(d) ? d[0] : d;
  if (!q || !q.price) throw new Error(`No price data for ${ticker}`);
  return {
    price: q.price ?? 0,
    change: q.change ?? 0,
    changePercent: q.changePercentage ?? 0,
    high52: q.yearHigh ?? 0,
    low52: q.yearLow ?? 0,
    pe: q.pe ?? null,
    eps: q.eps ?? null,
    marketCap: q.marketCap ?? null,
    volumeRatio: 1,
  };
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  const clientPrice = parseFloat(req.nextUrl.searchParams.get("price") ?? "0");
  const cacheKey = ticker.toUpperCase() + (clientPrice > 0 ? "_real" : "");
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const meta = TICKERS[cacheKey] ?? { name: cacheKey, sector: "General" };

  const clientChange = parseFloat(req.nextUrl.searchParams.get("change") ?? "0");
  const clientChangePct = parseFloat(req.nextUrl.searchParams.get("changePct") ?? "0");

  try {
    const q = clientPrice > 0
      ? { price: clientPrice, change: clientChange, changePercent: clientChangePct, high52: 0, low52: 0, pe: null, eps: null, marketCap: null, volumeRatio: 1 }
      : await fetchQuote(ticker);

    // Score calculado matemáticamente sin IA
    const changePct = q.changePercent;
    const tecnico = Math.min(10, Math.max(0, 5 + changePct * 1.5));
    const fundamental = 5; // sin datos de P/E disponibles en tier gratis
    const sentimiento = changePct > 1 ? 7 : changePct > 0 ? 6 : changePct > -1 ? 4 : 3;
    const score = Math.round((tecnico * 0.4 + fundamental * 0.4 + sentimiento * 0.2) * 10) / 10;
    const riesgo: "bajo" | "medio" | "alto" = score >= 7 ? "bajo" : score >= 4 ? "medio" : "alto";
    const resumen = changePct > 1
      ? `${meta.name} muestra momentum positivo hoy con una subida del ${changePct.toFixed(2)}%.`
      : changePct > 0
      ? `${meta.name} sube ligeramente hoy un ${changePct.toFixed(2)}%, señal neutral.`
      : changePct > -1
      ? `${meta.name} baja un ${Math.abs(changePct).toFixed(2)}% hoy, señal de cautela.`
      : `${meta.name} cae un ${Math.abs(changePct).toFixed(2)}% hoy, señal negativa.`;

    const result = {
      ticker: cacheKey,
      name: meta.name,
      sector: meta.sector,
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      score,
      tecnico: Math.round(tecnico * 10) / 10,
      fundamental,
      sentimiento,
      resumen,
      riesgo,
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
      resumen: "No se pudo cargar el análisis.",
      riesgo: "medio",
    });
  }
}
