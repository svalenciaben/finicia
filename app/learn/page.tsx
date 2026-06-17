"use client";
import { useState, useEffect } from "react";
import { CheckCircle, Lock, Circle, Star, Flame, ChevronRight } from "lucide-react";
import LessonView from "@/components/LessonView";

const MODULES = [
  {
    title: "Módulo 1 — Fundamentos",
    lessons: [
      { id: 1, title: "¿Por qué invertir y no solo ahorrar?", minutes: 3 },
      { id: 2, title: "¿Qué es una acción?", minutes: 3 },
      { id: 3, title: "¿Qué es un ETF?", minutes: 4 },
      { id: 4, title: "El interés compuesto — la 8ª maravilla", minutes: 4 },
      { id: 5, title: "Riesgo: tu aliado si lo entiendes", minutes: 3 },
      { id: 6, title: "Tu primer portafolio en papel", minutes: 5 },
    ],
  },
  {
    title: "Módulo 2 — Análisis",
    lessons: [
      { id: 7, title: "Cómo leer un gráfico de precios", minutes: 4 },
      { id: 8, title: "P/E ratio en palabras normales", minutes: 3 },
      { id: 9, title: "Dividendos: que te paguen por tener acciones", minutes: 3 },
      { id: 10, title: "Cómo interpretar un AI Score", minutes: 3 },
    ],
  },
  {
    title: "Módulo 3 — Práctica",
    lessons: [
      { id: 11, title: "Analizar una acción real paso a paso", minutes: 5 },
      { id: 12, title: "Diversificación: no pongas todos los huevos...", minutes: 4 },
      { id: 13, title: "Estrategia de largo plazo vs. trading", minutes: 4 },
      { id: 14, title: "Rebalancear tu portafolio", minutes: 4 },
    ],
  },
];

export default function LearnPage() {
  const [completed, setCompleted] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("finicia_completed");
      return saved ? new Set<number>(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [activeLesson, setActiveLesson] = useState<number | null>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const saved = localStorage.getItem("finicia_active");
      return saved ? parseInt(saved) : 1;
    } catch { return 1; }
  });

  useEffect(() => {
    localStorage.setItem("finicia_completed", JSON.stringify([...completed]));
  }, [completed]);

  useEffect(() => {
    if (activeLesson !== null) localStorage.setItem("finicia_active", String(activeLesson));
  }, [activeLesson]);
  const totalXp = completed.size * 50;
  const streak = 1;

  const isUnlocked = (lessonId: number) => {
    if (lessonId === 1) return true;
    return completed.has(lessonId - 1);
  };

  const handleComplete = (id: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    const flat = MODULES.flatMap((m) => m.lessons);
    const idx = flat.findIndex((l) => l.id === id);
    if (idx < flat.length - 1) setActiveLesson(flat[idx + 1].id);
  };

  const activeLesson_ = MODULES.flatMap((m) => m.lessons).find((l) => l.id === activeLesson) ?? null;

  return (
    <div className="flex h-screen md:h-auto min-h-screen flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar */}
      <aside
        className="w-full md:w-72 shrink-0 overflow-y-auto py-6 px-4"
        style={{ borderRight: "1px solid var(--border)", background: "var(--bg-card)" }}
      >
        {/* XP row */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="flex items-center gap-1.5">
            <Star size={15} style={{ color: "var(--accent-gold)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--accent-gold)", fontWeight: 500 }}>
              {totalXp} XP
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame size={15} style={{ color: "var(--accent-red)" }} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{streak} día{streak > 1 ? "s" : ""}</span>
          </div>
          <div className="ml-auto badge-purple text-xs">
            {completed.size === 0 ? "Curioso" : completed.size < 4 ? "Aprendiz" : completed.size < 8 ? "Inversor" : "Estratega"}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 px-1">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
            <span>Progreso total</span>
            <span>{completed.size} / {MODULES.flatMap(m => m.lessons).length}</span>
          </div>
          <div style={{ height: 4, background: "var(--bg-surface)", borderRadius: 2 }}>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "var(--accent-purple)",
                width: `${(completed.size / 14) * 100}%`,
                transition: "width 400ms ease-out",
              }}
            />
          </div>
        </div>

        {/* Modules */}
        {MODULES.map((mod, mi) => (
          <div key={mi} className="mb-6">
            <p style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, paddingLeft: 4 }}>
              {mod.title}
            </p>
            <div className="flex flex-col gap-1">
              {mod.lessons.map((lesson) => {
                const done = completed.has(lesson.id);
                const unlocked = isUnlocked(lesson.id);
                const active = activeLesson === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => unlocked && setActiveLesson(lesson.id)}
                    disabled={!unlocked}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-all duration-200"
                    style={{
                      background: active ? "var(--bg-surface)" : "transparent",
                      borderLeft: active ? "2px solid var(--accent-purple)" : "2px solid transparent",
                      opacity: unlocked ? 1 : 0.4,
                      cursor: unlocked ? "pointer" : "default",
                    }}
                  >
                    {done ? (
                      <CheckCircle size={16} style={{ color: "var(--accent-green)", flexShrink: 0 }} />
                    ) : !unlocked ? (
                      <Lock size={16} style={{ color: "var(--text-secondary)" }} />
                    ) : (
                      <Circle size={16} style={{ color: active ? "var(--accent-purple)" : "var(--text-secondary)" }} />
                    )}
                    <span style={{
                      fontSize: 13,
                      color: active ? "var(--text-primary)" : done ? "var(--text-secondary)" : "var(--text-secondary)",
                      fontWeight: active ? 500 : 400,
                      lineHeight: 1.4,
                    }}>
                      {lesson.title}
                    </span>
                    <span className="ml-auto text-xs shrink-0" style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {lesson.minutes}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </aside>

      {/* Lesson content */}
      <div className="flex-1 overflow-y-auto">
        {activeLesson_ ? (
          <LessonView
            key={activeLesson_!.id}
            lesson={activeLesson_}
            completed={completed.has(activeLesson_!.id)}
            onComplete={() => handleComplete(activeLesson_!.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: "var(--text-secondary)" }}>
            Selecciona una lección para comenzar
          </div>
        )}
      </div>
    </div>
  );
}
