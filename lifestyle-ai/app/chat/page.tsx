"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGoals } from "@/context/GoalContext";

export default function ChatPage() {
  const search = useSearchParams();
  const mode = search.get("mode");
  const router = useRouter();
  const { addGoal } = useGoals();

  const [messages, setMessages] = useState<{from: "user"|"ai"; text: string}[]>([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w: any = window;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (ev: any) => {
      const t = ev.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + t : t));
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
  }, []);

  const toggleListen = () => {
    const r = recogRef.current;
    if (!r) return alert("Speech recognition not supported in this browser.");
    if (listening) {
      r.stop();
      setListening(false);
    } else {
      r.start();
      setListening(true);
    }
  };

  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((m) => [...m, { from: "user", text: userText }]);
    setInput("");

    // Simple stubbed AI reply — in real app call backend LLM
    setTimeout(() => {
      const ai = mode === "goal" ? `I can help turn that into a goal: \"${userText}\". Click create to add.` : `Echo: ${userText}`;
      setMessages((m) => [...m, { from: "ai", text: ai }]);
    }, 600);
  };

  const createGoalFromLast = () => {
    const last = messages.slice().reverse().find((m) => m.from === "user");
    if (!last) return;
    addGoal(last.text, "Daily");
    router.push("/profile");
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Chat</h1>

      <div className="mt-4 space-y-3 max-w-xl">
        {messages.map((m, i) => (
          <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block p-3 rounded-xl ${m.from === "user" ? "bg-blue-600" : "bg-slate-700"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-6">
        <div className="flex gap-2">
          <button onClick={toggleListen} className="bg-slate-800 px-3 py-2 rounded-xl">
            {listening ? "Stop" : "Voice"}
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-3 rounded-xl bg-slate-700" placeholder="Say or type..." />
          <button onClick={send} className="bg-blue-600 px-4 py-2 rounded-xl">Send</button>
        </div>

        {mode === "goal" && (
          <div className="mt-3 flex gap-2">
            <button onClick={createGoalFromLast} className="flex-1 bg-green-600 p-3 rounded-xl">Create goal from last message</button>
            <button onClick={() => router.push("/onboarding") } className="flex-1 bg-slate-600 p-3 rounded-xl">Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
