import { ollamaGenerate } from "../config/ollama";

export async function translate(text: string, language: string): Promise<string> {
  if (!text?.trim()) return "";
  return ollamaGenerate(`
Translate the following text to ${language}.
Return ONLY the translated text, no explanation or commentary.

Text:
${text}
`);
}