import type { CategoryProgress } from "./aggregate";

export type InsightTone = "info" | "warning" | "success";

export type Insight = {
  id: string;
  tone: InsightTone;
  message: string;
};

/** Considerado "quase lá" quando falta <= 15% da meta da categoria. */
const NEAR_COMPLETION_RATIO = 0.15;

/**
 * Gera os insights concretos do Dashboard a partir do progresso por
 * categoria (ex.: "Faltam X horas em Extensão — considere certificados de
 * Y", aviso de quase-conclusão). O alerta de "ultrapassar o limite da
 * categoria" descrito no MD acontece no momento do upload do certificado,
 * não aqui no Dashboard — fica para a etapa de "Certificados".
 */
export function getInsights(progress: CategoryProgress[]): Insight[] {
  const insights: Insight[] = [];

  for (const category of progress) {
    if (category.remainingHours === 0) {
      insights.push({
        id: `${category.key}-completo`,
        tone: "success",
        message: `Você completou a categoria ${category.label}! 🎉`,
      });
      continue;
    }

    const suggestion = category.suggestions.join(", ");
    insights.push({
      id: `${category.key}-faltam`,
      tone: "info",
      message: `Faltam ${category.remainingHours}h em ${category.label} — considere certificados de ${suggestion}.`,
    });

    const isNearCompletion =
      category.remainingHours <= category.requiredHours * NEAR_COMPLETION_RATIO;
    if (isNearCompletion) {
      insights.push({
        id: `${category.key}-quase-la`,
        tone: "warning",
        message: `Você está quase completando ${category.label}: faltam só ${category.remainingHours}h!`,
      });
    }
  }

  return insights;
}
