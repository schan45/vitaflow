import { NextResponse } from "next/server";
import { summarizeMood } from "@/services/moodSummaryService";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.text !== "string" || body.text.trim() === "") {
      return NextResponse.json(
        { error: "Valid text is required." },
        { status: 400 }
      );
    }

    const summary = await summarizeMood(body.text.trim());

    return NextResponse.json(
      { summary },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Mood summary error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
