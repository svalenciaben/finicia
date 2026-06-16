import Link from "next/link";
import { BookOpen, BarChart2, TrendingUp, Zap, Shield, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-12 md:px-12 md:py-16 pb-24 md:pb-16">
      {/* Hero */}
      <div className="max-w-2xl mb-16 animate-fade-in-up">
        <div className="badge-purple mb-6 inline-block">Gratis · Sin experiencia previa</div>
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(40px, 6vw, 64px)",
            lineHeight: 1.1,
            color: "var(--text-primary)",
            marginBottom: 20,
          }}
        >
          Aprende a invertir{" "}
          <span style={{ color: "var(--accent-green)" }}>desde cero.</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32 }}>
          Finicia te explica paso a paso qué es invertir, dónde poner tu dinero y
          por qué — usando IA para que lo entiendas en tu idioma, con tu contexto.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/learn" className="btn-primary" style={{ fontSize: 15, padding: "12px 24px" }}>
            <BookOpen size={16} /> Empezar a aprender
          </Link>
          <Link href="/invest" className="btn-ghost" style={{ fontSize: 15, padding: "12px 24px" }}>
            <BarChart2 size={16} /> Ver el radar de acciones
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 max-w-3xl">
        {[
          {
            icon: Brain,
            color: "var(--accent-purple)",
            title: "Personalizado por IA",
            desc: "Claude adapta cada explicación a tu edad, intereses y nivel — sin jerga financiera.",
          },
          {
            icon: TrendingUp,
            color: "var(--accent-green)",
            title: "Score de acciones real",
            desc: "Datos de Yahoo Finance + análisis de IA. Score 0-10 con explicación en español.",
          },
          {
            icon: Shield,
            color: "var(--accent-gold)",
            title: "Paper trading seguro",
            desc: "Practica con dinero simulado. Sin riesgo real hasta que tú decidas invertir de verdad.",
          },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="card p-5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
              style={{ background: `${color}20`, border: `1px solid ${color}30` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: "var(--text-primary)" }}>
              {title}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Path preview */}
      <div className="max-w-3xl">
        <p style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Tu camino de aprendizaje
        </p>
        <div className="card p-6">
          <div className="flex flex-col gap-4">
            {[
              { step: "01", label: "¿Por qué invertir y no solo ahorrar?", status: "start" },
              { step: "02", label: "¿Qué es una acción?", status: "locked" },
              { step: "03", label: "¿Qué es un ETF?", status: "locked" },
              { step: "04", label: "El interés compuesto — la 8ª maravilla", status: "locked" },
              { step: "05", label: "Riesgo: tu aliado si lo entiendes", status: "locked" },
              { step: "06", label: "Tu primer portafolio en papel → desbloquea Inversiones", status: "locked" },
            ].map(({ step, label, status }, i) => (
              <div key={step} className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background: status === "start" ? "rgba(108,99,255,0.2)" : "var(--bg-surface)",
                    color: status === "start" ? "var(--accent-purple)" : "var(--text-secondary)",
                    border: status === "start" ? "1px solid rgba(108,99,255,0.4)" : "1px solid var(--border)",
                  }}
                >
                  {step}
                </div>
                <span style={{ fontSize: 14, color: status === "start" ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  {label}
                </span>
                {status === "start" && (
                  <span className="badge-purple ml-auto">Empezar</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Link href="/learn" className="btn-primary w-full justify-center" style={{ display: "flex" }}>
              <Zap size={15} /> Comenzar lección 1
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
