export type GoalState = "not-started" | "in-progress" | "completed";

export function resolveGoalState(progressPercent: number): GoalState {
  if (progressPercent >= 100) return "completed";
  if (progressPercent > 0) return "in-progress";
  return "not-started";
}
