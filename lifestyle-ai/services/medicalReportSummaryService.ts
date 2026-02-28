import { getAzureOpenAIClient } from "@/services/azureOpenAIClient";

export async function summarizeMedicalReport(reportText: string): Promise<string> {
  const client = getAzureOpenAIClient();

  if (!client) {
    return "I couldn't access the medical summary model right now. Please try again shortly.";
  }

  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT!,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "You summarize medical reports in simple language. Do not diagnose.",
      },
      {
        role: "user",
        content: reportText,
      },
    ],
  });

  return (
    response.choices?.[0]?.message?.content?.trim() ||
    "I couldn't generate a report summary right now. Please try again."
  );
}
