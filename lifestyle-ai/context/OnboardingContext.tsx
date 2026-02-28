"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export type OnboardingData = {
  // I. Medical
  diagnosis?: string;
  diagnosisDate?: string;
  medication?: string;
  doctorRestrictions?: string;
  allergies?: string;

  // II. Baseline
  age?: string;
  gender?: string;
  weight?: string;
  height?: string;
  sleepHours?: string;
  weeklyExercise?: string;

  // III. Lifestyle
  dailySteps?: string;
  exerciseType?: string;
  mealsPerDay?: string;
  processedFood?: string;
  sugaryFood?: string;
  stressLevel?: string;

  // IV. Motivation
  mainReason?: string;
  previousAttempts?: string;
  relapseReason?: string;
  changeStyle?: string;
  reminders?: string;
  readiness?: string;

  // V. Practical
  workType?: string;
  availableTime?: string;
};

type ContextType = {
  data: OnboardingData;
  update: (values: Partial<OnboardingData>) => void;
  replaceAll: (values: OnboardingData) => void;
};

const OnboardingContext = createContext<ContextType | undefined>(
  undefined
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, accessToken, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<OnboardingData>({});
  const [isLoadedFromDb, setIsLoadedFromDb] = useState(false);

  const update = useCallback((values: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...values }));
  }, []);

  const replaceAll = useCallback((values: OnboardingData) => {
    setData(values);
  }, []);

  useEffect(() => {
    const loadOnboardingData = async () => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !accessToken) {
        setData({});
        setIsLoadedFromDb(true);
        return;
      }

      try {
        const res = await fetch("/api/onboarding-data", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          setIsLoadedFromDb(true);
          return;
        }

        const response = (await res.json()) as {
          onboarding?: Record<string, string>;
        };

        if (response.onboarding && Object.keys(response.onboarding).length > 0) {
          setData(response.onboarding);
        } else {
          setData({});
        }
      } catch {
        // keep empty state if load fails
      } finally {
        setIsLoadedFromDb(true);
      }
    };

    void loadOnboardingData();
  }, [isAuthenticated, accessToken, authLoading]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !isLoadedFromDb) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetch("/api/onboarding-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          onboarding: data,
          completed: false,
        }),
      });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [data, isAuthenticated, accessToken, isLoadedFromDb]);

  return (
    <OnboardingContext.Provider value={{ data, update, replaceAll }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("Use inside provider");
  return context;
}
