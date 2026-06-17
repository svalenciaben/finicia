"use client";
import { useState } from "react";
import { Lightbulb, CheckCircle, XCircle, ChevronRight, Star } from "lucide-react";

const LESSONS_DATA: Record<number, {
  concept: string;
  analogy: string;
  quiz: Array<{ q: string; options: string[]; correct: number; explanation: string }>;
}> = {
  1: {
    concept: "Cuando ahorras, tu dinero se queda quieto. Si hay inflación del 4% y tu banco te da 1%, estás perdiendo 3% de poder de compra cada año sin darte cuenta.\n\nInvertir es poner tu dinero a trabajar. En vez de que duerma en una cuenta, lo pones en empresas, fondos o activos que pueden crecer con la economía.\n\nNo se trata de hacerse rico rápido — se trata de que tu dinero no pierda valor mientras duermes.",
    analogy: "Imagina que tienes un árbol frutal. Ahorrar es cortar el árbol y guardar la madera. Invertir es regarlo, cuidarlo, y cada año te da más fruta sin que hagas nada extra.",
    quiz: [
      { q: "Si la inflación es 5% y tu cuenta bancaria da 1%, ¿qué pasa con tu dinero?", options: ["Crece un 1%", "Pierde poder de compra", "Se mantiene igual"], correct: 1, explanation: "Pierdes 4% de poder de compra real. Tus billetes dicen lo mismo, pero compran menos." },
      { q: "¿Cuál es el objetivo principal de invertir?", options: ["Hacerse rico en semanas", "Que tu dinero no pierda valor y crezca con el tiempo", "Guardar dinero en un lugar seguro"], correct: 1, explanation: "Invertir a largo plazo busca que tu dinero crezca más que la inflación." },
    ],
  },
  2: {
    concept: "Una acción es una pequeña parte de una empresa. Cuando Apple tiene millones de acciones y tú compras una, eres dueño de una fracción minúscula de Apple.\n\nSi Apple gana más dinero, crece, lanza productos exitosos — el valor de tu parte sube. Si les va mal, baja. Eso es el riesgo y la oportunidad al mismo tiempo.\n\nLas acciones se compran y venden en bolsa (como el NYSE o NASDAQ) todos los días de lunes a viernes.",
    analogy: "Una empresa es como una pizza enorme cortada en millones de rebanadas (acciones). Si compras una rebanada y la pizza crece — porque la receta mejoró o abrieron más locales — tu rebanada también vale más.",
    quiz: [
      { q: "¿Qué te convierte en dueño de una parte de una empresa?", options: ["Comprar sus productos", "Comprar sus acciones", "Trabajar ahí"], correct: 1, explanation: "Comprar acciones te da propiedad parcial real de la empresa." },
      { q: "¿Dónde se compran y venden las acciones?", options: ["En el banco directamente", "En la bolsa de valores", "En la empresa misma"], correct: 1, explanation: "La bolsa (NYSE, NASDAQ, etc.) es el mercado donde se intercambian acciones." },
    ],
  },
  3: {
    concept: "Un ETF (fondo cotizado en bolsa) es una canasta que contiene decenas o cientos de acciones a la vez. En vez de elegir una sola empresa, compras un poco de muchas.\n\nPor ejemplo, el ETF S&P 500 contiene las 500 empresas más grandes de EE.UU. Si el conjunto crece, tú ganas. Si una empresa fracasa, las otras 499 amortiguan el golpe.\n\nEs la forma más simple y efectiva de diversificar sin ser experto. Warren Buffett lo recomienda para la mayoría de inversores.",
    analogy: "Comprar acciones individuales es apostar por un jugador específico. Comprar un ETF es apostar por el equipo completo. Si el equipo gana, tú ganas — aunque algún jugador individual falle.",
    quiz: [
      { q: "¿Qué contiene un ETF?", options: ["Una sola acción muy segura", "Una canasta de muchas acciones", "Solo bonos del gobierno"], correct: 1, explanation: "Un ETF te da exposición a muchas empresas al mismo tiempo con una sola compra." },
      { q: "¿Por qué los ETF son buenos para principiantes?", options: ["Garantizan ganancias", "Diversifican el riesgo automáticamente", "No cobran comisiones"], correct: 1, explanation: "Al tener muchas empresas, el fracaso de una no destruye tu inversión." },
    ],
  },
  4: {
    concept: "El interés compuesto es ganar intereses sobre los intereses que ya ganaste. Al principio parece poco, pero con el tiempo se convierte en algo extraordinario.\n\nSi inviertes $1,000 al 7% anual: año 1 tienes $1,070. Año 2 el 7% es sobre $1,070, no sobre $1,000. Así sucesivamente. A los 30 años tienes $7,612 — sin hacer nada más.\n\nAlbert Einstein lo llamó 'la octava maravilla del mundo'. La clave es empezar temprano — cada año que esperas le cuesta más de lo que crees.",
    analogy: "Es como una bola de nieve cuesta abajo. Al principio es pequeña y lenta. Pero mientras más rueda, más nieve recoge, y más rápido crece. Los primeros metros son lentos; los últimos metros son explosivos.",
    quiz: [
      { q: "$1,000 al 7% anual por 30 años se convierte aproximadamente en:", options: ["$3,100", "$7,600", "$2,100"], correct: 1, explanation: "El interés compuesto multiplica tu dinero de forma no lineal — crece más rápido cada año." },
      { q: "¿Cuál es la variable más importante en el interés compuesto?", options: ["El porcentaje de retorno", "El tiempo que inviertes", "El banco que eliges"], correct: 1, explanation: "Empezar 10 años antes puede duplicar o triplicar el resultado final." },
    ],
  },
  5: {
    concept: "Riesgo en inversiones significa que el valor puede subir o bajar. No hay inversión sin riesgo — ni siquiera el efectivo bajo el colchón (ese tiene riesgo de inflación).\n\nLa clave es entender qué tipo de riesgo puedes tolerar emocionalmente. Si ver tu inversión caer 30% te haría venderlo todo en pánico, necesitas menos riesgo. Si puedes esperar, el tiempo suele compensar las caídas.\n\nDiversificar reduce el riesgo: no poner todo en una sola empresa o sector. Los ETF hacen esto automáticamente.",
    analogy: "El riesgo es como el clima. No puedes eliminarlo, pero puedes prepararte: paraguas (diversificación), ropa de abrigo (horizonte largo), y no salir en tormenta (no vender en pánico).",
    quiz: [
      { q: "¿Cómo se reduce el riesgo en una cartera?", options: ["Comprando solo acciones 'seguras'", "Diversificando entre diferentes activos", "Invirtiendo solo en bonos"], correct: 1, explanation: "La diversificación es la única forma probada de reducir riesgo sin sacrificar demasiado retorno." },
      { q: "¿Qué es el riesgo de la inflación?", options: ["Que las acciones bajen", "Que tu dinero pierda poder de compra", "Que el banco quiebre"], correct: 1, explanation: "Incluso sin invertir, tu dinero corre el riesgo de valer menos cada año por la inflación." },
    ],
  },
  6: {
    concept: "Un portafolio en papel es una cartera simulada donde practicas sin usar dinero real. Es la mejor forma de aprender sin arriesgar nada.\n\nEliges empresas o ETF, registras cuánto 'comprarías' y cuándo, y sigues cómo evoluciona. Aprenderás a manejar emociones cuando baje, a analizar antes de comprar, y a evaluar decisiones.\n\nEn Finicia puedes hacer esto en la sección Invertir. Una vez que te sientas cómodo, puedes pasar al dinero real con un broker como Interactive Brokers, eToro o Degiro.",
    analogy: "Es como el simulador de vuelo que usan los pilotos antes de volar aviones reales. Practican emergencias, aterrizajes difíciles, todo — sin riesgo. Tú practicas inversiones sin riesgo antes de usar dinero real.",
    quiz: [
      { q: "¿Cuál es el propósito principal de un portafolio en papel?", options: ["Ganar dinero real", "Practicar sin riesgo y aprender", "Demostrarle a otros tus habilidades"], correct: 1, explanation: "El paper trading te permite cometer errores y aprender de ellos sin consecuencias financieras." },
      { q: "Después de practicar en papel, ¿cuál sería un buen próximo paso?", options: ["Invertir todo tu ahorro de una vez", "Empezar con una cantidad pequeña que puedas perder sin problema", "Esperar 5 años más"], correct: 1, explanation: "Empezar con poco dinero real te da experiencia real con riesgo controlado." },
    ],
  },
};

