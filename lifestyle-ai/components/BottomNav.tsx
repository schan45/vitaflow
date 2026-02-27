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
        className="flex flex-1 justify-center items-center py-4"
      >
        <div
          className={`min-w-[90px] text-center px-6 py-3 rounded-full text-base font-semibold transition ${
            active
              ? "bg-blue-500 text-white shadow-md"
              : "bg-slate-700 text-slate-200"
          }`}
        >
          {label}
        </div>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-800/80 border-t border-slate-700 flex shadow-2xl">
      {navItem("/", "Home")}
      {navItem("/chat", "Chat")}
      {navItem("/dashboard", "Tracker")}
      {navItem("/profile", "Profile")}
    </div>
  );
}
