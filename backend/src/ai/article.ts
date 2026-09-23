import { ollamaGenerate } from "../config/ollama";

export async function generateArticle(
  title: string,
  transcript: string,
  summary: string,
  category: string = "",
  isPodcast: boolean = false
): Promise<string> {
  if (!transcript?.trim()) return "";

  let instructions = `Write a polished, engaging article from this transcript. Use a clear title, headings, paragraphs, and a concise conclusion. Preserve facts from the transcript and do not invent details.`;

  if (category === "Music") {
    instructions = `Create a lyrics page from this song transcript. Preserve the lyrics accurately, format verses and chorus clearly, and include the singer, producer, or song context only when mentioned in the transcript. Do not add or invent lyrics.`;
  } else if (isPodcast || category === "Podcast") {
    instructions = `Turn this podcast transcript into a natural conversational article or interview. Preserve the speakers' viewpoints, use speaker labels when clear, and capture the flow and key insights without inventing dialogue.`;
  } else if (category === "Story") {
    instructions = `Rewrite this transcript as a compelling narrative story with a clear beginning, development, and ending. Preserve the events and characters from the transcript, use vivid but accurate prose, and do not invent plot details.`;
  } else if (category === "News") {
    instructions = `Write a formal, objective news article based on this transcript, adhering to journalistic standards.`;
  }

  return ollamaGenerate(`
${instructions}

Title: ${title}
Summary: ${summary}
Transcript: ${transcript}

Return ONLY the markdown article with headings. No extra commentary.
`);
}