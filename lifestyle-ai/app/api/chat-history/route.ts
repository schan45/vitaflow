import { NextResponse } from "next/server";
import { getUserIdFromAuthHeader, supabaseServer } from "@/lib/supabaseServer";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

const ATTRIBUTE_NAME = "chat_history";

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
    return NextResponse.json({ messages: [] as ChatMessage[] });
  }

  try {
    const parsed = JSON.parse(data.attribute_value) as ChatMessage[];
    return NextResponse.json({ messages: Array.isArray(parsed) ? parsed : [] });
  } catch {
    return NextResponse.json({ messages: [] as ChatMessage[] });
  }
}

export async function POST(req: Request) {
  const userId = await getUserIdFromAuthHeader(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scopedAttributeName = `${ATTRIBUTE_NAME}:${userId}`;

  const body = (await req.json().catch(() => null)) as { messages?: unknown } | null;
  const messages = Array.isArray(body?.messages) ? body?.messages : [];

  const sanitized = messages
    .filter((item): item is ChatMessage => {
      return (
        !!item &&
        typeof item === "object" &&
        ((item as ChatMessage).role === "user" || (item as ChatMessage).role === "ai") &&
        typeof (item as ChatMessage).content === "string"
      );
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-100);

  const value = JSON.stringify(sanitized);

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
