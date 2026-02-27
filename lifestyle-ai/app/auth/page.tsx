"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = () => {
    if (isRegister) {
      register();
      router.replace("/onboarding");
    } else {
      login();
      router.replace("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-sm space-y-6 shadow-xl">
        <h1 className="text-xl font-semibold text-center">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h1>

        <input
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-slate-700"
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full p-3 rounded-xl bg-slate-700"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 p-3 rounded-xl"
        >
          {isRegister ? "Register" : "Login"}
        </button>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm text-slate-400 w-full"
        >
          {isRegister
            ? "Already have an account?"
            : "Create account"}
        </button>
      </div>
    </div>
  );
}
