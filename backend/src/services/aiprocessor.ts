import Content from "../models/Content";
import path from "path";
import fs from "fs";
import { extractAudio } from "../utils/ffmpeg";
import { generateTranscript } from "../ai/whisper";
import { generateSummary } from "../ai/summary";
import { generateArticle } from "../ai/article";
import { generateSEO } from "../ai/seo";
import { generateChapters } from "../ai/chapters";
import { translate } from "../ai/translator";
import { generatePodcast } from "../ai/podcast";

export async function processAI(contentId: string) {
    try {
        const content = await Content.findById(contentId);
        if (!content) return;

        console.log("AI Processing Started...");

        const audioPath = path.join(__dirname, `../../uploads/${contentId}.mp3`);
        await extractAudio(content.originalVideo, audioPath);

        const transcript = await generateTranscript(audioPath);
        const summary = await generateSummary(transcript);
        let article = "";
        if (content.publishArticle) {
            article = await generateArticle(content.title, transcript, summary, content.category, content.publishPodcast);
        }
        const chapters = await generateChapters(transcript);
        const translated = await translate(transcript, "Hindi");
        const seo = await generateSEO(article);
        const podcast = await generatePodcast(audioPath);

        content.transcript = transcript;
        content.summary = summary;
        content.article = article;
        content.chapters = chapters;
        content.seoDescription = seo;
        content.podcastAudio = podcast;
        content.status = "published";

        await content.save();

        try { if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath); } catch {}

        console.log("AI Processing Completed");
    } catch (err) {
        console.error(err);
    }
}