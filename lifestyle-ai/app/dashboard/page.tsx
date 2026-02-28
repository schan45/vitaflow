"use client";

import { useGoals } from "@/context/GoalContext";
import { cardStyle } from "@/lib/ui";
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

const weeklyData = [
  { day: "Mon", progress: 40 },
  { day: "Tue", progress: 60 },
  { day: "Wed", progress: 30 },
  { day: "Thu", progress: 80 },
  { day: "Fri", progress: 100 },
  { day: "Sat", progress: 70 },
  { day: "Sun", progress: 90 },
];

const habitData = [
  { name: "Completed", value: 65 },
  { name: "Remaining", value: 35 },
];

const COLORS = ["#8b5cf6", "#06b6d4"];

export default function Dashboard() {
  const { goals, toggleGoal } = useGoals();

  const completedCount = goals.filter((h) => h.completed).length;
  const progress = Math.round(
    (completedCount / goals.length) * 100
  );

  const streak = completedCount === goals.length ? 5 : 4;

  return (
    <div className="w-full p-6 pb-28 space-y-6">
      <h1 className="text-2xl font-semibold mb-6">
        Your Progress
      </h1>

      {/* Progress Ring */}
      <div className="flex justify-center mb-8">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full rotate-[-90deg]">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#1e293b"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#3b82f6"
              strokeWidth="12"
              fill="none"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={
                2 * Math.PI * 60 -
                (progress / 100) * 2 * Math.PI * 60
              }
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-blue-400">
            {progress}%
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-blue-800 rounded-3xl p-5 mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-400">
            Current Streak
          </p>
          <p className="text-xl font-semibold">
            🔥 {streak} days
          </p>
        </div>

        <span className="text-blue-400 text-sm">
          Keep going!
        </span>
      </div>

      {/* Weekly Line Chart */}
      <div className="w-full bg-gradient-to-br from-slate-700/60 to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl mt-6">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
          📈 Weekly Progress
        </h2>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="progress"
              stroke="#8b5cf6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Bar Chart */}
      <div className="w-full bg-gradient-to-br from-slate-700/60 to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl mt-6">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
          ✅ Daily Completion
        </h2>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="progress" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="w-full bg-gradient-to-br from-slate-700/60 to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl mt-6">
        <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
          🎯 Goal Distribution
        </h2>

        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={habitData}
              dataKey="value"
              outerRadius={70}
            >
              {habitData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Habit List */}
      <div className="space-y-4">
        {goals.map((habit) => (
          <div
            key={habit.id}
            onClick={() => toggleGoal(habit.id)}
            className={`p-4 rounded-2xl flex justify-between items-center transition cursor-pointer ${
              habit.completed
                ? "bg-blue-600 text-white"
                : "bg-blue-800 text-slate-200"
            }`}
          >
            <span>{habit.name}</span>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                habit.completed
                  ? "border-white bg-white text-blue-600"
                  : "border-slate-500"
              }`}
            >
              {habit.completed && "✓"}
            </div>
          </div>
        ))}
      </div>

      {/* Motivation */}
      <div className="mt-8 text-center text-slate-400 text-sm">
        {progress === 100
          ? "Amazing work today! 🎉"
          : "Consistency builds transformation."}
      </div>
    </div>
  );
}
