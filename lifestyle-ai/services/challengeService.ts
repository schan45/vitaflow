export type Challenge = {
  id: string;
  title: string;
  difficulty: number;
};

export function pickDailyChallenge(challenges: Challenge[]): Challenge | null {
  if (challenges.length === 0) return null;
  return [...challenges].sort((a, b) => a.difficulty - b.difficulty)[0];
}
