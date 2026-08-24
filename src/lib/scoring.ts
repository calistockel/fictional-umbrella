export type ScoreBand = "excellent" | "strong" | "worth_investigating" | "low";

export function bandForScore(score: number): ScoreBand {
  if (score >= 85) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 55) return "worth_investigating";
  return "low";
}

export const bandLabel: Record<ScoreBand, string> = {
  excellent: "Excellent",
  strong: "Solide",
  worth_investigating: "À explorer",
  low: "Potentiel faible",
};

export const bandClasses: Record<ScoreBand, { text: string; bg: string; ring: string }> = {
  excellent: { text: "text-score-excellent", bg: "bg-score-excellent-bg", ring: "ring-score-excellent/20" },
  strong: { text: "text-score-strong", bg: "bg-score-strong-bg", ring: "ring-score-strong/20" },
  worth_investigating: { text: "text-score-moderate", bg: "bg-score-moderate-bg", ring: "ring-score-moderate/20" },
  low: { text: "text-score-low", bg: "bg-score-low-bg", ring: "ring-score-low/20" },
};

export function riskLabel(risk: "low" | "medium" | "high") {
  return { low: "Faible", medium: "Moyen", high: "Élevé" }[risk];
}

export function riskClasses(risk: "low" | "medium" | "high") {
  return {
    low: "text-risk-low bg-score-excellent-bg",
    medium: "text-risk-medium bg-score-moderate-bg",
    high: "text-risk-high bg-red-50",
  }[risk];
}

export function formatRange(range: [number, number], unit = "") {
  return `${range[0].toLocaleString("fr-BE")}–${range[1].toLocaleString("fr-BE")}${unit}`;
}
