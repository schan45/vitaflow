"use client";

import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hi! I'm your AI health assistant 🌿",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input) return;

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "That sounds like a great focus area. Let's build consistency step by step.",
        },
      ]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-screen p-6 pb-40">

      <div className="text-2xl font-semibold mb-4 flex items-center gap-2">
        🤖 AI Coach
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-[30px] max-w-[80%] ${
              msg.role === "user"
                ? "ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "bg-white/10 backdrop-blur-xl border border-white/10"
            }`}
          >
            {msg.content}
          </div>
        ))}

      </div>

      <div className="fixed bottom-24 left-0 w-full px-6">
        <div className="flex bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-xl">
          <input
            className="flex-1 bg-transparent px-4 outline-none"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 px-5 py-2 rounded-full text-white"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}
