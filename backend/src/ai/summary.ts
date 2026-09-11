import { ollamaGenerate } from "../config/ollama";

export async function generateSummary(text: string): Promise<string> {
  if (!text?.trim()) return "";
  return ollamaGenerate(`
You are an expert content summarizer.
Summarize the following transcript in 3-5 sentences. Be concise and capture the key points.

Transcript:
${text}

Return only the summary, no extra commentary.
`);
}