"use client";

import { useSettings } from "@/context/SettingsContext";

export default function Settings() {
  const {
    fontScale,
    increaseFont,
    decreaseFont,
  } = useSettings();

  return (
    <div
      style={{
        transform: `scale(${fontScale})`,
      }}
      className="p-6 space-y-6"
    >
      <h1 className="text-2xl font-semibold">
        Settings
      </h1>

      <div className="app-card p-5 rounded-2xl space-y-3">
        <p className="font-medium">Font Size</p>
        <div className="flex gap-4">
          <button
            onClick={decreaseFont}
            className="bg-slate-700 px-4 py-2 rounded-xl"
          >
            A-
          </button>

          <button
            onClick={increaseFont}
            className="bg-slate-700 px-4 py-2 rounded-xl"
          >
            A+
          </button>
        </div>
      </div>
    </div>
  );
}
