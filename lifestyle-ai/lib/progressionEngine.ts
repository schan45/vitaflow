export type ProgressionState = {
  completedDays: number;
  streakDays: number;
};

export function calculateProgression(state: ProgressionState): number {
  const score = state.completedDays * 2 + state.streakDays * 3;
  return Math.max(0, Math.min(100, score));
}
