"use client";

import { useState } from "react";
import { useGoals } from "@/context/GoalContext";

export default function GoalModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addGoal } = useGoals();

  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<
    "Daily" | "Weekly"
  >("Daily");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    addGoal(title, frequency);
    setTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
      <div className="bg-slate-900 w-full max-w-md rounded-t-3xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          Create New Goal
        </h2>

        <input
          className="w-full bg-slate-800 p-3 rounded-xl"
          placeholder="Goal title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={() => setFrequency("Daily")}
            className={`flex-1 p-3 rounded-xl ${
              frequency === "Daily"
                ? "bg-blue-600"
                : "bg-slate-800"
            }`}
          >
            Daily
          </button>

          <button
            onClick={() => setFrequency("Weekly")}
            className={`flex-1 p-3 rounded-xl ${
              frequency === "Weekly"
                ? "bg-blue-600"
                : "bg-slate-800"
            }`}
          >
            Weekly
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 p-3 rounded-xl"
        >
          Save Goal
        </button>

        <button
          onClick={onClose}
          className="w-full text-slate-400 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
