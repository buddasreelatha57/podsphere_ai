import { ollamaGenerate } from "../config/ollama";

export async function generateArticle(
  title: string,
  transcript: string,
  summary: string,
  category: string = ""
): Promise<string> {
  if (!transcript?.trim()) return "";

  let instructions = `Write a professional, engaging blog article from this transcript.`;

  if (category === "Music") {
    instructions = `You are a music transcriber. Extract the exact lyrics from the transcript. Format beautifully and include the Producer or Singer name if mentioned.`;
  } else if (category === "Podcast") {
    instructions = `Convert this transcript into an engaging conversational piece or interview format, capturing the podcast's essence.`;
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