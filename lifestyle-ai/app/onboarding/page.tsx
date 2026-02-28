"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";

export default function Onboarding() {
  const router = useRouter();
  const { data, update, replaceAll } = useOnboarding();
  const { isAuthenticated, accessToken } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoadedFromDb, setIsLoadedFromDb] = useState(false);

  const finish = async () => {
    if (isAuthenticated && accessToken) {
      await fetch("/api/onboarding-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          onboarding: data,
          completed: true,
        }),
      });
    }

    router.push("/");
  };

  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!isAuthenticated || !accessToken) {
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
          replaceAll(response.onboarding);
        }
      } catch {
        // keep in-memory onboarding if load fails
      } finally {
        setIsLoadedFromDb(true);
      }
    };

    void loadOnboardingData();
  }, [isAuthenticated, accessToken, replaceAll]);

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

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-lg space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
        <div className="text-sm text-slate-400">
          Step {step} of 5
        </div>

        {step === 1 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                🩺 <span>Medical Context</span>
              </h1>
              <p className="text-sm text-slate-400">
                Understanding your health background
              </p>
            </div>

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
          <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                📊 <span>Baseline</span>
              </h1>
              <p className="text-sm text-slate-400">
                Your current health snapshot
              </p>
            </div>

            <input
              placeholder="Age"
              type="number"
              className="w-full p-3 rounded-xl bg-slate-700"
              onChange={(e) =>
                update({ age: e.target.value })
              }
            />

            <div className="space-y-2">
              <p className="font-medium">Gender</p>
              <div className="flex gap-2">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    onClick={() => update({ gender: g })}
                    className="flex-1 p-2 rounded-xl bg-slate-700 hover:bg-blue-600 transition"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <input
              placeholder="Weight (kg)"
              type="number"
              className="w-full p-3 rounded-xl bg-slate-700"
              onChange={(e) =>
                update({ weight: e.target.value })
              }
            />

            <input
              placeholder="Height (cm)"
              type="number"
              className="w-full p-3 rounded-xl bg-slate-700"
              onChange={(e) =>
                update({ height: e.target.value })
              }
            />

            <input
              placeholder="Sleep Hours (avg per night)"
              type="number"
              step="0.5"
              className="w-full p-3 rounded-xl bg-slate-700"
              onChange={(e) =>
                update({ sleepHours: e.target.value })
              }
            />
          </div>
        )}

        {step === 3 && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-3xl p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                🏃‍♂️ <span>Lifestyle</span>
              </h1>
              <p className="text-sm text-slate-400">
                Your daily habits & routines
              </p>
            </div>
            
            {/* Weekly Exercise Selection */}
            <div className="space-y-3">
              <p className="font-medium">How often do you exercise?</p>
              {[
                "Almost never",
                "1-2 times / week",
                "3-4 times / week",
                "5+ times / week",
              ].map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    update({ weeklyExercise: option })
                  }
                  className={`w-full p-3 rounded-2xl border transition ${
                    data.weeklyExercise === option
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-slate-700/50 border-slate-600"
                  }`}
                >
                  {data.weeklyExercise === option && "✔ "} {option}
                </button>
              ))}
            </div>
            
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
          <div className="bg-pink-500/10 border border-pink-500/20 rounded-3xl p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                🔥 <span>Motivation</span>
              </h1>
              <p className="text-sm text-slate-400">
                Your goals & readiness
              </p>
            </div>

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
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                🧩 <span>Practical</span>
              </h1>
              <p className="text-sm text-slate-400">
                Time & availability
              </p>
            </div>
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

        {/* Skip suggested goals section */}

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
