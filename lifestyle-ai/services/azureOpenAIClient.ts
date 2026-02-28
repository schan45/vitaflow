import OpenAI from "openai";

function hasAzureConfig() {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  return (
    !!apiKey &&
    !!endpoint &&
    !!deployment &&
    !["PASTE_HERE", "xxxxxxxx"].includes(apiKey) &&
    !endpoint.includes("PASTE_HERE") &&
    !deployment.includes("PASTE_HERE")
  );
}

export function getAzureOpenAIClient() {
  if (!hasAzureConfig()) {
    return null;
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT!.replace(/\/+$/, "");
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;

  return new OpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    baseURL: `${endpoint}/openai/deployments/${deployment}`,
    defaultQuery: {
      "api-version": process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21",
    },
    defaultHeaders: {
      "api-key": process.env.AZURE_OPENAI_KEY!,
    },
  });
}
