"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function Auth() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPasswordValidationErrors = (value: string) => {
    const errors: string[] = [];

    if (value.length < 6) {
      errors.push("Password must be at least 6 characters.");
    }

    if (!/[A-Z]/.test(value)) {
      errors.push("Password must include at least one uppercase letter.");
    }

    return errors;
  };

  const initializeProfile = async (emailValue: string) => {
    const { data } = await supabaseBrowser.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      return;
    }

    await fetch("/api/profile/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: emailValue }),
    });
  };

  const handleSubmit = async () => {
    setAuthError("");

    if (!email || !password) return;

    if (isRegister) {
      const passwordErrors = getPasswordValidationErrors(password);
      if (passwordErrors.length > 0) {
        setAuthError(passwordErrors.join(" "));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register({ email, password });
        localStorage.setItem("email", email);
        localStorage.setItem("hasUploadedReport", "false");
        await initializeProfile(email);
        router.push("/onboarding");
      } else {
        await login({ email, password });
        localStorage.setItem("email", email);
        localStorage.setItem("hasUploadedReport", "false");
        await initializeProfile(email);
        router.push("/");
      }
    } catch (error: unknown) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordValidationErrors = isRegister
    ? getPasswordValidationErrors(password)
    : [];
  const isRegisterPasswordValid = passwordValidationErrors.length === 0;
  const isSubmitDisabled = isSubmitting || (isRegister && !isRegisterPasswordValid);
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);

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

          {isRegister && (
            <div className="text-xs space-y-1">
              <p className={hasMinLength ? "text-green-300" : "text-amber-300"}>
                {hasMinLength ? "✓" : "•"} At least 6 characters
              </p>
              <p className={hasUppercase ? "text-green-300" : "text-amber-300"}>
                {hasUppercase ? "✓" : "•"} At least one uppercase letter
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full bg-linear-to-r from-blue-500 to-purple-500 p-3 rounded-2xl font-semibold text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Please wait..." : isRegister ? "Register" : "Enter"}
          </button>

          {authError && (
            <p className="text-sm text-red-300 text-center">
              {authError}
            </p>
          )}

          <button
            onClick={() => {
              setAuthError("");
              setIsRegister(!isRegister);
            }}
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
