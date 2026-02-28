import { runAiPrompt } from "@/services/aiServices";

export async function runOnboardingAnalysis(symptoms: string): Promise<string> {
  return runAiPrompt(`Analyze these symptoms and provide a concise triage summary: ${symptoms}`);
}
