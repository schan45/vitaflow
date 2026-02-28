"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GoalModal from "@/components/GoalModal";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(67);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const circumference = 2 * Math.PI * 36;

  return (
    <div className="w-full p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Let’s build consistency today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div onClick={() => setIsModalOpen(true)} className="bg-blue-800 px-3 py-1 rounded-full text-xs text-blue-400 cursor-pointer">
            🔥 4 day streak
          </div>

          <div
            onClick={() => router.push("/profile")}
            className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            LF
          </div>
        </div>
      </div>

      {/* TODAY SUMMARY CARD */}
      <div className="app-card p-6">
        <div className="flex justify-between items-center">

          <div>
            <p className="text-sm text-slate-400 mb-1">
              Today’s Progress
            </p>
            <p className="text-lg font-semibold">
              2 of 3 habits completed
            </p>
          </div>

          {/* MINI PROGRESS RING */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#1e293b"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#3b82f6"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference - (progress / 100) * circumference
                }
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-blue-400">
              {progress}%
            </div>
          </div>
        </div>
      </div>

      {/* PRIMARY ACTION CARD */}
      <Link href="/dashboard">
        <div className="rounded-3xl bg-linear-to-r from-blue-600 to-blue-500 p-6 shadow-xl transition transform active:scale-95">
          <p className="text-lg font-semibold mb-1">
            Track Today’s Progress
          </p>
          <p className="text-blue-100 text-sm">
            Mark habits and maintain your streak
          </p>
        </div>
      </Link>

      {/* SECONDARY ACTIONS */}
      <div className="grid grid-cols-2 gap-4">

        <div className="app-card p-5 active:scale-95 transition">
          <p className="font-semibold mb-1">
            Set New Goal
          </p>
          <p className="text-xs text-slate-400">
            Define a new healthy habit
          </p>
        </div>

        <Link href="/upload">
          <div className="app-card p-5 active:scale-95 transition">
            <p className="font-semibold mb-1">
              Upload Report
            </p>
            <p className="text-xs text-slate-400">
              AI-powered analysis
            </p>
          </div>
        </Link>

      </div>

      {/* AI QUICK ACCESS */}
      <Link href="/chat">
        <div className="rounded-3xl bg-linear-to-r from-blue-800 to-blue-900 p-6 border border-blue-800 shadow-md active:scale-95 transition">
          <p className="text-sm text-slate-400 mb-2">
            How are you feeling today?
          </p>
          <p className="font-semibold text-blue-400">
            Talk with your AI assistant →
          </p>
        </div>
      </Link>

      {/* ABOUT SECTION */}
      <div className="mt-10 pt-6 border-t border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold">
          About VitaFlow
        </h2>
        <p className="text-slate-400 text-sm">
          VitaFlow is a prevention-first AI lifestyle medicine platform
          helping reduce chronic disease risk through structured habit change.
        </p>
        <Link
          href="/partners"
          className="text-blue-400 text-sm"
        >
          Our Partners →
        </Link>
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}