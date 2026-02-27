"use client";

import { createContext, useContext, useState } from "react";

export type Goal = {
  id: number;
  title: string;
  frequency: "Daily" | "Weekly";
  completed: boolean;
};

type GoalContextType = {
  goals: Goal[];
  addGoal: (title: string, frequency: "Daily" | "Weekly") => void;
  toggleGoal: (id: number) => void;
};

const GoalContext = createContext<GoalContextType | undefined>(
  undefined
);

export function GoalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: "30 min walk",
      frequency: "Daily",
      completed: false,
    },
  ]);

  const addGoal = (
    title: string,
    frequency: "Daily" | "Weekly"
  ) => {
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        frequency,
        completed: false,
      },
    ]);
  };

  const toggleGoal = (id: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  };

  return (
    <GoalContext.Provider
      value={{ goals, addGoal, toggleGoal }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error("useGoals must be used inside GoalProvider");
  }
  return context;
}
