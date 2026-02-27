"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { useGoals } from "@/context/GoalContext";

export default function Profile() {
  const router = useRouter();
  const { logout } = useAuth();
  const { data } = useOnboarding();
  const { goals, toggleGoal } = useGoals();

  return (
    <div className="p-6 pb-28 space-y-8">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-slate-700/70 backdrop-blur-lg flex items-center justify-center">
          👤
        </div>

        <div>
          <h1 className="text-xl font-semibold">
            Profile
          </h1>
          <p className="text-slate-400 text-sm">
            Your health journey
          </p>
        </div>

        <button
          onClick={() => router.push("/settings")}
          className="ml-auto bg-blue-500 px-4 py-2 rounded-xl text-sm"
        >
          Settings
        </button>
      </div>

      {/* PROFILE SECTIONS */}
      <div className="space-y-5">

        {/* My Goals */}
        <div className="bg-slate-700/70 backdrop-blur-lg rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold">My Goals</h2>
            <button onClick={() => router.push('/dashboard')} className="bg-blue-500 px-3 py-1 rounded-lg text-xs">Open</button>
          </div>
          <div className="space-y-2">
            {goals.map((g) => (
              <div key={g.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{g.title}</div>
                  <div className="text-sm text-slate-400">{g.frequency}</div>
                </div>
                <div>
                  <button onClick={() => toggleGoal(g.id)} className={`px-3 py-1 rounded-lg ${g.completed ? 'bg-green-600' : 'bg-slate-700/70'}`}>
                    {g.completed ? 'Done' : 'Mark'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* I. MEDICAL CONTEXT */}
        <div className="bg-slate-700/70 backdrop-blur-lg rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold">
              I. Medical Context
            </h2>
            <button
              onClick={() => router.push("/onboarding")}
              className="bg-blue-500 px-3 py-1 rounded-lg text-xs"
            >
              Edit
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-2">
            Diagnosis: {data.diagnosis || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Date: {data.diagnosisDate || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Medication: {data.medication || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Doctor Restrictions: {data.doctorRestrictions || "-"}
          </p>
          <p className="text-sm text-slate-400">
            Allergies: {data.allergies || "-"}
          </p>
        </div>

        {/* II. BASELINE */}
        <div className="bg-slate-700/70 backdrop-blur-lg rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold">
              II. Baseline
            </h2>
            <button
              onClick={() => router.push("/onboarding")}
              className="bg-blue-500 px-3 py-1 rounded-lg text-xs"
            >
              Edit
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-2">
            Age: {data.age || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Gender: {data.gender || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Weight: {data.weight || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Height: {data.height || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Sleep Hours: {data.sleepHours || "-"}
          </p>
          <p className="text-sm text-slate-400">
            Weekly Exercise: {data.weeklyExercise || "-"}
          </p>
        </div>

        {/* III. LIFESTYLE */}
        <div className="bg-slate-700/70 backdrop-blur-lg rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold">
              III. Lifestyle
            </h2>
            <button
              onClick={() => router.push("/onboarding")}
              className="bg-blue-500 px-3 py-1 rounded-lg text-xs"
            >
              Edit
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-2">
            Daily Steps: {data.dailySteps || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Exercise Type: {data.exerciseType || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Meals Per Day: {data.mealsPerDay || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Processed Food: {data.processedFood || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Sugary Food: {data.sugaryFood || "-"}
          </p>
          <p className="text-sm text-slate-400">
            Stress Level: {data.stressLevel || "-"}
          </p>
        </div>

        {/* IV. MOTIVATION */}
        <div className="bg-slate-700/70 backdrop-blur-lg rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold">
              IV. Motivation
            </h2>
            <button
              onClick={() => router.push("/onboarding")}
              className="bg-blue-500 px-3 py-1 rounded-lg text-xs"
            >
              Edit
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-2">
            Main Reason: {data.mainReason || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Previous Attempts: {data.previousAttempts || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Relapse Reason: {data.relapseReason || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Change Style: {data.changeStyle || "-"}
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Reminders: {data.reminders || "-"}
          </p>
          <p className="text-sm text-slate-400">
            Readiness: {data.readiness || "-"}
          </p>
        </div>

        {/* V. PRACTICAL */}
        <div className="bg-slate-700/70 backdrop-blur-lg rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold">
              V. Practical
            </h2>
            <button
              onClick={() => router.push("/onboarding")}
              className="bg-blue-500 px-3 py-1 rounded-lg text-xs"
            >
              Edit
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-2">
            Work Type: {data.workType || "-"}
          </p>
          <p className="text-sm text-slate-400">
            Available Time: {data.availableTime || "-"}
          </p>
        </div>

      </div>

      <div className="pt-6">
        <button
          onClick={() => {
            logout();
            router.push("/auth");
          }}
          className="w-full bg-red-500 hover:bg-red-600 transition text-white p-3 rounded-2xl font-semibold"
        >
          Log out
        </button>
      </div>

    </div>
  );
}
