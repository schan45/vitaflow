import { deriveRiskLevel } from "@/lib/riskEngine";

export function shouldReferToDoctor(riskScore: number): boolean {
  const risk = deriveRiskLevel(riskScore);
  return risk === "high" || risk === "moderate";
}
