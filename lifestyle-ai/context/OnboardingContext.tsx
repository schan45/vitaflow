"use client";

import { createContext, useContext, useState } from "react";

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
};

const OnboardingContext = createContext<ContextType | undefined>(
  undefined
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<OnboardingData>({});

  const update = (values: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...values }));
  };

  return (
    <OnboardingContext.Provider value={{ data, update }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("Use inside provider");
  return context;
}
