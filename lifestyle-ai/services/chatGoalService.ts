import { resolveGoalState } from "@/lib/goalStateEngine";

export function summarizeGoalProgress(progressPercent: number): string {
  const state = resolveGoalState(progressPercent);

  if (state === "completed") {
    return "Great work, your goal is completed.";
  }

  if (state === "in-progress") {
    return "You are making progress. Keep going.";
  }

  return "Let us start with one small step today.";
}
