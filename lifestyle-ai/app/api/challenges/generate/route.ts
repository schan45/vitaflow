import { NextResponse } from "next/server";
import { getUserIdFromAuthHeader } from "@/lib/supabaseServer";
import { getAzureOpenAIClient } from "@/services/azureOpenAIClient";

type OnboardingInput = {
  workType?: string;
  weeklyExercise?: string;
  dailySteps?: string;
  exerciseType?: string;
  availableTime?: string;
  stressLevel?: string;
  mainReason?: string;
  readiness?: string;
};

type Challenge = {
  title: string;
  frequency: "Daily" | "Weekly";
};

function hasWeekLabel(title: string): boolean {
  return /^week\s*\d+\s*:/i.test(title.trim());
}

function ensureProgressiveWeeks(challenges: Challenge[]): Challenge[] {
  if (challenges.some((challenge) => hasWeekLabel(challenge.title))) {
    return challenges;
  }

  const base = challenges[0]?.title || "Brisk walk for 20 minutes";

  const progressive: Challenge[] = [
    { title: `Week 1: ${base}`, frequency: "Daily" },
    { title: `Week 2: ${base} +10%`, frequency: "Weekly" },
    { title: `Week 3: ${base} +20%`, frequency: "Weekly" },
  ];

  const rest = challenges.slice(1, 4);
  return [...progressive, ...rest].slice(0, 6);
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toFrequency(input: unknown): "Daily" | "Weekly" {
  return input === "Weekly" ? "Weekly" : "Daily";
}

function sanitizeChallenges(input: unknown): Challenge[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((item): item is Partial<Challenge> => !!item && typeof item === "object")
    .map((item) => ({
      title: typeof item.title === "string" ? item.title.trim() : "",
      frequency: toFrequency(item.frequency),
    }))
    .filter((item) => item.title.length > 0)
    .slice(0, 6);
}

function buildFallbackChallenges(data: OnboardingInput): Challenge[] {
  const workType = normalize(data.workType || "");
  const weeklyExercise = normalize(data.weeklyExercise || "");
  const stressLevel = Number.parseInt(data.stressLevel || "", 10);
  const availableTime = Number.parseInt(data.availableTime || "", 10);

  const isSedentary =
    workType.includes("sitting") ||
    workType.includes("desk") ||
    workType.includes("office") ||
    workType.includes("ulo") ||
    workType.includes("iroda");

  const isLowExercise =
    weeklyExercise.includes("almost never") ||
    weeklyExercise.includes("never") ||
    weeklyExercise.includes("1-2") ||
    weeklyExercise.includes("alig") ||
    weeklyExercise.includes("soha");

  const lowTime = Number.isFinite(availableTime) && availableTime > 0 && availableTime <= 20;
  const highStress = Number.isFinite(stressLevel) && stressLevel >= 7;

  if (isSedentary && isLowExercise) {
    return [
      { title: "Week 1: Walk briskly for 20 minutes", frequency: "Daily" },
      { title: "Week 2: Run 1 km at easy pace", frequency: "Weekly" },
      { title: "Week 3: Run 1.5 km at easy pace", frequency: "Weekly" },
      { title: "Week 4: Run 2 km at easy pace", frequency: "Weekly" },
      { title: "Do 5 minutes mobility after work", frequency: "Daily" },
    ];
  }

  if (lowTime) {
    return [
      { title: "Take a 10-minute power walk", frequency: "Daily" },
      { title: "Do a 12-minute bodyweight circuit", frequency: "Weekly" },
      { title: "Increase one workout by +5 minutes this week", frequency: "Weekly" },
      { title: "Stand and stretch every 90 minutes", frequency: "Daily" },
    ];
  }

  if (highStress) {
    return [
      { title: "Practice 6 minutes of breathing", frequency: "Daily" },
      { title: "Take a 20-minute low-intensity walk", frequency: "Daily" },
      { title: "Add one longer session (+10 minutes) weekly", frequency: "Weekly" },
      { title: "No-screen wind-down for 20 minutes", frequency: "Daily" },
    ];
  }

  return [
    { title: "Walk 7000+ steps", frequency: "Daily" },
    { title: "Complete 2 cardio sessions", frequency: "Weekly" },
    { title: "Complete 2 strength sessions", frequency: "Weekly" },
    { title: "Progressive overload: increase duration by 10% this week", frequency: "Weekly" },
  ];
}

async function generateWithAI(data: OnboardingInput): Promise<Challenge[] | null> {
  const client = getAzureOpenAIClient();
  if (!client) {
    return null;
  }

  const prompt = {
    workType: data.workType || "",
    weeklyExercise: data.weeklyExercise || "",
    dailySteps: data.dailySteps || "",
    exerciseType: data.exerciseType || "",
    availableTime: data.availableTime || "",
    stressLevel: data.stressLevel || "",
    mainReason: data.mainReason || "",
    readiness: data.readiness || "",
  };

  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT!,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "You are a lifestyle coach. Return ONLY valid JSON array with 4-6 items. Each item must have: title (string), frequency ('Daily' or 'Weekly'). Personalize from onboarding answers and include progressive overload (gradually harder over weeks). Include at least three week-labeled tasks exactly in this style: 'Week 1: ...', 'Week 2: ...', 'Week 3: ...'. Keep tasks safe for beginners, concrete, and short.",
      },
      {
        role: "user",
        content: JSON.stringify(prompt),
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return null;
  }

  const start = content.indexOf("[");
  const end = content.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  const jsonText = content.slice(start, end + 1);
  const parsed = JSON.parse(jsonText) as unknown;
  const sanitized = ensureProgressiveWeeks(sanitizeChallenges(parsed));
  return sanitized.length > 0 ? sanitized : null;
}

export async function POST(req: Request) {
  const userId = await getUserIdFromAuthHeader(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { onboarding?: OnboardingInput } | null;
  const onboarding = body?.onboarding || {};

  try {
    const aiChallenges = await generateWithAI(onboarding);
    const challenges = aiChallenges && aiChallenges.length > 0
      ? ensureProgressiveWeeks(aiChallenges)
      : ensureProgressiveWeeks(buildFallbackChallenges(onboarding));
    return NextResponse.json({ challenges });
  } catch {
    return NextResponse.json({ challenges: ensureProgressiveWeeks(buildFallbackChallenges(onboarding)) });
  }
}