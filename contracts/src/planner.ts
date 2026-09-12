import { PHASE_TYPES, type PhaseType } from "./index.js";

const intentKeywords: Readonly<Record<PhaseType, readonly string[]>> = {
  UNDERSTAND: ["explicação", "explicar", "compreender", "material", "teoria"],
  MEASURE: ["experiência", "experimento", "medir", "prática", "pratico"],
  ANALYSE: ["analisar", "análise", "gráfico", "dados", "calcular"],
  REFLECT: ["reflexão", "refletir", "reflectir", "exit ticket"]
};

export function planIntent(intent: string): PhaseType[] {
  const normalized = intent.trim().toLocaleLowerCase("pt-PT");
  const phases = PHASE_TYPES.filter((phase) => intentKeywords[phase].some((keyword) => normalized.includes(keyword)));
  return phases.length > 0 ? phases : ["UNDERSTAND"];
}

