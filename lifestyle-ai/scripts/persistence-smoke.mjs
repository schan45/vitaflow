import { createClient } from "@supabase/supabase-js";

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.log("FAIL: Missing Supabase env");
    process.exit(1);
  }

  const supabase = createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const username = `persist_${Date.now()}`;
  const email = `${username}@vitaflow.local`;
  const password = "TestPass123!";

  const signUp = await supabase.auth.signUp({ email, password });
  if (signUp.error && !signUp.error.message.toLowerCase().includes("already")) {
    console.log("FAIL: signup", signUp.error.message);
    process.exit(1);
  }

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error || !signIn.data.session?.access_token) {
    console.log("FAIL: signin", signIn.error?.message || "No token");
    process.exit(1);
  }

  const token = signIn.data.session.access_token;

  const profileRes = await fetch("http://localhost:3000/api/profile/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });

  if (!profileRes.ok) {
    console.log("FAIL: profile init", profileRes.status);
    process.exit(1);
  }

  const messages = [
    { role: "ai", content: "Hi! I'm your AI health assistant 🌿" },
    { role: "user", content: "Persist this please" },
    { role: "ai", content: "Saved." },
  ];

  const chatSave = await fetch("http://localhost:3000/api/chat-history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!chatSave.ok) {
    console.log("FAIL: chat save", chatSave.status);
    process.exit(1);
  }

  const chatLoad = await fetch("http://localhost:3000/api/chat-history", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const chatJson = await chatLoad.json();
  const chatPass = chatLoad.ok && Array.isArray(chatJson.messages) && chatJson.messages.length >= 3;

  if (!chatPass) {
    console.log("FAIL: chat load", chatLoad.status, chatJson);
    process.exit(1);
  }

  const onboardingPayload = {
    diagnosis: "Hypertension",
    age: "34",
    stressLevel: "7",
    availableTime: "30",
  };

  const onboardingSave = await fetch("http://localhost:3000/api/onboarding-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ onboarding: onboardingPayload, completed: true }),
  });

  if (!onboardingSave.ok) {
    console.log("FAIL: onboarding save", onboardingSave.status);
    process.exit(1);
  }

  const onboardingLoad = await fetch("http://localhost:3000/api/onboarding-data", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const onboardingJson = await onboardingLoad.json();
  const onboardingPass =
    onboardingLoad.ok &&
    onboardingJson?.onboarding?.diagnosis === "Hypertension" &&
    onboardingJson?.onboarding?.age === "34";

  if (!onboardingPass) {
    console.log("FAIL: onboarding load", onboardingLoad.status, onboardingJson);
    process.exit(1);
  }

  console.log("PASS: profile/chat/onboarding persistence verified", {
    user: username,
    chatMessages: chatJson.messages.length,
    onboarding: onboardingJson.onboarding,
  });
}

run();
