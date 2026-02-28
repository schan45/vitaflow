export type AdaptiveInput = {
  consistencyScore: number;
  currentDifficulty: number;
};

export function computeAdaptiveDifficulty(input: AdaptiveInput): number {
  const next = input.currentDifficulty + (input.consistencyScore >= 0.7 ? 1 : -1);
  return Math.max(1, Math.min(10, next));
}
