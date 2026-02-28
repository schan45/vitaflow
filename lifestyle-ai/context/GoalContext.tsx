"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export type Goal = {
  id: number;
  title: string;
  frequency: "Daily" | "Weekly";
  completed: boolean;
};

type GoalContextType = {
  goals: Goal[];
  addGoal: (title: string, frequency: "Daily" | "Weekly") => void;
  addGoalsBulk: (items: Array<{ title: string; frequency: "Daily" | "Weekly" }>) => void;
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
  const { isAuthenticated, accessToken, isLoading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadedFromDb, setIsLoadedFromDb] = useState(false);

  useEffect(() => {
    const loadGoals = async () => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !accessToken) {
        setGoals([]);
        setIsLoadedFromDb(true);
        return;
      }

      try {
        const res = await fetch("/api/goals-data", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          setIsLoadedFromDb(true);
          return;
        }

        const data = (await res.json()) as { goals?: Goal[] };
        setGoals(Array.isArray(data.goals) ? data.goals : []);
      } catch {
        setGoals([]);
      } finally {
        setIsLoadedFromDb(true);
      }
    };

    void loadGoals();
  }, [isAuthenticated, accessToken, authLoading]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !isLoadedFromDb) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetch("/api/goals-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ goals }),
      });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [goals, isAuthenticated, accessToken, isLoadedFromDb]);

  const addGoal = useCallback((
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
  }, []);

  const addGoalsBulk = useCallback((items: Array<{ title: string; frequency: "Daily" | "Weekly" }>) => {
    const normalized = items
      .map((item) => ({
        title: item.title.trim(),
        frequency: item.frequency,
      }))
      .filter((item) => item.title.length > 0);

    if (normalized.length === 0) {
      return;
    }

    setGoals((prev) => {
      const titleSet = new Set(prev.map((goal) => goal.title.toLowerCase()));
      const newItems = normalized
        .filter((item) => !titleSet.has(item.title.toLowerCase()))
        .map((item, index) => ({
          id: Date.now() + index,
          title: item.title,
          frequency: item.frequency,
          completed: false,
        }));

      return [...prev, ...newItems];
    });
  }, []);

  const toggleGoal = useCallback((id: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  }, []);

  return (
    <GoalContext.Provider
      value={{ goals, addGoal, addGoalsBulk, toggleGoal }}
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
