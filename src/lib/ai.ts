import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

/**
 * Sélectionne le modèle selon AI_PROVIDER :
 * - openai-compatible (défaut) : tout serveur d'API compatible OpenAI, pour des modèles open source
 *   (Ollama en local, Groq, OpenRouter, Together…). Variables : AI_BASE_URL, AI_MODEL, AI_API_KEY.
 * - openai / anthropic : API commerciales (clés OPENAI_API_KEY / ANTHROPIC_API_KEY).
 */
export function getModel() {
  const provider = process.env.AI_PROVIDER ?? "openai-compatible";

  if (provider === "anthropic") return anthropic(process.env.AI_MODEL ?? "claude-haiku-5-5");
  if (provider === "openai") return openai(process.env.AI_MODEL ?? "gpt-4o-mini");

  const baseURL = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (!baseURL || !model) throw new Error("AI_BASE_URL et AI_MODEL sont requis avec AI_PROVIDER=openai-compatible");

  return createOpenAICompatible({
    name: "open-source",
    baseURL,
    apiKey: process.env.AI_API_KEY || undefined,
    supportsStructuredOutputs: true,
  })(model);
}
