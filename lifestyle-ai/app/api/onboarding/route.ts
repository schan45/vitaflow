import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type RiskLevel = "low" | "moderate" | "high";

type RiskResponse = {
  riskLevel: RiskLevel;
  shouldSeeDoctor: boolean;
};

type DoctorRecommendation = {
  id: string | number;
  full_name: string;
  specialty: string;
  clinic_name: string;
  city: string;
  country: string;
  website_url?: string | null;
  booking_url?: string | null;
};

type DoctorRow = DoctorRecommendation & {
  is_active?: boolean | null;
};

type OnboardingAiResult = {
  summary: string;
  risk: RiskResponse;
  recommendedSpecialty: string;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSpecialtyAliases(specialty: string): string[] {
  const normalized = normalizeText(specialty);

  const aliasMap: Record<string, string[]> = {
    cardiology: ["cardiology", "cardiologist", "kardiologia", "kardiologus", "heart"],
    pulmonology: ["pulmonology", "pulmonologist", "tudogyogyaszat", "tudogyogyasz", "respiratory"],
    neurology: ["neurology", "neurologist", "neurologia", "neurologus"],
    dermatology: ["dermatology", "dermatologist", "borgyogyaszat", "borgyogyasz"],
    gastroenterology: ["gastroenterology", "gastroenterologist", "gasztroenterologia", "gasztroenterologus"],
    orthopedics: ["orthopedics", "orthopedic", "ortopedia", "ortoped", "mozgasszerv"],
    endocrinology: ["endocrinology", "endocrinologist", "endokrinologia", "endokrinologus"],
    psychiatry: ["psychiatry", "psychiatrist", "pszichiatria", "pszichiater", "mental health"],
    gynecology: ["gynecology", "gynaecology", "gynecologist", "nogyogyaszat", "nogyogyasz"],
    ent: ["ent", "otorhinolaryngology", "fulegeszet", "orrgegeszet"],
    "general medicine": ["general medicine", "internal medicine", "family medicine", "haziorvos", "belgyogyaszat"],
  };

  const matched = Object.entries(aliasMap).find(([key, aliases]) => {
    if (normalized.includes(key)) {
      return true;
    }
    return aliases.some((alias) => normalized.includes(alias));
  });

  if (matched) {
    return matched[1];
  }

  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens.length > 0 ? tokens : [normalized];
}

function scoreDoctorBySpecialty(rowSpecialty: string, aliases: string[]): number {
  const normalizedRowSpecialty = normalizeText(rowSpecialty);
  if (!normalizedRowSpecialty) {
    return 0;
  }

  let score = 0;
  for (const alias of aliases) {
    const normalizedAlias = normalizeText(alias);
    if (!normalizedAlias) continue;

    if (normalizedRowSpecialty === normalizedAlias) {
      score = Math.max(score, 100);
      continue;
    }

    if (normalizedRowSpecialty.includes(normalizedAlias)) {
      score = Math.max(score, 80);
      continue;
    }

    const aliasTokens = normalizedAlias
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter(Boolean);
    const overlap = aliasTokens.filter((token) => normalizedRowSpecialty.includes(token)).length;

    if (overlap > 0) {
      score = Math.max(score, 40 + overlap * 10);
    }
  }

  return score;
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function detectRiskLevelFallback(text: string): RiskLevel {
  const normalized = normalizeText(text);

  const highRiskKeywords = [
    "chest pain",
    "shortness of breath",
    "faint",
    "fainted",
    "seizure",
    "stroke",
    "numbness",
    "severe bleeding",
    "vomiting blood",
    "suicidal",
    "cannot breathe",
    "mellkasi fajdalom",
    "nem kapok levegot",
    "legszomj",
    "elajulas",
    "gorcsroham",
    "verzes",
    "vert hanyok",
    "szelutes",
    "ongyilkos",
  ];

  const moderateRiskKeywords = [
    "fever",
    "persistent pain",
    "migraine",
    "rash",
    "infection",
    "dizziness",
    "joint pain",
    "stomach pain",
    "palpitations",
    "anxiety",
    "depression",
    "laz",
    "fajdalom",
    "migren",
    "kialutes",
    "fertozes",
    "szedules",
    "izuleti fajdalom",
    "hasi fajdalom",
    "szivdobogas",
    "szorongas",
    "depresszio",
  ];

  const doctorHelpIntentKeywords = [
    "help",
    "need help",
    "symptom",
    "medical",
    "problem",
    "segits",
    "segitseg",
    "tunet",
    "orvos",
    "beteg",
    "egeszsegugyi problema",
  ];

  if (highRiskKeywords.some((keyword) => normalized.includes(keyword))) {
    return "high";
  }

  if (moderateRiskKeywords.some((keyword) => normalized.includes(keyword))) {
    return "moderate";
  }

  if (doctorHelpIntentKeywords.some((keyword) => normalized.includes(keyword))) {
    return "moderate";
  }

  return "low";
}

function detectSpecialtyFallback(text: string): string {
  const normalized = normalizeText(text);

  const specialtyMatchers: Array<{ specialty: string; keywords: string[] }> = [
    {
      specialty: "Cardiology",
      keywords: ["heart", "chest", "palpitation", "blood pressure", "sziv", "mellkas", "vernyomas", "szivdobogas"],
    },
    {
      specialty: "Pulmonology",
      keywords: ["breath", "lung", "cough", "asthma", "legzes", "legszomj", "tudo", "kohoges", "asztma"],
    },
    {
      specialty: "Neurology",
      keywords: ["headache", "migraine", "seizure", "numb", "dizzy", "fejfajas", "migren", "zsibbadas", "szedules", "gorcsroham"],
    },
    {
      specialty: "Dermatology",
      keywords: ["skin", "rash", "acne", "eczema", "itch", "bor", "kiutes", "viszketes"],
    },
    {
      specialty: "Gastroenterology",
      keywords: ["stomach", "gut", "nausea", "reflux", "diarrhea", "has", "hanyinger", "reflux", "hasmenes", "gyomor"],
    },
    {
      specialty: "Orthopedics",
      keywords: ["knee", "back pain", "joint", "shoulder", "bone", "terd", "hatfajas", "izulet", "vall", "csont"],
    },
    {
      specialty: "Endocrinology",
      keywords: ["thyroid", "hormone", "diabetes", "insulin", "pajzsmirigy", "hormon", "cukorbetegseg"],
    },
    {
      specialty: "Psychiatry",
      keywords: ["anxiety", "panic", "depression", "insomnia", "stress", "szorongas", "panik", "depresszio", "almatlansag", "stressz"],
    },
    {
      specialty: "Gynecology",
      keywords: [
        "period",
        "pregnancy",
        "pelvic",
        "ovary",
        "menstruacio",
        "menstruacios",
        "terhesseg",
        "medence",
        "petefeszek",
        "alhasi",
        "ciklus",
        "havi verzes",
      ],
    },
    {
      specialty: "ENT",
      keywords: ["ear", "nose", "throat", "sinus", "ful", "orr", "torok", "arcureg"],
    },
  ];

  let bestSpecialty = "General Medicine";
  let bestScore = 0;

  for (const matcher of specialtyMatchers) {
    const score = matcher.keywords.reduce((acc, keyword) => {
      if (!normalized.includes(keyword)) {
        return acc;
      }

      if (keyword.length >= 8) {
        return acc + 3;
      }

      if (keyword.length >= 5) {
        return acc + 2;
      }

      return acc + 1;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestSpecialty = matcher.specialty;
    }
  }

  return bestSpecialty;
}

function fallbackTriage(text: string): OnboardingAiResult {
  const riskLevel = detectRiskLevelFallback(text);
  const shouldSeeDoctor = riskLevel !== "low";
  const recommendedSpecialty = detectSpecialtyFallback(text);

  const summary =
    riskLevel === "high"
      ? "Your symptoms may require urgent evaluation. Please seek medical care as soon as possible."
      : riskLevel === "moderate"
      ? "Your symptoms suggest a non-urgent but meaningful health concern. A specialist visit is recommended."
      : "Your symptoms appear lower risk at the moment. Continue monitoring and follow up if they worsen.";

  return {
    summary,
    risk: {
      riskLevel,
      shouldSeeDoctor,
    },
    recommendedSpecialty,
  };
}

async function analyzeSymptomsWithAzure(text: string): Promise<OnboardingAiResult> {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";

  const hasValidAzureConfig =
    !!apiKey &&
    !!endpoint &&
    !!deployment &&
    !["PASTE_HERE", "xxxxxxxx"].includes(apiKey) &&
    !endpoint.includes("PASTE_HERE") &&
    !deployment.includes("PASTE_HERE");

  if (!hasValidAzureConfig) {
    return fallbackTriage(text);
  }

  const baseEndpoint = endpoint.replace(/\/+$/, "");
  const url = `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const systemPrompt = [
    "You are a medical triage assistant.",
    "Based on symptoms:",
    "1) Classify riskLevel as low | moderate | high",
    "2) Decide shouldSeeDoctor as boolean",
    "3) Recommend one medical specialty",
    "4) Return a short safe summary",
    "Return ONLY valid JSON with exactly this shape:",
    "{",
    '  "risk": { "riskLevel": "low|moderate|high", "shouldSeeDoctor": true|false },',
    '  "recommendedSpecialty": "string",',
    '  "summary": "string"',
    "}",
  ].join("\n");

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        temperature: 0.2,
        max_tokens: 220,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });
  } catch {
    return fallbackTriage(text);
  }

  if (!response.ok) {
    return fallbackTriage(text);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawContent = payload.choices?.[0]?.message?.content;
  if (!rawContent) {
    return fallbackTriage(text);
  }

  const parsed = parseJsonObject(rawContent);
  if (!parsed) {
    return fallbackTriage(text);
  }

  const riskObj = (parsed.risk ?? {}) as Record<string, unknown>;
  const riskLevelRaw = riskObj.riskLevel;
  const shouldSeeDoctorRaw = riskObj.shouldSeeDoctor;
  const recommendedSpecialtyRaw = parsed.recommendedSpecialty;
  const summaryRaw = parsed.summary;

  const riskLevel: RiskLevel =
    riskLevelRaw === "high" || riskLevelRaw === "moderate" || riskLevelRaw === "low"
      ? riskLevelRaw
      : detectRiskLevelFallback(text);

  const shouldSeeDoctor =
    typeof shouldSeeDoctorRaw === "boolean" ? shouldSeeDoctorRaw : riskLevel !== "low";

  const recommendedSpecialty =
    typeof recommendedSpecialtyRaw === "string" && recommendedSpecialtyRaw.trim()
      ? recommendedSpecialtyRaw.trim()
      : detectSpecialtyFallback(text);

  const summary =
    typeof summaryRaw === "string" && summaryRaw.trim()
      ? summaryRaw.trim()
      : fallbackTriage(text).summary;

  return {
    summary,
    risk: {
      riskLevel,
      shouldSeeDoctor,
    },
    recommendedSpecialty,
  };
}

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function findDoctorRecommendation(specialty: string): Promise<DoctorRecommendation | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const fields = "id, full_name, specialty, clinic_name, city, country, website_url, booking_url, is_active";
  const candidateTables = ["doctors", "doctor_recommendations", "specialists"];
  const aliases = getSpecialtyAliases(specialty);
  let bestMatch: DoctorRecommendation | null = null;
  let bestScore = 0;

  for (const tableName of candidateTables) {
    const activeRows = await supabase
      .from(tableName)
      .select(fields)
      .eq("is_active", true)
      .limit(100);

    const rowsFromActive = !activeRows.error && Array.isArray(activeRows.data)
      ? (activeRows.data as DoctorRow[])
      : [];

    const allRows = await supabase
      .from(tableName)
      .select(fields)
      .limit(100);

    const rowsFromAll = !allRows.error && Array.isArray(allRows.data)
      ? (allRows.data as DoctorRow[])
      : [];

    const rows = rowsFromActive.length > 0 ? rowsFromActive : rowsFromAll;

    for (const row of rows) {
      const specialtyValue = typeof row.specialty === "string" ? row.specialty : "";
      const score = scoreDoctorBySpecialty(specialtyValue, aliases);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          id: row.id,
          full_name: row.full_name,
          specialty: row.specialty,
          clinic_name: row.clinic_name,
          city: row.city,
          country: row.country,
          website_url: row.website_url,
          booking_url: row.booking_url,
        };
      }
    }
  }

  return bestScore >= 40 ? bestMatch : null;
}

export async function POST(request: Request) {
  try {
    const { text, hasReport } = (await request.json()) as {
      text?: unknown;
      hasReport?: unknown;
    };

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const aiResult = await analyzeSymptomsWithAzure(text.trim());
    const parsedHasReport =
      hasReport === true || hasReport === "true" || hasReport === 1 || hasReport === "1";

    const shouldRecommendDoctor = aiResult.risk.shouldSeeDoctor && !parsedHasReport;
    const doctorRecommendation = shouldRecommendDoctor
      ? await findDoctorRecommendation(aiResult.recommendedSpecialty)
      : null;

    return NextResponse.json({
      summary: aiResult.summary,
      risk: aiResult.risk,
      doctorRecommendation,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
