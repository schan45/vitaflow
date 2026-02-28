import { getAzureOpenAIClient } from "@/services/azureOpenAIClient";

export async function runAiPrompt(prompt: string): Promise<string> {
  const client = getAzureOpenAIClient();

  if (!client) {
    return "AI service is currently unavailable.";
  }

  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT!,
    temperature: 0.2,
    messages: [
      { role: "system", content: "You are a helpful health assistant." },
      { role: "user", content: prompt },
    ],
  });

  return response.choices?.[0]?.message?.content?.trim() || "No response.";
}
