"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setAuthError("");

    if (!email || !password) return;

    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register({ email, password });
      } else {
        await login({ email, password });
      }

      localStorage.setItem("email", email);

      if (isRegister) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">

      <div className="relative w-full max-w-sm">

        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl"></div>

        <div className="app-card rounded-4xl p-8 space-y-5">

          <h1 className="text-2xl font-semibold text-center">
            {isRegister ? "🌱 Create Profile" : "👋 Welcome Back"}
          </h1>

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="app-input"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="app-input"
          />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-blue-500 to-purple-500 p-3 rounded-2xl font-semibold text-white shadow-lg"
          >
            {isSubmitting ? "Please wait..." : isRegister ? "Start Journey" : "Enter"}
          </button>

          {authError && (
            <p className="text-sm text-red-300 text-center">
              {authError}
            </p>
          )}

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-slate-300 w-full"
          >
            {isRegister
              ? "Already have a profile?"
              : "Create new profile"}
          </button>

        </div>
      </div>
    </div>
  );
}
