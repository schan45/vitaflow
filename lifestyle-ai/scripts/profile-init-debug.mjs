import { createClient } from "@supabase/supabase-js";

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const username = `debug_${Date.now()}`;
  const email = `${username}@vitaflow.local`;
  const password = "TestPass123!";

  const signUp = await supabase.auth.signUp({ email, password });
  console.log("signup", signUp.error?.message || "ok");

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  console.log("signin", signIn.error?.message || "ok");

  const token = signIn.data.session?.access_token;
  if (!token) {
    console.log("no token");
    return;
  }

  const res = await fetch("http://localhost:3000/api/profile/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });

  const text = await res.text();
  console.log("status", res.status);
  console.log("body", text);
}

run();
