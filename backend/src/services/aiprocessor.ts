import Content from "../models/Content";

import { extractAudio } from "../utils/ffmpeg";

import { transcribeAudio } from "../ai/whisper";

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

        //------------------------------------
        // Extract Audio
        //------------------------------------

        const audioPath = await extractAudio(
            content.originalVideo
        );

        //------------------------------------
        // Whisper
        //------------------------------------

        const transcript = await transcribeAudio(audioPath);

        //------------------------------------
        // Summary
        //------------------------------------

        const summary = await generateSummary(transcript);

        //------------------------------------
        // Article
        //------------------------------------

        let article = "";
        if (content.publishArticle) {
            article = await generateArticle(content.title, transcript, summary, content.category);
        }

        //------------------------------------
        // Chapters
        //------------------------------------

        const chapters = await generateChapters(transcript);

        //------------------------------------
        // Translation
        //------------------------------------

        const translated = await translate(
            transcript,
            "Hindi"
        );

        //------------------------------------
        // SEO
        //------------------------------------

        const seo = await generateSEO(article);

        //------------------------------------
        // Podcast
        //------------------------------------

        const podcast = await generatePodcast(audioPath);

        //------------------------------------
        // Save Database
        //------------------------------------

        content.transcript = transcript;

        content.summary = summary;

        content.article = article;

        content.chapters = chapters;

        content.seoDescription = seo;

        content.podcastAudio = podcast;

        content.status = "published";

        await content.save();

        console.log("AI Processing Completed");

    } catch (err) {

        console.log(err);

    }

}