export type PlanStep = {
  id: string;
  title: string;
  completed: boolean;
};

export function processPlan(steps: PlanStep[]): PlanStep[] {
  return steps.map((step) => ({
    ...step,
    title: step.title.trim(),
  }));
}
