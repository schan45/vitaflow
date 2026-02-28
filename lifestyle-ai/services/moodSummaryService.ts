import { getAzureOpenAIClient } from "@/services/azureOpenAIClient";

export async function summarizeMood(text: string): Promise<string> {
  const client = getAzureOpenAIClient();

  if (!client) {
    return "Thanks for sharing. I hear you, and we can take this step by step.";
  }

  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT!,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "Summarize how the user feels emotionally and physically in a supportive way. Do not diagnose.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return (
    response.choices?.[0]?.message?.content?.trim() ||
    "Thanks for sharing. I hear you, and we can take this step by step."
  );
}
