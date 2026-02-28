import { NextResponse } from "next/server";
import { getUserIdFromAuthHeader, supabaseServer } from "@/lib/supabaseServer";

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  return token || null;
}

function toUsernameCandidate(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "vitaflow_user";
}

async function upsertLegacyProfileAttribute(userId: string, displayName: string) {
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
    return existing.error;
  }

  if (existing.data?.id) {
    const updated = await supabaseServer
      .from("user_health_attributes")
      .update({ attribute_value: displayName })
      .eq("id", existing.data.id);
    return updated.error;
  }

  const inserted = await supabaseServer
    .from("user_health_attributes")
    .insert({
      user_id: null,
      attribute_name: attributeName,
      attribute_value: displayName,
    });

  return inserted.error;
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromAuthHeader(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = getBearerToken(req);
    const authUser = token ? await supabaseServer.auth.getUser(token) : null;
    const authEmail = authUser?.data.user?.email ?? null;

    const profileRow = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!profileRow.error && profileRow.data) {
      const profileData = profileRow.data as Record<string, unknown>;
      const nameCandidate =
        profileData.full_name ?? profileData.display_name ?? profileData.username ?? profileData.name;
      const emailCandidate = profileData.email;

      const displayName =
        typeof nameCandidate === "string" && nameCandidate.trim()
          ? nameCandidate.trim()
          : typeof emailCandidate === "string" && emailCandidate.trim()
            ? emailCandidate.trim()
            : authEmail || "VitaFlow User";

      const email =
        typeof emailCandidate === "string" && emailCandidate.trim()
          ? emailCandidate.trim()
          : authEmail;

      return NextResponse.json({ displayName, email });
    }

    const legacyAttribute = await supabaseServer
      .from("user_health_attributes")
      .select("attribute_value")
      .is("user_id", null)
      .eq("attribute_name", `full_name:${userId}`)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (legacyAttribute.error) {
      return NextResponse.json({ error: legacyAttribute.error.message }, { status: 500 });
    }

    const legacyDisplayName =
      typeof legacyAttribute.data?.attribute_value === "string" && legacyAttribute.data.attribute_value.trim()
        ? legacyAttribute.data.attribute_value.trim()
        : null;

    return NextResponse.json({
      displayName: legacyDisplayName || authEmail || "VitaFlow User",
      email: authEmail,
    });
  } catch (error: unknown) {
    console.error("Profile get error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromAuthHeader(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as {
      email?: unknown;
      username?: unknown;
    } | null;

    const providedEmail = typeof body?.email === "string" && body.email.trim()
      ? body.email.trim()
      : "";

    const providedUsername = typeof body?.username === "string" && body.username.trim()
      ? body.username.trim()
      : "";

    const displayName = providedEmail || providedUsername
      ? (providedEmail || providedUsername)
      : "VitaFlow User";

    const usernameBase = providedUsername || (providedEmail.includes("@") ? providedEmail.split("@")[0] : providedEmail);
    const username = toUsernameCandidate(usernameBase || userId.slice(0, 12));

    const upsertProfiles = await supabaseServer.from("profiles").upsert(
      {
        id: userId,
        username,
        email: displayName,
      },
      { onConflict: "id" }
    );

    if (upsertProfiles.error) {
      const fallbackProfilesWithUsername = await supabaseServer
        .from("profiles")
        .upsert(
          {
            id: userId,
            username,
          },
          { onConflict: "id" }
        );

      if (fallbackProfilesWithUsername.error) {
        const fallbackProfilesIdOnly = await supabaseServer
          .from("profiles")
          .upsert(
            {
              id: userId,
            },
            { onConflict: "id" }
          );

        if (fallbackProfilesIdOnly.error) {
          return NextResponse.json({ error: fallbackProfilesIdOnly.error.message }, { status: 500 });
        }
      }
    }

    const legacyError = await upsertLegacyProfileAttribute(userId, displayName);
    if (legacyError) {
      return NextResponse.json({ error: legacyError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Profile init error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
