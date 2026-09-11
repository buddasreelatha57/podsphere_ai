import { ollamaGenerate } from "../config/ollama";

export async function generateChapters(text: string): Promise<any[]> {
  if (!text?.trim()) return [];

  try {
    const raw = await ollamaGenerate(`
Generate timestamp chapters for this transcript.

Strictly return ONLY a raw JSON array, no markdown fences, no explanation:
[
  { "title": "Introduction", "startTime": 0 },
  { "title": "Main Topic", "startTime": 120 }
]
(startTime must be in seconds)

Transcript:
${text}
`);

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) return parsed;
    if (parsed?.chapters && Array.isArray(parsed.chapters)) return parsed.chapters;
    return [];
  } catch (error) {
    console.error("[generateChapters error]", error);
    return [];
  }
}