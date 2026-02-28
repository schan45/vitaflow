"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItem = (path: string, label: string) => {
    const active = pathname === path;

    return (
      <Link
        href={path}
        className="flex flex-1 justify-center items-center"
      >
        <div
          className={`min-w-20.5 text-center px-4 py-2 rounded-full text-sm font-semibold transition ${
            active
              ? "bg-blue-500 text-white shadow-md"
              : "text-slate-300"
          }`}
        >
          {label}
        </div>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-120 -translate-x-1/2 px-4 pb-4">
      <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl">
        {navItem("/", "Home")}
        {navItem("/chat", "Chat")}
        {navItem("/dashboard", "Tracker")}
        {navItem("/profile", "Profile")}
      </div>
    </div>
  );
}
