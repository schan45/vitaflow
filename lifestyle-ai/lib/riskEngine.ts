export type RiskLevel = "low" | "moderate" | "high";

export function deriveRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 35) return "moderate";
  return "low";
}
