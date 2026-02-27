"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { useGoals } from "@/context/GoalContext";

export default function Onboarding() {
  const router = useRouter();
  const { login } = useAuth();
  const { data, update } = useOnboarding();
  const { goals, addGoal } = useGoals();
  const [step, setStep] = useState(1);

  const finish = () => {
    login();
    router.replace("/");
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const getSuggestions = () => {
    const s: { title: string; frequency: "Daily" | "Weekly" }[] = [];
    const steps = Number(data.dailySteps);
    const stress = Number(data.stressLevel);
    const readiness = Number(data.readiness);

    if (!isNaN(steps) && steps < 5000) {
      s.push({ title: "Walk 30 minutes (aim ~5k steps)", frequency: "Daily" });
    }

    if (data.sugaryFood && data.sugaryFood.toLowerCase().includes("often")) {
      s.push({ title: "Limit sugary snacks to twice a week", frequency: "Weekly" });
    }

    if (!isNaN(stress) && stress >= 7) {
      s.push({ title: "10 minutes mindfulness / breathing", frequency: "Daily" });
    }

    if (!isNaN(readiness) && readiness >= 7) {
      s.push({ title: "Start light home exercise (3x week)", frequency: "Weekly" });
    }

    if (s.length === 0) {
      s.push({ title: "30 min walk", frequency: "Daily" });
      s.push({ title: "Eat 2 veg servings per day", frequency: "Daily" });
    }

    return s;
  };

  const suggestions = getSuggestions();
  const isAdded = (title: string) => goals.some((g) => g.title === title);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-sm space-y-6">
        <div className="text-sm text-slate-400">
          Step {step} of 5
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">
              I. Medical Context
            </h1>

            <input
              placeholder="Diagnosis"
              className="w-full p-3 rounded-xl bg-slate-700"
              onChange={(e) =>
                update({ diagnosis: e.target.value })
              }
            />

            <input
              placeholder="Diagnosis date (year/month)"
              className="w-full p-3 rounded-xl bg-slate-700"
              onChange={(e) =>
                update({ diagnosisDate: e.target.value })
              }
            />

            <input
              placeholder="Current medication"
              className="w-full p-3 rounded-xl bg-slate-700"
              onChange={(e) =>
                update({ medication: e.target.value })
              }
            />

            <input
              placeholder="Doctor restrictions"
              className="w-full p-3 rounded-xl bg-slate-700"
              onChange={(e) =>
                update({ doctorRestrictions: e.target.value })
              }
            />

            <input
              placeholder="Allergies / intolerances"
              className="w-full p-3 rounded-xl bg-slate-700"
              onChange={(e) =>
                update({ allergies: e.target.value })
              }
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">
              II. Baseline
            </h1>
            <p className="text-sm text-slate-400">
              (Coming soon)
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">
              III. Lifestyle
            </h1>
            <input
              placeholder="Daily steps"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.dailySteps || ""}
              onChange={(e) => update({ dailySteps: e.target.value })}
            />

            <input
              placeholder="Exercise type"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.exerciseType || ""}
              onChange={(e) => update({ exerciseType: e.target.value })}
            />

            <input
              placeholder="Meals per day"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.mealsPerDay || ""}
              onChange={(e) => update({ mealsPerDay: e.target.value })}
            />

            <input
              placeholder="Processed food frequency"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.processedFood || ""}
              onChange={(e) => update({ processedFood: e.target.value })}
            />

            <input
              placeholder="Sugary food frequency"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.sugaryFood || ""}
              onChange={(e) => update({ sugaryFood: e.target.value })}
            />

            <input
              placeholder="Stress level (1-10)"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.stressLevel || ""}
              onChange={(e) => update({ stressLevel: e.target.value })}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">
              IV. Motivation
            </h1>

            <input
              placeholder="Main reason for change"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.mainReason || ""}
              onChange={(e) => update({ mainReason: e.target.value })}
            />

            <input
              placeholder="Previous attempts"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.previousAttempts || ""}
              onChange={(e) => update({ previousAttempts: e.target.value })}
            />

            <input
              placeholder="Relapse reason"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.relapseReason || ""}
              onChange={(e) => update({ relapseReason: e.target.value })}
            />

            <input
              placeholder="Preferred change style"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.changeStyle || ""}
              onChange={(e) => update({ changeStyle: e.target.value })}
            />

            <input
              placeholder="Reminders (e.g., SMS, app)"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.reminders || ""}
              onChange={(e) => update({ reminders: e.target.value })}
            />

            <input
              placeholder="Readiness (1-10)"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.readiness || ""}
              onChange={(e) => update({ readiness: e.target.value })}
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">
              V. Practical
            </h1>
            <input
              placeholder="Work type"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.workType || ""}
              onChange={(e) => update({ workType: e.target.value })}
            />

            <input
              placeholder="Available time per day (minutes)"
              className="w-full p-3 rounded-xl bg-slate-700"
              value={data.availableTime || ""}
              onChange={(e) => update({ availableTime: e.target.value })}
            />

            <p className="text-sm text-slate-400">Review and finish</p>
          </div>
        )}

        {/* Suggested goals based on onboarding answers */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Suggested goals</h2>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.title}
                className="flex items-center justify-between bg-slate-700 p-3 rounded-xl"
              >
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-slate-400">{s.frequency}</div>
                </div>

                <div>
                  <button
                    onClick={() => addGoal(s.title, s.frequency)}
                    disabled={isAdded(s.title)}
                    className="bg-blue-600 px-3 py-2 rounded-xl"
                  >
                    {isAdded(s.title) ? "Added" : "Add"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => router.push("/chat?mode=goal")}
              className="w-full bg-slate-600 p-3 rounded-xl"
            >
              Set new goal with chat
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex-1 bg-slate-700 p-3 rounded-xl disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 p-3 rounded-xl"
          >
            {step === 5 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
