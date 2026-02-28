"use client";

import { useState } from "react";
import { useGoals } from "@/context/GoalContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const COLORS = ["#8b5cf6", "#06b6d4"];

function getWeekNumber(title: string): number | null {
  const match = title.trim().match(/^week\s*(\d+)\s*:/i);
  if (!match) {
    return null;
  }

  const value = Number.parseInt(match[1], 10);
  return Number.isNaN(value) ? null : value;
}

export default function Dashboard() {
  const { goals, toggleGoal } = useGoals();
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isQueryModalDismissed, setIsQueryModalDismissed] = useState(false);
  const [isQueryModalRequested] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("streakModal") === "1"
  );

  const completedCount = goals.filter((goal) => goal.completed).length;
  const progress = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;
  const streak = completedCount;
  const isModalVisible = isStreakModalOpen || (isQueryModalRequested && !isQueryModalDismissed);

  const weeklyData = WEEK_DAYS.map((day, index) => ({
    day,
    progress: index === WEEK_DAYS.length - 1 ? progress : 0,
  }));

  const habitData = [
    { name: "Completed", value: completedCount },
    { name: "Remaining", value: Math.max(goals.length - completedCount, 0) },
  ];

  const weeklyPlanGoals = goals
    .filter((goal) => getWeekNumber(goal.title) !== null)
    .sort((first, second) => (getWeekNumber(first.title) ?? 0) - (getWeekNumber(second.title) ?? 0));

  const nextWeeklyGoal = weeklyPlanGoals.find((goal) => !goal.completed) ?? weeklyPlanGoals[weeklyPlanGoals.length - 1];
  const currentWeekNumber = nextWeeklyGoal ? getWeekNumber(nextWeeklyGoal.title) : null;

  const regularGoals = goals.filter((goal) => getWeekNumber(goal.title) === null);

  return (
    <div className="w-full p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Your Progress</h1>

      <div className="flex justify-center mb-8">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90">
            <circle cx="72" cy="72" r="60" stroke="#1e293b" strokeWidth="12" fill="none" />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#3b82f6"
              strokeWidth="12"
              fill="none"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 - (progress / 100) * 2 * Math.PI * 60}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-blue-400">
            {progress}%
          </div>
        </div>
      </div>

      <div
        onClick={() => {
          setIsQueryModalDismissed(false);
          setIsStreakModalOpen(true);
        }}
        className="app-card bg-blue-900/60 p-5 mb-6 flex justify-between items-center cursor-pointer"
      >
        <div>
          <p className="text-sm text-slate-400">Current Streak</p>
          <p className="text-xl font-semibold">🔥 {streak} days</p>
        </div>
        <span className="text-blue-400 text-sm">Keep going!</span>
      </div>

      <div className="app-card w-full p-6 mt-6">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">📈 Weekly Progress</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyData}>
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="progress" stroke="#8b5cf6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="app-card w-full p-6 mt-6">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">✅ Daily Completion</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="progress" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="app-card w-full p-6 mt-6">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">🎯 Goal Distribution</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={habitData} dataKey="value" outerRadius={70}>
              {habitData.map((entry, index) => (
                <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {weeklyPlanGoals.length > 0 && (
        <div className="app-card p-5 space-y-3">
          <h3 className="text-lg font-semibold">🚀 Progressive Plan</h3>
          {currentWeekNumber !== null && (
            <p className="text-sm text-blue-300">Current focus: Week {currentWeekNumber}</p>
          )}
          {weeklyPlanGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-4 rounded-2xl flex justify-between items-center transition cursor-pointer ${
                getWeekNumber(goal.title) === currentWeekNumber && !goal.completed
                  ? "border border-blue-400 bg-blue-900/40 text-white"
                  : goal.completed
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-200 border border-slate-700"
              }`}
            >
              <span>{goal.title}</span>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  goal.completed ? "border-white bg-white text-blue-600" : "border-slate-500"
                }`}
              >
                {goal.completed && "✓"}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700">
            No goals yet. Add your first goal to start tracking.
          </div>
        ) : regularGoals.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700">
            Your current plan is fully week-based. Complete the Progressive Plan above.
          </div>
        ) : (
          regularGoals.map((habit) => (
            <div
              key={habit.id}
              onClick={() => toggleGoal(habit.id)}
              className={`p-4 rounded-2xl flex justify-between items-center transition cursor-pointer ${
                habit.completed
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-200 border border-slate-700"
              }`}
            >
              <span>{habit.title}</span>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  habit.completed ? "border-white bg-white text-blue-600" : "border-slate-500"
                }`}
              >
                {habit.completed && "✓"}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 text-center text-slate-400 text-sm">
        {progress === 100 ? "Amazing work today! 🎉" : "Consistency builds transformation."}
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-6 pb-6 pt-16">
          <div className="app-card w-full max-w-sm p-7 text-center space-y-4">
            <p className="text-sm text-slate-400">Current Streak</p>
            <p className="text-4xl font-bold text-blue-400">🔥 {streak} days</p>
            <p className="text-slate-300 text-sm">You are building consistency. Keep going.</p>
            <button
              onClick={() => {
                setIsStreakModalOpen(false);
                setIsQueryModalDismissed(true);
              }}
              className="w-full rounded-2xl bg-blue-500 py-3 font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
