import { ollamaGenerate } from "../config/ollama";

export async function generateSEO(text: string): Promise<string> {
  if (!text?.trim()) return "";
  return ollamaGenerate(`
Generate SEO metadata for the following content.
Return ONLY these three fields, nothing else:

SEO Title: <title here>
SEO Description: <description here>
Keywords: <comma separated keywords>

Content:
${text.slice(0, 2000)}
`);
}