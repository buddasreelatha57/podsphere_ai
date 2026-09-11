/**
 * Whisper transcription client.
 * In Docker: calls the whisper microservice over HTTP.
 * In local dev (no WHISPER_URL set): falls back to spawning transcribe.py directly.
 */
import { exec } from "child_process";
import path from "path";

const WHISPER_URL = process.env.WHISPER_URL;

export const generateTranscript = async (audioPath: string): Promise<string> => {
  // ── Docker / Cloud: call the HTTP whisper service ──
  if (WHISPER_URL) {
    const res = await fetch(`${WHISPER_URL}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioPath }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Whisper service error ${res.status}: ${err}`);
    }

    const data = (await res.json()) as { transcript?: string; error?: string };
    if (data.error) throw new Error(data.error);
    return data.transcript ?? "";
  }

  // ── Local dev: spawn Python script directly ──
  return new Promise((resolve, reject) => {
    const script = path.join(__dirname, "../python/transcribe.py");
    exec(
      `python "${script}" "${audioPath}"`,
      { encoding: "utf-8" },
      (error, stdout, stderr) => {
        if (error) {
          console.error("[Whisper]", stderr);
          return reject(error);
        }
        resolve(stdout.trim());
      }
    );
  });
};