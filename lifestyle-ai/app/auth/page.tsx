"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!username || !password) return;
    if (isRegister && !email) return;

    if (isRegister) {
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      register();
      router.push("/onboarding");
    } else {
      localStorage.setItem("username", username);
      login();
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">

      <div className="relative w-full max-w-sm">

        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl"></div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl space-y-6">

          <h1 className="text-2xl font-semibold text-center">
            {isRegister ? "🌱 Create Profile" : "👋 Welcome Back"}
          </h1>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
          />

          {isRegister && (
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
            />
          )}

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl font-semibold text-white shadow-lg"
          >
            {isRegister ? "Start Journey" : "Enter"}
          </button>

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
