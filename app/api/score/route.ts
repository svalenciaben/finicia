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
  // Stooq: free, no API key, works server-side
  const url = `https://stooq.com/q/l/?s=${ticker.toLowerCase()}.us&f=sd2t2ohlcv&h&e=csv`;
  const res = await fetch(url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Stooq error ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split("\n");
  if (lines.length < 2) throw new Error("No data from Stooq");
  const parts = lines[1].split(",");
  // CSV: Symbol,Date,Time,Open,High,Low,Close,Volume
  const close = parseFloat(parts[6]);
  const open = parseFloat(parts[3]);
  if (!close || close <= 0) throw new Error("Invalid price");
  const change = close - open;
  const changePercent = open > 0 ? (change / open) * 100 : 0;
  return {
    price: close,
    change,
    changePercent,
    high52: 0,
    low52: 0,
    pe: null,
    eps: null,
    marketCap: null,
    volumeRatio: 1,
  };
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  const upper = ticker.toUpperCase();
  const cached = cache.get(upper);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const meta = TICKERS[upper] ?? { name: upper, sector: "General" };

  try {
    const q = await fetchQuote(upper);

    const changePct = q.changePercent;
    const tecnico = Math.min(10, Math.max(0, 5 + changePct * 1.5));
    const fundamental = 5;
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
      ticker: upper,
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

    cache.set(upper, { data: result, expires: Date.now() + 30 * 60 * 1000 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Score error:", err);
    return NextResponse.json({
      ticker: upper,
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
