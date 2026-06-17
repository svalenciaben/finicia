import { NextResponse } from "next/server";

const TICKERS = [
  { ticker: "AAPL", name: "Apple", sector: "Tecnología" },
  { ticker: "MSFT", name: "Microsoft", sector: "Tecnología" },
  { ticker: "GOOGL", name: "Alphabet", sector: "Tecnología" },
  { ticker: "NVDA", name: "NVIDIA", sector: "Tecnología" },
  { ticker: "AMZN", name: "Amazon", sector: "Consumo" },
  { ticker: "TSLA", name: "Tesla", sector: "Automoción" },
];

const cache = new Map<string, { data: unknown[]; expires: number }>();

async function fetchOne(ticker: string, name: string) {
  const res = await fetch(
    `https://api.twelvedata.com/quote?symbol=${ticker}&apikey=demo`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  if (d.status === "error" || !d.close) throw new Error(d.message ?? "no data");
  const price = parseFloat(d.close);
  const changePct = parseFloat(d.percent_change ?? "0");
  const change = parseFloat(d.change ?? "0");
  const tecnico = Math.min(10, Math.max(0, 5 + changePct * 1.5));
  const fundamental = 5;
  const sentimiento = changePct > 1 ? 7 : changePct > 0 ? 6 : changePct > -1 ? 4 : 3;
  const score = Math.round((tecnico * 0.4 + fundamental * 0.4 + sentimiento * 0.2) * 10) / 10;
  const riesgo: "bajo" | "medio" | "alto" = score >= 7 ? "bajo" : score >= 4 ? "medio" : "alto";
  const resumen = changePct > 1
    ? `${name} muestra momentum positivo hoy con una subida del ${changePct.toFixed(2)}%.`
    : changePct > 0
    ? `${name} sube ligeramente hoy un ${changePct.toFixed(2)}%, señal neutral.`
    : changePct > -1
    ? `${name} baja un ${Math.abs(changePct).toFixed(2)}% hoy, señal de cautela.`
    : `${name} cae un ${Math.abs(changePct).toFixed(2)}% hoy, señal negativa.`;
  return { price, change, changePercent: changePct, score, tecnico: Math.round(tecnico * 10) / 10, fundamental, sentimiento, riesgo, resumen };
}

export const dynamic = "force-dynamic";

export async function GET() {
  const cached = cache.get("all");
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const results = [];
  for (const t of TICKERS) {
    try {
      const q = await fetchOne(t.ticker, t.name);
      results.push({ ticker: t.ticker, name: t.name, sector: t.sector, ...q });
    } catch {
      results.push({
        ticker: t.ticker, name: t.name, sector: t.sector,
        price: 0, change: 0, changePercent: 0,
        score: 5, tecnico: 5, fundamental: 5, sentimiento: 5,
        riesgo: "medio", resumen: "No se pudo cargar el análisis.",
      });
    }
    // Small delay between requests to respect demo key limits
    await new Promise((r) => setTimeout(r, 200));
  }

  cache.set("all", { data: results, expires: Date.now() + 15 * 60 * 1000 });
  return NextResponse.json(results);
}
