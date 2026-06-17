"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ExternalLink, MessageCircle, RefreshCw, Send } from "lucide-react";

const TICKERS = [
  { ticker: "AAPL", name: "Apple", sector: "Tecnología" },
  { ticker: "MSFT", name: "Microsoft", sector: "Tecnología" },
  { ticker: "GOOGL", name: "Alphabet", sector: "Tecnología" },
  { ticker: "NVDA", name: "NVIDIA", sector: "Tecnología" },
  { ticker: "AMZN", name: "Amazon", sector: "Consumo" },
  { ticker: "TSLA", name: "Tesla", sector: "Automoción" },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Salud" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Finanzas" },
];

interface StockScore {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  score: number;
  tecnico: number;
  fundamental: number;
  sentimiento: number;
  resumen: string;
  riesgo: "bajo" | "medio" | "alto";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function InvestPage() {
  const [scores, setScores] = useState<StockScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StockScore | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hola! Soy tu asistente financiero. Puedo explicarte cualquier acción, el AI Score, o ayudarte a entender cómo funciona el mercado. ¿Qué quieres saber?" },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const loadScores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scores");
      if (!res.ok) throw new Error();
      const results = await res.json() as StockScore[];
      setScores(results);
      if (!selected) setSelected(results[0] ?? null);
    } catch {
      setScores(TICKERS.slice(0, 6).map((t) => ({
        ...t,
        price: 0,
        change: 0,
        changePercent: 0,
        score: 5,
        tecnico: 5,
        fundamental: 5,
        sentimiento: 5,
        resumen: "No se pudo cargar el análisis.",
        riesgo: "medio" as const,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { loadScores(); }, []);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, selectedStock: selected }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Lo siento, hubo un error. Intenta de nuevo." }]);
    }
    setChatLoading(false);
  };

  const scoreColor = (s: number) =>
    s >= 7 ? "var(--accent-green)" : s >= 4 ? "var(--accent-gold)" : "var(--accent-red)";

  const scoreBadge = (s: number) =>
    s >= 7 ? "badge-green" : s >= 4 ? "badge-gold" : "badge-red";

  const CHIPS = ["¿Qué es el P/E ratio?", "¿Cómo diversifico $500?", "¿Qué significa un score de 8?", "¿Es buen momento para invertir?"];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pb-20 lg:pb-0" style={{ maxHeight: "100vh", overflow: "hidden" }}>
      {/* Left: scores list */}
      <div className="w-full lg:w-80 shrink-0 overflow-y-auto py-6 px-4" style={{ borderRight: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "var(--text-primary)" }}>
            Radar de acciones
          </h2>
          <button className="btn-ghost" style={{ padding: "6px 10px" }} onClick={loadScores}>
            <RefreshCw size={14} />
          </button>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
          Score 0-10 generado por IA analizando datos de mercado reales. No es consejo de inversión.
        </p>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse" style={{ height: 80 }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {scores.map((s) => (
              <button
                key={s.ticker}
                onClick={() => setSelected(s)}
                className="card p-4 text-left w-full transition-all duration-200"
                style={{
                  border: selected?.ticker === s.ticker ? `1px solid var(--accent-purple)` : "1px solid var(--border)",
                  background: selected?.ticker === s.ticker ? "rgba(108,99,255,0.05)" : "var(--bg-card)",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{s.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>{s.ticker} · {s.sector}</p>
                  </div>
                  <span className={scoreBadge(s.score)} style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.score}/10
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    ${s.price.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 12, color: s.changePercent >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                  </span>
                  {s.changePercent >= 0 ? <TrendingUp size={12} style={{ color: "var(--accent-green)" }} /> : <TrendingDown size={12} style={{ color: "var(--accent-red)" }} />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center: detail */}
      <div className="flex-1 overflow-y-auto py-6 px-6" style={{ borderRight: "1px solid var(--border)" }}>
        {selected && (
          <div className="max-w-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  {selected.name}
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {selected.ticker} · {selected.sector}
                </p>
              </div>
              <div className="text-right">
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 500, color: "var(--text-primary)" }}>
                  ${selected.price.toFixed(2)}
                </p>
                <p style={{ fontSize: 14, color: selected.changePercent >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {selected.changePercent >= 0 ? "+" : ""}{selected.changePercent.toFixed(2)}% hoy
                </p>
              </div>
            </div>

            {/* Score arc */}
            <div className="card p-6 mb-4">
              <div className="flex items-center gap-6 mb-5">
                <div className="relative flex items-center justify-center" style={{ width: 90, height: 90 }}>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="38" fill="none" stroke="var(--bg-surface)" strokeWidth="8" />
                    <circle
                      cx="45" cy="45" r="38"
                      fill="none"
                      stroke={scoreColor(selected.score)}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(selected.score / 10) * 239} 239`}
                      transform="rotate(-90 45 45)"
                      style={{ transition: "stroke-dasharray 800ms ease-out" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", textAlign: "center" }}>
                    <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: scoreColor(selected.score), lineHeight: 1 }}>
                      {selected.score}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--text-secondary)" }}>/10</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)", marginBottom: 10 }}>
                    {selected.resumen}
                  </p>
                  <span className={`${selected.riesgo === "bajo" ? "badge-green" : selected.riesgo === "medio" ? "badge-gold" : "badge-red"}`}>
                    Riesgo {selected.riesgo}
                  </span>
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="flex flex-col gap-3">
                {[
                  { label: "Técnico", value: selected.tecnico },
                  { label: "Fundamental", value: selected.fundamental },
                  { label: "Sentimiento", value: selected.sentimiento },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", width: 90, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 5, background: "var(--bg-surface)", borderRadius: 3 }}>
                      <div style={{
                        height: 5,
                        borderRadius: 3,
                        background: scoreColor(value),
                        width: `${value * 10}%`,
                        transition: "width 600ms ease-out",
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", width: 20, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danelfin link */}
            <a
              href={`https://danelfin.com/stock/${selected.ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost w-full justify-center mb-4"
              style={{ display: "flex", textDecoration: "none" }}
            >
              <ExternalLink size={14} /> Ver análisis completo en Danelfin
            </a>

            <button
              className="btn-ghost w-full justify-center"
              onClick={() => sendMessage(`¿Por qué ${selected.name} tiene un AI Score de ${selected.score}?`)}
              style={{ display: "flex" }}
            >
              <MessageCircle size={14} /> Preguntarle al asistente
            </button>

            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 16, lineHeight: 1.6, textAlign: "center" }}>
              Score generado por IA con datos de Yahoo Finance. No es consejo financiero. Investiga siempre antes de invertir.
            </p>
          </div>
        )}
      </div>

      {/* Right: chat */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col" style={{ height: "100vh" }}>
        <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Asistente Finicia</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="rounded-xl px-4 py-3 max-w-xs text-sm"
                style={{
                  background: m.role === "user" ? "var(--accent-purple)" : "var(--bg-surface)",
                  color: "var(--text-primary)",
                  lineHeight: 1.6,
                  fontSize: 13,
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-3" style={{ background: "var(--bg-surface)" }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-secondary)", animation: `pulse-dot 1s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {CHIPS.map((c) => (
              <button key={c} onClick={() => sendMessage(c)} className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Pregunta lo que sea..."
              style={{ flex: 1 }}
            />
            <button className="btn-primary" style={{ padding: "10px 14px" }} onClick={() => sendMessage()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
