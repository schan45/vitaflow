import { NextResponse } from "next/server";
import { getUserIdFromAuthHeader, supabaseServer } from "@/lib/supabaseServer";

type Goal = {
  id: number;
  title: string;
  frequency: "Daily" | "Weekly";
  completed: boolean;
};

const ATTRIBUTE_NAME = "goals_data";

function sanitizeGoals(input: unknown): Goal[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((item): item is Partial<Goal> => !!item && typeof item === "object")
    .map((goal) => {
      const id = typeof goal.id === "number" ? goal.id : Date.now() + Math.floor(Math.random() * 1000);
      const title = typeof goal.title === "string" ? goal.title.trim() : "";
      const frequency: Goal["frequency"] = goal.frequency === "Weekly" ? "Weekly" : "Daily";
      const completed = Boolean(goal.completed);
      return { id, title, frequency, completed };
    })
    .filter((goal) => goal.title.length > 0)
    .slice(-200);
}

export async function GET(req: Request) {
  const userId = await getUserIdFromAuthHeader(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scopedAttributeName = `${ATTRIBUTE_NAME}:${userId}`;

  const { data, error } = await supabaseServer
    .from("user_health_attributes")
    .select("attribute_value")
    .is("user_id", null)
    .eq("attribute_name", scopedAttributeName)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.attribute_value) {
    return NextResponse.json({ goals: [] as Goal[] });
  }

  try {
    const parsed = JSON.parse(data.attribute_value) as unknown;
    return NextResponse.json({ goals: sanitizeGoals(parsed) });
  } catch {
    return NextResponse.json({ goals: [] as Goal[] });
  }
}

export async function POST(req: Request) {
  const userId = await getUserIdFromAuthHeader(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scopedAttributeName = `${ATTRIBUTE_NAME}:${userId}`;

  const body = (await req.json().catch(() => null)) as { goals?: unknown } | null;
  const goals = sanitizeGoals(body?.goals);
  const value = JSON.stringify(goals);

  const existing = await supabaseServer
    .from("user_health_attributes")
    .select("id")
    .is("user_id", null)
    .eq("attribute_name", scopedAttributeName)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing.error) {
    return NextResponse.json({ error: existing.error.message }, { status: 500 });
  }

  if (existing.data?.id) {
    const { error } = await supabaseServer
      .from("user_health_attributes")
      .update({ attribute_value: value })
      .eq("id", existing.data.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  const { error } = await supabaseServer
    .from("user_health_attributes")
    .insert({
      user_id: null,
      attribute_name: scopedAttributeName,
      attribute_value: value,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}