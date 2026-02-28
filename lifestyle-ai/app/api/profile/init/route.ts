import { NextResponse } from "next/server";
import { getUserIdFromAuthHeader, supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromAuthHeader(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as {
      email?: unknown;
    } | null;

    const displayName = typeof body?.email === "string" && body.email.trim()
      ? body.email.trim()
      : "VitaFlow User";

    const attributeName = `full_name:${userId}`;

    const existing = await supabaseServer
      .from("user_health_attributes")
      .select("id")
      .is("user_id", null)
      .eq("attribute_name", attributeName)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing.error) {
      return NextResponse.json({ error: existing.error.message }, { status: 500 });
    }

    let error: { message: string } | null = null;

    if (existing.data?.id) {
      const updated = await supabaseServer
        .from("user_health_attributes")
        .update({ attribute_value: displayName })
        .eq("id", existing.data.id);
      error = updated.error ? { message: updated.error.message } : null;
    } else {
      const inserted = await supabaseServer
        .from("user_health_attributes")
        .insert({
          user_id: null,
          attribute_name: attributeName,
          attribute_value: displayName,
        });
      error = inserted.error ? { message: inserted.error.message } : null;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Profile init error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