const DEFAULT_LESSON = {
  concept: "Esta lección está en desarrollo. Completa las anteriores para desbloquearla.",
  analogy: "Cada lección que completas te acerca más a entender el mundo de las inversiones.",
  quiz: [
    { q: "¿Estás listo para seguir aprendiendo?", options: ["Sí, voy a completar las lecciones anteriores", "Sí"], correct: 0, explanation: "Completa las lecciones en orden para desbloquear esta." },
  ],
};

interface Props {
  lesson: { id: number; title: string; minutes: number };
  completed: boolean;
  onComplete: () => void;
}

// Steps: 0=concept, 1=analogy, 2..2+quiz.length-1=quiz questions, last=done
export default function LessonView({ lesson, completed, onComplete }: Props) {
  const data = LESSONS_DATA[lesson.id] ?? DEFAULT_LESSON;
  const STEP_CONCEPT = 0;
  const STEP_ANALOGY = 1;
  const STEP_QUIZ_START = 2;
  const totalSteps = STEP_QUIZ_START + data.quiz.length;

  const [step, setStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showXp, setShowXp] = useState(false);

  const currentQuizIdx = step - STEP_QUIZ_START;
  const isQuizStep = step >= STEP_QUIZ_START && step < totalSteps;
  const isDone = step >= totalSteps;
  const currentQ = isQuizStep ? data.quiz[currentQuizIdx] : null;
  const currentAnswered = currentQ !== null && quizAnswers[currentQuizIdx] !== undefined;

  const handleAnswer = (ai: number) => {
    if (quizAnswers[currentQuizIdx] !== undefined) return;
    setQuizAnswers((prev) => ({ ...prev, [currentQuizIdx]: ai }));
  };

  const goNext = () => setStep((s) => s + 1);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 pb-32 md:pb-10">
      {/* Header */}
      <div className="mb-10 relative">
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 96, color: "var(--accent-purple)", opacity: 0.08, position: "absolute", top: -20, left: -10, lineHeight: 1, userSelect: "none" }}>
          {String(lesson.id).padStart(2, "0")}
        </div>
        <div className="badge-purple mb-3 inline-block relative">Lección {lesson.id}</div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 4vw, 36px)", lineHeight: 1.2, color: "var(--text-primary)", marginBottom: 10, position: "relative" }}>
          {lesson.title}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {lesson.minutes} min de lectura · +50 XP al completar
        </p>
        {/* Progress dots */}
        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i <= step ? "var(--accent-purple)" : "var(--border)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Step 0 — Explicación */}
      {step === STEP_CONCEPT && (
        <div className="animate-fade-in-up">
          <div className="mb-8">
            {data.concept.split("\n\n").map((p, i) => (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.85, color: "var(--text-primary)", marginBottom: 16 }}>{p}</p>
            ))}
          </div>
          <button className="btn-primary" onClick={goNext}>
            Entendido, siguiente <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Step 1 — Analogía */}
      {step === STEP_ANALOGY && (
        <div className="animate-fade-in-up">
          <div className="mb-8 p-5 rounded-xl" style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid var(--accent-purple)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={15} style={{ color: "var(--accent-purple)" }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--accent-purple)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Analogía simple</span>
            </div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, lineHeight: 1.6, color: "var(--text-primary)" }}>{data.analogy}</p>
          </div>
          <button className="btn-primary" onClick={goNext}>
            Listo, ponme a prueba <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Quiz steps */}
      {isQuizStep && currentQ && (
        <div className="animate-fade-in-up">
          <p style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Pregunta {currentQuizIdx + 1} de {data.quiz.length}
          </p>
          <div className="card p-5 mb-4">
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", marginBottom: 14, lineHeight: 1.5 }}>{currentQ.q}</p>
            <div className="flex flex-col gap-2">
              {currentQ.options.map((opt, ai) => {
                const isSelected = quizAnswers[currentQuizIdx] === ai;
                const isCorrect = ai === currentQ.correct;
                let borderColor = "var(--border)";
                let bg = "transparent";
                let textColor = "var(--text-secondary)";
                if (currentAnswered && isSelected) {
                  if (isCorrect) { borderColor = "var(--accent-green)"; bg = "rgba(0,200,150,0.08)"; textColor = "var(--accent-green)"; }
                  else { borderColor = "var(--accent-red)"; bg = "rgba(255,77,106,0.08)"; textColor = "var(--accent-red)"; }
                }
                return (
                  <button
                    key={ai}
                    onClick={() => handleAnswer(ai)}
                    disabled={currentAnswered}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-all duration-200"
                    style={{ border: `1px solid ${borderColor}`, background: bg, color: textColor, cursor: currentAnswered ? "default" : "pointer" }}
                  >
                    {currentAnswered && isSelected && isCorrect && <CheckCircle size={15} style={{ color: "var(--accent-green)", flexShrink: 0 }} />}
                    {currentAnswered && isSelected && !isCorrect && <XCircle size={15} style={{ color: "var(--accent-red)", flexShrink: 0 }} />}
                    {!currentAnswered && <div style={{ width: 15, height: 15, borderRadius: "50%", border: "1px solid var(--border)", flexShrink: 0 }} />}
                    {opt}
                  </button>
                );
              })}
            </div>
            {currentAnswered && (
              <div className="mt-3 p-3 rounded-lg animate-fade-in-up" style={{ background: "var(--bg-surface)" }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{currentQ.explanation}</p>
              </div>
            )}
          </div>
          {currentAnswered && (
            <button className="btn-primary animate-fade-in-up" onClick={() => {
              const isLast = currentQuizIdx === data.quiz.length - 1;
              if (isLast) {
                if (!completed) {
                  setShowXp(true);
                  setTimeout(() => setShowXp(false), 1500);
                  onComplete();
                }
              }
              goNext();
            }}>
              {currentQuizIdx < data.quiz.length - 1 ? <>Siguiente pregunta <ChevronRight size={15} /></> : <>Ver resultado <ChevronRight size={15} /></>}
            </button>
          )}
        </div>
      )}

      {/* Completado */}
      {isDone && (
        <div className="card p-5 animate-fade-in-up relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} style={{ color: "var(--accent-green)" }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--accent-green)" }}>Lección completada · +50 XP</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
            Continúa con la siguiente lección para seguir tu camino.
          </p>
          <button className="btn-primary" onClick={onComplete}>
            Siguiente lección <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* XP float */}
      {showXp && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 40,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
            fontSize: 20,
            color: "var(--accent-gold)",
            animation: "xp-float 1.5s ease-out forwards",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          <Star size={16} style={{ display: "inline", marginRight: 4 }} />
          +50 XP
        </div>
      )}
    </div>
  );
}
