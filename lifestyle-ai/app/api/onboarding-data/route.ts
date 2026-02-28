import { NextResponse } from "next/server";
import { getUserIdFromAuthHeader, supabaseServer } from "@/lib/supabaseServer";

const ATTRIBUTE_NAME = "onboarding_data";

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
    return NextResponse.json({ onboarding: {} });
  }

  try {
    const parsed = JSON.parse(data.attribute_value) as Record<string, string>;
    return NextResponse.json({ onboarding: parsed ?? {} });
  } catch {
    return NextResponse.json({ onboarding: {} });
  }
}

export async function POST(req: Request) {
  const userId = await getUserIdFromAuthHeader(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scopedAttributeName = `${ATTRIBUTE_NAME}:${userId}`;

  const body = (await req.json().catch(() => null)) as {
    onboarding?: Record<string, unknown>;
    completed?: unknown;
  } | null;

  const rawOnboarding = body?.onboarding ?? {};
  const normalized = Object.entries(rawOnboarding).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        acc[key] = trimmed;
      }
    }
    return acc;
  }, {});

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

  let setupError: { message: string } | null = null;

  if (existing.data?.id) {
    const updated = await supabaseServer
      .from("user_health_attributes")
      .update({ attribute_value: JSON.stringify(normalized) })
      .eq("id", existing.data.id);
    setupError = updated.error ? { message: updated.error.message } : null;
  } else {
    const inserted = await supabaseServer
      .from("user_health_attributes")
      .insert({
        user_id: null,
        attribute_name: scopedAttributeName,
        attribute_value: JSON.stringify(normalized),
      });
    setupError = inserted.error ? { message: inserted.error.message } : null;
  }

  if (setupError) {
    return NextResponse.json({ error: setupError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
