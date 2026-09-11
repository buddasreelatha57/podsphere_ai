/**
 * Ollama client — drop-in replacement for the Gemini SDK.
 * Calls the local Ollama HTTP API.
 * OLLAMA_URL defaults to http://localhost:11434 for local dev,
 * and is set to http://ollama:11434 inside Docker.
 */

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

export async function ollamaGenerate(prompt: string): Promise<string> {
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
