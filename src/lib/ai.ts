import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

/** Sélectionne le modèle selon AI_PROVIDER (openai | anthropic) et AI_MODEL (optionnel). */
export function getModel() {
  const provider = process.env.AI_PROVIDER ?? "openai";
  if (provider === "anthropic") return anthropic(process.env.AI_MODEL ?? "claude-haiku-5-5");
  return openai(process.env.AI_MODEL ?? "gpt-4o-mini");
}
