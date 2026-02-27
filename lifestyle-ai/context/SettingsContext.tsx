"use client";

import { createContext, useContext, useState } from "react";

type SettingsType = {
  fontScale: number;
  increaseFont: () => void;
  decreaseFont: () => void;
};

const SettingsContext = createContext<SettingsType | undefined>(
  undefined
);

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fontScale, setFontScale] = useState(1);

  return (
    <SettingsContext.Provider
      value={{
        fontScale,
        increaseFont: () =>
          setFontScale((prev) => Math.min(prev + 0.1, 1.4)),
        decreaseFont: () =>
          setFontScale((prev) => Math.max(prev - 0.1, 1)),
      }}
    >
      <div
        style={{
          transform: `scale(${fontScale})`,
          transformOrigin: "top center",
        }}
      >
        {children}
      </div>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("Use inside provider");
  return context;
}
