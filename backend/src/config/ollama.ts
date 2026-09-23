import gemini from "./gemini";

/**
 * Shared AI text generation client.
 * Docker uses Ollama; hosted deployments use Gemini when no Ollama URL exists.
 */

const OLLAMA_URL = process.env.OLLAMA_URL;
const MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function ollamaGenerate(prompt: string): Promise<string> {
  if (OLLAMA_URL) {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error ${res.status}: ${err}`);
    }

    const data = (await res.json()) as { response: string };
    return data.response?.trim() ?? "";
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("No AI provider configured. Set OLLAMA_URL or GEMINI_API_KEY.");
  }

  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  return response.text?.trim() ?? "";
}
